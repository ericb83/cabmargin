using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Stripe;
using Stripe.Checkout;
using LoadProfit.API.Configuration;
using LoadProfit.API.Data;
using LoadProfit.API.Models;

namespace LoadProfit.API.Services;

public class StripeService : IStripeService
{
    private readonly StripeSettings _settings;
    private readonly ApplicationDbContext _context;
    private readonly ILogger<StripeService> _logger;

    public StripeService(
        IOptions<StripeSettings> settings,
        ApplicationDbContext context,
        ILogger<StripeService> logger)
    {
        _settings = settings.Value;
        _context = context;
        _logger = logger;
    }

    public async Task<string> CreateCheckoutSessionAsync(User user, string priceId)
    {
        EnsureApiKey();

        var customerId = await EnsureCustomerAsync(user);

        var options = new SessionCreateOptions
        {
            Customer = customerId,
            ClientReferenceId = user.Id.ToString(),
            Mode = "subscription",
            LineItems = new List<SessionLineItemOptions>
            {
                new()
                {
                    Price = priceId,
                    Quantity = 1
                }
            },
            SuccessUrl = AppendQuery(_settings.SuccessUrl, "session_id={CHECKOUT_SESSION_ID}"),
            CancelUrl = _settings.CancelUrl,
            Metadata = new Dictionary<string, string>
            {
                ["UserId"] = user.Id.ToString()
            },
            SubscriptionData = new SessionSubscriptionDataOptions
            {
                Metadata = new Dictionary<string, string>
                {
                    ["UserId"] = user.Id.ToString()
                }
            }
        };

        var service = new SessionService();
        var session = await service.CreateAsync(options);

        if (string.IsNullOrEmpty(session.Url))
        {
            throw new InvalidOperationException("Stripe did not return a checkout URL.");
        }

        return session.Url;
    }

    public async Task ConfirmCheckoutSessionAsync(User user, string sessionId)
    {
        EnsureApiKey();

        var service = new SessionService();
        var session = await service.GetAsync(sessionId, new SessionGetOptions
        {
            Expand = new List<string> { "subscription" }
        });

        if (!SessionBelongsToUser(session, user))
        {
            throw new InvalidOperationException("This checkout session does not belong to the current user.");
        }

        if (session.Status != "complete")
        {
            throw new InvalidOperationException("Checkout is not complete yet.");
        }

        var subscription = session.Subscription;
        if (subscription == null && !string.IsNullOrEmpty(session.SubscriptionId))
        {
            subscription = await new SubscriptionService().GetAsync(session.SubscriptionId);
        }

        if (subscription == null)
        {
            throw new InvalidOperationException("Stripe has not attached a subscription to this checkout yet.");
        }

        ApplySubscription(user, subscription);
        await _context.SaveChangesAsync();
    }

    public async Task<string> CreateBillingPortalSessionAsync(User user)
    {
        EnsureApiKey();

        if (string.IsNullOrEmpty(user.StripeCustomerId))
        {
            throw new InvalidOperationException("No billing account exists for this user yet.");
        }

        var service = new Stripe.BillingPortal.SessionService();
        var session = await service.CreateAsync(new Stripe.BillingPortal.SessionCreateOptions
        {
            Customer = user.StripeCustomerId,
            ReturnUrl = _settings.PortalReturnUrl
        });

        if (string.IsNullOrEmpty(session.Url))
        {
            throw new InvalidOperationException("Stripe did not return a billing portal URL.");
        }

        return session.Url;
    }

    public async Task CancelAtPeriodEndAsync(User user)
    {
        EnsureApiKey();

        if (string.IsNullOrEmpty(user.StripeSubscriptionId))
        {
            throw new InvalidOperationException("No active subscription to cancel.");
        }

        var service = new SubscriptionService();
        var updated = await service.UpdateAsync(user.StripeSubscriptionId, new SubscriptionUpdateOptions
        {
            CancelAtPeriodEnd = true
        });

        ApplySubscription(user, updated);
        await _context.SaveChangesAsync();
    }

    public async Task<bool> HandleWebhookAsync(string json, string signature)
    {
        if (!StripeSettings.IsRealValue(_settings.WebhookSecret))
        {
            _logger.LogError("Stripe webhook secret is not configured.");
            return false;
        }

        try
        {
            EnsureApiKey();
            var stripeEvent = EventUtility.ConstructEvent(json, signature, _settings.WebhookSecret);
            _logger.LogInformation("Handling Stripe event {EventType} {EventId}", stripeEvent.Type, stripeEvent.Id);

            switch (stripeEvent.Type)
            {
                case "checkout.session.completed":
                    await HandleCheckoutSessionCompleted(stripeEvent);
                    break;
                case "invoice.paid":
                    await HandleInvoicePaid(stripeEvent);
                    break;
                case "customer.subscription.updated":
                    await HandleSubscriptionUpdated(stripeEvent);
                    break;
                case "customer.subscription.deleted":
                    await HandleSubscriptionDeleted(stripeEvent);
                    break;
                case "invoice.payment_failed":
                    _logger.LogWarning("Stripe invoice payment failed for event {EventId}", stripeEvent.Id);
                    break;
            }

            return true;
        }
        catch (StripeException ex)
        {
            _logger.LogError(ex, "Stripe webhook error");
            return false;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error while handling Stripe webhook");
            return false;
        }
    }

    private async Task HandleCheckoutSessionCompleted(Event stripeEvent)
    {
        var session = stripeEvent.Data.Object as Session;
        if (session == null) return;

        var user = await FindUserAsync(ReadUserId(session.Metadata), session.CustomerId, session.SubscriptionId);
        if (user == null)
        {
            _logger.LogWarning("Checkout session {SessionId} did not match a user", session.Id);
            return;
        }

        Subscription? subscription = session.Subscription;
        if (subscription == null && !string.IsNullOrEmpty(session.SubscriptionId))
        {
            subscription = await new SubscriptionService().GetAsync(session.SubscriptionId);
        }

        if (subscription == null)
        {
            _logger.LogWarning("Checkout session {SessionId} completed without a subscription", session.Id);
            return;
        }

        ApplySubscription(user, subscription);
        await _context.SaveChangesAsync();
        _logger.LogInformation("User {UserId} subscribed via checkout {SessionId}", user.Id, session.Id);
    }

    private async Task HandleInvoicePaid(Event stripeEvent)
    {
        var invoice = stripeEvent.Data.Object as Invoice;
        var details = invoice?.Parent?.SubscriptionDetails;
        if (invoice == null || details == null) return;

        var user = await FindUserAsync(ReadUserId(details.Metadata), invoice.CustomerId, details.SubscriptionId);
        if (user == null) return;

        var subscription = details.Subscription;
        if (subscription == null && !string.IsNullOrEmpty(details.SubscriptionId))
        {
            subscription = await new SubscriptionService().GetAsync(details.SubscriptionId);
        }

        if (subscription == null) return;

        ApplySubscription(user, subscription);
        await _context.SaveChangesAsync();
        _logger.LogInformation("User {UserId} subscription renewed through {ExpiresAt}", user.Id, user.SubscriptionExpiresAt);
    }

    private async Task HandleSubscriptionUpdated(Event stripeEvent)
    {
        var subscription = stripeEvent.Data.Object as Subscription;
        if (subscription == null) return;

        var user = await FindUserAsync(ReadUserId(subscription.Metadata), subscription.CustomerId, subscription.Id);
        if (user == null) return;

        ApplySubscription(user, subscription);
        await _context.SaveChangesAsync();
    }

    private async Task HandleSubscriptionDeleted(Event stripeEvent)
    {
        var subscription = stripeEvent.Data.Object as Subscription;
        if (subscription == null) return;

        var user = await FindUserAsync(ReadUserId(subscription.Metadata), subscription.CustomerId, subscription.Id);
        if (user == null) return;

        user.SubscriptionTier = SubscriptionTier.Free;
        user.StripeSubscriptionId = null;
        user.SubscriptionExpiresAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();
        _logger.LogInformation("User {UserId} subscription ended", user.Id);
    }

    private async Task<string> EnsureCustomerAsync(User user)
    {
        if (!string.IsNullOrEmpty(user.StripeCustomerId))
        {
            return user.StripeCustomerId;
        }

        var customerService = new CustomerService();
        var customer = await customerService.CreateAsync(new CustomerCreateOptions
        {
            Email = user.Email,
            Metadata = new Dictionary<string, string>
            {
                ["UserId"] = user.Id.ToString()
            }
        });

        user.StripeCustomerId = customer.Id;
        await _context.SaveChangesAsync();
        return customer.Id;
    }

    private async Task<User?> FindUserAsync(string? userIdRaw, string? customerId, string? subscriptionId)
    {
        if (int.TryParse(userIdRaw, out var userId))
        {
            var byId = await _context.Users.FindAsync(userId);
            if (byId != null) return byId;
        }

        if (!string.IsNullOrEmpty(customerId))
        {
            var byCustomer = await _context.Users.FirstOrDefaultAsync(u => u.StripeCustomerId == customerId);
            if (byCustomer != null) return byCustomer;
        }

        if (!string.IsNullOrEmpty(subscriptionId))
        {
            return await _context.Users.FirstOrDefaultAsync(u => u.StripeSubscriptionId == subscriptionId);
        }

        return null;
    }

    private static void ApplySubscription(User user, Subscription subscription)
    {
        if (!string.IsNullOrEmpty(subscription.CustomerId))
        {
            user.StripeCustomerId = subscription.CustomerId;
        }

        user.StripeSubscriptionId = subscription.Id;
        var periodEnd = GetPeriodEnd(subscription);

        switch (subscription.Status)
        {
            case "active":
            case "trialing":
                user.SubscriptionTier = SubscriptionTier.Premium;
                if (periodEnd.HasValue)
                {
                    user.SubscriptionExpiresAt = periodEnd;
                }
                break;
            case "past_due":
                user.SubscriptionTier = SubscriptionTier.Premium;
                var grace = DateTime.UtcNow.AddDays(3);
                user.SubscriptionExpiresAt = periodEnd.HasValue && periodEnd.Value > grace
                    ? periodEnd
                    : grace;
                break;
            case "canceled":
            case "unpaid":
            case "incomplete_expired":
                user.SubscriptionTier = SubscriptionTier.Free;
                user.StripeSubscriptionId = null;
                user.SubscriptionExpiresAt = DateTime.UtcNow;
                break;
        }
    }

    private static DateTime? GetPeriodEnd(Subscription subscription)
    {
        var items = subscription.Items?.Data;
        if (items == null || items.Count == 0) return null;

        var end = items.Max(item => item.CurrentPeriodEnd);
        if (end == default) return null;

        return DateTime.SpecifyKind(end, DateTimeKind.Utc);
    }

    private static string? ReadUserId(Dictionary<string, string>? metadata)
    {
        if (metadata != null && metadata.TryGetValue("UserId", out var userId))
        {
            return userId;
        }

        return null;
    }

    private static bool SessionBelongsToUser(Session session, User user)
    {
        var metadataUserId = ReadUserId(session.Metadata) ?? session.ClientReferenceId;
        if (metadataUserId == user.Id.ToString()) return true;
        return !string.IsNullOrEmpty(user.StripeCustomerId) && session.CustomerId == user.StripeCustomerId;
    }

    private static string AppendQuery(string url, string query)
    {
        var separator = url.Contains('?') ? "&" : "?";
        return url + separator + query;
    }

    private void EnsureApiKey()
    {
        if (!StripeSettings.IsRealValue(_settings.SecretKey))
        {
            throw new InvalidOperationException(
                "Stripe is not configured. Set Stripe:SecretKey, Stripe:MonthlyPriceId, and Stripe:AnnualPriceId with user secrets.");
        }

        StripeConfiguration.ApiKey = _settings.SecretKey;
    }
}

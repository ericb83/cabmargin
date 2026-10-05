using LoadProfit.API.Models;

namespace LoadProfit.API.Services;

public interface IStripeService
{
    Task<string> CreateCheckoutSessionAsync(User user, string priceId);
    Task ConfirmCheckoutSessionAsync(User user, string sessionId);
    Task<string> CreateBillingPortalSessionAsync(User user);
    Task CancelAtPeriodEndAsync(User user);
    Task<bool> HandleWebhookAsync(string json, string signature);
}

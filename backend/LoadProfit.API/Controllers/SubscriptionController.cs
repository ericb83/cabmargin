using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using LoadProfit.API.Configuration;
using LoadProfit.API.Controllers.DTOs;
using LoadProfit.API.Data;
using LoadProfit.API.Models;
using LoadProfit.API.Services;

namespace LoadProfit.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SubscriptionController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly IStripeService _stripeService;
    private readonly IConfiguration _configuration;

    public SubscriptionController(
        ApplicationDbContext context,
        IStripeService stripeService,
        IConfiguration configuration)
    {
        _context = context;
        _stripeService = stripeService;
        _configuration = configuration;
    }

    [HttpGet("pricing")]
    public ActionResult<PricingInfoDto> GetPricing()
    {
        var monthlyPriceId = _configuration["Stripe:MonthlyPriceId"] ?? "";
        var annualPriceId = _configuration["Stripe:AnnualPriceId"] ?? "";

        return Ok(new PricingInfoDto
        {
            MonthlyPriceId = monthlyPriceId,
            AnnualPriceId = annualPriceId,
            MonthlyPrice = 9.99m,
            AnnualPrice = 79.99m,
            Configured = StripeSettings.IsRealValue(_configuration["Stripe:SecretKey"]) &&
                         StripeSettings.IsRealValue(monthlyPriceId) &&
                         StripeSettings.IsRealValue(annualPriceId)
        });
    }

    [HttpGet("status")]
    [Authorize]
    public async Task<ActionResult<SubscriptionStatusDto>> GetStatus()
    {
        var userId = GetUserId();
        if (userId == null) return Unauthorized();

        var user = await _context.Users.FindAsync(userId);
        if (user == null) return NotFound();

        var isPremium = user.HasActivePremium();

        return Ok(new SubscriptionStatusDto
        {
            Tier = user.SubscriptionTier.ToString(),
            IsPremium = isPremium,
            ExpiresAt = user.SubscriptionExpiresAt,
            CanSaveLoads = isPremium
        });
    }

    [HttpPost("create-checkout")]
    [Authorize]
    public async Task<ActionResult<CheckoutResponseDto>> CreateCheckout([FromBody] CreateCheckoutDto request)
    {
        var userId = GetUserId();
        if (userId == null) return Unauthorized();

        var user = await _context.Users.FindAsync(userId);
        if (user == null) return NotFound();

        if (user.HasActivePremium() && !string.IsNullOrEmpty(user.StripeSubscriptionId))
        {
            return Conflict(new { message = "You already have an active subscription. Use Manage billing to change it." });
        }

        var validPriceIds = new[]
        {
            _configuration["Stripe:MonthlyPriceId"],
            _configuration["Stripe:AnnualPriceId"]
        };

        if (!validPriceIds.Contains(request.PriceId) || !StripeSettings.IsRealValue(request.PriceId))
        {
            return BadRequest(new { message = "Invalid price ID" });
        }

        try
        {
            var checkoutUrl = await _stripeService.CreateCheckoutSessionAsync(user, request.PriceId);
            return Ok(new CheckoutResponseDto { CheckoutUrl = checkoutUrl });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("confirm")]
    [Authorize]
    public async Task<ActionResult<SubscriptionStatusDto>> ConfirmCheckout([FromBody] ConfirmCheckoutDto request)
    {
        var user = await GetCurrentUserAsync();
        if (user == null) return Unauthorized();

        if (string.IsNullOrWhiteSpace(request.SessionId))
        {
            return BadRequest(new { message = "Missing checkout session." });
        }

        try
        {
            await _stripeService.ConfirmCheckoutSessionAsync(user, request.SessionId);
            return Ok(ToStatus(user));
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("portal")]
    [Authorize]
    public async Task<ActionResult<PortalResponseDto>> CreatePortal()
    {
        var user = await GetCurrentUserAsync();
        if (user == null) return Unauthorized();

        try
        {
            var url = await _stripeService.CreateBillingPortalSessionAsync(user);
            return Ok(new PortalResponseDto { Url = url });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("webhook")]
    [AllowAnonymous]
    public async Task<IActionResult> Webhook()
    {
        Request.EnableBuffering();
        var json = await new StreamReader(HttpContext.Request.Body).ReadToEndAsync();
        var signature = Request.Headers["Stripe-Signature"].FirstOrDefault();

        if (string.IsNullOrEmpty(signature))
        {
            return BadRequest("Missing Stripe signature");
        }

        var success = await _stripeService.HandleWebhookAsync(json, signature);
        
        if (success)
        {
            return Ok();
        }
        
        return BadRequest("Webhook processing failed");
    }

    [HttpPost("cancel")]
    [Authorize]
    public async Task<IActionResult> CancelSubscription()
    {
        var user = await GetCurrentUserAsync();
        if (user == null) return Unauthorized();

        if (string.IsNullOrEmpty(user.StripeSubscriptionId))
        {
            return BadRequest(new { message = "No active subscription to cancel" });
        }

        try
        {
            await _stripeService.CancelAtPeriodEndAsync(user);
            return Ok(new
            {
                message = "Subscription will cancel at the end of the current billing period.",
                expiresAt = user.SubscriptionExpiresAt
            });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    private async Task<User?> GetCurrentUserAsync()
    {
        var userId = GetUserId();
        if (userId == null) return null;
        return await _context.Users.FindAsync(userId);
    }

    private static SubscriptionStatusDto ToStatus(User user)
    {
        var isPremium = user.HasActivePremium();
        return new SubscriptionStatusDto
        {
            Tier = user.SubscriptionTier.ToString(),
            IsPremium = isPremium,
            ExpiresAt = user.SubscriptionExpiresAt,
            CanSaveLoads = isPremium
        };
    }

    private int? GetUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out var userId))
        {
            return null;
        }
        return userId;
    }
}



using Microsoft.AspNetCore.Identity;

namespace LoadProfit.API.Models;

public class User : IdentityUser<int>
{
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    // Subscription fields
    public SubscriptionTier SubscriptionTier { get; set; } = SubscriptionTier.Free;
    public string? StripeCustomerId { get; set; }
    public string? StripeSubscriptionId { get; set; }
    public DateTime? SubscriptionExpiresAt { get; set; }

    public bool HasActivePremium() =>
        SubscriptionTier == SubscriptionTier.Premium &&
        (SubscriptionExpiresAt == null || SubscriptionExpiresAt > DateTime.UtcNow);
    
    // Navigation property
    public ICollection<Load> Loads { get; set; } = new List<Load>();
}

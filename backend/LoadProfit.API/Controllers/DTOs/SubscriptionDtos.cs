namespace LoadProfit.API.Controllers.DTOs;

public class CreateCheckoutDto
{
    public required string PriceId { get; set; }
}

public class ConfirmCheckoutDto
{
    public required string SessionId { get; set; }
}

public class SubscriptionStatusDto
{
    public required string Tier { get; set; }
    public bool IsPremium { get; set; }
    public DateTime? ExpiresAt { get; set; }
    public bool CanSaveLoads { get; set; }
}

public class CheckoutResponseDto
{
    public required string CheckoutUrl { get; set; }
}

public class PricingInfoDto
{
    public required string MonthlyPriceId { get; set; }
    public required string AnnualPriceId { get; set; }
    public decimal MonthlyPrice { get; set; }
    public decimal AnnualPrice { get; set; }
    public bool Configured { get; set; }
}

public class PortalResponseDto
{
    public required string Url { get; set; }
}



namespace LoadProfit.API.Configuration;

public class StripeSettings
{
    public string SecretKey { get; set; } = "";
    public string PublishableKey { get; set; } = "";
    public string WebhookSecret { get; set; } = "";
    public string MonthlyPriceId { get; set; } = "";
    public string AnnualPriceId { get; set; } = "";
    public string SuccessUrl { get; set; } = "http://localhost:5173/subscription/success";
    public string CancelUrl { get; set; } = "http://localhost:5173/pricing";
    public string PortalReturnUrl { get; set; } = "http://localhost:5173/pricing";

    public bool IsConfigured =>
        IsRealValue(SecretKey) &&
        IsRealValue(MonthlyPriceId) &&
        IsRealValue(AnnualPriceId);

    public static bool IsRealValue(string? value) =>
        !string.IsNullOrWhiteSpace(value) &&
        !value.Contains("YOUR_", StringComparison.OrdinalIgnoreCase);
}

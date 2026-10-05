namespace LoadProfit.API.Controllers.DTOs;

public class RegisterDto
{
    public required string Email { get; set; }
    public required string Password { get; set; }
}

public class LoginDto
{
    public required string Email { get; set; }
    public required string Password { get; set; }
}

public class AuthResponseDto
{
    public required string Token { get; set; }
    public required string Email { get; set; }
    public int UserId { get; set; }
    public DateTime ExpiresAt { get; set; }
    public required string SubscriptionTier { get; set; }
    public bool IsPremium { get; set; }
}

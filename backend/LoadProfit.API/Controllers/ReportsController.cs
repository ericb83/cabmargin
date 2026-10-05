using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using LoadProfit.API.Controllers.DTOs;
using LoadProfit.API.Data;
using LoadProfit.API.Models;
using LoadProfit.API.Services;

namespace LoadProfit.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ReportsController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly IReportService _reportService;

    public ReportsController(ApplicationDbContext context, IReportService reportService)
    {
        _context = context;
        _reportService = reportService;
    }

    [HttpGet("weekly")]
    public async Task<ActionResult<ReportDto>> GetWeeklyReport()
    {
        var userId = GetUserId();
        if (userId == null) return Unauthorized();

        // Check if user is premium
        var user = await _context.Users.FindAsync(userId);
        if (user == null || !user.HasActivePremium())
        {
            return StatusCode(403, new { message = "Premium subscription required for reports", requiresUpgrade = true });
        }

        var report = await _reportService.GetWeeklyReportAsync(userId.Value);
        return Ok(report);
    }

    [HttpGet("monthly")]
    public async Task<ActionResult<ReportDto>> GetMonthlyReport()
    {
        var userId = GetUserId();
        if (userId == null) return Unauthorized();

        // Check if user is premium
        var user = await _context.Users.FindAsync(userId);
        if (user == null || !user.HasActivePremium())
        {
            return StatusCode(403, new { message = "Premium subscription required for reports", requiresUpgrade = true });
        }

        var report = await _reportService.GetMonthlyReportAsync(userId.Value);
        return Ok(report);
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



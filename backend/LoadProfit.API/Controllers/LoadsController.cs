using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using LoadProfit.API.Controllers.DTOs;
using LoadProfit.API.Data;
using LoadProfit.API.Models;

namespace LoadProfit.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class LoadsController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public LoadsController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<LoadDto>>> GetLoads()
    {
        var userId = GetUserId();
        if (userId == null)
        {
            return Unauthorized();
        }

        // Check if user is premium
        var user = await _context.Users.FindAsync(userId);
        if (user == null || !user.HasActivePremium())
        {
            return StatusCode(403, new { message = "Premium subscription required to view load history", requiresUpgrade = true });
        }

        var loads = await _context.Loads
            .Where(l => l.UserId == userId)
            .OrderByDescending(l => l.CreatedAt)
            .Select(l => new LoadDto
            {
                Id = l.Id,
                LoadRate = l.LoadRate,
                Distance = l.Distance,
                DeadheadMiles = l.DeadheadMiles,
                FuelPricePerGallon = l.FuelPricePerGallon,
                MilesPerGallon = l.MilesPerGallon,
                TollsCost = l.TollsCost,
                MaintenancePerMile = l.MaintenancePerMile,
                InsurancePerMile = l.InsurancePerMile,
                TruckPayment = l.TruckPayment,
                TrailerPayment = l.TrailerPayment,
                DispatchFeePercent = l.DispatchFeePercent,
                FactoringFeePercent = l.FactoringFeePercent,
                OtherExpenses = l.OtherExpenses,
                CalculatedProfit = l.CalculatedProfit,
                ProfitMargin = l.ProfitMargin,
                CreatedAt = l.CreatedAt
            })
            .ToListAsync();

        return Ok(loads);
    }

    [HttpPost]
    public async Task<ActionResult<LoadDto>> SaveLoad([FromBody] SaveLoadDto request)
    {
        var userId = GetUserId();
        if (userId == null)
        {
            return Unauthorized();
        }

        // Check if user is premium
        var user = await _context.Users.FindAsync(userId);
        if (user == null || !user.HasActivePremium())
        {
            return StatusCode(403, new { message = "Premium subscription required to save loads", requiresUpgrade = true });
        }

        var load = new Load
        {
            UserId = userId.Value,
            LoadRate = request.LoadRate,
            Distance = request.Distance,
            DeadheadMiles = request.DeadheadMiles,
            FuelPricePerGallon = request.FuelPricePerGallon,
            MilesPerGallon = request.MilesPerGallon,
            TollsCost = request.TollsCost,
            MaintenancePerMile = request.MaintenancePerMile,
            InsurancePerMile = request.InsurancePerMile,
            TruckPayment = request.TruckPayment,
            TrailerPayment = request.TrailerPayment,
            DispatchFeePercent = request.DispatchFeePercent,
            FactoringFeePercent = request.FactoringFeePercent,
            OtherExpenses = request.OtherExpenses,
            CalculatedProfit = request.CalculatedProfit,
            ProfitMargin = request.ProfitMargin,
            CreatedAt = DateTime.UtcNow
        };

        _context.Loads.Add(load);
        await _context.SaveChangesAsync();

        return Ok(new LoadDto
        {
            Id = load.Id,
            LoadRate = load.LoadRate,
            Distance = load.Distance,
            DeadheadMiles = load.DeadheadMiles,
            FuelPricePerGallon = load.FuelPricePerGallon,
            MilesPerGallon = load.MilesPerGallon,
            TollsCost = load.TollsCost,
            MaintenancePerMile = load.MaintenancePerMile,
            InsurancePerMile = load.InsurancePerMile,
            TruckPayment = load.TruckPayment,
            TrailerPayment = load.TrailerPayment,
            DispatchFeePercent = load.DispatchFeePercent,
            FactoringFeePercent = load.FactoringFeePercent,
            OtherExpenses = load.OtherExpenses,
            CalculatedProfit = load.CalculatedProfit,
            ProfitMargin = load.ProfitMargin,
            CreatedAt = load.CreatedAt
        });
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteLoad(int id)
    {
        var userId = GetUserId();
        if (userId == null)
        {
            return Unauthorized();
        }

        // Check if user is premium
        var user = await _context.Users.FindAsync(userId);
        if (user == null || !user.HasActivePremium())
        {
            return StatusCode(403, new { message = "Premium subscription required", requiresUpgrade = true });
        }

        var load = await _context.Loads
            .FirstOrDefaultAsync(l => l.Id == id && l.UserId == userId);

        if (load == null)
        {
            return NotFound();
        }

        _context.Loads.Remove(load);
        await _context.SaveChangesAsync();

        return NoContent();
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

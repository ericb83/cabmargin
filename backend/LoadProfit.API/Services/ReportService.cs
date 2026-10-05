using Microsoft.EntityFrameworkCore;
using LoadProfit.API.Controllers.DTOs;
using LoadProfit.API.Data;

namespace LoadProfit.API.Services;

public class ReportService : IReportService
{
    private readonly ApplicationDbContext _context;

    public ReportService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<ReportDto> GetWeeklyReportAsync(int userId)
    {
        var endDate = DateTime.UtcNow.Date.AddDays(1); // Include today
        var startDate = endDate.AddDays(-7);

        return await GenerateReportAsync(userId, startDate, endDate, "Weekly");
    }

    public async Task<ReportDto> GetMonthlyReportAsync(int userId)
    {
        var endDate = DateTime.UtcNow.Date.AddDays(1); // Include today
        var startDate = endDate.AddDays(-30);

        return await GenerateReportAsync(userId, startDate, endDate, "Monthly");
    }

    private async Task<ReportDto> GenerateReportAsync(int userId, DateTime startDate, DateTime endDate, string period)
    {
        var loads = await _context.Loads
            .Where(l => l.UserId == userId && l.CreatedAt >= startDate && l.CreatedAt < endDate)
            .ToListAsync();

        var totalLoads = loads.Count;
        var totalRevenue = loads.Sum(l => l.LoadRate);
        var totalProfit = loads.Sum(l => l.CalculatedProfit);
        var totalMiles = loads.Sum(l => l.Distance + l.DeadheadMiles);
        var totalCosts = totalRevenue - totalProfit;

        var avgProfitPerLoad = totalLoads > 0 ? totalProfit / totalLoads : 0;
        var avgProfitMargin = totalLoads > 0 ? loads.Average(l => l.ProfitMargin) : 0;
        var avgRatePerMile = totalMiles > 0 ? totalRevenue / loads.Sum(l => l.Distance) : 0;

        // Generate daily breakdown
        var dailyBreakdown = loads
            .GroupBy(l => l.CreatedAt.Date)
            .Select(g => new DailyProfitDto
            {
                Date = g.Key,
                LoadCount = g.Count(),
                Revenue = g.Sum(l => l.LoadRate),
                Profit = g.Sum(l => l.CalculatedProfit)
            })
            .OrderBy(d => d.Date)
            .ToList();

        // Fill in missing days with zeros
        var allDays = new List<DailyProfitDto>();
        for (var date = startDate; date < endDate; date = date.AddDays(1))
        {
            var existing = dailyBreakdown.FirstOrDefault(d => d.Date == date);
            allDays.Add(existing ?? new DailyProfitDto
            {
                Date = date,
                LoadCount = 0,
                Revenue = 0,
                Profit = 0
            });
        }

        return new ReportDto
        {
            Period = period,
            StartDate = startDate,
            EndDate = endDate.AddDays(-1),
            TotalLoads = totalLoads,
            TotalRevenue = Math.Round(totalRevenue, 2),
            TotalCosts = Math.Round(totalCosts, 2),
            TotalProfit = Math.Round(totalProfit, 2),
            AverageProfitPerLoad = Math.Round(avgProfitPerLoad, 2),
            AverageProfitMargin = Math.Round(avgProfitMargin, 2),
            TotalMiles = Math.Round(totalMiles, 2),
            AverageRatePerMile = Math.Round(avgRatePerMile, 2),
            DailyBreakdown = allDays
        };
    }
}



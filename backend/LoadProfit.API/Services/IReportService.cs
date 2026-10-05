using LoadProfit.API.Controllers.DTOs;

namespace LoadProfit.API.Services;

public interface IReportService
{
    Task<ReportDto> GetWeeklyReportAsync(int userId);
    Task<ReportDto> GetMonthlyReportAsync(int userId);
}



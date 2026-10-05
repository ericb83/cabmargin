namespace LoadProfit.API.Controllers.DTOs;

public class ReportDto
{
    public required string Period { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public int TotalLoads { get; set; }
    public decimal TotalRevenue { get; set; }
    public decimal TotalCosts { get; set; }
    public decimal TotalProfit { get; set; }
    public decimal AverageProfitPerLoad { get; set; }
    public decimal AverageProfitMargin { get; set; }
    public decimal TotalMiles { get; set; }
    public decimal AverageRatePerMile { get; set; }
    public List<DailyProfitDto> DailyBreakdown { get; set; } = new();
}

public class DailyProfitDto
{
    public DateTime Date { get; set; }
    public int LoadCount { get; set; }
    public decimal Revenue { get; set; }
    public decimal Profit { get; set; }
}



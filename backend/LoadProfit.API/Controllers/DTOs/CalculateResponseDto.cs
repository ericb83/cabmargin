namespace LoadProfit.API.Controllers.DTOs;

public class CalculateResponseDto
{
    public decimal LoadRate { get; set; }
    public decimal Distance { get; set; }
    public decimal DeadheadMiles { get; set; }
    public decimal TotalMiles { get; set; }
    public decimal FuelCost { get; set; }
    public decimal OperatingCosts { get; set; }
    public decimal TotalCosts { get; set; }
    public decimal NetProfit { get; set; }
    public decimal ProfitMargin { get; set; }
    public decimal RatePerMile { get; set; }
    
    // Input values for reference
    public decimal FuelPricePerGallon { get; set; }
    public decimal MilesPerGallon { get; set; }
    public decimal TollsCost { get; set; }
    public decimal MaintenancePerMile { get; set; }
    public decimal InsurancePerMile { get; set; }
    
    // New expense fields
    public decimal TruckPayment { get; set; }
    public decimal TrailerPayment { get; set; }
    public decimal DispatchFeePercent { get; set; }
    public decimal FactoringFeePercent { get; set; }
    public decimal DispatchFeeCost { get; set; }
    public decimal FactoringFeeCost { get; set; }
    
    public decimal OtherExpenses { get; set; }
}

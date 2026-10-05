namespace LoadProfit.API.Controllers.DTOs;

public class CalculateRequestDto
{
    public decimal LoadRate { get; set; }
    public decimal Distance { get; set; }
    public decimal DeadheadMiles { get; set; }
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
    
    public decimal OtherExpenses { get; set; }
}

using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LoadProfit.API.Models;

public class Load
{
    [Key]
    public int Id { get; set; }
    
    public int UserId { get; set; }
    
    [Column(TypeName = "decimal(18,2)")]
    public decimal LoadRate { get; set; }
    
    [Column(TypeName = "decimal(18,2)")]
    public decimal Distance { get; set; }
    
    [Column(TypeName = "decimal(18,2)")]
    public decimal DeadheadMiles { get; set; }
    
    [Column(TypeName = "decimal(18,3)")]
    public decimal FuelPricePerGallon { get; set; }
    
    [Column(TypeName = "decimal(18,2)")]
    public decimal MilesPerGallon { get; set; }
    
    [Column(TypeName = "decimal(18,2)")]
    public decimal TollsCost { get; set; }
    
    [Column(TypeName = "decimal(18,4)")]
    public decimal MaintenancePerMile { get; set; }
    
    [Column(TypeName = "decimal(18,4)")]
    public decimal InsurancePerMile { get; set; }
    
    // New expense fields
    [Column(TypeName = "decimal(18,2)")]
    public decimal TruckPayment { get; set; }
    
    [Column(TypeName = "decimal(18,2)")]
    public decimal TrailerPayment { get; set; }
    
    [Column(TypeName = "decimal(18,2)")]
    public decimal DispatchFeePercent { get; set; }
    
    [Column(TypeName = "decimal(18,2)")]
    public decimal FactoringFeePercent { get; set; }
    
    [Column(TypeName = "decimal(18,2)")]
    public decimal OtherExpenses { get; set; }
    
    [Column(TypeName = "decimal(18,2)")]
    public decimal CalculatedProfit { get; set; }
    
    [Column(TypeName = "decimal(18,2)")]
    public decimal ProfitMargin { get; set; }
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    // Navigation property
    [ForeignKey("UserId")]
    public User? User { get; set; }
}

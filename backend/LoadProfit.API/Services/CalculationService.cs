using LoadProfit.API.Controllers.DTOs;

namespace LoadProfit.API.Services;

public class CalculationService : ICalculationService
{
    public CalculateResponseDto Calculate(CalculateRequestDto request)
    {
        // Calculate total miles (loaded + deadhead)
        decimal totalMiles = request.Distance + request.DeadheadMiles;
        
        // Calculate fuel cost
        decimal gallonsNeeded = request.MilesPerGallon > 0 
            ? totalMiles / request.MilesPerGallon 
            : 0;
        decimal fuelCost = gallonsNeeded * request.FuelPricePerGallon;
        
        // Calculate dispatch and factoring fees (percentage of load rate)
        decimal dispatchFeeCost = request.LoadRate * (request.DispatchFeePercent / 100);
        decimal factoringFeeCost = request.LoadRate * (request.FactoringFeePercent / 100);
        
        // Calculate operating costs
        decimal maintenanceCost = totalMiles * request.MaintenancePerMile;
        decimal insuranceCost = totalMiles * request.InsurancePerMile;
        decimal operatingCosts = maintenanceCost + insuranceCost + 
                                 request.TollsCost + 
                                 request.TruckPayment + 
                                 request.TrailerPayment +
                                 dispatchFeeCost +
                                 factoringFeeCost +
                                 request.OtherExpenses;
        
        // Calculate total costs
        decimal totalCosts = fuelCost + operatingCosts;
        
        // Calculate net profit
        decimal netProfit = request.LoadRate - totalCosts;
        
        // Calculate profit margin (as percentage)
        decimal profitMargin = request.LoadRate > 0 
            ? (netProfit / request.LoadRate) * 100 
            : 0;
        
        // Calculate rate per mile (based on loaded miles only)
        decimal ratePerMile = request.Distance > 0 
            ? request.LoadRate / request.Distance 
            : 0;

        return new CalculateResponseDto
        {
            LoadRate = request.LoadRate,
            Distance = request.Distance,
            DeadheadMiles = request.DeadheadMiles,
            TotalMiles = totalMiles,
            FuelCost = Math.Round(fuelCost, 2),
            OperatingCosts = Math.Round(operatingCosts, 2),
            TotalCosts = Math.Round(totalCosts, 2),
            NetProfit = Math.Round(netProfit, 2),
            ProfitMargin = Math.Round(profitMargin, 2),
            RatePerMile = Math.Round(ratePerMile, 2),
            FuelPricePerGallon = request.FuelPricePerGallon,
            MilesPerGallon = request.MilesPerGallon,
            TollsCost = request.TollsCost,
            MaintenancePerMile = request.MaintenancePerMile,
            InsurancePerMile = request.InsurancePerMile,
            TruckPayment = request.TruckPayment,
            TrailerPayment = request.TrailerPayment,
            DispatchFeePercent = request.DispatchFeePercent,
            FactoringFeePercent = request.FactoringFeePercent,
            DispatchFeeCost = Math.Round(dispatchFeeCost, 2),
            FactoringFeeCost = Math.Round(factoringFeeCost, 2),
            OtherExpenses = request.OtherExpenses
        };
    }
}

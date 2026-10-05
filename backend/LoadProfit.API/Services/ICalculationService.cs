using LoadProfit.API.Controllers.DTOs;

namespace LoadProfit.API.Services;

public interface ICalculationService
{
    CalculateResponseDto Calculate(CalculateRequestDto request);
}


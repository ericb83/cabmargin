using Microsoft.AspNetCore.Mvc;
using LoadProfit.API.Controllers.DTOs;
using LoadProfit.API.Services;

namespace LoadProfit.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CalculateController : ControllerBase
{
    private readonly ICalculationService _calculationService;

    public CalculateController(ICalculationService calculationService)
    {
        _calculationService = calculationService;
    }

    [HttpPost]
    public ActionResult<CalculateResponseDto> Calculate([FromBody] CalculateRequestDto request)
    {
        if (request.Distance <= 0)
        {
            return BadRequest("Distance must be greater than 0");
        }

        if (request.MilesPerGallon <= 0)
        {
            return BadRequest("Miles per gallon must be greater than 0");
        }

        var result = _calculationService.Calculate(request);
        return Ok(result);
    }
}


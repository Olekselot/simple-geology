using API_net.DTOs;
using BLL_net.Models;
using BLL_net.Services;
using Microsoft.AspNetCore.Mvc;

namespace API_net.Controllers;

[ApiController]
[Route("api/[controller]")]
public class GeologicalObjectsController : ControllerBase
{
    private readonly IGeologicalObjectService _service;

    public GeologicalObjectsController(IGeologicalObjectService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<GeologicalObjectDto>>> GetAll(CancellationToken cancellationToken)
    {
        var items = await _service.GetAllAsync(cancellationToken);
        return Ok(items.Select(ToDto));
    }

    [HttpGet("classes/top-level")]
    public async Task<ActionResult<IEnumerable<string>>> GetTopLevelClasses(CancellationToken cancellationToken)
    {
        var items = await _service.GetTopLevelClassNamesAsync(cancellationToken);
        return Ok(items);
    }

    [HttpGet("classes/children")]
    public async Task<ActionResult<IEnumerable<string>>> GetChildClasses(
        [FromQuery] string topLevelName,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(topLevelName))
        {
            return BadRequest(new { error = "topLevelName is required" });
        }

        var items = await _service.GetChildClassNamesAsync(topLevelName, cancellationToken);
        return Ok(items);
    }

    [HttpGet("classes/cildren-level")]
    public async Task<ActionResult<IEnumerable<string>>> GetChildrenLevelClasses(
        [FromQuery] string currentLevel,
        [FromQuery] string selectedName,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(currentLevel))
        {
            return BadRequest(new { error = "currentLevel is required" });
        }

        if (string.IsNullOrWhiteSpace(selectedName))
        {
            return BadRequest(new { error = "selectedName is required" });
        }

        var items = await _service.GetChildrenLevelClassNamesAsync(currentLevel, selectedName, cancellationToken);
        return Ok(items);
    }

    [HttpGet("minerals/characteristics")]
    public async Task<ActionResult<MineralCharacteristicDto>> GetMineralCharacteristics(
        [FromQuery] int? mineralId,
        [FromQuery] string? mineralName,
        CancellationToken cancellationToken)
    {
        if (!mineralId.HasValue && string.IsNullOrWhiteSpace(mineralName))
        {
            return BadRequest(new { error = "Provide mineralId or mineralName" });
        }

        var characteristic = await _service.GetMineralCharacteristicAsync(mineralId, mineralName, cancellationToken);
        if (characteristic is null)
        {
            return NotFound(new { error = "Mineral was not found" });
        }

        return Ok(ToDto(characteristic));
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<GeologicalObjectDto>> GetById(int id, CancellationToken cancellationToken)
    {
        var item = await _service.GetByIdAsync(id, cancellationToken);
        if (item is null)
        {
            return NotFound();
        }

        return Ok(ToDto(item));
    }

    [HttpPost]
    public async Task<ActionResult<GeologicalObjectDto>> Create(
        CreateGeologicalObjectDto request,
        CancellationToken cancellationToken)
    {
        try
        {
            var created = await _service.AddAsync(
                new CreateGeologicalObjectRequest(request.Name, request.Type, request.DepthMeters, request.Description),
                cancellationToken);

            var dto = ToDto(created);
            return CreatedAtAction(nameof(GetById), new { id = dto.Id }, dto);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    private static GeologicalObjectDto ToDto(GeologicalObject item)
    {
        return new GeologicalObjectDto(item.Id, item.Name, item.Type, item.DepthMeters, item.Description);
    }

    private static MineralCharacteristicDto ToDto(MineralCharacteristic item)
    {
        return new MineralCharacteristicDto(
            item.MineralId,
            item.MineralName,
            item.ChemicalFormula,
            item.Luster,
            item.Color,
            item.Streak,
            item.Transparency,
            item.HardnessMohs,
            item.Cleavage,
            item.Fracture,
            item.Tenacity,
            item.SpecificGravity,
            item.Magnetism,
            item.Morphology,
            item.Paragenesis,
            item.SpecialProperties,
            item.Notes);
    }
}
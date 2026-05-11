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
        try
        {
            var items = await _service.GetAllAsync(cancellationToken);
            return Ok(items.Select(ToDto));
        }
        catch (Exception ex)
        {
            return Error<IEnumerable<GeologicalObjectDto>>(ex.Message);
        }
    }

    [HttpGet("classes/top-level")]
    public async Task<ActionResult<IEnumerable<string>>> GetTopLevelClasses(CancellationToken cancellationToken)
    {
        try
        {
            var items = await _service.GetTopLevelClassNamesAsync(cancellationToken);
            return Ok(items);
        }
        catch (Exception ex)
        {
            return Error<IEnumerable<string>>(ex.Message);
        }
    }

    [HttpGet("classes/second-level")]
    public async Task<ActionResult<IEnumerable<string>>> GetChildClasses(
        [FromQuery] string topLevelName,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(topLevelName))
        {
            return BadRequest(new { error = "topLevelName is required" });
        }

        try
        {
            var items = await _service.GetChildClassNamesAsync(topLevelName, cancellationToken);
            return Ok(items);
        }
        catch (Exception ex)
        {
            return Error<IEnumerable<string>>(ex.Message);
        }
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

        try
        {
            var items = await _service.GetChildrenLevelClassNamesAsync(currentLevel, selectedName, cancellationToken);
            return Ok(items);
        }
        catch (Exception ex)
        {
            return Error<IEnumerable<string>>(ex.Message);
        }
    }

    [HttpGet("search")]
    public async Task<ActionResult<IEnumerable<SearchResultDto>>> Search(
        [FromQuery] string query,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(query) || query.Trim().Length < 3)
        {
            return BadRequest(new { error = "query must be at least 3 characters" });
        }

        try
        {
            var results = await _service.SearchAsync(query.Trim(), cancellationToken);
            return Ok(results.Select(r => new SearchResultDto(r.Name, r.EntityType, GetEntityTypeLabel(r.EntityType))));
        }
        catch (Exception ex)
        {
            return Error<IEnumerable<SearchResultDto>>(ex.Message);
        }
    }

    [HttpGet("search/minerals")]
    public async Task<ActionResult<IEnumerable<MineralSearchResultDto>>> SearchMinerals(
        [FromQuery] MineralSearchFiltersDto filters,
        CancellationToken cancellationToken)
    {
        var hasFilters = HasAnyMineralFilters(filters);
        if (!hasFilters && (string.IsNullOrWhiteSpace(filters.Query) || filters.Query.Trim().Length < 3))
        {
            return BadRequest(new { error = "query must be at least 3 characters when filters are not set" });
        }

        try
        {
            var results = await _service.SearchMineralsAsync(
                new MineralSearchFilters
                {
                    Query = filters.Query,
                    ChemicalFormula = filters.ChemicalFormula,
                    MineralClass = filters.MineralClass,
                    SilicateStructure = filters.SilicateStructure,
                    Luster = filters.Luster,
                    Color = filters.Color,
                    Streak = filters.Streak,
                    Transparency = filters.Transparency,
                    Cleavage = filters.Cleavage,
                    Fracture = filters.Fracture,
                    Tenacity = filters.Tenacity,
                    Morphology = filters.Morphology,
                    Paragenesis = filters.Paragenesis,
                    SpecialProperties = filters.SpecialProperties,
                    Notes = filters.Notes,
                    Description = filters.Description,
                    CommonUse = filters.CommonUse,
                    HardnessMin = filters.HardnessMin,
                    HardnessMax = filters.HardnessMax,
                    SpecificGravityMin = filters.SpecificGravityMin,
                    SpecificGravityMax = filters.SpecificGravityMax,
                    Magnetism = filters.Magnetism,
                    HasSilicateStructure = filters.HasSilicateStructure,
                    HasCharacteristics = filters.HasCharacteristics,
                    Limit = filters.Limit ?? 100
                },
                cancellationToken);

            return Ok(results.Select(x => new MineralSearchResultDto(
                x.MineralId,
                x.MineralName,
                x.MineralClass,
                x.SilicateStructure,
                x.ChemicalFormula,
                x.HardnessMohs,
                x.SpecificGravity,
                x.Color,
                x.Luster,
                x.Magnetism)));
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
        catch (Exception ex)
        {
            return Error<IEnumerable<MineralSearchResultDto>>(ex.Message);
        }
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

        try
        {
            var characteristic = await _service.GetMineralCharacteristicAsync(mineralId, mineralName, cancellationToken);
            if (characteristic is null)
            {
                return NotFound(new { error = "Mineral was not found" });
            }

            return Ok(ToDto(characteristic));
        }
        catch (Exception ex)
        {
            return Error<MineralCharacteristicDto>(ex.Message);
        }
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<GeologicalObjectDto>> GetById(int id, CancellationToken cancellationToken)
    {
        try
        {
            var item = await _service.GetByIdAsync(id, cancellationToken);
            if (item is null)
            {
                return NotFound(new { error = $"Geological object with id {id} was not found" });
            }

            return Ok(ToDto(item));
        }
        catch (Exception ex)
        {
            return Error<GeologicalObjectDto>(ex.Message);
        }
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
        catch (Exception ex)
        {
            return Error<GeologicalObjectDto>(ex.Message);
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

    private static string GetEntityTypeLabel(string entityType) => entityType switch
    {
        "top-level"          => "Верхня категорія",
        "rock-type"          => "Тип породи",
        "rock-subtype"       => "Підтип породи",
        "rock"               => "Гірська порода",
        "silicate-structure" => "Силікатна структура",
        "mineral-class"      => "Клас мінералів",
        "mineral"            => "Мінерал",
        _                    => entityType
    };

    private static ObjectResult Error<T>(string message)
    {
        return new ObjectResult(new { error = message })
        {
            StatusCode = StatusCodes.Status500InternalServerError
        };
    }

    private static bool HasAnyMineralFilters(MineralSearchFiltersDto filters)
    {
        return
            !string.IsNullOrWhiteSpace(filters.ChemicalFormula) ||
            !string.IsNullOrWhiteSpace(filters.MineralClass) ||
            !string.IsNullOrWhiteSpace(filters.SilicateStructure) ||
            !string.IsNullOrWhiteSpace(filters.Luster) ||
            !string.IsNullOrWhiteSpace(filters.Color) ||
            !string.IsNullOrWhiteSpace(filters.Streak) ||
            !string.IsNullOrWhiteSpace(filters.Transparency) ||
            !string.IsNullOrWhiteSpace(filters.Cleavage) ||
            !string.IsNullOrWhiteSpace(filters.Fracture) ||
            !string.IsNullOrWhiteSpace(filters.Tenacity) ||
            !string.IsNullOrWhiteSpace(filters.Morphology) ||
            !string.IsNullOrWhiteSpace(filters.Paragenesis) ||
            !string.IsNullOrWhiteSpace(filters.SpecialProperties) ||
            !string.IsNullOrWhiteSpace(filters.Notes) ||
            !string.IsNullOrWhiteSpace(filters.Description) ||
            !string.IsNullOrWhiteSpace(filters.CommonUse) ||
            filters.HardnessMin.HasValue ||
            filters.HardnessMax.HasValue ||
            filters.SpecificGravityMin.HasValue ||
            filters.SpecificGravityMax.HasValue ||
            filters.Magnetism.HasValue ||
            filters.HasSilicateStructure.HasValue ||
            filters.HasCharacteristics.HasValue;
    }
}
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
}
using BLL_net.Abstractions;
using BLL_net.Models;

namespace BLL_net.Services;

public class GeologicalObjectService : IGeologicalObjectService
{
    private readonly IGeologicalObjectRepository _repository;

    public GeologicalObjectService(IGeologicalObjectRepository repository)
    {
        _repository = repository;
    }

    public Task<IReadOnlyList<GeologicalObject>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return _repository.GetAllAsync(cancellationToken);
    }

    public Task<GeologicalObject?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        return _repository.GetByIdAsync(id, cancellationToken);
    }

    public Task<GeologicalObject> AddAsync(CreateGeologicalObjectRequest request, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(request.Name))
        {
            throw new ArgumentException("Name is required", nameof(request.Name));
        }

        if (string.IsNullOrWhiteSpace(request.Type))
        {
            throw new ArgumentException("Type is required", nameof(request.Type));
        }

        if (request.DepthMeters < 0)
        {
            throw new ArgumentException("Depth cannot be negative", nameof(request.DepthMeters));
        }

        var geologicalObject = new GeologicalObject
        {
            Name = request.Name.Trim(),
            Type = request.Type.Trim(),
            DepthMeters = request.DepthMeters,
            Description = request.Description?.Trim() ?? string.Empty
        };

        return _repository.AddAsync(geologicalObject, cancellationToken);
    }
}
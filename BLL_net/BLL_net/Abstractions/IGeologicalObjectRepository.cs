using BLL_net.Models;

namespace BLL_net.Abstractions;

public interface IGeologicalObjectRepository
{
    Task<IReadOnlyList<GeologicalObject>> GetAllAsync(CancellationToken cancellationToken = default);

    Task<GeologicalObject?> GetByIdAsync(int id, CancellationToken cancellationToken = default);

    Task<GeologicalObject> AddAsync(GeologicalObject geologicalObject, CancellationToken cancellationToken = default);
}
using BLL_net.Models;

namespace BLL_net.Services;

public interface IGeologicalObjectService
{
    Task<IReadOnlyList<GeologicalObject>> GetAllAsync(CancellationToken cancellationToken = default);

    Task<GeologicalObject?> GetByIdAsync(int id, CancellationToken cancellationToken = default);

    Task<GeologicalObject> AddAsync(CreateGeologicalObjectRequest request, CancellationToken cancellationToken = default);
}
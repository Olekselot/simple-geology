using BLL_net.Abstractions;
using BLL_net.Models;

namespace DAL_net.Repositories;

public class InMemoryGeologicalObjectRepository : IGeologicalObjectRepository
{
    private readonly List<GeologicalObject> _items =
    [
        new GeologicalObject
        {
            Id = 1,
            Name = "Kryvyi Rih Iron Ore",
            Type = "Ore deposit",
            DepthMeters = 1200,
            Description = "Large iron ore basin in central Ukraine"
        },
        new GeologicalObject
        {
            Id = 2,
            Name = "Shale Layer D-12",
            Type = "Sedimentary layer",
            DepthMeters = 340,
            Description = "Prospective shale gas layer"
        }
    ];

    public Task<IReadOnlyList<GeologicalObject>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return Task.FromResult<IReadOnlyList<GeologicalObject>>(_items.ToList());
    }

    public Task<GeologicalObject?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        return Task.FromResult(_items.FirstOrDefault(x => x.Id == id));
    }

    public Task<GeologicalObject> AddAsync(GeologicalObject geologicalObject, CancellationToken cancellationToken = default)
    {
        var nextId = _items.Count == 0 ? 1 : _items.Max(x => x.Id) + 1;
        geologicalObject.Id = nextId;
        _items.Add(geologicalObject);

        return Task.FromResult(geologicalObject);
    }
}
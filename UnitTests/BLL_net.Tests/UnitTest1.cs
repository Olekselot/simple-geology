using BLL_net.Abstractions;
using BLL_net.Models;
using BLL_net.Services;

namespace BLL_net.Tests;

public class GeologicalObjectServiceTests
{
    [Fact]
    public async Task AddAsync_Should_Create_Object_With_Trimmed_Values()
    {
        var repository = new FakeRepository();
        var service = new GeologicalObjectService(repository);

        var created = await service.AddAsync(new CreateGeologicalObjectRequest("  Core-17  ", "  Borehole  ", 120.5, "  test  "));

        Assert.Equal(1, created.Id);
        Assert.Equal("Core-17", created.Name);
        Assert.Equal("Borehole", created.Type);
        Assert.Equal(120.5, created.DepthMeters);
        Assert.Equal("test", created.Description);
    }

    [Fact]
    public async Task AddAsync_Should_Throw_When_Name_Is_Empty()
    {
        var repository = new FakeRepository();
        var service = new GeologicalObjectService(repository);

        await Assert.ThrowsAsync<ArgumentException>(() =>
            service.AddAsync(new CreateGeologicalObjectRequest(" ", "Borehole", 10, "")));
    }

    private sealed class FakeRepository : IGeologicalObjectRepository
    {
        private readonly List<GeologicalObject> _items = [];

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
            geologicalObject.Id = _items.Count + 1;
            _items.Add(geologicalObject);
            return Task.FromResult(geologicalObject);
        }

        public Task<IReadOnlyList<string>> GetTopLevelClassNamesAsync(CancellationToken cancellationToken = default)
        {
            return Task.FromResult<IReadOnlyList<string>>([]);
        }

        public Task<IReadOnlyList<string>> GetChildClassNamesAsync(string topLevelName, CancellationToken cancellationToken = default)
        {
            return Task.FromResult<IReadOnlyList<string>>([]);
        }

        public Task<IReadOnlyList<string>> GetChildrenLevelClassNamesAsync(string currentLevel, string selectedName, CancellationToken cancellationToken = default)
        {
            return Task.FromResult<IReadOnlyList<string>>([]);
        }

        public Task<MineralCharacteristic?> GetMineralCharacteristicAsync(int? mineralId, string? mineralName, CancellationToken cancellationToken = default)
        {
            return Task.FromResult<MineralCharacteristic?>(null);
        }
    }
}

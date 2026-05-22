using BLL_net.Abstractions;
using BLL_net.Models;
using BLL_net.Services;

namespace BLL_net.Tests;

public class GeologicalObjectServiceTests
{
    // ── AddAsync ──────────────────────────────────────────────────────────────

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

    [Fact]
    public async Task AddAsync_Should_Throw_When_Type_Is_Empty()
    {
        var service = new GeologicalObjectService(new FakeRepository());

        await Assert.ThrowsAsync<ArgumentException>(() =>
            service.AddAsync(new CreateGeologicalObjectRequest("Core-1", "  ", 10, "")));
    }

    [Fact]
    public async Task AddAsync_Should_Throw_When_Depth_Is_Negative()
    {
        var service = new GeologicalObjectService(new FakeRepository());

        await Assert.ThrowsAsync<ArgumentException>(() =>
            service.AddAsync(new CreateGeologicalObjectRequest("Core-1", "Borehole", -1, "")));
    }

    [Fact]
    public async Task AddAsync_Should_Allow_Zero_Depth()
    {
        var service = new GeologicalObjectService(new FakeRepository());

        var created = await service.AddAsync(new CreateGeologicalObjectRequest("Core-1", "Borehole", 0, ""));

        Assert.Equal(0, created.DepthMeters);
    }

    [Fact]
    public async Task AddAsync_Should_Set_Empty_Description_When_Null()
    {
        var service = new GeologicalObjectService(new FakeRepository());

        var created = await service.AddAsync(new CreateGeologicalObjectRequest("Core-1", "Borehole", 10, null));

        Assert.Equal(string.Empty, created.Description);
    }

    // ── GetAllAsync ───────────────────────────────────────────────────────────

    [Fact]
    public async Task GetAllAsync_Should_Return_All_Items_From_Repository()
    {
        var repo = new FakeRepository();
        repo.Seed(new GeologicalObject { Id = 1, Name = "A", Type = "T" });
        repo.Seed(new GeologicalObject { Id = 2, Name = "B", Type = "T" });
        var service = new GeologicalObjectService(repo);

        var result = await service.GetAllAsync();

        Assert.Equal(2, result.Count);
    }

    // ── GetByIdAsync ──────────────────────────────────────────────────────────

    [Fact]
    public async Task GetByIdAsync_Should_Return_Item_When_Found()
    {
        var repo = new FakeRepository();
        repo.Seed(new GeologicalObject { Id = 7, Name = "Rock", Type = "Igneous" });
        var service = new GeologicalObjectService(repo);

        var result = await service.GetByIdAsync(7);

        Assert.NotNull(result);
        Assert.Equal("Rock", result.Name);
    }

    [Fact]
    public async Task GetByIdAsync_Should_Return_Null_When_Not_Found()
    {
        var service = new GeologicalObjectService(new FakeRepository());

        var result = await service.GetByIdAsync(999);

        Assert.Null(result);
    }

    // ── GetTopLevelClassNamesAsync ────────────────────────────────────────────

    [Fact]
    public async Task GetTopLevelClassNamesAsync_Should_Delegate_To_Repository()
    {
        var repo = new FakeRepository(topLevel: ["Rocks", "Minerals"]);
        var service = new GeologicalObjectService(repo);

        var result = await service.GetTopLevelClassNamesAsync();

        Assert.Equal(["Rocks", "Minerals"], result);
    }

    // ── GetChildClassNamesAsync ───────────────────────────────────────────────

    [Fact]
    public async Task GetChildClassNamesAsync_Should_Delegate_To_Repository()
    {
        var repo = new FakeRepository(children: ["Granite", "Basalt"]);
        var service = new GeologicalObjectService(repo);

        var result = await service.GetChildClassNamesAsync("Rocks");

        Assert.Equal(["Granite", "Basalt"], result);
    }

    // ── GetChildrenLevelClassNamesAsync ───────────────────────────────────────

    [Fact]
    public async Task GetChildrenLevelClassNamesAsync_Should_Delegate_To_Repository()
    {
        var repo = new FakeRepository(levelChildren: ["Feldspar"]);
        var service = new GeologicalObjectService(repo);

        var result = await service.GetChildrenLevelClassNamesAsync("Minerals", "Silicates");

        Assert.Equal(["Feldspar"], result);
    }

    // ── GetMineralCharacteristicAsync ─────────────────────────────────────────

    [Fact]
    public async Task GetMineralCharacteristicAsync_Should_Return_Null_When_Not_Found()
    {
        var service = new GeologicalObjectService(new FakeRepository());

        var result = await service.GetMineralCharacteristicAsync(null, "Unknown");

        Assert.Null(result);
    }

    // ── SearchAsync ───────────────────────────────────────────────────────────

    [Fact]
    public async Task SearchAsync_Should_Delegate_To_Repository()
    {
        var repo = new FakeRepository(searchResults:
        [
            new SearchResult("Quartz", "Mineral"),
        ]);
        var service = new GeologicalObjectService(repo);

        var result = await service.SearchAsync("Quartz");

        Assert.Single(result);
        Assert.Equal("Quartz", result[0].Name);
    }

    // ── SearchMineralsAsync ───────────────────────────────────────────────────

    [Fact]
    public async Task SearchMineralsAsync_Should_Throw_When_HardnessMin_Greater_Than_Max()
    {
        var service = new GeologicalObjectService(new FakeRepository());

        await Assert.ThrowsAsync<ArgumentException>(() =>
            service.SearchMineralsAsync(new MineralSearchFilters { HardnessMin = 9, HardnessMax = 3 }));
    }

    [Fact]
    public async Task SearchMineralsAsync_Should_Throw_When_GravityMin_Greater_Than_Max()
    {
        var service = new GeologicalObjectService(new FakeRepository());

        await Assert.ThrowsAsync<ArgumentException>(() =>
            service.SearchMineralsAsync(new MineralSearchFilters { SpecificGravityMin = 5, SpecificGravityMax = 2 }));
    }

    [Fact]
    public async Task SearchMineralsAsync_Should_Clamp_Limit_Zero_To_100()
    {
        MineralSearchFilters? captured = null;
        var repo = new FakeRepository(onSearchMinerals: f => captured = f);
        var service = new GeologicalObjectService(repo);

        await service.SearchMineralsAsync(new MineralSearchFilters { Limit = 0 });

        Assert.Equal(100, captured!.Limit);
    }

    [Fact]
    public async Task SearchMineralsAsync_Should_Clamp_Negative_Limit_To_100()
    {
        MineralSearchFilters? captured = null;
        var repo = new FakeRepository(onSearchMinerals: f => captured = f);
        var service = new GeologicalObjectService(repo);

        await service.SearchMineralsAsync(new MineralSearchFilters { Limit = -5 });

        Assert.Equal(100, captured!.Limit);
    }

    [Fact]
    public async Task SearchMineralsAsync_Should_Clamp_Limit_Above_300_To_300()
    {
        MineralSearchFilters? captured = null;
        var repo = new FakeRepository(onSearchMinerals: f => captured = f);
        var service = new GeologicalObjectService(repo);

        await service.SearchMineralsAsync(new MineralSearchFilters { Limit = 999 });

        Assert.Equal(300, captured!.Limit);
    }

    [Fact]
    public async Task SearchMineralsAsync_Should_Keep_Limit_Within_Valid_Range()
    {
        MineralSearchFilters? captured = null;
        var repo = new FakeRepository(onSearchMinerals: f => captured = f);
        var service = new GeologicalObjectService(repo);

        await service.SearchMineralsAsync(new MineralSearchFilters { Limit = 50 });

        Assert.Equal(50, captured!.Limit);
    }

    [Fact]
    public async Task SearchMineralsAsync_Should_Trim_String_Fields()
    {
        MineralSearchFilters? captured = null;
        var repo = new FakeRepository(onSearchMinerals: f => captured = f);
        var service = new GeologicalObjectService(repo);

        await service.SearchMineralsAsync(new MineralSearchFilters
        {
            Query = "  quartz  ",
            Color = "  white  ",
            MineralClass = "  Silicates  "
        });

        Assert.Equal("quartz", captured!.Query);
        Assert.Equal("white", captured!.Color);
        Assert.Equal("Silicates", captured!.MineralClass);
    }

    [Fact]
    public async Task SearchMineralsAsync_Should_Not_Throw_When_HardnessMin_Equals_Max()
    {
        var service = new GeologicalObjectService(new FakeRepository());

        var ex = await Record.ExceptionAsync(() =>
            service.SearchMineralsAsync(new MineralSearchFilters { HardnessMin = 5, HardnessMax = 5 }));

        Assert.Null(ex);
    }

    private sealed class FakeRepository(
        IReadOnlyList<string>? topLevel = null,
        IReadOnlyList<string>? children = null,
        IReadOnlyList<string>? levelChildren = null,
        IReadOnlyList<SearchResult>? searchResults = null,
        Action<MineralSearchFilters>? onSearchMinerals = null) : IGeologicalObjectRepository
    {
        private readonly List<GeologicalObject> _items = [];

        public void Seed(GeologicalObject item) => _items.Add(item);

        public Task<IReadOnlyList<GeologicalObject>> GetAllAsync(CancellationToken cancellationToken = default) =>
            Task.FromResult<IReadOnlyList<GeologicalObject>>(_items.ToList());

        public Task<GeologicalObject?> GetByIdAsync(int id, CancellationToken cancellationToken = default) =>
            Task.FromResult(_items.FirstOrDefault(x => x.Id == id));

        public Task<GeologicalObject> AddAsync(GeologicalObject geologicalObject, CancellationToken cancellationToken = default)
        {
            geologicalObject.Id = _items.Count + 1;
            _items.Add(geologicalObject);
            return Task.FromResult(geologicalObject);
        }

        public Task<IReadOnlyList<string>> GetTopLevelClassNamesAsync(CancellationToken cancellationToken = default) =>
            Task.FromResult(topLevel ?? (IReadOnlyList<string>)[]);

        public Task<IReadOnlyList<string>> GetChildClassNamesAsync(string topLevelName, CancellationToken cancellationToken = default) =>
            Task.FromResult(children ?? (IReadOnlyList<string>)[]);

        public Task<IReadOnlyList<string>> GetChildrenLevelClassNamesAsync(string currentLevel, string selectedName, CancellationToken cancellationToken = default) =>
            Task.FromResult(levelChildren ?? (IReadOnlyList<string>)[]);

        public Task<MineralCharacteristic?> GetMineralCharacteristicAsync(int? mineralId, string? mineralName, CancellationToken cancellationToken = default) =>
            Task.FromResult<MineralCharacteristic?>(null);

        public Task<IReadOnlyList<SearchResult>> SearchAsync(string query, CancellationToken cancellationToken = default) =>
            Task.FromResult(searchResults ?? (IReadOnlyList<SearchResult>)[]);

        public Task<IReadOnlyList<MineralSearchResult>> SearchMineralsAsync(MineralSearchFilters filters, CancellationToken cancellationToken = default)
        {
            onSearchMinerals?.Invoke(filters);
            return Task.FromResult<IReadOnlyList<MineralSearchResult>>([]);
        }

        public Task<(byte[] Data, string ContentType)?> GetMineralImageAsync(int mineralId, CancellationToken cancellationToken = default) =>
            Task.FromResult<(byte[] Data, string ContentType)?>(null);

        public Task UploadMineralImageAsync(int mineralId, byte[] data, string contentType, CancellationToken cancellationToken = default) =>
            Task.CompletedTask;
    }
}

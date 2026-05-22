using BLL_net.Models;

namespace BLL_net.Abstractions;

public interface IGeologicalObjectRepository
{
    Task<IReadOnlyList<GeologicalObject>> GetAllAsync(CancellationToken cancellationToken = default);

    Task<GeologicalObject?> GetByIdAsync(int id, CancellationToken cancellationToken = default);

    Task<GeologicalObject> AddAsync(GeologicalObject geologicalObject, CancellationToken cancellationToken = default);

    Task<IReadOnlyList<string>> GetTopLevelClassNamesAsync(CancellationToken cancellationToken = default);

    Task<IReadOnlyList<string>> GetChildClassNamesAsync(string topLevelName, CancellationToken cancellationToken = default);

    Task<IReadOnlyList<string>> GetChildrenLevelClassNamesAsync(
        string currentLevel,
        string selectedName,
        CancellationToken cancellationToken = default);

    Task<MineralCharacteristic?> GetMineralCharacteristicAsync(
        int? mineralId,
        string? mineralName,
        CancellationToken cancellationToken = default);

    Task<IReadOnlyList<SearchResult>> SearchAsync(
        string query,
        CancellationToken cancellationToken = default);

    Task<IReadOnlyList<MineralSearchResult>> SearchMineralsAsync(
        MineralSearchFilters filters,
        CancellationToken cancellationToken = default);

    Task<(byte[] Data, string ContentType)?> GetMineralImageAsync(
        int mineralId,
        CancellationToken cancellationToken = default);

    Task UploadMineralImageAsync(
        int mineralId,
        byte[] data,
        string contentType,
        CancellationToken cancellationToken = default);
}
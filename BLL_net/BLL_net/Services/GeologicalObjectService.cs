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

    public Task<IReadOnlyList<string>> GetTopLevelClassNamesAsync(CancellationToken cancellationToken = default)
    {
        return _repository.GetTopLevelClassNamesAsync(cancellationToken);
    }

    public Task<IReadOnlyList<string>> GetChildClassNamesAsync(string topLevelName, CancellationToken cancellationToken = default)
    {
        return _repository.GetChildClassNamesAsync(topLevelName, cancellationToken);
    }

    public Task<IReadOnlyList<string>> GetChildrenLevelClassNamesAsync(
        string currentLevel,
        string selectedName,
        CancellationToken cancellationToken = default)
    {
        return _repository.GetChildrenLevelClassNamesAsync(currentLevel, selectedName, cancellationToken);
    }

    public Task<MineralCharacteristic?> GetMineralCharacteristicAsync(
        int? mineralId,
        string? mineralName,
        CancellationToken cancellationToken = default)
    {
        return _repository.GetMineralCharacteristicAsync(mineralId, mineralName, cancellationToken);
    }

    public Task<IReadOnlyList<SearchResult>> SearchAsync(
        string query,
        CancellationToken cancellationToken = default)
    {
        return _repository.SearchAsync(query, cancellationToken);
    }

    public Task<IReadOnlyList<MineralSearchResult>> SearchMineralsAsync(
        MineralSearchFilters filters,
        CancellationToken cancellationToken = default)
    {
        if (filters.HardnessMin.HasValue && filters.HardnessMax.HasValue && filters.HardnessMin > filters.HardnessMax)
        {
            throw new ArgumentException("hardnessMin cannot be greater than hardnessMax");
        }

        if (filters.SpecificGravityMin.HasValue && filters.SpecificGravityMax.HasValue && filters.SpecificGravityMin > filters.SpecificGravityMax)
        {
            throw new ArgumentException("specificGravityMin cannot be greater than specificGravityMax");
        }

        var safeLimit = filters.Limit switch
        {
            <= 0 => 100,
            > 300 => 300,
            _ => filters.Limit
        };

        var normalizedFilters = new MineralSearchFilters
        {
            Query = filters.Query?.Trim(),
            ChemicalFormula = filters.ChemicalFormula?.Trim(),
            MineralClass = filters.MineralClass?.Trim(),
            SilicateStructure = filters.SilicateStructure?.Trim(),
            Luster = filters.Luster?.Trim(),
            Color = filters.Color?.Trim(),
            Streak = filters.Streak?.Trim(),
            Transparency = filters.Transparency?.Trim(),
            Cleavage = filters.Cleavage?.Trim(),
            Fracture = filters.Fracture?.Trim(),
            Tenacity = filters.Tenacity?.Trim(),
            Morphology = filters.Morphology?.Trim(),
            Paragenesis = filters.Paragenesis?.Trim(),
            SpecialProperties = filters.SpecialProperties?.Trim(),
            Notes = filters.Notes?.Trim(),
            Description = filters.Description?.Trim(),
            CommonUse = filters.CommonUse?.Trim(),
            HardnessMin = filters.HardnessMin,
            HardnessMax = filters.HardnessMax,
            SpecificGravityMin = filters.SpecificGravityMin,
            SpecificGravityMax = filters.SpecificGravityMax,
            Magnetism = filters.Magnetism,
            HasSilicateStructure = filters.HasSilicateStructure,
            HasCharacteristics = filters.HasCharacteristics,
            Limit = safeLimit
        };

        return _repository.SearchMineralsAsync(normalizedFilters, cancellationToken);
    }

    public Task<(byte[] Data, string ContentType)?> GetMineralImageAsync(
        int mineralId,
        CancellationToken cancellationToken = default)
    {
        return _repository.GetMineralImageAsync(mineralId, cancellationToken);
    }

    public async Task UploadMineralImageAsync(
        int mineralId,
        byte[] data,
        string contentType,
        CancellationToken cancellationToken = default)
    {
        const int maxBytes = 10 * 1024 * 1024; // 10 MB
        if (data.Length > maxBytes)
            throw new ArgumentException("Image exceeds the 10 MB size limit");

        var allowed = new[] { "image/png", "image/jpeg", "image/webp" };
        if (!allowed.Contains(contentType.ToLowerInvariant()))
            throw new ArgumentException("Only PNG, JPEG, and WebP images are supported");

        await _repository.UploadMineralImageAsync(mineralId, data, contentType, cancellationToken);
    }
}
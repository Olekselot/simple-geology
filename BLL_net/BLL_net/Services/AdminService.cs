using BLL_net.Abstractions;
using BLL_net.Models;

namespace BLL_net.Services;

public class AdminService : IAdminService
{
    private readonly IAdminRepository _repo;

    public AdminService(IAdminRepository repo)
    {
        _repo = repo;
    }

    // --- Hierarchy ---
    public Task<IReadOnlyList<AdminTopLevelCategoryModel>> GetTopLevelCategoriesAsync(CancellationToken ct = default)
        => _repo.GetTopLevelCategoriesAsync(ct);

    public async Task<AdminTopLevelCategoryModel> AddTopLevelCategoryAsync(string name, string sourceTable, CancellationToken ct = default)
    {
        var result = await _repo.AddTopLevelCategoryAsync(name.Trim(), sourceTable.Trim(), ct);
        await _repo.AddAuditLogAsync("top_level_categories", result.Id, "CREATE", $"Додано категорію «{result.Name}»", ct);
        return result;
    }

    public async Task UpdateTopLevelCategoryAsync(int id, string name, string sourceTable, CancellationToken ct = default)
    {
        await _repo.UpdateTopLevelCategoryAsync(id, name.Trim(), sourceTable.Trim(), ct);
        await _repo.AddAuditLogAsync("top_level_categories", id, "UPDATE", $"Оновлено категорію id={id}", ct);
    }

    public async Task DeleteTopLevelCategoryAsync(int id, CancellationToken ct = default)
    {
        await _repo.DeleteTopLevelCategoryAsync(id, ct);
        await _repo.AddAuditLogAsync("top_level_categories", id, "DELETE", $"Видалено категорію id={id}", ct);
    }

    public Task<IReadOnlyList<AdminRockTypeModel>> GetRockTypesAsync(CancellationToken ct = default)
        => _repo.GetRockTypesAsync(ct);

    public async Task<AdminRockTypeModel> AddRockTypeAsync(string name, string? description, string? originNote, CancellationToken ct = default)
    {
        var result = await _repo.AddRockTypeAsync(name.Trim(), description?.Trim(), originNote?.Trim(), ct);
        await _repo.AddAuditLogAsync("rock_types", result.Id, "CREATE", $"Додано тип порід «{result.Name}»", ct);
        return result;
    }

    public async Task UpdateRockTypeAsync(int id, string name, string? description, string? originNote, CancellationToken ct = default)
    {
        await _repo.UpdateRockTypeAsync(id, name.Trim(), description?.Trim(), originNote?.Trim(), ct);
        await _repo.AddAuditLogAsync("rock_types", id, "UPDATE", $"Оновлено тип порід id={id}", ct);
    }

    public async Task DeleteRockTypeAsync(int id, CancellationToken ct = default)
    {
        await _repo.DeleteRockTypeAsync(id, ct);
        await _repo.AddAuditLogAsync("rock_types", id, "DELETE", $"Видалено тип порід id={id}", ct);
    }

    public Task<IReadOnlyList<AdminRockSubtypeModel>> GetRockSubtypesAsync(int? rockTypeId = null, CancellationToken ct = default)
        => _repo.GetRockSubtypesAsync(rockTypeId, ct);

    public async Task<AdminRockSubtypeModel> AddRockSubtypeAsync(int rockTypeId, string name, string? formationNote, CancellationToken ct = default)
    {
        var result = await _repo.AddRockSubtypeAsync(rockTypeId, name.Trim(), formationNote?.Trim(), ct);
        await _repo.AddAuditLogAsync("rock_subtypes", result.Id, "CREATE", $"Додано підтип порід «{result.Name}»", ct);
        return result;
    }

    public async Task UpdateRockSubtypeAsync(int id, int rockTypeId, string name, string? formationNote, CancellationToken ct = default)
    {
        await _repo.UpdateRockSubtypeAsync(id, rockTypeId, name.Trim(), formationNote?.Trim(), ct);
        await _repo.AddAuditLogAsync("rock_subtypes", id, "UPDATE", $"Оновлено підтип порід id={id}", ct);
    }

    public async Task DeleteRockSubtypeAsync(int id, CancellationToken ct = default)
    {
        await _repo.DeleteRockSubtypeAsync(id, ct);
        await _repo.AddAuditLogAsync("rock_subtypes", id, "DELETE", $"Видалено підтип порід id={id}", ct);
    }

    public Task<IReadOnlyList<AdminMineralClassModel>> GetMineralClassesAsync(CancellationToken ct = default)
        => _repo.GetMineralClassesAsync(ct);

    public async Task<AdminMineralClassModel> AddMineralClassAsync(string name, string? chemicalNote, string? analogy, CancellationToken ct = default)
    {
        var result = await _repo.AddMineralClassAsync(name.Trim(), chemicalNote?.Trim(), analogy?.Trim(), ct);
        await _repo.AddAuditLogAsync("mineral_classes", result.Id, "CREATE", $"Додано клас мінералів «{result.Name}»", ct);
        return result;
    }

    public async Task UpdateMineralClassAsync(int id, string name, string? chemicalNote, string? analogy, CancellationToken ct = default)
    {
        await _repo.UpdateMineralClassAsync(id, name.Trim(), chemicalNote?.Trim(), analogy?.Trim(), ct);
        await _repo.AddAuditLogAsync("mineral_classes", id, "UPDATE", $"Оновлено клас мінералів id={id}", ct);
    }

    public async Task DeleteMineralClassAsync(int id, CancellationToken ct = default)
    {
        await _repo.DeleteMineralClassAsync(id, ct);
        await _repo.AddAuditLogAsync("mineral_classes", id, "DELETE", $"Видалено клас мінералів id={id}", ct);
    }

    public Task<IReadOnlyList<AdminSilicateStructureModel>> GetSilicateStructuresAsync(CancellationToken ct = default)
        => _repo.GetSilicateStructuresAsync(ct);

    public async Task<AdminSilicateStructureModel> AddSilicateStructureAsync(string name, string? iupacName, string? structureDesc, string? analogy, CancellationToken ct = default)
    {
        var result = await _repo.AddSilicateStructureAsync(name.Trim(), iupacName?.Trim(), structureDesc?.Trim(), analogy?.Trim(), ct);
        await _repo.AddAuditLogAsync("silicate_structures", result.Id, "CREATE", $"Додано силікатну структуру «{result.Name}»", ct);
        return result;
    }

    public async Task UpdateSilicateStructureAsync(int id, string name, string? iupacName, string? structureDesc, string? analogy, CancellationToken ct = default)
    {
        await _repo.UpdateSilicateStructureAsync(id, name.Trim(), iupacName?.Trim(), structureDesc?.Trim(), analogy?.Trim(), ct);
        await _repo.AddAuditLogAsync("silicate_structures", id, "UPDATE", $"Оновлено силікатну структуру id={id}", ct);
    }

    public async Task DeleteSilicateStructureAsync(int id, CancellationToken ct = default)
    {
        await _repo.DeleteSilicateStructureAsync(id, ct);
        await _repo.AddAuditLogAsync("silicate_structures", id, "DELETE", $"Видалено силікатну структуру id={id}", ct);
    }

    // --- Leaves ---
    public Task<IReadOnlyList<AdminMineralModel>> GetMineralsAsync(CancellationToken ct = default)
        => _repo.GetMineralsAsync(ct);

    public async Task<AdminMineralModel> AddMineralAsync(string name, string? chemicalFormula, int mineralClassId, int? silicateStructureId, string? description, string? commonUse, CancellationToken ct = default)
    {
        var result = await _repo.AddMineralAsync(name.Trim(), chemicalFormula?.Trim(), mineralClassId, silicateStructureId, description?.Trim(), commonUse?.Trim(), ct);
        await _repo.AddAuditLogAsync("minerals", result.Id, "CREATE", $"Додано мінерал «{result.Name}»", ct);
        return result;
    }

    public async Task UpdateMineralAsync(int id, string name, string? chemicalFormula, int mineralClassId, int? silicateStructureId, string? description, string? commonUse, CancellationToken ct = default)
    {
        await _repo.UpdateMineralAsync(id, name.Trim(), chemicalFormula?.Trim(), mineralClassId, silicateStructureId, description?.Trim(), commonUse?.Trim(), ct);
        await _repo.AddAuditLogAsync("minerals", id, "UPDATE", $"Оновлено мінерал id={id}", ct);
    }

    public async Task DeleteMineralAsync(int id, CancellationToken ct = default)
    {
        await _repo.DeleteMineralAsync(id, ct);
        await _repo.AddAuditLogAsync("minerals", id, "DELETE", $"Видалено мінерал id={id}", ct);
    }

    public Task<IReadOnlyList<AdminRockModel>> GetRocksAsync(CancellationToken ct = default)
        => _repo.GetRocksAsync(ct);

    public async Task<AdminRockModel> AddRockAsync(int subtypeId, string name, string? description, string? notableNote, CancellationToken ct = default)
    {
        var result = await _repo.AddRockAsync(subtypeId, name.Trim(), description?.Trim(), notableNote?.Trim(), ct);
        await _repo.AddAuditLogAsync("rocks", result.Id, "CREATE", $"Додано породу «{result.Name}»", ct);
        return result;
    }

    public async Task UpdateRockAsync(int id, int subtypeId, string name, string? description, string? notableNote, CancellationToken ct = default)
    {
        await _repo.UpdateRockAsync(id, subtypeId, name.Trim(), description?.Trim(), notableNote?.Trim(), ct);
        await _repo.AddAuditLogAsync("rocks", id, "UPDATE", $"Оновлено породу id={id}", ct);
    }

    public async Task DeleteRockAsync(int id, CancellationToken ct = default)
    {
        await _repo.DeleteRockAsync(id, ct);
        await _repo.AddAuditLogAsync("rocks", id, "DELETE", $"Видалено породу id={id}", ct);
    }

    // --- Characteristics ---
    public Task<IReadOnlyList<AdminMineralCharacteristicModel>> GetMineralCharacteristicsAsync(CancellationToken ct = default)
        => _repo.GetMineralCharacteristicsAsync(ct);

    public async Task<AdminMineralCharacteristicModel> AddMineralCharacteristicAsync(int mineralId, string? luster, string? color, string? streak, string? transparency, decimal? hardnessMohs, string? cleavage, string? fracture, string? tenacity, decimal? specificGravity, bool magnetism, string? morphology, string? paragenesis, string? specialProperties, string? notes, CancellationToken ct = default)
    {
        var result = await _repo.AddMineralCharacteristicAsync(mineralId, luster, color, streak, transparency, hardnessMohs, cleavage, fracture, tenacity, specificGravity, magnetism, morphology, paragenesis, specialProperties, notes, ct);
        await _repo.AddAuditLogAsync("mineral_characteristics", result.Id, "CREATE", $"Додано характеристику мінерала id={mineralId}", ct);
        return result;
    }

    public async Task UpdateMineralCharacteristicAsync(int id, string? luster, string? color, string? streak, string? transparency, decimal? hardnessMohs, string? cleavage, string? fracture, string? tenacity, decimal? specificGravity, bool magnetism, string? morphology, string? paragenesis, string? specialProperties, string? notes, CancellationToken ct = default)
    {
        await _repo.UpdateMineralCharacteristicAsync(id, luster, color, streak, transparency, hardnessMohs, cleavage, fracture, tenacity, specificGravity, magnetism, morphology, paragenesis, specialProperties, notes, ct);
        await _repo.AddAuditLogAsync("mineral_characteristics", id, "UPDATE", $"Оновлено характеристику id={id}", ct);
    }

    public async Task DeleteMineralCharacteristicAsync(int id, CancellationToken ct = default)
    {
        await _repo.DeleteMineralCharacteristicAsync(id, ct);
        await _repo.AddAuditLogAsync("mineral_characteristics", id, "DELETE", $"Видалено характеристику id={id}", ct);
    }

    public Task<IReadOnlyList<AdminRockCompositionModel>> GetRockCompositionsAsync(CancellationToken ct = default)
        => _repo.GetRockCompositionsAsync(ct);

    public async Task<AdminRockCompositionModel> AddRockCompositionAsync(int rockId, int mineralId, string? abundance, string? notes, CancellationToken ct = default)
    {
        var result = await _repo.AddRockCompositionAsync(rockId, mineralId, abundance, notes, ct);
        await _repo.AddAuditLogAsync("rock_mineral_composition", result.Id, "CREATE", $"Додано склад породи rockId={rockId}, mineralId={mineralId}", ct);
        return result;
    }

    public async Task UpdateRockCompositionAsync(int id, int rockId, int mineralId, string? abundance, string? notes, CancellationToken ct = default)
    {
        await _repo.UpdateRockCompositionAsync(id, rockId, mineralId, abundance, notes, ct);
        await _repo.AddAuditLogAsync("rock_mineral_composition", id, "UPDATE", $"Оновлено склад породи id={id}", ct);
    }

    public async Task DeleteRockCompositionAsync(int id, CancellationToken ct = default)
    {
        await _repo.DeleteRockCompositionAsync(id, ct);
        await _repo.AddAuditLogAsync("rock_mineral_composition", id, "DELETE", $"Видалено склад породи id={id}", ct);
    }

    // --- Site Texts ---
    public Task<IReadOnlyList<AdminSiteTextModel>> GetSiteTextsAsync(CancellationToken ct = default)
        => _repo.GetSiteTextsAsync(ct);

    public async Task UpdateSiteTextAsync(string key, string value, CancellationToken ct = default)
    {
        await _repo.UpsertSiteTextAsync(key, value, ct);
        await _repo.AddAuditLogAsync("site_texts", null, "UPDATE", $"Оновлено текст «{key}»", ct);
    }

    // --- History ---
    public Task<IReadOnlyList<AdminAuditLogModel>> GetAuditLogsAsync(int limit = 200, CancellationToken ct = default)
        => _repo.GetAuditLogsAsync(limit, ct);
}

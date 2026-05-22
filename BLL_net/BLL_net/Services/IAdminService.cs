using BLL_net.Models;

namespace BLL_net.Services;

public interface IAdminService
{
    // --- Hierarchy ---
    Task<IReadOnlyList<AdminTopLevelCategoryModel>> GetTopLevelCategoriesAsync(CancellationToken ct = default);
    Task<AdminTopLevelCategoryModel> AddTopLevelCategoryAsync(string name, string sourceTable, CancellationToken ct = default);
    Task UpdateTopLevelCategoryAsync(int id, string name, string sourceTable, CancellationToken ct = default);
    Task DeleteTopLevelCategoryAsync(int id, CancellationToken ct = default);

    Task<IReadOnlyList<AdminRockTypeModel>> GetRockTypesAsync(CancellationToken ct = default);
    Task<AdminRockTypeModel> AddRockTypeAsync(string name, string? description, string? originNote, CancellationToken ct = default);
    Task UpdateRockTypeAsync(int id, string name, string? description, string? originNote, CancellationToken ct = default);
    Task DeleteRockTypeAsync(int id, CancellationToken ct = default);

    Task<IReadOnlyList<AdminRockSubtypeModel>> GetRockSubtypesAsync(int? rockTypeId = null, CancellationToken ct = default);
    Task<AdminRockSubtypeModel> AddRockSubtypeAsync(int rockTypeId, string name, string? formationNote, CancellationToken ct = default);
    Task UpdateRockSubtypeAsync(int id, int rockTypeId, string name, string? formationNote, CancellationToken ct = default);
    Task DeleteRockSubtypeAsync(int id, CancellationToken ct = default);

    Task<IReadOnlyList<AdminMineralClassModel>> GetMineralClassesAsync(CancellationToken ct = default);
    Task<AdminMineralClassModel> AddMineralClassAsync(string name, string? chemicalNote, string? analogy, CancellationToken ct = default);
    Task UpdateMineralClassAsync(int id, string name, string? chemicalNote, string? analogy, CancellationToken ct = default);
    Task DeleteMineralClassAsync(int id, CancellationToken ct = default);

    Task<IReadOnlyList<AdminSilicateStructureModel>> GetSilicateStructuresAsync(CancellationToken ct = default);
    Task<AdminSilicateStructureModel> AddSilicateStructureAsync(string name, string? iupacName, string? structureDesc, string? analogy, CancellationToken ct = default);
    Task UpdateSilicateStructureAsync(int id, string name, string? iupacName, string? structureDesc, string? analogy, CancellationToken ct = default);
    Task DeleteSilicateStructureAsync(int id, CancellationToken ct = default);

    // --- Leaves ---
    Task<IReadOnlyList<AdminMineralModel>> GetMineralsAsync(CancellationToken ct = default);
    Task<AdminMineralModel> AddMineralAsync(string name, string? chemicalFormula, int mineralClassId, int? silicateStructureId, string? description, string? commonUse, CancellationToken ct = default);
    Task UpdateMineralAsync(int id, string name, string? chemicalFormula, int mineralClassId, int? silicateStructureId, string? description, string? commonUse, CancellationToken ct = default);
    Task DeleteMineralAsync(int id, CancellationToken ct = default);

    Task<IReadOnlyList<AdminRockModel>> GetRocksAsync(CancellationToken ct = default);
    Task<AdminRockModel> AddRockAsync(int subtypeId, string name, string? description, string? notableNote, CancellationToken ct = default);
    Task UpdateRockAsync(int id, int subtypeId, string name, string? description, string? notableNote, CancellationToken ct = default);
    Task DeleteRockAsync(int id, CancellationToken ct = default);

    // --- Characteristics ---
    Task<IReadOnlyList<AdminMineralCharacteristicModel>> GetMineralCharacteristicsAsync(CancellationToken ct = default);
    Task<AdminMineralCharacteristicModel> AddMineralCharacteristicAsync(int mineralId, string? luster, string? color, string? streak, string? transparency, decimal? hardnessMohs, string? cleavage, string? fracture, string? tenacity, decimal? specificGravity, bool magnetism, string? morphology, string? paragenesis, string? specialProperties, string? notes, CancellationToken ct = default);
    Task UpdateMineralCharacteristicAsync(int id, string? luster, string? color, string? streak, string? transparency, decimal? hardnessMohs, string? cleavage, string? fracture, string? tenacity, decimal? specificGravity, bool magnetism, string? morphology, string? paragenesis, string? specialProperties, string? notes, CancellationToken ct = default);
    Task DeleteMineralCharacteristicAsync(int id, CancellationToken ct = default);

    Task<IReadOnlyList<AdminRockCompositionModel>> GetRockCompositionsAsync(CancellationToken ct = default);
    Task<AdminRockCompositionModel> AddRockCompositionAsync(int rockId, int mineralId, string? abundance, string? notes, CancellationToken ct = default);
    Task UpdateRockCompositionAsync(int id, int rockId, int mineralId, string? abundance, string? notes, CancellationToken ct = default);
    Task DeleteRockCompositionAsync(int id, CancellationToken ct = default);

    // --- Site Texts ---
    Task<IReadOnlyList<AdminSiteTextModel>> GetSiteTextsAsync(CancellationToken ct = default);
    Task UpdateSiteTextAsync(string key, string value, CancellationToken ct = default);

    // --- History ---
    Task<IReadOnlyList<AdminAuditLogModel>> GetAuditLogsAsync(int limit = 200, CancellationToken ct = default);
}

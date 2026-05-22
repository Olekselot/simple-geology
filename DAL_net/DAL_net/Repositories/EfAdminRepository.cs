using BLL_net.Abstractions;
using BLL_net.Models;
using DAL_net.Persistence;
using DAL_net.Persistence.Entities;
using Microsoft.EntityFrameworkCore;

namespace DAL_net.Repositories;

public class EfAdminRepository : IAdminRepository
{
    private readonly GeologyDbContext _db;

    public EfAdminRepository(GeologyDbContext db)
    {
        _db = db;
    }

    // ===== TOP LEVEL CATEGORIES =====

    public async Task<IReadOnlyList<AdminTopLevelCategoryModel>> GetTopLevelCategoriesAsync(CancellationToken ct = default)
    {
        return await _db.TopLevelCategories
            .AsNoTracking()
            .OrderBy(x => x.Id)
            .Select(x => new AdminTopLevelCategoryModel(x.Id, x.Name, x.SourceTable, x.HasItems))
            .ToListAsync(ct);
    }

    public async Task<AdminTopLevelCategoryModel> AddTopLevelCategoryAsync(string name, string sourceTable, CancellationToken ct = default)
    {
        var entity = new TopLevelCategoryEntity { Name = name, SourceTable = sourceTable };
        _db.TopLevelCategories.Add(entity);
        await _db.SaveChangesAsync(ct);
        return new AdminTopLevelCategoryModel(entity.Id, entity.Name, entity.SourceTable, entity.HasItems);
    }

    public async Task UpdateTopLevelCategoryAsync(int id, string name, string sourceTable, CancellationToken ct = default)
    {
        var entity = await _db.TopLevelCategories.FindAsync([id], ct)
            ?? throw new KeyNotFoundException($"TopLevelCategory id={id} not found");
        entity.Name = name;
        entity.SourceTable = sourceTable;
        await _db.SaveChangesAsync(ct);
    }

    public async Task DeleteTopLevelCategoryAsync(int id, CancellationToken ct = default)
    {
        var entity = await _db.TopLevelCategories.FindAsync([id], ct)
            ?? throw new KeyNotFoundException($"TopLevelCategory id={id} not found");
        _db.TopLevelCategories.Remove(entity);
        await _db.SaveChangesAsync(ct);
    }

    // ===== ROCK TYPES =====

    public async Task<IReadOnlyList<AdminRockTypeModel>> GetRockTypesAsync(CancellationToken ct = default)
    {
        return await _db.RockTypes
            .AsNoTracking()
            .OrderBy(x => x.Name)
            .Select(x => new AdminRockTypeModel(x.Id, x.Name, x.Description, x.OriginNote))
            .ToListAsync(ct);
    }

    public async Task<AdminRockTypeModel> AddRockTypeAsync(string name, string? description, string? originNote, CancellationToken ct = default)
    {
        var entity = new RockTypeEntity { Name = name, Description = description, OriginNote = originNote };
        _db.RockTypes.Add(entity);
        await _db.SaveChangesAsync(ct);
        return new AdminRockTypeModel(entity.Id, entity.Name, entity.Description, entity.OriginNote);
    }

    public async Task UpdateRockTypeAsync(int id, string name, string? description, string? originNote, CancellationToken ct = default)
    {
        var entity = await _db.RockTypes.FindAsync([id], ct)
            ?? throw new KeyNotFoundException($"RockType id={id} not found");
        entity.Name = name;
        entity.Description = description;
        entity.OriginNote = originNote;
        await _db.SaveChangesAsync(ct);
    }

    public async Task DeleteRockTypeAsync(int id, CancellationToken ct = default)
    {
        var entity = await _db.RockTypes.FindAsync([id], ct)
            ?? throw new KeyNotFoundException($"RockType id={id} not found");
        _db.RockTypes.Remove(entity);
        await _db.SaveChangesAsync(ct);
    }

    // ===== ROCK SUBTYPES =====

    public async Task<IReadOnlyList<AdminRockSubtypeModel>> GetRockSubtypesAsync(int? rockTypeId = null, CancellationToken ct = default)
    {
        var query = _db.RockSubtypes.AsNoTracking().Include(x => x.RockType).AsQueryable();
        if (rockTypeId.HasValue)
            query = query.Where(x => x.RockTypeId == rockTypeId.Value);
        return await query
            .OrderBy(x => x.RockType.Name).ThenBy(x => x.Name)
            .Select(x => new AdminRockSubtypeModel(x.Id, x.RockTypeId, x.RockType.Name, x.Name, x.FormationNote))
            .ToListAsync(ct);
    }

    public async Task<AdminRockSubtypeModel> AddRockSubtypeAsync(int rockTypeId, string name, string? formationNote, CancellationToken ct = default)
    {
        var entity = new RockSubtypeEntity { RockTypeId = rockTypeId, Name = name, FormationNote = formationNote };
        _db.RockSubtypes.Add(entity);
        await _db.SaveChangesAsync(ct);
        var typeName = await _db.RockTypes.Where(x => x.Id == rockTypeId).Select(x => x.Name).FirstOrDefaultAsync(ct) ?? "";
        return new AdminRockSubtypeModel(entity.Id, rockTypeId, typeName, entity.Name, entity.FormationNote);
    }

    public async Task UpdateRockSubtypeAsync(int id, int rockTypeId, string name, string? formationNote, CancellationToken ct = default)
    {
        var entity = await _db.RockSubtypes.FindAsync([id], ct)
            ?? throw new KeyNotFoundException($"RockSubtype id={id} not found");
        entity.RockTypeId = rockTypeId;
        entity.Name = name;
        entity.FormationNote = formationNote;
        await _db.SaveChangesAsync(ct);
    }

    public async Task DeleteRockSubtypeAsync(int id, CancellationToken ct = default)
    {
        var entity = await _db.RockSubtypes.FindAsync([id], ct)
            ?? throw new KeyNotFoundException($"RockSubtype id={id} not found");
        _db.RockSubtypes.Remove(entity);
        await _db.SaveChangesAsync(ct);
    }

    // ===== MINERAL CLASSES =====

    public async Task<IReadOnlyList<AdminMineralClassModel>> GetMineralClassesAsync(CancellationToken ct = default)
    {
        return await _db.MineralClasses
            .AsNoTracking()
            .OrderBy(x => x.Name)
            .Select(x => new AdminMineralClassModel(x.Id, x.Name, x.ChemicalNote, x.Analogy))
            .ToListAsync(ct);
    }

    public async Task<AdminMineralClassModel> AddMineralClassAsync(string name, string? chemicalNote, string? analogy, CancellationToken ct = default)
    {
        var entity = new MineralClassEntity { Name = name, ChemicalNote = chemicalNote, Analogy = analogy };
        _db.MineralClasses.Add(entity);
        await _db.SaveChangesAsync(ct);
        return new AdminMineralClassModel(entity.Id, entity.Name, entity.ChemicalNote, entity.Analogy);
    }

    public async Task UpdateMineralClassAsync(int id, string name, string? chemicalNote, string? analogy, CancellationToken ct = default)
    {
        var entity = await _db.MineralClasses.FindAsync([id], ct)
            ?? throw new KeyNotFoundException($"MineralClass id={id} not found");
        entity.Name = name;
        entity.ChemicalNote = chemicalNote;
        entity.Analogy = analogy;
        await _db.SaveChangesAsync(ct);
    }

    public async Task DeleteMineralClassAsync(int id, CancellationToken ct = default)
    {
        var entity = await _db.MineralClasses.FindAsync([id], ct)
            ?? throw new KeyNotFoundException($"MineralClass id={id} not found");
        _db.MineralClasses.Remove(entity);
        await _db.SaveChangesAsync(ct);
    }

    // ===== SILICATE STRUCTURES =====

    public async Task<IReadOnlyList<AdminSilicateStructureModel>> GetSilicateStructuresAsync(CancellationToken ct = default)
    {
        return await _db.SilicateStructures
            .AsNoTracking()
            .OrderBy(x => x.Name)
            .Select(x => new AdminSilicateStructureModel(x.Id, x.Name, x.IupacName, x.StructureDesc, x.Analogy))
            .ToListAsync(ct);
    }

    public async Task<AdminSilicateStructureModel> AddSilicateStructureAsync(string name, string? iupacName, string? structureDesc, string? analogy, CancellationToken ct = default)
    {
        var entity = new SilicateStructureEntity { Name = name, IupacName = iupacName, StructureDesc = structureDesc, Analogy = analogy };
        _db.SilicateStructures.Add(entity);
        await _db.SaveChangesAsync(ct);
        return new AdminSilicateStructureModel(entity.Id, entity.Name, entity.IupacName, entity.StructureDesc, entity.Analogy);
    }

    public async Task UpdateSilicateStructureAsync(int id, string name, string? iupacName, string? structureDesc, string? analogy, CancellationToken ct = default)
    {
        var entity = await _db.SilicateStructures.FindAsync([id], ct)
            ?? throw new KeyNotFoundException($"SilicateStructure id={id} not found");
        entity.Name = name;
        entity.IupacName = iupacName;
        entity.StructureDesc = structureDesc;
        entity.Analogy = analogy;
        await _db.SaveChangesAsync(ct);
    }

    public async Task DeleteSilicateStructureAsync(int id, CancellationToken ct = default)
    {
        var entity = await _db.SilicateStructures.FindAsync([id], ct)
            ?? throw new KeyNotFoundException($"SilicateStructure id={id} not found");
        _db.SilicateStructures.Remove(entity);
        await _db.SaveChangesAsync(ct);
    }

    // ===== MINERALS =====

    public async Task<IReadOnlyList<AdminMineralModel>> GetMineralsAsync(CancellationToken ct = default)
    {
        return await _db.Minerals
            .AsNoTracking()
            .Include(x => x.MineralClass)
            .Include(x => x.SilicateStructure)
            .OrderBy(x => x.Name)
            .Select(x => new AdminMineralModel(
                x.Id, x.Name, x.ChemicalFormula,
                x.MineralClassId, x.MineralClass.Name,
                x.SilicateStructureId, x.SilicateStructure != null ? x.SilicateStructure.Name : null,
                x.Description, x.CommonUse))
            .ToListAsync(ct);
    }

    public async Task<AdminMineralModel> AddMineralAsync(string name, string? chemicalFormula, int mineralClassId, int? silicateStructureId, string? description, string? commonUse, CancellationToken ct = default)
    {
        var entity = new MineralEntity
        {
            Name = name,
            ChemicalFormula = chemicalFormula,
            MineralClassId = mineralClassId,
            SilicateStructureId = silicateStructureId,
            Description = description,
            CommonUse = commonUse
        };
        _db.Minerals.Add(entity);
        await _db.SaveChangesAsync(ct);
        await _db.Entry(entity).Reference(x => x.MineralClass).LoadAsync(ct);
        if (silicateStructureId.HasValue)
            await _db.Entry(entity).Reference(x => x.SilicateStructure).LoadAsync(ct);
        return new AdminMineralModel(entity.Id, entity.Name, entity.ChemicalFormula,
            entity.MineralClassId, entity.MineralClass.Name,
            entity.SilicateStructureId, entity.SilicateStructure?.Name,
            entity.Description, entity.CommonUse);
    }

    public async Task UpdateMineralAsync(int id, string name, string? chemicalFormula, int mineralClassId, int? silicateStructureId, string? description, string? commonUse, CancellationToken ct = default)
    {
        var entity = await _db.Minerals.FindAsync([id], ct)
            ?? throw new KeyNotFoundException($"Mineral id={id} not found");
        entity.Name = name;
        entity.ChemicalFormula = chemicalFormula;
        entity.MineralClassId = mineralClassId;
        entity.SilicateStructureId = silicateStructureId;
        entity.Description = description;
        entity.CommonUse = commonUse;
        await _db.SaveChangesAsync(ct);
    }

    public async Task DeleteMineralAsync(int id, CancellationToken ct = default)
    {
        var entity = await _db.Minerals.FindAsync([id], ct)
            ?? throw new KeyNotFoundException($"Mineral id={id} not found");
        _db.Minerals.Remove(entity);
        await _db.SaveChangesAsync(ct);
    }

    // ===== ROCKS =====

    public async Task<IReadOnlyList<AdminRockModel>> GetRocksAsync(CancellationToken ct = default)
    {
        return await _db.Rocks
            .AsNoTracking()
            .Include(x => x.Subtype)
            .OrderBy(x => x.Name)
            .Select(x => new AdminRockModel(x.Id, x.SubtypeId, x.Subtype.Name, x.Name, x.Description, x.NotableNote))
            .ToListAsync(ct);
    }

    public async Task<AdminRockModel> AddRockAsync(int subtypeId, string name, string? description, string? notableNote, CancellationToken ct = default)
    {
        var entity = new RockEntity { SubtypeId = subtypeId, Name = name, Description = description, NotableNote = notableNote };
        _db.Rocks.Add(entity);
        await _db.SaveChangesAsync(ct);
        await _db.Entry(entity).Reference(x => x.Subtype).LoadAsync(ct);
        return new AdminRockModel(entity.Id, entity.SubtypeId, entity.Subtype.Name, entity.Name, entity.Description, entity.NotableNote);
    }

    public async Task UpdateRockAsync(int id, int subtypeId, string name, string? description, string? notableNote, CancellationToken ct = default)
    {
        var entity = await _db.Rocks.FindAsync([id], ct)
            ?? throw new KeyNotFoundException($"Rock id={id} not found");
        entity.SubtypeId = subtypeId;
        entity.Name = name;
        entity.Description = description;
        entity.NotableNote = notableNote;
        await _db.SaveChangesAsync(ct);
    }

    public async Task DeleteRockAsync(int id, CancellationToken ct = default)
    {
        var entity = await _db.Rocks.FindAsync([id], ct)
            ?? throw new KeyNotFoundException($"Rock id={id} not found");
        _db.Rocks.Remove(entity);
        await _db.SaveChangesAsync(ct);
    }

    // ===== MINERAL CHARACTERISTICS =====

    public async Task<IReadOnlyList<AdminMineralCharacteristicModel>> GetMineralCharacteristicsAsync(CancellationToken ct = default)
    {
        return await _db.MineralCharacteristics
            .AsNoTracking()
            .Include(x => x.Mineral)
            .OrderBy(x => x.Mineral.Name)
            .Select(x => new AdminMineralCharacteristicModel(
                x.Id, x.MineralId, x.Mineral.Name,
                x.Luster, x.Color, x.Streak, x.Transparency,
                x.HardnessMohs, x.Cleavage, x.Fracture, x.Tenacity,
                x.SpecificGravity, x.Magnetism, x.Morphology, x.Paragenesis,
                x.SpecialProperties, x.Notes))
            .ToListAsync(ct);
    }

    public async Task<AdminMineralCharacteristicModel> AddMineralCharacteristicAsync(
        int mineralId, string? luster, string? color, string? streak, string? transparency,
        decimal? hardnessMohs, string? cleavage, string? fracture, string? tenacity,
        decimal? specificGravity, bool magnetism, string? morphology, string? paragenesis,
        string? specialProperties, string? notes, CancellationToken ct = default)
    {
        var entity = new MineralCharacteristicEntity
        {
            MineralId = mineralId, Luster = luster, Color = color, Streak = streak,
            Transparency = transparency, HardnessMohs = hardnessMohs, Cleavage = cleavage,
            Fracture = fracture, Tenacity = tenacity, SpecificGravity = specificGravity,
            Magnetism = magnetism, Morphology = morphology, Paragenesis = paragenesis,
            SpecialProperties = specialProperties, Notes = notes
        };
        _db.MineralCharacteristics.Add(entity);
        await _db.SaveChangesAsync(ct);
        var mineralName = await _db.Minerals.Where(x => x.Id == mineralId).Select(x => x.Name).FirstOrDefaultAsync(ct) ?? "";
        return new AdminMineralCharacteristicModel(entity.Id, mineralId, mineralName,
            luster, color, streak, transparency, hardnessMohs, cleavage, fracture, tenacity,
            specificGravity, magnetism, morphology, paragenesis, specialProperties, notes);
    }

    public async Task UpdateMineralCharacteristicAsync(
        int id, string? luster, string? color, string? streak, string? transparency,
        decimal? hardnessMohs, string? cleavage, string? fracture, string? tenacity,
        decimal? specificGravity, bool magnetism, string? morphology, string? paragenesis,
        string? specialProperties, string? notes, CancellationToken ct = default)
    {
        var entity = await _db.MineralCharacteristics.FindAsync([id], ct)
            ?? throw new KeyNotFoundException($"MineralCharacteristic id={id} not found");
        entity.Luster = luster;
        entity.Color = color;
        entity.Streak = streak;
        entity.Transparency = transparency;
        entity.HardnessMohs = hardnessMohs;
        entity.Cleavage = cleavage;
        entity.Fracture = fracture;
        entity.Tenacity = tenacity;
        entity.SpecificGravity = specificGravity;
        entity.Magnetism = magnetism;
        entity.Morphology = morphology;
        entity.Paragenesis = paragenesis;
        entity.SpecialProperties = specialProperties;
        entity.Notes = notes;
        await _db.SaveChangesAsync(ct);
    }

    public async Task DeleteMineralCharacteristicAsync(int id, CancellationToken ct = default)
    {
        var entity = await _db.MineralCharacteristics.FindAsync([id], ct)
            ?? throw new KeyNotFoundException($"MineralCharacteristic id={id} not found");
        _db.MineralCharacteristics.Remove(entity);
        await _db.SaveChangesAsync(ct);
    }

    // ===== ROCK COMPOSITIONS =====

    public async Task<IReadOnlyList<AdminRockCompositionModel>> GetRockCompositionsAsync(CancellationToken ct = default)
    {
        return await _db.RockMineralCompositions
            .AsNoTracking()
            .Include(x => x.Rock)
            .Include(x => x.Mineral)
            .OrderBy(x => x.Rock.Name).ThenBy(x => x.Mineral.Name)
            .Select(x => new AdminRockCompositionModel(
                x.Id, x.RockId, x.Rock.Name, x.MineralId, x.Mineral.Name, x.Abundance, x.Notes))
            .ToListAsync(ct);
    }

    public async Task<AdminRockCompositionModel> AddRockCompositionAsync(int rockId, int mineralId, string? abundance, string? notes, CancellationToken ct = default)
    {
        var entity = new RockMineralCompositionEntity { RockId = rockId, MineralId = mineralId, Abundance = abundance, Notes = notes };
        _db.RockMineralCompositions.Add(entity);
        await _db.SaveChangesAsync(ct);
        var rockName = await _db.Rocks.Where(x => x.Id == rockId).Select(x => x.Name).FirstOrDefaultAsync(ct) ?? "";
        var mineralName = await _db.Minerals.Where(x => x.Id == mineralId).Select(x => x.Name).FirstOrDefaultAsync(ct) ?? "";
        return new AdminRockCompositionModel(entity.Id, rockId, rockName, mineralId, mineralName, abundance, notes);
    }

    public async Task UpdateRockCompositionAsync(int id, int rockId, int mineralId, string? abundance, string? notes, CancellationToken ct = default)
    {
        var entity = await _db.RockMineralCompositions.FindAsync([id], ct)
            ?? throw new KeyNotFoundException($"RockMineralComposition id={id} not found");
        entity.RockId = rockId;
        entity.MineralId = mineralId;
        entity.Abundance = abundance;
        entity.Notes = notes;
        await _db.SaveChangesAsync(ct);
    }

    public async Task DeleteRockCompositionAsync(int id, CancellationToken ct = default)
    {
        var entity = await _db.RockMineralCompositions.FindAsync([id], ct)
            ?? throw new KeyNotFoundException($"RockMineralComposition id={id} not found");
        _db.RockMineralCompositions.Remove(entity);
        await _db.SaveChangesAsync(ct);
    }

    // ===== SITE TEXTS =====

    public async Task<IReadOnlyList<AdminSiteTextModel>> GetSiteTextsAsync(CancellationToken ct = default)
    {
        return await _db.SiteTexts
            .AsNoTracking()
            .OrderBy(x => x.Key)
            .Select(x => new AdminSiteTextModel(x.Id, x.Key, x.Value, x.Description))
            .ToListAsync(ct);
    }

    public async Task UpsertSiteTextAsync(string key, string value, CancellationToken ct = default)
    {
        var entity = await _db.SiteTexts.FirstOrDefaultAsync(x => x.Key == key, ct);
        if (entity is null)
        {
            entity = new SiteTextEntity { Key = key, Value = value };
            _db.SiteTexts.Add(entity);
        }
        else
        {
            entity.Value = value;
        }
        await _db.SaveChangesAsync(ct);
    }

    // ===== AUDIT LOG =====

    public async Task<IReadOnlyList<AdminAuditLogModel>> GetAuditLogsAsync(int limit = 200, CancellationToken ct = default)
    {
        return await _db.AuditLogs
            .AsNoTracking()
            .OrderByDescending(x => x.ChangedAt)
            .Take(limit)
            .Select(x => new AdminAuditLogModel(x.Id, x.TableName, x.RecordId, x.Operation, x.ChangedAt, x.Description))
            .ToListAsync(ct);
    }

    public async Task AddAuditLogAsync(string tableName, int? recordId, string operation, string? description, CancellationToken ct = default)
    {
        _db.AuditLogs.Add(new AuditLogEntity
        {
            TableName = tableName,
            RecordId = recordId,
            Operation = operation,
            ChangedAt = DateTime.UtcNow,
            Description = description
        });
        await _db.SaveChangesAsync(ct);
    }
}

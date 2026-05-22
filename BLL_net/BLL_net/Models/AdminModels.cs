namespace BLL_net.Models;

public record AdminTopLevelCategoryModel(int Id, string Name, string SourceTable, bool HasItems);

public record AdminRockTypeModel(int Id, string Name, string? Description, string? OriginNote);

public record AdminRockSubtypeModel(int Id, int RockTypeId, string RockTypeName, string Name, string? FormationNote);

public record AdminRockModel(int Id, int SubtypeId, string SubtypeName, string Name, string? Description, string? NotableNote);

public record AdminMineralClassModel(int Id, string Name, string? ChemicalNote, string? Analogy);

public record AdminSilicateStructureModel(int Id, string Name, string? IupacName, string? StructureDesc, string? Analogy);

public record AdminMineralModel(
    int Id,
    string Name,
    string? ChemicalFormula,
    int MineralClassId,
    string MineralClassName,
    int? SilicateStructureId,
    string? SilicateStructureName,
    string? Description,
    string? CommonUse);

public record AdminMineralCharacteristicModel(
    int Id,
    int MineralId,
    string MineralName,
    string? Luster,
    string? Color,
    string? Streak,
    string? Transparency,
    decimal? HardnessMohs,
    string? Cleavage,
    string? Fracture,
    string? Tenacity,
    decimal? SpecificGravity,
    bool Magnetism,
    string? Morphology,
    string? Paragenesis,
    string? SpecialProperties,
    string? Notes);

public record AdminRockCompositionModel(
    int Id,
    int RockId,
    string RockName,
    int MineralId,
    string MineralName,
    string? Abundance,
    string? Notes);

public record AdminSiteTextModel(int Id, string Key, string Value, string? Description);

public record AdminAuditLogModel(int Id, string TableName, int? RecordId, string Operation, DateTime ChangedAt, string? Description);

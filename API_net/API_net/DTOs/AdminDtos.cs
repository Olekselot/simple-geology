namespace API_net.DTOs;

// --- Auth ---
public record AdminLoginRequest(string Login, string Password);
public record AdminTokenResponse(string Token);

// --- Hierarchy ---
public record TopLevelCategoryDto(int Id, string Name, string SourceTable, bool HasItems);
public record UpsertTopLevelCategoryDto(string Name, string SourceTable);

public record RockTypeDto(int Id, string Name, string? Description, string? OriginNote);
public record UpsertRockTypeDto(string Name, string? Description, string? OriginNote);

public record RockSubtypeDto(int Id, int RockTypeId, string RockTypeName, string Name, string? FormationNote);
public record UpsertRockSubtypeDto(int RockTypeId, string Name, string? FormationNote);

public record MineralClassDto(int Id, string Name, string? ChemicalNote, string? Analogy);
public record UpsertMineralClassDto(string Name, string? ChemicalNote, string? Analogy);

public record SilicateStructureDto(int Id, string Name, string? IupacName, string? StructureDesc, string? Analogy);
public record UpsertSilicateStructureDto(string Name, string? IupacName, string? StructureDesc, string? Analogy);

// --- Leaves ---
public record AdminMineralDto(int Id, string Name, string? ChemicalFormula, int MineralClassId, string MineralClassName, int? SilicateStructureId, string? SilicateStructureName, string? Description, string? CommonUse);
public record UpsertMineralDto(string Name, string? ChemicalFormula, int MineralClassId, int? SilicateStructureId, string? Description, string? CommonUse);

public record AdminRockDto(int Id, int SubtypeId, string SubtypeName, string Name, string? Description, string? NotableNote);
public record UpsertRockDto(int SubtypeId, string Name, string? Description, string? NotableNote);

// --- Characteristics ---
public record AdminMineralCharacteristicDto(
    int Id, int MineralId, string MineralName,
    string? Luster, string? Color, string? Streak, string? Transparency,
    decimal? HardnessMohs, string? Cleavage, string? Fracture, string? Tenacity,
    decimal? SpecificGravity, bool Magnetism, string? Morphology,
    string? Paragenesis, string? SpecialProperties, string? Notes);

public record UpsertMineralCharacteristicDto(
    int MineralId,
    string? Luster, string? Color, string? Streak, string? Transparency,
    decimal? HardnessMohs, string? Cleavage, string? Fracture, string? Tenacity,
    decimal? SpecificGravity, bool Magnetism, string? Morphology,
    string? Paragenesis, string? SpecialProperties, string? Notes);

public record AdminRockCompositionDto(int Id, int RockId, string RockName, int MineralId, string MineralName, string? Abundance, string? Notes);
public record UpsertRockCompositionDto(int RockId, int MineralId, string? Abundance, string? Notes);

// --- Texts ---
public record SiteTextDto(int Id, string Key, string Value, string? Description);
public record UpdateSiteTextDto(string Value);

// --- History ---
public record AuditLogDto(int Id, string TableName, int? RecordId, string Operation, DateTime ChangedAt, string? Description);

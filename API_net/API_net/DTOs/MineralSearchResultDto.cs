namespace API_net.DTOs;

public record MineralSearchResultDto(
    int MineralId,
    string MineralName,
    string? MineralClass,
    string? SilicateStructure,
    string? ChemicalFormula,
    decimal? HardnessMohs,
    decimal? SpecificGravity,
    string? Color,
    string? Luster,
    bool Magnetism);

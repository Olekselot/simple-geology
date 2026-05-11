namespace BLL_net.Models;

public record MineralSearchResult(
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

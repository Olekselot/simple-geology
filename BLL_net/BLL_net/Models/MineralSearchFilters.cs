namespace BLL_net.Models;

public class MineralSearchFilters
{
    public string? Query { get; init; }
    public string? ChemicalFormula { get; init; }
    public string? MineralClass { get; init; }
    public string? SilicateStructure { get; init; }
    public string? Luster { get; init; }
    public string? Color { get; init; }
    public string? Streak { get; init; }
    public string? Transparency { get; init; }
    public string? Cleavage { get; init; }
    public string? Fracture { get; init; }
    public string? Tenacity { get; init; }
    public string? Morphology { get; init; }
    public string? Paragenesis { get; init; }
    public string? SpecialProperties { get; init; }
    public string? Notes { get; init; }
    public string? Description { get; init; }
    public string? CommonUse { get; init; }
    public decimal? HardnessMin { get; init; }
    public decimal? HardnessMax { get; init; }
    public decimal? SpecificGravityMin { get; init; }
    public decimal? SpecificGravityMax { get; init; }
    public bool? Magnetism { get; init; }
    public bool? HasSilicateStructure { get; init; }
    public bool? HasCharacteristics { get; init; }
    public int Limit { get; init; } = 100;
}

namespace API_net.DTOs;

public record MineralCharacteristicDto(
    int MineralId,
    string MineralName,
    string? ChemicalFormula,
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
    string? Notes,
    bool HasImage);

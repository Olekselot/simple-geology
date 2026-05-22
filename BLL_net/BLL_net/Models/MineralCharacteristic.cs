namespace BLL_net.Models;

public class MineralCharacteristic
{
    public int MineralId { get; set; }

    public string MineralName { get; set; } = string.Empty;

    public string? ChemicalFormula { get; set; }

    public string? Luster { get; set; }

    public string? Color { get; set; }

    public string? Streak { get; set; }

    public string? Transparency { get; set; }

    public decimal? HardnessMohs { get; set; }

    public string? Cleavage { get; set; }

    public string? Fracture { get; set; }

    public string? Tenacity { get; set; }

    public decimal? SpecificGravity { get; set; }

    public bool Magnetism { get; set; }

    public string? Morphology { get; set; }

    public string? Paragenesis { get; set; }

    public string? SpecialProperties { get; set; }

    public string? Notes { get; set; }

    public bool HasImage { get; set; }
}

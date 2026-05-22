namespace DAL_net.Persistence.Entities;

public class MineralCharacteristicEntity
{
    public int Id { get; set; }

    public int MineralId { get; set; }

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

    public byte[]? ImageData { get; set; }

    public string? ImageContentType { get; set; }

    public MineralEntity Mineral { get; set; } = null!;
}

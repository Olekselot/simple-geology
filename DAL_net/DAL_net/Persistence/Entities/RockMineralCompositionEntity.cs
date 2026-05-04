namespace DAL_net.Persistence.Entities;

public class RockMineralCompositionEntity
{
    public int Id { get; set; }

    public int RockId { get; set; }

    public int MineralId { get; set; }

    public string? Abundance { get; set; }

    public string? Notes { get; set; }

    public RockEntity Rock { get; set; } = null!;

    public MineralEntity Mineral { get; set; } = null!;
}

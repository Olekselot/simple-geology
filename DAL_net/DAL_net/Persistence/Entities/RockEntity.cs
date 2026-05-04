namespace DAL_net.Persistence.Entities;

public class RockEntity
{
    public int Id { get; set; }

    public int SubtypeId { get; set; }

    public string Name { get; set; } = string.Empty;

    public string? Description { get; set; }

    public string? NotableNote { get; set; }

    public RockSubtypeEntity Subtype { get; set; } = null!;

    public ICollection<RockMineralCompositionEntity> MineralCompositions { get; set; } = new List<RockMineralCompositionEntity>();
}

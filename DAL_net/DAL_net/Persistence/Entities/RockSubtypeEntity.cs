namespace DAL_net.Persistence.Entities;

public class RockSubtypeEntity
{
    public int Id { get; set; }

    public int RockTypeId { get; set; }

    public string Name { get; set; } = string.Empty;

    public string? FormationNote { get; set; }

    public RockTypeEntity RockType { get; set; } = null!;

    public ICollection<RockEntity> Rocks { get; set; } = new List<RockEntity>();
}

namespace DAL_net.Persistence.Entities;

public class RockTypeEntity
{
    public int Id { get; set; }

    public string Name { get; set; } = string.Empty;

    public string? Description { get; set; }

    public string? OriginNote { get; set; }

    public ICollection<RockSubtypeEntity> Subtypes { get; set; } = new List<RockSubtypeEntity>();
}

namespace DAL_net.Persistence.Entities;

public class SilicateStructureEntity
{
    public int Id { get; set; }

    public string Name { get; set; } = string.Empty;

    public string? IupacName { get; set; }

    public string? StructureDesc { get; set; }

    public string? Analogy { get; set; }

    public ICollection<MineralEntity> Minerals { get; set; } = new List<MineralEntity>();
}

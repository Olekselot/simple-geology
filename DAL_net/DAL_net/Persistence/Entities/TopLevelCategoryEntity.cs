namespace DAL_net.Persistence.Entities;

public class TopLevelCategoryEntity
{
    public int Id { get; set; }
    public string Name { get; set; } = default!;
    public string SourceTable { get; set; } = default!;
    public bool HasItems { get; set; }
}
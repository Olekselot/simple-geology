namespace DAL_net.Persistence.Entities;

public class SiteTextEntity
{
    public int Id { get; set; }
    public string Key { get; set; } = default!;
    public string Value { get; set; } = default!;
    public string? Description { get; set; }
}
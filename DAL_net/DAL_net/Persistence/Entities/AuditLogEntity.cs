namespace DAL_net.Persistence.Entities;

public class AuditLogEntity
{
    public int Id { get; set; }
    public string TableName { get; set; } = default!;
    public int? RecordId { get; set; }
    public string Operation { get; set; } = default!;
    public DateTime ChangedAt { get; set; }
    public string? Description { get; set; }
}
namespace BLL_net.Models;

public class GeologicalObject
{
    public int Id { get; set; }

    public required string Name { get; set; }

    public required string Type { get; set; }

    public double DepthMeters { get; set; }

    public string Description { get; set; } = string.Empty;
}
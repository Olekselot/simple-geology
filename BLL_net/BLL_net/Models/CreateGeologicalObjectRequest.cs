namespace BLL_net.Models;

public record CreateGeologicalObjectRequest(
    string Name,
    string Type,
    double DepthMeters,
    string? Description);
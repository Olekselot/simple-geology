namespace API_net.DTOs;

public record GeologicalObjectDto(
    int Id,
    string Name,
    string Type,
    double DepthMeters,
    string Description);

public record CreateGeologicalObjectDto(
    string Name,
    string Type,
    double DepthMeters,
    string? Description);
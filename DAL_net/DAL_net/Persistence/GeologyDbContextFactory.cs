using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace DAL_net.Persistence;

public class GeologyDbContextFactory : IDesignTimeDbContextFactory<GeologyDbContext>
{
    public GeologyDbContext CreateDbContext(string[] args)
    {
        var connectionString = Environment.GetEnvironmentVariable("ConnectionStrings__DefaultConnection")
            ?? "Host=localhost;Port=5432;Database=GeologyDB;Username=postgres;Password=postgres";

        var optionsBuilder = new DbContextOptionsBuilder<GeologyDbContext>();
        optionsBuilder.UseNpgsql(connectionString);

        return new GeologyDbContext(optionsBuilder.Options);
    }
}

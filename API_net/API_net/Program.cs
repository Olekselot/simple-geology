using DAL_net.Persistence;
using DAL_net.Repositories;
using BLL_net.Abstractions;
using BLL_net.Services;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Validate required secrets are present before starting
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
if (string.IsNullOrWhiteSpace(connectionString))
{
    throw new InvalidOperationException(
        "Missing required secret: ConnectionStrings:DefaultConnection. " +
        "In development, run: dotnet user-secrets set \"ConnectionStrings:DefaultConnection\" \"<your-connection-string>\"");
}

var jwtSecret = builder.Configuration["AppSecrets:JwtSecretKey"];
if (string.IsNullOrWhiteSpace(jwtSecret))
{
    throw new InvalidOperationException(
        "Missing required secret: AppSecrets:JwtSecretKey. " +
        "In development, run: dotnet user-secrets set \"AppSecrets:JwtSecretKey\" \"<your-secret-key>\"");
}

// Add services to the container.

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddDbContext<GeologyDbContext>(options =>
    options.UseNpgsql(connectionString));
builder.Services.AddScoped<IGeologicalObjectRepository, EfGeologicalObjectRepository>();
builder.Services.AddScoped<IGeologicalObjectService, GeologicalObjectService>();
builder.Services.AddCors(options =>
{
	options.AddPolicy("ClientReact", policy =>
	{
		policy
			// Allow Vite dev server on localhost (any port/protocol).
			.SetIsOriginAllowed(origin =>
			{
				if (!Uri.TryCreate(origin, UriKind.Absolute, out var uri))
				{
					return false;
				}

				return uri.Host.Equals("localhost", StringComparison.OrdinalIgnoreCase);
			})
			.AllowAnyHeader()
			.AllowAnyMethod();
	});
});

var app = builder.Build();

// Configure the HTTP request pipeline.

app.UseSwagger();
app.UseSwaggerUI();

if (!app.Environment.IsDevelopment())
{
	app.UseHttpsRedirection();
}

app.UseCors("ClientReact");

app.UseAuthorization();

app.MapControllers();

app.Run();

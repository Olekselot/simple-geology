using System.Text;
using DAL_net.Persistence;
using DAL_net.Repositories;
using BLL_net.Abstractions;
using BLL_net.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

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

var adminLogin = builder.Configuration["AdminCredentials:Login"];
var adminPassword = builder.Configuration["AdminCredentials:Password"];
if (string.IsNullOrWhiteSpace(adminLogin) || string.IsNullOrWhiteSpace(adminPassword))
{
    throw new InvalidOperationException(
        "Missing required secrets: AdminCredentials:Login and AdminCredentials:Password. " +
        "In development, run: dotnet user-secrets set \"AdminCredentials:Login\" \"admin\" && " +
        "dotnet user-secrets set \"AdminCredentials:Password\" \"1111\"");
}

// Add services to the container.

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddDbContext<GeologyDbContext>(options =>
    options.UseNpgsql(connectionString));
builder.Services.AddScoped<IGeologicalObjectRepository, EfGeologicalObjectRepository>();
builder.Services.AddScoped<IGeologicalObjectService, GeologicalObjectService>();
builder.Services.AddScoped<IAdminRepository, EfAdminRepository>();
builder.Services.AddScoped<IAdminService, AdminService>();

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = "simple-geology",
            ValidAudience = "simple-geology-admin",
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecret))
        };
    });

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

// Auto-apply EF Core migrations on startup (required for Docker)
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<GeologyDbContext>();
    db.Database.Migrate();
}

// Configure the HTTP request pipeline.

app.UseSwagger();
app.UseSwaggerUI();

if (!app.Environment.IsDevelopment())
{
	app.UseHttpsRedirection();
}

app.UseCors("ClientReact");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
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

builder.Services.AddScoped<BLL_net.Abstractions.IGeologicalObjectRepository, DAL_net.Repositories.InMemoryGeologicalObjectRepository>();
builder.Services.AddScoped<BLL_net.Services.IGeologicalObjectService, BLL_net.Services.GeologicalObjectService>();

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

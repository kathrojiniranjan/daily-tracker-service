using System.Text;
using System.Threading.RateLimiting;
using Asp.Versioning;
using Asp.Versioning.ApiExplorer;
using DailyTrackerService.Auditing;
using DailyTrackerService.CustomMiddleware;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using Swashbuckle.AspNetCore.SwaggerGen;

var builder = WebApplication.CreateBuilder(args);

// Controllers + global audit filter
builder.Services.AddControllers(options =>
{
    options.Filters.Add<AuditActionFilter>();
});

// Audit logging — swap FileAuditLogger for a DB/SIEM sink in production.
builder.Services.AddSingleton<IAuditLogger, FileAuditLogger>();
builder.Services.AddScoped<AuditActionFilter>();

// Global exception handling (RFC 7807 ProblemDetails)
builder.Services.AddExceptionHandler<GlobalExceptionHandler>();
builder.Services.AddProblemDetails();

// CORS — browser-side gatekeeper. List the exact origins (scheme+host+port) of
// the front-end apps allowed to call this API. Driven by configuration so each
// environment (Dev / Staging / Prod) can have its own list without code change.
const string CorsPolicy = "DefaultCors";
var allowedOrigins = builder.Configuration
    .GetSection("Cors:AllowedOrigins")
    .Get<string[]>() ?? Array.Empty<string>();

builder.Services.AddCors(options =>
{
    options.AddPolicy(CorsPolicy, policy =>
    {
        if (allowedOrigins.Length == 0)
        {
            // No origins configured -> no cross-origin browser calls allowed.
            // (Server-to-server callers like Postman/curl are unaffected.)
            return;
        }

        policy.WithOrigins(allowedOrigins)
              .AllowAnyHeader()
              .AllowAnyMethod();
        // .AllowCredentials();  // enable ONLY if you use cookies / credentials: 'include'
    });
});

// Authentication — JWT Bearer
var jwtSection = builder.Configuration.GetSection("Jwt");
var jwtKey = Encoding.UTF8.GetBytes(jwtSection["Key"]!);

builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwtSection["Issuer"],
            ValidAudience = jwtSection["Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(jwtKey),
            ClockSkew = TimeSpan.FromSeconds(30)
        };
    });

// Authorization policies — centralize access rules here instead of sprinkling
// role strings across controllers. Endpoints reference policies by name:
//   [Authorize(Policy = "CanWriteItems")]
// To change who can write/delete later, edit ONLY this block.
builder.Services.AddAuthorization(options =>
{
    // Read access: any authenticated user (Admin or User).
    options.AddPolicy("CanReadItems",   p => p.RequireRole("Admin", "User"));

    // Write access (POST / PUT / PATCH): Admin only for now.
    options.AddPolicy("CanWriteItems",  p => p.RequireRole("Admin"));

    // Delete access: Admin only (reserved for when DELETE endpoints are added).
    options.AddPolicy("CanDeleteItems", p => p.RequireRole("Admin"));
});

// Rate limiting — protects against abuse / brute force.
builder.Services.AddRateLimiter(options =>
{
    // Returned to the client when limit is exceeded.
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
    options.OnRejected = async (context, ct) =>
    {
        if (context.Lease.TryGetMetadata(MetadataName.RetryAfter, out var retryAfter))
            context.HttpContext.Response.Headers.RetryAfter = ((int)retryAfter.TotalSeconds).ToString();

        await context.HttpContext.Response.WriteAsJsonAsync(new
        {
            status = 429,
            title = "Too many requests",
            detail = "Slow down and try again later."
        }, ct);
    };

    // 1. Global limit — applies to every request unless an endpoint opts into another policy.
    options.GlobalLimiter = PartitionedRateLimiter.Create<HttpContext, string>(httpContext =>
        RateLimitPartition.GetFixedWindowLimiter(
            partitionKey: httpContext.User.Identity?.Name
                          ?? httpContext.Connection.RemoteIpAddress?.ToString()
                          ?? "anonymous",
            factory: _ => new FixedWindowRateLimiterOptions
            {
                PermitLimit = 100,
                Window = TimeSpan.FromMinutes(1),
                QueueLimit = 0
            }));

    // 2. Strict policy for login — 5 attempts per minute per IP (brute-force protection).
    options.AddFixedWindowLimiter("login", opt =>
    {
        opt.PermitLimit = 5;
        opt.Window = TimeSpan.FromMinutes(1);
        opt.QueueLimit = 0;
    });
});

// API versioning (URL segment style: /api/v1/..., /api/v2/...)
builder.Services
    .AddApiVersioning(options =>
    {
        options.DefaultApiVersion = new ApiVersion(1, 0);
        options.AssumeDefaultVersionWhenUnspecified = true;
        options.ReportApiVersions = true;
    })
    .AddApiExplorer(options =>
    {
        options.GroupNameFormat = "'v'VVV";       // e.g. v1, v2
        options.SubstituteApiVersionInUrl = true; // replaces {version} in route
    });

// Swagger / OpenAPI — one document per API version + Bearer auth UI
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddTransient<IConfigureOptions<SwaggerGenOptions>, ConfigureSwaggerOptions>();
builder.Services.AddSwaggerGen(options =>
{
    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "Paste your JWT token (without the 'Bearer ' prefix)."
    });
    options.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

var app = builder.Build();

// MUST be first — catches exceptions from every middleware that follows.
app.UseExceptionHandler();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(options =>
    {
        var provider = app.Services.GetRequiredService<IApiVersionDescriptionProvider>();
        foreach (var desc in provider.ApiVersionDescriptions)
        {
            options.SwaggerEndpoint(
                $"/swagger/{desc.GroupName}/swagger.json",
                $"Daily Tracker API {desc.GroupName.ToUpperInvariant()}");
        }
    });
}

app.UseHttpsRedirection();
app.UseMiddleware<LoggingMiddleware>();
app.UseRateLimiter();          // throttle abusive clients (after routing, before auth)
app.UseCors(CorsPolicy);       // MUST be before auth so OPTIONS preflight isn't 401'd
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Map("/ping", branch =>
{
    branch.Run(async ctx => await ctx.Response.WriteAsync("pong"));
});

app.Run();

// Registers one Swagger doc per discovered API version.
internal sealed class ConfigureSwaggerOptions : IConfigureOptions<SwaggerGenOptions>
{
    private readonly IApiVersionDescriptionProvider _provider;

    public ConfigureSwaggerOptions(IApiVersionDescriptionProvider provider) => _provider = provider;

    public void Configure(SwaggerGenOptions options)
    {
        foreach (var desc in _provider.ApiVersionDescriptions)
        {
            options.SwaggerDoc(desc.GroupName, new OpenApiInfo
            {
                Title = "Daily Tracker API",
                Version = desc.ApiVersion.ToString(),
                Description = desc.IsDeprecated ? "This API version is deprecated." : "Daily Tracker Service"
            });
        }
    }
}

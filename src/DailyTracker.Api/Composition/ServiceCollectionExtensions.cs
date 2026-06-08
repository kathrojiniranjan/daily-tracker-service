using DailyTracker.Api.Auditing;
using DailyTracker.Application.UseCases;
using DailyTracker.Application.Contracts;
using DailyTracker.Domain.Entities;
using DailyTracker.Infrastructure.Persistence;
using DailyTracker.Infrastructure.Repositories;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace DailyTracker.Api.Composition;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddDailyTrackerComposition(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("Default")
            ?? "Data Source=dailytracker.db";

        services.AddDbContext<AppDbContext>(options => options.UseSqlite(connectionString));
        services.AddScoped<IAppDbContext>(sp => sp.GetRequiredService<AppDbContext>());

        services.AddScoped<IUserRepository, UserRepository>();
        services.AddScoped<IRoleRepository, RoleRepository>();
        services.AddScoped<IDailyItemRepository, DailyItemRepository>();
        services.AddScoped<ITransactionRepository, TransactionRepository>();
        services.AddScoped<IUnitOfWork, UnitOfWork>();

        services.AddScoped<IAuthService, AuthService>();
        services.AddScoped<IDailyItemService, DailyItemService>();
        services.AddScoped<ITransactionService, TransactionService>();
        services.AddScoped<IAdminService, AdminService>();

        services.AddSingleton<IPasswordHasher<User>, PasswordHasher<User>>();

        services.AddSingleton<IAuditLogger, FileAuditLogger>();
        services.AddScoped<AuditActionFilter>();

        return services;
    }
}

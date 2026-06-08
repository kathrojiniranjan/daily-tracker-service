namespace DailyTracker.Contracts.Tests;

public class AuthContractTests
{
    [Fact]
    public void AuthLoginSnapshotExists()
    {
        var snapshot = Path.Combine(AppContext.BaseDirectory, "ContractSnapshots", "auth-login-success.json");
        Assert.True(File.Exists(snapshot));
    }
}

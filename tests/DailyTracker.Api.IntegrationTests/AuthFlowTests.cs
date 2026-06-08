namespace DailyTracker.Api.IntegrationTests;

public class AuthFlowTests(TestHostFactory factory) : IClassFixture<TestHostFactory>
{
    [Fact]
    public async Task HealthEndpoint_ReturnsOk()
    {
        using var client = factory.CreateClient();
        var response = await client.GetAsync("/health");
        response.EnsureSuccessStatusCode();
    }
}

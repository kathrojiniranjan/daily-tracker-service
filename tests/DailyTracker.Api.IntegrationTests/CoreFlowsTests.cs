namespace DailyTracker.Api.IntegrationTests;

public class CoreFlowsTests(TestHostFactory factory) : IClassFixture<TestHostFactory>
{
    [Fact]
    public async Task WeatherForecastEndpoint_ReturnsOk()
    {
        using var client = factory.CreateClient();
        var response = await client.GetAsync("/weatherforecast");
        response.EnsureSuccessStatusCode();
    }
}

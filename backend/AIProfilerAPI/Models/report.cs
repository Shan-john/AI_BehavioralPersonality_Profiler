namespace AIProfilerAPI.Models
{

    public class Report
    {
        public int Id { get; set; }
        public string Data { get; set; } = string.Empty;
        public int UserId { get; set; }
    }
}
namespace AIProfilerAPI.Models
{

    public class Report
    {
        public int id { get; set; }
        public string data { get; set; } = string.Empty;
        public int userId { get; set; }
    }
}
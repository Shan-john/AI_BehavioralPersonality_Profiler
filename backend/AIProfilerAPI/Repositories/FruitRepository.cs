using AIProfilerAPI.Interfaces;
using AIProfilerAPI.Models;

namespace AIProfilerAPI.Repositories
{
    public class FruitRepository : IFruitRepository
    {
        // Using a list so we can add to it, simulating an in-memory database table
        private static readonly List<Fruit> Fruits = new List<Fruit>
        {
            new Fruit { Id = 0, Name = "Apple" },
            new Fruit { Id = 1, Name = "Banana" },
            new Fruit { Id = 2, Name = "Orange" }
        };

        public IEnumerable<Fruit> GetAllFruits()
        {
            return Fruits;
        }

        public Fruit? GetFruitById(int id)
        {
            return Fruits.FirstOrDefault(f => f.Id == id);
        }

        public Fruit AddFruit(Fruit fruit)
        {
            fruit.Id = Fruits.Any() ? Fruits.Max(f => f.Id) + 1 : 0;
            Fruits.Add(fruit);
            return fruit;
        }
    }
}

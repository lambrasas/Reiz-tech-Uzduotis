import express from "express";
import axios from "axios";
import dotenv from "dotenv";
import NodeCache from "node-cache";
import cors from "cors";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

const cache = new NodeCache({ stdTTL: 600 });
const API_URL = "https://restcountries.com/v2/all?fields=name,region,area";

const axiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 30000,
});

async function fetchCountriesWithRetry(retries = 3) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`Attempt ${attempt}: Fetching data from API...`);
      const response = await axiosInstance.get("");
      console.log("API response received.");
      return response.data;
    } catch (error) {
      console.error(`Attempt ${attempt} failed:`, error.message);
      if (attempt === retries) {
        throw error;
      }
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  }
}

app.get("/api/countries", async (req, res) => {
  console.log("Received request for /api/countries");

  const cacheKey = "all_countries";
  const cachedData = cache.get(cacheKey);
  if (cachedData) {
    console.log("Serving data from cache");
    return res.json(cachedData);
  }

  try {
    const countries = await fetchCountriesWithRetry();
    console.log("Countries data fetched from API:", countries);

    cache.set(cacheKey, countries);
    res.json(countries);
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({ error: "Failed to fetch data" });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

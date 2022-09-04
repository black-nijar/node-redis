const express = require("express");
const axios = require("axios");
const cors = require("cors");
const redis = require("redis");
const app = express();

// create redis client
const redisClient = redis.createClient();
redisClient.connect();
const DEFAULT_EXP = 360;

app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.get("/photos", async (req, res) => {
  try {
    const redisData = await redisClient.get("photos");
    if (redisData) {
      res.json(JSON.parse(redisData));
    } else {
      const albumId = req.query.albumId;
      const { data } = await axios.get(
        "https://jsonplaceholder.typicode.com/posts",
        { params: { albumId } }
      );
      redisClient.setEx("photos", DEFAULT_EXP, JSON.stringify(data));
      res.json(data);
    }
  } catch (error) {
    throw error;
  }
});

app.get("/photos/:id", async (req, res) => {
  const { data } = await axios.get(
    `https://jsonplaceholder.typicode.com/photos/${req.params.id}`
  );
  res.json(data);
});

app.listen(3000, (req, res) => console.log("server is up on port", 3000));

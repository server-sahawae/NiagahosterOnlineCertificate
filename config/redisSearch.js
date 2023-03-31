if (process.env.NODE_ENV !== "production") require("dotenv").config();

const { createClient } = require("redis");

console.log("masuk redis Text");
const redisSearch = createClient({
  url: process.env.REDIS_SEARCH_URL,
});

module.exports = redisSearch;

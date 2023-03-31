if (process.env.NODE_ENV !== "production") require("dotenv").config();

const { createClient } = require("redis");

console.log("masuk redis Text");
const redisText = createClient({
  url: process.env.REDIS_NON_FILE_URL,
});

module.exports = redisText;

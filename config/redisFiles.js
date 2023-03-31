if (process.env.NODE_ENV !== "production") require("dotenv").config();

const { createClient } = require("redis");

console.log("masuk redis File");
const redisFile = createClient({
  url: process.env.REDIS_FILE_URL,
});

module.exports = redisFile;

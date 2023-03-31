if (process.env.NODE_ENV !== "production") require("dotenv").config();

const express = require("express");
const ErrorHandler = require("./middlewares/ErrorHandler");
const routes = require("./routes");
const app = express();
const fileupload = require("express-fileupload");
const port = process.env.PORT || 3000;
const cors = require("cors");
const { loggerInfo } = require("./helpers/loggerDebug");
const redisFile = require("./config/redisFiles");
const redisText = require("./config/redisText");
const redisSearch = require("./config/redisSearch");

app.use(fileupload());
app.use(cors({ origin: true, credentials: true }));
app.use(express.urlencoded({ extended: true, limit: 10485760 }));
app.use(express.json());

app.use(routes);
app.use(ErrorHandler);
app.listen(port, async () => {
  if (process.env.DEBUG) {
    loggerInfo(`Element Control listening on port ${port}`);
  } else console.log(`Element Control listening on port ${port}`);
  redisFile
    .on("error", (err) => loggerInfo("Redis File Error", err))
    .on("ready", () => loggerInfo("Redis File on"));
  await redisFile.connect();
  redisText
    .on("error", (err) => loggerInfo("Redis Text Error", err))
    .on("ready", () => loggerInfo("Redis Text on"));
  await redisText.connect();
  redisSearch
    .on("error", (err) => loggerInfo("Redis Search Error", err))
    .on("ready", () => loggerInfo("Redis Search on"));
  await redisSearch.connect();
});

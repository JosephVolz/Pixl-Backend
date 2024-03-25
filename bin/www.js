// npm packages
import "dotenv/config.js";
import express from "express";
import logger from "morgan";
import cors from "cors";
import formData from "express-form-data";
import serverless from "serverless-http";

import http from "http";

// import routes
import {router as profilesRouter} from "../routes/profiles.js";
import {router as authRouter} from "../routes/auth.js";

// create the express app
const app = express();

// basic middleware
app.use(cors());
app.use(logger("dev"));
app.use(express.json());
app.use(formData.parse());

// mount imported routes
app.use("/api/profiles", profilesRouter);
app.use("/api/auth", authRouter);

// handle 404 errors
app.use(function (req, res, next) {
  res.status(404).json({err: "Not found"});
});

// handle all other errors
app.use(function (err, req, res, next) {
  res.status(err.status || 500).json({err: err.message});
});

// get port from environment and store in Express
const port = process.env.PORT || 5000;
app.set("port", port);

// create HTTP server
const server = http.createServer(app);

// listen on provided port, on all network interfaces
server.listen(port);

server.on("listening", () => {
  const addr = server.address();
  const bind = typeof addr === "string" ? `pipe ${addr}` : `port ${addr.port}`;
  console.log(`Listening on ${bind}`);
});

export const handler = serverless(app);

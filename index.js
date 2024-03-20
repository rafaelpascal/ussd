// var restify = require("restify");
// var config = require("./config/config");
// const restifyPlugins = require("restify-plugins");
// var route_link = require("./routes/route_index");

// const server = restify.createServer({
//   name: config.name,
//   version: config.version,
// });

// server.use(
//   restifyPlugins.jsonBodyParser({
//     mapParams: true,
//   })
// );

// server.use(restifyPlugins.acceptParser(server.acceptable));

// server.use(
//   restifyPlugins.queryParser({
//     mapParams: true,
//   })
// );

// server.use(restifyPlugins.fullResponse());

// server.listen(config.port, function () {
//   console.log("Server Listening to %s", config.base_url);
// });

// route_link(server);

const express = require("express");
const bodyParser = require("body-parser");
const config = require("./config/config");
const routeLink = require("./routes/route_index");

const app = express();
const port = config.port;

// Middleware for parsing JSON and URL-encoded data
// app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes setup
routeLink(app);

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});

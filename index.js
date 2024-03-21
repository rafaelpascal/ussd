const express = require("express");
const bodyParser = require("body-parser");
const config = require("./config/config");
const routeLink = require("./routes/route_index");

const app = express();
const port = config.port;

// Middleware for parsing JSON and URL-encoded data
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/ussd", (req, res) => {
  res.send("Appmart Ussd Payment status verification Is Running");
});

// Routes setup
app.use("/ussd", routeLink);

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});

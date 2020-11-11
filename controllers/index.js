const express = require('express'),
   app = express();

const catalogue = require("./catalogue")

app.use("/catalogue", catalogue);
module.exports = app;
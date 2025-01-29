const express = require("express");
const app = express();
const cors = require("cors");
const AllRoutes = require("./Routes/index");

app.use(cors());
app.use(express.json());
app.use(AllRoutes);

module.exports = { app };

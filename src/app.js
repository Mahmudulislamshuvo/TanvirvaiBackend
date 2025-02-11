const express = require("express");
const app = express();
const cors = require("cors");
const AllRoutes = require("./Routes/index.js");

app.use(express.static("Public/temp"));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(AllRoutes);

module.exports = { app };

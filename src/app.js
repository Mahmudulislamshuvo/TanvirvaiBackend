const express = require("express");
const app = express();
const cors = require("cors");
const AllRoutes = require("./Routes/index.js");

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public/temp"));
// whatever I set here I don't have to use it in links. //http://localhost:4000/1739343741417-260795572.png like that one

app.use(AllRoutes);

module.exports = { app };

const mongoose = require("mongoose");
require("dotenv").config();
const chalk = require("chalk");
const { dbName } = require("../Constant/constant");

const dbConnect = async () => {
  try {
    const dbconnectionInstense = await mongoose.connect(
      `${process.env.MONGODB_DATABASE_URL}/${dbName}`
    );
  } catch (error) {
    console.log(chalk.blue("Connection error"), error);
  }
};

module.exports = { dbConnect };

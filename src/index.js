require("dotenv").config();
const { dbConnect } = require("./database/dbconnect");
const { app } = require("./app.js");
const chalk = require("chalk");

dbConnect()
  .then(() => {
    console.log(chalk.bgBlue("Database Connection Successful"));
    const port = process.env.PORT || 4000;
    app.listen(port, () => {
      console.log(
        chalk.bgGreen(`Server is running on http://localhost:${port}`)
      );
    });
  })
  .catch((error) => {
    console.log(chalk.bgRed("Connection error from index"), error);
  });

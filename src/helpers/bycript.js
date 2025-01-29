const bcrypt = require("bcrypt");

const makeHashPassword = async (PlaintextPassword) => {
  try {
    return bcrypt.hash(PlaintextPassword, 10);
  } catch (error) {
    console.log("failed to hash password", error);
  }
};

const comparePassword = async (PlaintextPassword, hashpass) => {
  try {
    return bcrypt.compare(PlaintextPassword, hashpass);
  } catch (error) {
    console.log("unable to dehash password", error);
  }
};

module.exports = { makeHashPassword, comparePassword };

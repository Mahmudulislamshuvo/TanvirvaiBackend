const aleaRNGFactory = require("number-generator/lib/aleaRNGFactory");

const Otpnumbergenertor = async () => {
  const generator1 = await aleaRNGFactory(Date.now());
  // my way
  const randomValue = await generator1.uInt32();
  // Limits it to 4 digits. add 0 or less 0 to control digits
  return (fiveDigitValue = randomValue % 10000);
};

module.exports = { Otpnumbergenertor };

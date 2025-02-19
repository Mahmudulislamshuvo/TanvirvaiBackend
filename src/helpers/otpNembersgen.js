const aleaRNGFactory = require("number-generator/lib/aleaRNGFactory");

const Otpnumbergenertor = async () => {
  const generator1 = await aleaRNGFactory(Date.now());
  const randomValue = await generator1.uInt32();
  // Convert to string and pad with zeros to ensure 4 digits.
  return (randomValue % 10000).toString().padStart(4, "0");
};

module.exports = { Otpnumbergenertor };

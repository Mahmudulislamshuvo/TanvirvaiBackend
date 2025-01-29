const Mailchecker = (email = "mahmudulislammern@gmail.com") => {
  const mailRegex =
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return mailRegex.test(email);
};

const PasswordChecker = (password) => {
  const PassRegex = /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{6,16}$/;
  return PassRegex.test(password);
};

const bdNumberChecker = (number) => {
  const bdMobileRegex = /^(?:\+?88)?01[3-9]\d{8}$/;
  bdMobileRegex.test(number);
  console.log(bdMobileRegex);

  return bdNumberChecker;
};

module.exports = { Mailchecker, PasswordChecker, bdNumberChecker };

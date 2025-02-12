const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/uploads");
  },
  // filename: function (req, file, cb) {
  //   cb(null, file.originalname);
  // },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);

    cb(null, uniqueSuffix + ext);
  },
});

const upload = multer({ storage: storage });

module.exports = { upload };

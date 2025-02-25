const multer = require("multer");
const path = require("path");

//get image file

const storage = multer.diskStorage({
  destination: (req, file, call) => {
    call(null, "uploads");
  },
  filename: (req, file, call) => {
    call(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 1000000,
    fileFilter: (req, fie, call) => {
      const fileTypes = /jpeg|jpg|JPEG|PNG|png|avif/;
      const mimetype = fileTypes.test(file.mimetype);
      const extname = fileTypes.test(path.extname(file.originalname));
      if (miniType && extname) {
        return call(null, true);
      } else {
        return call("File format invalid")
      }}}
}).single('image')
module.exports = upload

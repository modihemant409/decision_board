const multer = require("multer");
const uuid = require("uuid");
const Path = require("path");
const config = require("config");
const fs = require("fs");

exports.UploadFile = async (req, folder = "/") => {
  var storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, `assets/${folder}`);
    },
    filename: function (req, file, cb) {
      cb(null, uuid.v4() + file.originalname.replace(/\s/g, ""));
    },
  });

  var upload = multer({ storage: storage }).any();
  return new Promise((resolve, reject) => {
    upload(req, (res = null), async function (err) {
      if (err) reject(err);
      if (req.files) {
        const length = req.files.length;
        if (length == 1) {
          resolve({
            body: req.body,
            file: {
              ...req.files[0],
              path: config.get("Url.Backend") + req.files[0].path,
              length: 1,
            },
          });
        } else {
          resolve({
            body: req.body,
            file: req.files.map((image) => {
              let path = config.get("Url.Backend") + image.path;
              return { ...image, path: path };
            }),
          });
        }
      }
    });
  });
};

exports.removeFile = (file) => {
  if (!file) {
    console.log("no file");
    return;
  }
  const path = Path.join(
    __dirname,
    "../",
    file.replace(config.get("Url.Backend"), "")
  );
  if (fs.existsSync(path)) {
    fs.unlinkSync(path);
    return "success";
  }
  return "doesn't exist";
};

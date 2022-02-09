const express = require("express");
const app = express();
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path");
const https = require("https"),
  fs = require("fs");

const options = {
  key: fs.readFileSync("./key.pem"),
  cert: fs.readFileSync("./certificate.pem"),
  // ca : fs.readFileSync("./caBundle.pem")
};

const db = require("./db/connection");
//models and routes
const models = require("./models");
const Routes = require("./routes");

app.use(express.json({ limit: "50mb" }));
app.use("/assets", express.static(path.join(__dirname, "assets")));

app.use(cors());

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "OPTIONS,GET,POST");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type,Accept");
  next();
});

app.use("/api/v1/user", Routes.user);
app.use("/api/v1/auth", Routes.auth);
app.use("/api/v1/dashboard", Routes.dashboard);
app.use("/api/v1/sheet", Routes.sheet);
app.use("/api/v1/admin", Routes.admin);


models.Logo.findOne({ where: { id: 1 } })
  .then((logo) => {
    if (!logo) {
      return models.Logo.create({
        id: 1,
        name: "Home",
        path: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQlZac3pzaViD1cvpt2QccKZVbuj4_Mf75bKg&usqp=CAU",
      });
    }
  })
  .catch((error) => {
    console.log(error);
  });
//error handling
app.use((error, req, res, next) => {
  console.log(error);
  const status = false;
  const statusCode = error.statusCode || 500;
  const message = error.message;
  const data = error.data;
  res.status(statusCode).json({ status: status, message: message, data: data });
});
db.sync()
  // db.sync({ alter: true })
  .then((result) => {
    // Server = app.listen(process.env.PORT, (e) => {
      https.createServer(options, app).listen(process.env.PORT, (e) => {
      console.log("server is listening on " + process.env.PORT + " port");
    });
  })
  .catch((err) => {
    console.log(err);
  });

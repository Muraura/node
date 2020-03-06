// Importing packages
const express = require("express");
const bodyParser = require("body-parser");
const passport = require("passport");

const app = express();

// Ensble CORS
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.header(
    "Access-Control-Allow-Methods",
    "POST, GET, OPTIONS, DELETE, PUT,PATCH"
  );
  next();
});
// Link body parser for url reading
app.use(
  bodyParser.urlencoded({
    extended: false,
    limit: "10gb"
  })
);
app.use(
  bodyParser.json({
    limit: "10gb"
  })
);

// Initialize passport for authenticated routes
app.use(passport.initialize());
require("./passport")(passport);

// Import routes
const {
  personnel,
  scout,
  block,
  bed,
  issue,
  issueCategory,
  issueType,
  personnelType,
  tolerance,
  toleranceType,
  variety,
  station,
  point,
  score,plant
} = require("./routes");

// Initialize routes
app.use("/personnel", personnel);
app.use("/scout", scout);
app.use("/block", block);
app.use("/bed", bed);
app.use("/issue", issue);
app.use("/issue-category", issueCategory);
app.use("/issue-type", issueType);
app.use("/personnel-type", personnelType);
app.use("/tolerance", tolerance);
app.use("/tolerance-type", toleranceType);
app.use("/variety", variety);
app.use("/station", station);
app.use("/point", point);
app.use("/score", score);
app.use("/plant", plant);

module.exports = app;

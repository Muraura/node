const express = require("express");
const router = express.Router();
const passport = require("passport");

const { StationController } = require("../controllers");

//  @route  GET station
//  @desc   Station list all
//  @access private
router.get(
  "/",
  passport.authenticate("jwt", {
    session: false
  }),
  (req, res) => {
    const page = parseInt(req.query.page) > 0 ? parseInt(req.query.page) : 0;
    const limit =
      parseInt(req.query.limit) > 0 ? parseInt(req.query.limit) : 10;
    const order = req.query.hasOwnProperty("order")
      ? req.query.order
      : "station_name";
    const ordermethod = req.query.hasOwnProperty("id")
      ? req.query.ordermethod
      : "ASC";
    const name = req.query.hasOwnProperty("name") ? req.query.name : "";

    StationController.getAllStations(
      page,
      limit,
      order,
      ordermethod,
      name,
      (err, station) => {
        if (err) {
          res.status(400).json(err);
        } else {
          res.status(200).json(station);
        }
      }
    );
  }
);

//  @route  GET station
//  @desc   station list all without pagination
//  @access private
router.get(
  "/all",
  passport.authenticate("jwt", {
    session: false
  }),
  (req, res) => {
    StationController.exportStation((err, station) => {
      if (err) {
        //console.log(err);
        res.status(400).json(err);
      } else {
        res.status(200).json(station);
      }
    });
  }
);
module.exports = router;

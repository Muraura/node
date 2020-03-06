const express = require("express");
const router = express.Router();
const passport = require("passport");

const { PointController } = require("../controllers");

//  @route  GET point
//  @desc   Point list all
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
      : "point_name";
    const ordermethod = req.query.hasOwnProperty("id")
      ? req.query.ordermethod
      : "ASC";
    const name = req.query.hasOwnProperty("name") ? req.query.name : "";

    PointController.getAllPoints(
      page,
      limit,
      order,
      ordermethod,
      name,
      (err, point) => {
        if (err) {
          res.status(400).json(err);
        } else {
          res.status(200).json(point);
        }
      }
    );
  }
);

//  @route  GET point
//  @desc   point list all without pagination
//  @access private
router.get(
  "/all",
  passport.authenticate("jwt", {
    session: false
  }),
  (req, res) => {
    PointController.exportPoint((err, point) => {
      if (err) {
        //console.log(err);
        res.status(400).json(err);
      } else {
        res.status(200).json(point);
      }
    });
  }
);
module.exports = router;

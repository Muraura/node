const express = require("express");
const router = express.Router();
const passport = require("passport");

const { ToleranceController } = require("../controllers");

const { validateId } = require("../validation");

//  @route  POST tolerance
router.post(
  "/",
  passport.authenticate("jwt", {
    session: false
  }),
  (req, res) => {
    //console.log(req.body);
    ToleranceController.saveTolerance(
      req.body,
      req.user.id,
      (err, tolerance) => {
        if (err) {
          //console.log(err);
          res.status(400).json(err);
        } else {
          res.status(200).json(tolerance);
        }
      }
    );
  }
);

//  @route  GET tolerance
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
      : "created_at";
    const ordermethod = req.query.hasOwnProperty("ordermethod")
      ? req.query.ordermethod
      : "ASC";
    const name = req.query.hasOwnProperty("name") ? req.query.name : "";

    const tolerance_type = req.query.hasOwnProperty("tolerance_type")
      ? req.query.tolerance_type
      : "";

    ToleranceController.getAllTolerance(
      page,
      limit,
      order,
      ordermethod,
      name,
      tolerance_type,
      (err, tolerance) => {
        if (err) {
          res.status(400).json(err);
        } else {
          res.status(200).json(tolerance);
        }
      }
    );
  }
);

//  @route  PATCH personnel
router.patch(
  "/:id",
  passport.authenticate("jwt", {
    session: false
  }),
  (req, res) => {
    const toleranceId = req.params.id;

    if (toleranceId > 0) {
      ToleranceController.updateTolerance(
        toleranceId,
        req.body,
        req.user.id,
        (err, tolerance) => {
          if (err) {
            res.status(400).json(err);
          } else {
            res.status(200).json(tolerance);
          }
        }
      );
    } else {
      res.status(400).json({
        error: {
          id: "No id provided"
        }
      });
    }
  }
);

//  @route  DELETE tolerance
router.delete(
  "/:id",
  passport.authenticate("jwt", {
    session: false
  }),
  (req, res) => {
    const toleranceId = req.params.id;
    if (toleranceId > 0) {
      ToleranceController.deleteTolerance(toleranceId, (err, tolerance) => {
        if (err) {
          res.status(400).json(err);
        } else {
          res.status(200).json(tolerance);
        }
      });
    } else {
      res.status(400).json({
        error: {
          id: "No id provided"
        }
      });
    }
  }
);

//  @route  GET tolerance
router.get(
  "/all",
  passport.authenticate("jwt", {
    session: false
  }),
  (req, res) => {
    ToleranceController.exportTolerance((err, tolerance) => {
      if (err) {
        res.status(400).json(err);
      } else {
        res.status(200).json(tolerance);
      }
    });
  }
);

module.exports = router;

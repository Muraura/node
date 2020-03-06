const express = require("express");
const router = express.Router();
const passport = require("passport");

const { PersonnelController } = require("../controllers");

//  @route  POST personnel/login
//  @desc   Personnel login
//  @access Public
router.post("/login", (req, res) => {
  PersonnelController.login(req.body, (err, personnel) => {
    if (err) {
      console.log(err);
      res.status(400).json(err);
    } else {
      res.status(200).json(personnel);
    }
  });
});

//  @route  PATCH personnel/login
//  @desc   Personnel reset password
//  @access Public
router.patch("/reset_password", (req, res) => {
  PersonnelController.resetPassword(req.body, (err, personnel) => {
    if (err) {
      res.status(400).json(err);
    } else {
      //console.log(personnel)
      res.status(200).json(personnel);
    }
  });
});

//  @route  POST personnel
//  @desc   Personnel save
//  @access private
router.post(
  "/",
  passport.authenticate("jwt", {
    session: false
  }),
  (req, res) => {
    PersonnelController.savePersonnel(
      req.body,
      req.user.id,
      (err, personnel) => {
        if (err) {
          res.status(400).json(err);
        } else {
          res.status(200).json(personnel);
        }
      }
    );
  }
);

//  @route  GET personnel
//  @desc   Personnel list all
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
      : "personnel_first_name";
    const ordermethod = req.query.hasOwnProperty("ordermethod")
      ? req.query.ordermethod
      : "ASC";
    const first_name = req.query.hasOwnProperty("first_name")
      ? req.query.first_name
      : "";
    const last_name = req.query.hasOwnProperty("last_name")
      ? req.query.last_name
      : "";
    const phone = req.query.hasOwnProperty("phone") ? req.query.phone : "";
    const status = req.query.hasOwnProperty("status") ? req.query.status : "";
    const personnel_type_id = req.query.hasOwnProperty("personnel_type_id")
      ? req.query.personnel_type_id
      : "";

    PersonnelController.getAllPersonnel(
      page,
      limit,
      order,
      ordermethod,
      first_name,
      last_name,
      phone,
      status,
      personnel_type_id,
      (err, personnel) => {
        if (err) {
          console.log(err);
          res.status(400).json(err);
        } else {
          res.status(200).json(personnel);
        }
      }
    );
  }
);

//  @route  PATCH personnel
//  @desc   Patch a personnel
//  @access private
router.patch(
  "/:id",
  passport.authenticate("jwt", {
    session: false
  }),
  (req, res) => {
    const personnelId = req.params.id;

    if (personnelId > 0) {
      PersonnelController.updatePersonnel(
        personnelId,
        req.body,
        req.user.id,
        (err, personnel) => {
          if (err) {
            res.status(400).json(err);
          } else {
            res.status(200).json(personnel);
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

//  @route  DELETE personnel
//  @desc   Delete a personnel
//  @access private
router.delete(
  "/:id",
  passport.authenticate("jwt", {
    session: false
  }),
  (req, res) => {
    const personnelId = req.params.id;
    if (personnelId > 0) {
      PersonnelController.deletePersonnel(personnelId, (err, personnel) => {
        if (err) {
          res.status(400).json(err);
        } else {
          res.status(200).json(personnel);
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

//  @route  GET personnel
//  @desc   Personnel list all
//  @access private
router.get(
  "/scouts",
  passport.authenticate("jwt", {
    session: false
  }),
  (req, res) => {
    PersonnelController.getScouts((err, personnel) => {
      if (err) {
        res.status(400).json(err);
      } else {
        res.status(200).json(personnel);
      }
    });
  }
);

//  @route  GET personnel
//  @desc   Personnel list all
//  @access private
router.get(
  "/all",
  passport.authenticate("jwt", {
    session: false
  }),
  (req, res) => {
    PersonnelController.exportPersonnel((err, personnel) => {
      if (err) {
        res.status(400).json(err);
      } else {
        res.status(200).json(personnel);
      }
    });
  }
);

module.exports = router;

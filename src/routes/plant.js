const express = require("express");
const router = express.Router();
const passport = require("passport");

const { PlantController } = require("../controllers");

//  @route  GET plant
//  @desc   plant list all without pagination
//  @access private
router.get(
  "/all",
  passport.authenticate("jwt", {
    session: false
  }),
  (req, res) => {
    PlantController.fetchAllPlants((err, plant) => {
      if (err) {
        console.log(err);
        res.status(400).json(err);
      } else {
        res.status(200).json(plant);
      }
    });
  }
);
module.exports = router;

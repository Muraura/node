const express = require("express");
const router = express.Router();
const passport = require("passport");

const { ScoreController } = require("../controllers");

//  @route  GET score
//  @desc   score list all without pagination
//  @access private
router.get(
  "/all",
  passport.authenticate("jwt", {
    session: false
  }),
  (req, res) => {
    ScoreController.exportScores((err, score) => {
      //console.log(score);
      if (err) {
        //console.log(err);
        res.status(400).json(err);
      } else {
        res.status(200).json(score);
      }
    });
  }
);
module.exports = router;

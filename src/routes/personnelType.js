const express = require("express");
const router = express.Router();
const passport = require("passport");

const { PersonnelTypeController } = require("../controllers");

//  @route  GET /personnel-type
//  @desc   fetch Personnel type
//  @access private
router.get(
  "/all",
  passport.authenticate("jwt", {
    session: false
  }),
  (req, res) => {
    PersonnelTypeController.getAllPersonnelType((err, personneltype) => {
      if (err) {
        //console.log(err);
        res.status(400).json(err);
      } else {
        res.status(200).json(personneltype);
      }
    });
  }
);

module.exports = router;

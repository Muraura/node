const express = require('express');
const router = express.Router();
const passport = require('passport');

const {
    ToleranceTypeController,
} = require('../controllers');

//  @route  GET toleranceType
//  @desc   ToleranceType list all
//  @access private  
router.get(
    "/",
    passport.authenticate("jwt", {
        session: false
    }),
    (req, res) => {
        const page = parseInt(req.query.page) > 0 ? parseInt(req.query.page) : 0;
        const limit = parseInt(req.query.limit) > 0 ? parseInt(req.query.limit) : 5;
        const name = req.query.hasOwnProperty("name") ? req.query.name : "";

        ToleranceTypeController.getAllToleranceType(page, limit, name, (err, toleranceType) => {
            if (err) {
                res.status(400).json(err);
            } else {
                res.status(200).json(toleranceType);
            }
        });

    }
);

//  @route  GET toleranceType
//  @desc   toleranceType list all without pagination
//  @access private  
router.get(
    "/all",
    passport.authenticate("jwt", {
        session: false
    }),
    (req, res) => {
        ToleranceTypeController.fetchAllToleranceTypes((err, toleranceType) => {
            if (err) {
                res.status(400).json(err);
            } else {
                res.status(200).json(toleranceType);
            }
        });

    });

module.exports = router;
const express = require('express');
const router = express.Router();
const passport = require('passport');

const {
    IssueTypeController,
} = require('../controllers');

//  @route  GET issueType
//  @desc   IssueType list all
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

        IssueTypeController.getAllIssueType(page, limit, name, (err, issueType) => {
            if (err) {
                res.status(400).json(err);
            } else {
                res.status(200).json(issueType);
            }
        });

    }
);

//  @route  GET issueType
//  @desc   issueType list all without pagination
//  @access private  
router.get(
    "/all",
    passport.authenticate("jwt", {
        session: false
    }),
    (req, res) => {
        IssueTypeController.fetchAllIssueTypes((err, issueType) => {
            if (err) {
                res.status(400).json(err);
            } else {
                res.status(200).json(issueType);
            }
        });

    });

module.exports = router;
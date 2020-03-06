const express = require('express');
const router = express.Router();
const passport = require('passport');

const {
    IssueController,
} = require('../controllers');

const {
    validateId
} = require("../validation");

//  @route  POST issue
//  @desc   issue save
//  @access private  
router.post('/',
    passport.authenticate("jwt", {
        session: false
    }), (req, res) => {
        IssueController.saveIssue(req.body, req.user.id, (err, issue) => {
            if (err) {
                res.status(400).json(err);
            } else {
                res.status(200).json(issue);
            }
        });
    });

//  @route  GET issue
//  @desc   issue list all
//  @access private  
router.get(
    "/",
    passport.authenticate("jwt", {
        session: false
    }),
    (req, res) => {
        const page = parseInt(req.query.page) > 0 ? parseInt(req.query.page) : 0;
        const limit = parseInt(req.query.limit) > 0 ? parseInt(req.query.limit) : 10;
        const issue_name = req.query.hasOwnProperty("issue_name") ? req.query.issue_name : "";
        const issue_type = req.query.hasOwnProperty("issue_type") ? req.query.issue_type : "";
        const tolerance_type = req.query.hasOwnProperty("tolerance_type") ? req.query.tolerance_type : "";
        const score = req.query.hasOwnProperty("score") ? req.query.score : "";
        IssueController.getAllIssues(page, limit, issue_name, issue_type, tolerance_type, score, (err, issue) => {
            if (err) {
                res.status(400).json(err);
            } else {
                res.status(200).json(issue);
            }
        });

    }
);

//  @route  PATCH issue
//  @desc   Patch a issue
//  @access private
router.patch(
    "/:id",
    passport.authenticate("jwt", {
        session: false
    }),
    (req, res) => {
        const issueId = req.params.id;
        if (validateId(issueId)) {
            IssueController.updateIssue(issueId, req.body, req.user.id, (err, issue) => {
                if (err) {
                    res.status(400).json(err);
                } else {
                    res.status(200).json(issue);
                }
            });
        } else {
            res.status(400).json({
                error: {
                    id: "Invalid id provided"
                }
            });
        }
    }
);

//  @route  DELETE issue
//  @desc   Delete a issue
//  @access private
router.delete(
    "/:id",
    passport.authenticate("jwt", {
        session: false
    }),
    (req, res) => {
        const issueId = req.params.id;
        if (validateId(issueId)) {
            IssueController.deleteIssue(issueId, (err, issue) => {
                if (err) {
                    res.status(400).json(err);
                } else {
                    res.status(200).json(issue);
                }
            });
        } else {
            res.status(400).json({
                error: {
                    id: "Invalid id provided"
                }
            });
        }
    }
);

//  @route  GET issue
//  @desc   issue list all without pagination
//  @access private  
router.get(
    "/all",
    passport.authenticate("jwt", {
        session: false
    }),
    (req, res) => {
        const order = req.query.hasOwnProperty("order")
      ? req.query.order
      : "issue_name";
    const ordermethod = req.query.hasOwnProperty("ordermethod")
      ? req.query.ordermethod
      : "ASC";
        IssueController.fetchAllIssues(order,ordermethod,(err, issues) => {
            if (err) {
                res.status(400).json(err);
            } else {
                res.status(200).json(issues);
            }
        });

    }
);


module.exports = router;
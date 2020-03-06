const express = require("express");
const router = express.Router();
const passport = require("passport");

const { IssueCategoryController } = require("../controllers");

const { validateId } = require("../validation");

//  @route  POST issue-category
//  @desc   issue-category save
//  @access private
router.post(
  "/",
  passport.authenticate("jwt", {
    session: false
  }),
  (req, res) => {
    IssueCategoryController.saveIssueCategory(
      req.body,
      req.user.id,
      (err, issueCategory) => {
        if (err) {
          res.status(400).json(err);
        } else {
          res.status(200).json(issueCategory);
        }
      }
    );
  }
);

//  @route  GET issue-category
//  @desc   issue-category list all
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
      : "issue_category_name";
    const ordermethod = req.query.hasOwnProperty("ordermethod")
      ? req.query.ordermethod
      : "ASC";
    const name = req.query.hasOwnProperty("name") ? req.query.name : "";
    const issue = req.query.hasOwnProperty("issue") ? req.query.issue : "";

    IssueCategoryController.getAllIssueCategories(
      page,
      limit,
      order,
      ordermethod,
      name,
      issue,
      (err, issuecategory) => {
        if (err) {
          // console.log(err);
          res.status(400).json(err);
        } else {
          res.status(200).json(issuecategory);
        }
      }
    );
  }
);

//  @route  PATCH issue-category
//  @desc   Patch a issue-category
//  @access private
router.patch(
  "/:id",
  passport.authenticate("jwt", {
    session: false
  }),
  (req, res) => {
    const issueCategoryId = req.params.id;
    if (validateId(issueCategoryId)) {
      IssueCategoryController.updateIssueCategory(
        issueCategoryId,
        req.body,
        req.user.id,
        (err, issueCategory) => {
          if (err) {
            //console.log(err);
            res.status(400).json(err);
          } else {
            // console.log(personnel);
            res.status(200).json(issueCategory);
          }
        }
      );
    } else {
      res.status(400).json({
        error: {
          id: "Invalid id provided"
        }
      });
    }
  }
);

//  @route  DELETE issue-category
//  @desc   Delete a issue-category
//  @access private
router.delete(
  "/:id",
  passport.authenticate("jwt", {
    session: false
  }),
  (req, res) => {
    const issueCategoryId = req.params.id;
    if (issueCategoryId > 0) {
      IssueCategoryController.deleteIssueCategory(
        issueCategoryId,
        (err, issuecategory) => {
          if (err) {
            //console.log(err);
            res.status(400).json(err);
          } else {
            res.status(200).json(issuecategory);
          }
        }
      );
    } else {
      res.status(400).json({
        error: "Invalid issue category id"
      });
    }
  }
);

//  @route  GET issue-category
//  @desc   issue-category list all without pagination
//  @access private
router.get(
  "/all",
  passport.authenticate("jwt", {
    session: false
  }),
  (req, res) => {
    IssueCategoryController.fetchAllIssueCategories((err, issueCategory) => {
      if (err) {
        res.status(400).json(err);
      } else {
        res.status(200).json(issueCategory);
      }
    });
  }
);

module.exports = router;

const express = require("express");
const router = express.Router();
const passport = require("passport");

const { BlockController } = require("../controllers");

//  @route  POST /block
//  @desc   Create block
//  @access private
router.post(
  "/",
  passport.authenticate("jwt", {
    session: false
  }),
  (req, res) => {
    BlockController.saveBlock(req.body, req.user.id, (err, block) => {
      if (err) {
        //console.log(err);
        res.status(400).json(err);
      } else {
        res.status(200).json(block);
      }
    });
  }
);

//  @route  GET block
//  @desc   block list all
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
      : "block_name";
    const ordermethod = req.query.hasOwnProperty("ordermethod")
      ? req.query.ordermethod
      : "ASC";
    const name = req.query.hasOwnProperty("name") ? req.query.name : "";
    const parent = req.query.hasOwnProperty("parent") ? req.query.parent : "";

    BlockController.getAllBlocks(
      page,
      limit,
      order,
      ordermethod,
      name,
      parent,
      (err, block) => {
        if (err) {
          res.status(400).json(err);
        } else {
          res.status(200).json(block);
        }
      }
    );
  }
);
//  @route  GET block
//  @desc   block list all parent block
//  @access private
router.get(
  "/parent-block",
  passport.authenticate("jwt", {
    session: false
  }),
  (req, res) => {
    BlockController.getAllParentBlocks((err, blocks) => {
      if (err) {
        res.status(400).json(err);
      } else {
        res.status(200).json(blocks);
      }
    });
  }
);

//  @route  PATCH block
//  @desc   Patch a block
//  @access private
router.patch(
  "/:id",
  passport.authenticate("jwt", {
    session: false
  }),
  (req, res) => {
    const blockId = req.params.id;

    if (blockId > 0) {
      BlockController.updateBlock(
        blockId,
        req.body,
        req.user.id,
        (err, block) => {
          if (err) {
            //console.log(err);
            res.status(400).json(err);
          } else {
            res.status(200).json(block);
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

//  @route  DELETE block
//  @desc   Delete a block
//  @access private
router.delete(
  "/:id",
  passport.authenticate("jwt", {
    session: false
  }),
  (req, res) => {
    const blockId = req.params.id;
    if (blockId > 0) {
      BlockController.deleteBlock(blockId, (err, block) => {
        if (err) {
          res.status(400).json(err);
        } else {
          res.status(200).json(block);
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

//  @route  GET block
//  @desc   block list all without pagination
//  @access private
router.get(
  "/all",
  passport.authenticate("jwt", {
    session: false
  }),
  (req, res) => {
    BlockController.exportBlock((err, blocks) => {
      if (err) {
        res.status(400).json(err);
      } else {
        res.status(200).json(blocks);
      }
    });
  }
);

module.exports = router;

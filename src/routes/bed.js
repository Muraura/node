const express = require("express");
const router = express.Router();
const passport = require("passport");

const {
  BedController
} = require("../controllers");

//  @route  POST bed
//  @desc   bulk bed save
//  @access private
router.post(
  "/",
  passport.authenticate("jwt", {
    session: false
  }),
  (req, res) => {
    BedController.bulkSaveBed(req.body, req.user.id, (err, bed) => {
      if (err) {
        //console.log(err);
        res.status(400).json(err);
      } else {
        res.status(200).json(bed);
      }
    });
  }
);

// router.post(
//   "/",
//   passport.authenticate("jwt", {
//     session: false
//   }),
//   (req, res) => {
//     let bedPromises = [];
//     let allErrors = [];

//     let bed = req.body;

//     for (let r = bed.from; r <= bed.to; r++) {
//       let newBed = {
//         bed_name: "Bed " + r,
//         bed_number: r,
//         block_id: bed.block_id,
//         variety_id: bed.variety_id,
//         plant_status: bed.plant_status,
//         plant_expected_pick_date: bed.expected_pick_date,
//         plant_date: bed.plant_date
//       };
//       bedPromises.push(
//         Promise.resolve(
//           BedController.saveBed(newBed, req.user.id, (err, bed) => {
//             if (err) {
//               // console.log(err);
//               allErrors.push(err);
//             } else {
//               // console.log(bed);
//             }
//           })
//         )
//       );
//     }

//     Promise.all(bedPromises)
//       .then(bedResult => {
//         console.log(bedResult);
//         if (allErrors.length > 0) {
//           res.status(400).json(allErrors[0]);
//         } else {
//           res.status(200).json({ message: "Success" });
//         }
//       })
//       .catch(err => {
//         res.status(400).json({ error: err.message });
//       });
//   }
// );

//  @route  GET bed
//  @desc   bed list all
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
    const order = req.query.hasOwnProperty("order") ?
      req.query.order :
      "bed_name";
    const ordermethod = req.query.hasOwnProperty("ordermethod") ?
      req.query.ordermethod :
      "DESC";
    const bed_name = req.query.hasOwnProperty("bed_name") ?
      req.query.bed_name :
      "";
    const bed_number = req.query.hasOwnProperty("bed_number") ?
      req.query.bed_number :
      "";
    const block = req.query.hasOwnProperty("block") ? req.query.block : "";

    const sub_block_name = req.query.hasOwnProperty("sub_block_name") ?
      req.query.sub_block_name :
      "";
    const variety = req.query.hasOwnProperty("variety") ?
      req.query.variety :
      "";
    const plant_date = req.query.hasOwnProperty("plant_date") ?
      req.query.plant_date :
      "";

    const expected_pick_date = req.query.hasOwnProperty("expected_pick_date") ?
      req.query.expected_pick_date :
      "";

    const status = req.query.hasOwnProperty("status") ? req.query.status : "";

    BedController.getAllBeds(
      page,
      limit,
      order,
      ordermethod,
      bed_name,
      bed_number,
      block,
      sub_block_name,
      variety,
      plant_date,
      expected_pick_date,
      status,

      (err, bed) => {
        if (err) {
          //console.log(err);
          res.status(400).json(err);
        } else {
          res.status(200).json(bed);
        }
      }
    );
  }
);

//  @route  PATCH bed
//  @desc   Patch a bed
//  @access private
router.patch(
  "/:id",
  passport.authenticate("jwt", {
    session: false
  }),
  (req, res) => {
    const bedId = req.params.id;
    if (bedId > 0) {
      BedController.updateBed(bedId, req.body, req.user.id, (err, bed) => {
        if (err) {
          //console.log(err);
          res.status(400).json(err);
        } else {
          // console.log(personnel);
          res.status(200).json(bed);
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

//  @route  DELETE bed
//  @desc   Delete a bed
//  @access private
router.delete(
  "/:id",
  passport.authenticate("jwt", {
    session: false
  }),
  (req, res) => {
    const bedId = req.params.id;
    if (bedId > 0) {
      BedController.deleteBed(bedId, (err, bed) => {
        if (err) {
          //console.log(err);
          res.status(400).json(err);
        } else {
          res.status(200).json(bed);
        }
      });
    } else {
      res.status(400).json({
        error: "Invalid bed id"
      });
    }
  }
);
//  @route  GET bed
//  @desc   bed list all without pagination
//  @access private
router.get(
  "/all",
  passport.authenticate("jwt", {
    session: false
  }),
  (req, res) => {
    const order = req.query.hasOwnProperty("order") ?
      req.query.order :
      "bed_number";
    const ordermethod = req.query.hasOwnProperty("ordermethod") ?
      req.query.ordermethod :
      "ASC";
    BedController.fetchAllBeds(order, ordermethod, (err, beds) => {
      if (err) {
        //console.log(err);
        res.status(400).json(err);
      } else {
        res.status(200).json(beds);
      }
    });
  }
);

module.exports = router;
const sequelize = require("sequelize");
const Op = sequelize.Op;
const Plant = require("../../models").Plant;

const { isEmpty } = require("../validation");

module.exports = {

  
  fetchAllPlants(result) {
    Plant.findAll({
    attributes: [
      ["variety_id", "variety"],
       ["block_id", "block"],
      ["bed_id", "bed"],
       ["plant_expected_pick_date", "expected_pick_date"],
       ["plant_status", "status"],
       "plant_date","created_by","modified_by",
      "id"
    ],
      raw: true
    })
      .then(plant => {
        result(null, plant);
      })
      .catch(err => {
        result(err, null);
      });
  }
};

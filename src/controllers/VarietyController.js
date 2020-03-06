const sequelize = require("sequelize");
const Op = sequelize.Op;

const Variety = require("../../models").Variety;

const {
  createError,
  validateVarietyInput,
  isEmpty,
  validateId
} = require("../validation");

module.exports = {
  countVariety(where, result) {
    return Variety.count({
      where: where
    })
      .then(total => {
        result(null, total);
      })
      .catch(error => {
        result(error, null);
      });
  },
  getAllVariety(page, limit, name, result) {
    let where = {};

    if (!isEmpty(name)) {
      where["variety_name"] = {
        [Op.like]: "%" + name + "%"
      };
    }

    return Variety.findAll({
      attributes: ["id", ["variety_name", "name"]],
      offset: page * limit,
      limit: limit,
      raw: true,
      where: where
    })
      .then(variety => {
        this.countVariety(where, (err, total) => {
          if (err) {
            result(err, null);
          } else {
            result(null, {
              rows: total,
              items: variety
            });
          }
        });
      })
      .catch(err => {
        result(err, null);
      });
  },
  fetchAllVariety(result) {
    return Variety.findAll({
      attributes: ["id", ["variety_name", "name"]],
      raw: true
    })
      .then(variety => {
        return result(null, variety);
      })
      .catch(err => {
        const customError = createError(err);
        result(customError, null);
      });
  }
};

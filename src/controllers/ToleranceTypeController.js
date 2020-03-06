const sequelize = require("sequelize");
const Op = sequelize.Op;

const ToleranceType = require("../../models").ToleranceType;

const {
  createError,
  validateToleranceTypeInput,
  isEmpty,
  validateId
} = require("../validation");

module.exports = {
  countToleranceType(where, result) {
    return ToleranceType.count({
      where: where
    })
      .then(total => {
        result(null, total);
      })
      .catch(error => {
        result(error, null);
      });
  },
  getAllToleranceType(page, limit, name, result) {
    let where = {};

    if (!isEmpty(name)) {
      where["tolerance_type_name"] = {
        [Op.like]: "%" + name + "%"
      };
    }

    ToleranceType.findAll({
      attributes: ["id", ["tolerance_type_name", "name"]],
      offset: page * limit,
      limit: limit,
      raw: true,
      where: where
    })
      .then(toleranceType => {
        this.countToleranceType(where, (err, total) => {
          if (err) {
            result(err, null);
          } else {
            result(null, {
              rows: total,
              items: toleranceType
            });
          }
        });
      })
      .catch(err => {
        result(err, null);
      });
  },
  fetchAllToleranceTypes(result) {
    return ToleranceType.findAll({
      attributes: ["id", ["tolerance_type_name", "name"]],
      raw: true
    })
      .then(toleranceTypes => {
        return result(null, toleranceTypes);
      })
      .catch(err => {
        const customError = createError(err);
        result(customError, null);
      });
  }
};

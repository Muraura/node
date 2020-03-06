const sequelize = require("sequelize");
const Op = sequelize.Op;

const Tolerance = require("../../models").Tolerance;
const ToleranceType = require("../../models").ToleranceType;

const {
  createError,
  validateToleranceInput,
  isEmpty,
  validateId
} = require("../validation");

module.exports = {
  findTolerance(where, result) {
    Tolerance.findOne({
      raw: true,
      attributes: ["tolerance_from", "tolerance_to", "id"],
      where: where
    })
      .then(tolerance => {
        return result(null, tolerance);
      })
      .catch(err => {
        const customError = createError(err.message);
        result(customError, null);
      });
  },
  countTolerance(where, result) {
    Tolerance.count({
      where: where
    })
      .then(total => {
        result(null, total);
      })
      .catch(error => {
        result(error, null);
      });
  },
  saveTolerance(tolerance, personnelId, result) {
    const { errors, isValid } = validateToleranceInput(tolerance);
    if (!isValid) {
      const customError = createError(errors);
      result(customError, null);
    } else {
      this.findTolerance(
        {
          tolerance_name: tolerance.name,
          tolerance_from: tolerance.from,
          tolerance_to: tolerance.to,
          tolerance_type_id: tolerance.tolerance_type
        },
        (err, dbTolerance) => {
          if (err) {
            const customError = createError(err);
            result(customError, null);
          } else {
            if (dbTolerance) {
              const customError = createError({
                tolerance: "Tolerance already exist"
              });
              result(customError, null);
            } else {
              Tolerance.create({
                tolerance_name: tolerance.name,
                tolerance_from: tolerance.from,
                tolerance_to: tolerance.to,
                tolerance_type_id: tolerance.tolerance_type,
                created_by: personnelId
              })
                .then(() => {
                  result(null, {
                    message: "Success"
                  });
                })
                .catch(err => {
                  const customError = createError(err);
                  result(customError, null);
                });
            }
          }
        }
      );
    }
  },
  getAllTolerance(
    page,
    limit,
    order,
    ordermethod,
    name,
    tolerance_type,
    result
  ) {
    let where = {};
    let typewhere = {};

    if (!isEmpty(name)) {
      where["tolerance_name"] = {
        [Op.like]: "%" + name + "%"
      };
    }
    if (!isEmpty(tolerance_type)) {
      typewhere["tolerance_type_name"] = {
        [Op.like]: "%" + tolerance_type + "%"
      };
    }
    Tolerance.findAll({
      attributes: [
        "id",
        ["tolerance_name", "name"],
        ["tolerance_from", "from"],
        ["tolerance_to", "to"],
        ["tolerance_type_id", "tolerance_type"],
        [
          sequelize.col("tolerance_tolerance_type.tolerance_type_name"),
          "tolerance_type_name"
        ]
      ],
      offset: page * limit,
      limit: limit,
      raw: true,
      where: where,

      include: [
        {
          model: ToleranceType,
          as: "tolerance_tolerance_type",
          required: true,
          where: typewhere,
          attributes: []
        }
      ]
    })
      .then(tolerance => {
        this.countTolerance(where, (err, total) => {
          if (err) {
            result(err, null);
          } else {
            result(null, {
              rows: total,
              items: tolerance
            });
          }
        });
      })
      .catch(err => {
        result(err, null);
      });
  },
  updateTolerance(toleranceId, tolerance, personnelId, result) {
    const { errors, isValid } = validateToleranceInput(tolerance);
    if (!isValid) {
      const customError = createError(errors);
      result(customError, null);
    } else {
      this.findTolerance(
        {
          tolerance_name: tolerance.name,
          tolerance_from: tolerance.from,
          tolerance_to: tolerance.to,
          tolerance_type_id: tolerance.tolerance_type
        },
        (err, dbTolerance) => {
          if (err) {
            const customError = createError(err);
            result(customError, null);
          } else {
            if (dbTolerance) {
              const customError = createError({
                tolerance: "Tolerance already exist"
              });
              result(customError, null);
            } else {
              Tolerance.findOne({
                raw: true,
                attributes: ["tolerance_from", "tolerance_to", "id"],
                where: {
                  id: toleranceId
                }
              })
                .then(fetchedTolerance => {
                  //console.log(fetchedTolerance)
                  if (fetchedTolerance) {
                    Tolerance.update(
                      {
                        tolerance_name: tolerance.name,
                        tolerance_from: tolerance.from,
                        tolerance_to: tolerance.to,
                        tolerance_type_id: tolerance.tolerance_type,
                        modified_by: personnelId
                      },
                      {
                        where: {
                          id: toleranceId
                        }
                      }
                    )
                      .then(updatedTolerance => {
                        result(null, {
                          message: "Success"
                        });
                      })
                      .catch(err => {
                        result(err, null);
                      });
                  } else {
                    const customError = createError({
                      id: "Tolerance does not exist"
                    });
                    result(customError, null);
                  }
                })
                .catch(err => {
                  result(err, null);
                });
            }
          }
        }
      );
    }
  },
  deleteTolerance(toleranceId, result) {
    Tolerance.findOne({
      raw: true,
      attributes: ["tolerance_from", "tolerance_to", "id"],
      where: {
        id: toleranceId
      }
    })
      .then(tolerance => {
        if (tolerance) {
          Tolerance.destroy({
            where: {
              id: toleranceId
            }
          })
            .then(() => {
              // console.log(deletePlant)
              result(null, {
                message: "Success"
              });
            })
            .catch(err => {
              result(err, null);
            });
        } else {
          const customError = createError({
            id: "Tolerance does not exist"
          });
          result(customError, null);
        }
      })
      .catch(err => {
        const customError = createError(err);
        result(customError, null);
      });
  },
  exportTolerance(result) {
    Tolerance.findAll({
      attributes: [
        ["tolerance_name", "name"],
        ["tolerance_from", "from"],
        ["tolerance_to", "to"],
        ["tolerance_type_id", "tolerance_type"],
        [
          sequelize.col("tolerance_tolerance_type.tolerance_type_name"),
          "tolerance_type_name"
        ]
      ],
      raw: true,
      include: [
        {
          model: ToleranceType,
          as: "tolerance_tolerance_type",
          attributes: []
        }
      ]
    })
      .then(tolerance => {
        result(null, tolerance);
      })
      .catch(err => {
        result(err, null);
      });
  }
};

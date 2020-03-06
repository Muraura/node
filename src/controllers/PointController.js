const sequelize = require("sequelize");
const Op = sequelize.Op;
const Point = require("../../models").Point;

const { isEmpty } = require("../validation");

module.exports = {
  getAllPoints(page, limit, order, ordermethod, name, result) {
    let where = {};

    if (!isEmpty(name)) {
      where["id","point_name"] = {
        [Op.like]: "%" + name + "%"
      };
    }

    Point.findAll({
      attributes: ["point_name","id"],
      offset: page * limit,
      limit: limit,
      raw: true,
      where: where,
      order: [[order, ordermethod]]
    })
      .then(point => {
        this.countPoint(where, (err, total) => {
          if (err) {
            result(err, null);
          } else {
            result(null, {
              rows: total,
              items: point
            });
          }
        });
      })
      .catch(err => {
        result(err, null);
      });
  },
  countPoint(where, result) {
    Point.count({
      where: where
    })
      .then(total => {
        result(null, total);
      })
      .catch(error => {
        result(error, null);
      });
  },
  exportPoint(result) {
    Point.findAll({
      attributes: ["id","point_name"],
      raw: true
    })
      .then(point => {
        result(null, point);
      })
      .catch(err => {
        result(err, null);
      });
  }
};

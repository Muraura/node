const sequelize = require("sequelize");
const Op = sequelize.Op;
const Station = require("../../models").Station;

const { isEmpty } = require("../validation");

module.exports = {
  getAllStations(
    page,
    limit,
    order,
    ordermethod,
    name,

    result
  ) {
    let where = {};

    if (!isEmpty(name)) {
      where["station_name"] = {
        [Op.like]: "%" + name + "%"
      };
    }

    Station.findAll({
      attributes: ["station_name"],
      offset: page * limit,
      limit: limit,
      raw: true,
      where: where
      //order: [[order, ordermethod]]
    })
      .then(station => {
        this.countStation(where, (err, total) => {
          if (err) {
            result(err, null);
          } else {
            result(null, {
              rows: total,
              items: station
            });
          }
        });
      })
      .catch(err => {
        result(err, null);
      });
  },
  countStation(where, result) {
    Station.count({
      where: where
    })
      .then(total => {
        result(null, total);
      })
      .catch(error => {
        result(error, null);
      });
  },
  exportStation(result) {
    Station.findAll({
      attributes: ["id","station_name"],
      raw: true
    })
      .then(station => {
        result(null, station);
      })
      .catch(err => {
        result(err, null);
      });
  }
};

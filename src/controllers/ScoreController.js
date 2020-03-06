const sequelize = require("sequelize");
const Op = sequelize.Op;
const Score = require("../../models").Score;

module.exports = {
  exportScores(result) {
    Score.findAll({
      attributes: ["id", "score_name"],
      raw: true
    })
      .then(score => {
        result(null, score);
      })
      .catch(err => {
        result(err, null);
      });
  }
};

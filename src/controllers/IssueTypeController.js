const sequelize = require("sequelize");
const Op = sequelize.Op;

const IssueType = require("../../models").IssueType;

const {
  createError,
  validateIssueTypeInput,
  isEmpty,
  validateId
} = require("../validation");

module.exports = {
  countIssueType(where, result) {
    return IssueType.count({
      where: where
    })
      .then(total => {
        result(null, total);
      })
      .catch(error => {
        result(error, null);
      });
  },
  getAllIssueType(page, limit, name, result) {
    let where = {};

    if (!isEmpty(name)) {
      where["issue_type_name"] = {
        [Op.like]: "%" + name + "%"
      };
    }

    return IssueType.findAll({
      attributes: ["issue_type_name", "id"],
      offset: page * limit,
      limit: limit,
      raw: true,
      where: where
    })
      .then(issueType => {
        this.countIssueType(where, (err, total) => {
          if (err) {
            result(err, null);
          } else {
            result(null, {
              rows: total,
              items: issueType
            });
          }
        });
      })
      .catch(err => {
        result(err, null);
      });
  },
  fetchAllIssueTypes(result) {
    return IssueType.findAll({
      attributes: ["issue_type_name", "id"],
      raw: true
    })
      .then(issueTypes => {
        return result(null, issueTypes);
      })
      .catch(err => {
        const customError = createError(err);
        result(customError, null);
      });
  }
};

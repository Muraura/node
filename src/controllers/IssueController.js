const sequelize = require("sequelize");
const Op = sequelize.Op;

const Issue = require("../../models").Issue;
const Score = require("../../models").Score;
const IssueType = require("../../models").IssueType;
const ToleranceType = require("../../models").ToleranceType;

const {
  createError,
  validateIssueInput,
  isEmpty,
  validateId
} = require("../validation");

module.exports = {
  findIssue(where, result) {
    return Issue.findOne(where)
      .then(issue => {
        return result(null, issue);
      })
      .catch(error => {
        result(error, null);
      });
  },
  countIssue(where, result) {
    Issue.count({
      where: where
    })
      .then(total => {
        result(null, total);
      })
      .catch(error => {
        result(error, null);
      });
  },

  saveIssue(issue, personnelId, result) {
    const { errors, isValid } = validateIssueInput(issue);
    if (!isValid) {
      const customError = createError(errors);
      result(customError, null);
    } else {
      this.findIssue(
        {
          where: {
            issue_name: issue.issue_name
          }
        },
        (err, dbIssue) => {
          if (err) {
            const customError = createError(err);
            result(customError, null);
          } else {
            if (dbIssue) {
              const customError = createError({
                issue: "Issue already exist"
              });
              result(customError, null);
            } else {
              Issue.create({
                issue_name: issue.issue_name,
                issue_type_id: issue.issue_type_id,
                tolerance_type_id: issue.tolerance_type_id,
                score_id: issue.score_id,
                created_by: personnelId,
                modified_by: personnelId,
                created_at: new Date()
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
  getAllIssues(
    page,
    limit,
    issue_name,
    issue_type,
    tolerance_type,
    score,
    result
  ) {
    let where = {};

    if (!isEmpty(issue_type)) {
      where["issue_type_id"] = issue_type;
    }
    if (!isEmpty(issue_name)) {
      where["issue_name"] = {
        [Op.like]: "%" + issue_name + "%"
      };
    }
    if (!isEmpty(tolerance_type)) {
      where["tolerance_type_id"] = tolerance_type;
    }
    if (!isEmpty(score)) {
      where["score_id"] = score;
    }

    return Issue.findAll({
      attributes: [
        "issue_name",
        "issue_type_id",
        "tolerance_type_id",
        "score_id",
        "id",
        [sequelize.col("issue_types.issue_type_name"), "issue_type_name"],
        [
          sequelize.col("issue_tolerances.tolerance_type_name"),
          "tolerance_type_name"
        ],
        [sequelize.col("issue_scores.score_name"), "score_name"]
      ],
      offset: page * limit,
      limit: limit,
      raw: true,
      where: where,
      include: [
        {
          model: IssueType,
          as: "issue_types",
          attributes: []
        },
        {
          model: ToleranceType,
          as: "issue_tolerances",
          attributes: []
        },
        {
          model: Score,
          as: "issue_scores",
          attributes: []
        }
      ]
    })
      .then(issue => {
        this.countIssue(where, (err, total) => {
          if (err) {
            result(err, null);
          } else {
            result(null, {
              rows: total,
              items: issue
            });
          }
        });
      })
      .catch(err => {
        result(err, null);
      });
  },
  updateIssue(issueId, issue, personnelId, result) {
    const { errors, isValid } = validateIssueInput(issue);
    if (!isValid) {
      const customError = createError(errors);
      result(customError, null);
    } else {
      this.findIssue(
        {
          where: {
            issue_name: issue.issue_name,
            issue_type_id: issue.issue_type_id,
            tolerance_type_id: issue.tolerance_type_id,
            score_id: issue.score_id
          }
        },
        (err, dbIssue) => {
          if (err) {
            const customError = createError(err);
            result(customError, null);
          } else {
            if (dbIssue) {
              const customError = createError({
                issue: "Issue already exist"
              });
              result(customError, null);
            } else {
              const attributes = {
                issue_name: issue.issue_name,
                issue_type_id: issue.issue_type_id,
                tolerance_type_id: issue.tolerance_type_id,
                score_id: issue.score_id,
                modified_by: personnelId
              };
              Issue.findOne({
                where: {
                  id: issueId
                }
              })
                .then(issue => {
                  if (issue) {
                    //update
                    Issue.update(attributes, {
                      where: {
                        id: issueId
                      }
                    })
                      .then(updatedIssue => {
                        result(null, {
                          message: "Success"
                        });
                      })
                      .catch(err => {
                        result(err, null);
                      });
                  } else {
                    const customError = createError({
                      id: "Issue does not exist"
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
  deleteIssue(issueId, result) {
    Issue.findOne({
      raw: true,
      attributes: [
        "issue_name",
        "issue_type_id",
        "tolerance_type_id",
        "score_id",
        "id"
      ],
      where: {
        id: issueId
      }
    })
      .then(issue => {
        if (issue) {
          Issue.destroy({
            where: {
              id: issueId
            }
          })
            .then(() => {
              result(null, {
                message: "Success"
              });
            })
            .catch(err => {
              result(err, null);
            });
        } else {
          const customError = createError({
            id: "Issue does not exist"
          });
          result(customError, null);
        }
      })
      .catch(err => {
        const customError = createError(err);
        result(customError, null);
      });
  },
  fetchAllIssues(order,ordermethod,result) {
    return Issue.findAll({
      attributes: [
        "id",
        "issue_name",
        "issue_type_id",
        "tolerance_type_id",
        "score_id",
        [sequelize.col("issue_types.issue_type_name"), "issue_type_name"],
        [
          sequelize.col("issue_tolerances.tolerance_type_name"),
          "tolerance_type_name"
        ],
        [sequelize.col("issue_scores.score_name"), "score_name"]
      ],
      include: [
        {
          model: IssueType,
          as: "issue_types",
          attributes: []
        },
        {
          model: ToleranceType,
          as: "issue_tolerances",
          attributes: []
        },
        {
          model: Score,
          as: "issue_scores",
          attributes: []
        }
      ],
      order: [[order, ordermethod]]
    })
      .then(issue => {
        // console.log(issue)
        return result(null, issue);
      })
      .catch(err => {
        const customError = createError(err);
        result(customError, null);
      });
  }
};

const sequelize = require("sequelize");
const Op = sequelize.Op;

const IssueCategory = require("../../models").IssueCategory;
const Issue = require("../../models").Issue;

const {
  createError,
  validateIssueCategoryInput,
  isEmpty,
  validateId
} = require("../validation");

module.exports = {
  findIssueCategory(where, result) {
    return IssueCategory.findOne(where)
      .then(issueCategory => {
        return result(null, issueCategory);
      })
      .catch(error => {
        result(error, null);
      });
  },
  saveIssueCategory(issuecategory, personnelId, result) {
    const { errors, isValid } = validateIssueCategoryInput(issuecategory);
    if (!isValid) {
      const customError = createError(errors);
      result(customError, null);
    } else {
      this.findIssueCategory(
        {
          where: {
            issue_category_name: issuecategory.name,
            issue_id: issuecategory.issue
          }
        },
        (err, dbissuecategory) => {
          if (err) {
            const customError = createError(err);
            result(customError, null);
          } else {
            if (dbissuecategory) {
              const customError = createError({
                issueCategory: "Issue category already exist"
              });
              result(customError, null);
            } else {
              Issue.findOne({
                where: {
                  id: issuecategory.issue
                }
              }).then(dbIssue => {
                if (dbIssue) {
                  IssueCategory.create({
                    issue_category_name: issuecategory.name,
                    issue_id: issuecategory.issue,
                    created_by: personnelId,
                    modified_by: personnelId,
                    created_at: new Date(),
                    updated_at: new Date()
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
                } else {
                  const customError = createError({
                    issue: "Invalid issue provided"
                  });
                  result(customError, null);
                }
              });
            }
          }
        }
      );
    }
  },
  countIssueCategory(where, result) {
    IssueCategory.count({
      where: where
    })
      .then(total => {
        result(null, total);
      })
      .catch(error => {
        result(error, null);
      });
  },
  getAllIssueCategories(page, limit, order, ordermethod, name, issue, result) {
    let where = {};
    let issuewhere = {};
    if (!isEmpty(name)) {
      where["issue_category_name"] = {
        [Op.like]: "%" + name + "%"
      };
    }
    if (!isEmpty(issue)) {
      issuewhere["issue_name"] = {
        [Op.like]: "%" + issue + "%"
      };
    }

    IssueCategory.findAll({
      attributes: [
        "issue_id",
        "issue_category_name",
        [sequelize.col("issue_types_category.issue_name"), "issue_name"]
      ],
      offset: page * limit,
      limit: limit,
      raw: true,
      where: where,

      include: [
        {
          model: Issue,
          as: "issue_types_category",
          required: true,
          where: issuewhere,
          attributes: []
        }
      ]
    })
      .then(bed => {
        this.countIssueCategory(where, (err, total) => {
          if (err) {
            result(err, null);
          } else {
            result(null, {
              rows: total,
              items: bed
            });
          }
        });
      })
      .catch(err => {
        result(err, null);
      });
  },
  // getAllIssueCategories(page, limit, name, issue, result) {
  //   let where = {};

  //   if (!isEmpty(name)) {
  //     where["issue_category_name"] = {
  //       [Op.like]: "%" + name + "%"
  //     };
  //   }
  //   if (!isEmpty(issue)) {
  //     where["issue_types_category.issue_name$"] = issue;
  //   }
  //   // if (!isEmpty(issue)) {
  //   //   where["$issue_types_category.issue_name$"] = {
  //   //     [Op.like]: "%" + issue + "%"
  //   //   };
  //   // }
  //   console.log(where);
  //   IssueCategory.findAll({
  //     attributes: [
  //       //"issue_id",
  //       "issue_category_name",
  //       "id",
  //       [sequelize.col("issue_types_category.issue_name"), "issue_name"]
  //     ],
  //     offset: page * limit,
  //     limit: limit,
  //     raw: true,
  //     where: where,
  //     include: [
  //       {
  //         model: Issue,
  //         as: "issue_types_category",
  //         attributes: []
  //       }
  //     ]
  //   })
  //     .then(issueCategory => {
  //       this.countIssueCategory(where, (err, total) => {
  //         if (err) {
  //           result(err, null);
  //         } else {
  //           result(null, {
  //             rows: total,
  //             items: issueCategory
  //           });
  //         }
  //       });
  //     })
  //     .catch(err => {
  //       result(err, null);
  //     });
  // },
  updateIssueCategory(issueCategoryId, issuecategory, personnelId, result) {
    const { errors, isValid } = validateIssueCategoryInput(issuecategory);
    if (!isValid) {
      const customError = createError(errors);
      result(customError, null);
    } else {
      this.findIssueCategory(
        {
          where: {
            issue_category_name: issuecategory.name
          }
        },
        (err, dbissuecategory) => {
          if (err) {
            const customError = createError(err);
            result(customError, null);
          } else {
            if (dbissuecategory) {
              const customError = createError({
                name: "Issue category already exist"
              });
              result(customError, null);
            } else {
              const attributes = {
                issue_category_name: issuecategory.name,
                issue_id: issuecategory.issue,
                modified_by: personnelId
              };
              Issue.findOne({
                where: {
                  id: issuecategory.issue
                }
              })
                .then(issue => {
                  if (!issue) {
                    const customError = createError({
                      issue: "Invalid issue provided"
                    });
                    result(customError, null);
                  } else {
                    return IssueCategory.findOne({
                      where: {
                        id: issueCategoryId
                      }
                    })
                      .then(issueCategory => {
                        if (issueCategory) {
                          IssueCategory.update(attributes, {
                            where: {
                              id: issueCategoryId
                            }
                          })
                            .then(updatedPersonnel => {
                              result(null, {
                                message: "Success"
                              });
                            })
                            .catch(err => {
                              result(err, null);
                            });
                        } else {
                          const customError = createError({
                            id: "Issue category does not exist"
                          });
                          result(customError, null);
                        }
                      })
                      .catch(err => {
                        result(err, null);
                      });
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
  deleteIssueCategory(issueCategoryId, result) {
    IssueCategory.findByPk(issueCategoryId)
      .then(issuecategory => {
        if (issuecategory) {
          IssueCategory.destroy({
            where: {
              id: issueCategoryId
            }
          })
            .then(removedIssueCategory => {
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

  fetchAllIssueCategories(result) {
    return IssueCategory.findAll({
      attributes: [
        "issue_id",
        "issue_category_name",
        "id",
        [sequelize.col("issue_types_category.issue_name"), "issue_name"]
      ],
      raw: true,
      include: [
        {
          model: Issue,
          as: "issue_types_category",
          attributes: []
        }
      ]
    })
      .then(issueCategory => {
        return result(null, issueCategory);
      })
      .catch(err => {
        const customError = createError(err);
        result(customError, null);
      });
  }
};

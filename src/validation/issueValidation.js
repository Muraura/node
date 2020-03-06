const validator = require("validator");
const isEmpty = require("./is-empty");

module.exports = function validateIssueInput(data) {
  let errors = {};
  data.issue_name = !isEmpty(data.issue_name) ? data.issue_name : "";

  if (validator.isEmpty(data.issue_name)) {
    errors.issue_name = "Issue name is required";
  }

  if (data.issue_type_id > 0) {
  } else {
    errors.issue_type_id = "Issue type is required";
  }

  if (data.tolerance_type_id > 0) {
  } else {
    errors.tolerance_type_id = "Tolerance type is required";
  }

  if (data.score_id > 0) {
  } else {
    errors.score_id = "Score is required";
  }
  return {
    errors,
    isValid: isEmpty(errors)
  };
};

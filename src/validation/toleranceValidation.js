const validator = require("validator");
const isEmpty = require("./is-empty");
const validateId = require("./objectId");

module.exports = function validateToleranceInput(data) {
  let errors = {};
  data.name = !isEmpty(data.name) ? data.name : "";
  data.to = !isEmpty(data.to) ? data.to : "";
  data.from = !isEmpty(data.from) ? data.from : "";
  data.tolerance_type = !isEmpty(data.tolerance_type)
    ? data.tolerance_type
    : "";

  if (validator.isEmpty(data.name)) {
    errors.name = "Name is required";
  }
  if (data.from > 0) {
  } else {
    errors.from = "From is required";
  }
  if (data.to > 0) {
  } else {
    errors.to = "To is required";
  }
  if (data.tolerance_type > 0) {
  } else {
    errors.tolerance_type = "Tolerance type is required";
  }
  return {
    errors,
    isValid: isEmpty(errors)
  };
};

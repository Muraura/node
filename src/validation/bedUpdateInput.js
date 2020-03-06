const validator = require("validator");
const isEmpty = require("./is-empty");
const validateId = require("./objectId");

module.exports = function validateBedUpdateInput(data) {
  let errors = {};

  if (data.bed_number > 0) {
  } else {
    errors.bed_number = "Bed number is required";
  }
  if (validator.isEmpty(data.bed_name)) {
    errors.bed_name = "Bed name is required";
  }
  if (data.block_id > 0) {
  } else {
    errors.block_id = "Block id is required";
  }
  if (data.variety_id > 0) {
  } else {
    errors.variety_id = "Variety id is required";
  }

  return {
    errors,
    isValid: isEmpty(errors)
  };
};

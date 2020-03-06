const validator = require("validator");
const isEmpty = require("./is-empty");
const validateId = require("./objectId");

module.exports = function validateBedInput(data) {
  let errors = {};

  if (data.from > 0) {
  } else {
    errors.from = "From is required";
  }
  if (data.to > 0) {
  } else {
    errors.to = "To is required";
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

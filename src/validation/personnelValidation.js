const validator = require("validator");
const isEmpty = require("./is-empty");

module.exports = function validatePersonnelInput(data) {
    let errors = {};
    data.first_name = !isEmpty(data.first_name) ? data.first_name : "";
    data.last_name = !isEmpty(data.last_name) ? data.last_name : "";
    data.phone = !isEmpty(data.phone) ? data.phone : "";

    if (validator.isEmpty(data.first_name)) {
        errors.first_name = "First name is required";
    }
    if (validator.isEmpty(data.last_name)) {
        errors.last_name = "Last name is required";
    }
    if (validator.isEmpty(data.phone)) {
        errors.phone = "Phone is required";
    }
    if (data.status > 0) {} else {
        errors.status = "Status is required";
    }
    if (data.personnel_type_id > 0) {} else {
        errors.personnel_type_id = "Personnel type is required";
    }

    return {
        errors,
        isValid: isEmpty(errors)
    };
};
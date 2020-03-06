const validator = require('validator');
const isEmpty = require('./is-empty');

module.exports = function validateSubBlockInput(data) {
    let errors = {};
    data.parent = !isEmpty(data.parent) ? data.parent : '';
    data.name = !isEmpty(data.name) ? data.name : '';


    if (validator.isEmpty(data.parent)) {
        errors.parent = 'Parent is required';
    }
    if (validator.isEmpty(data.name)) {
        errors.name = 'Name is required';
    }

    return {
        errors,
        isValid: isEmpty(errors)
    }
}
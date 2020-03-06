const validator = require('validator');
const isEmpty = require('./is-empty');
const validateId = require('./objectId');

module.exports = function validateIssueCategoryInput(data) {
    let errors = {};
    data.name = !isEmpty(data.name) ? data.name : '';
    data.issue = !isEmpty(data.issue) ? data.issue : '';

    if (!validateId(data.issue)) {
        errors.issue = 'Issue is required';
    }
    if (validator.isEmpty(data.name)) {
        errors.name = 'Name is required';
    }

    return {
        errors,
        isValid: isEmpty(errors)
    }
}
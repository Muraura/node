const validator = require('validator');
const isEmpty = require('./is-empty');
const validateId = require('./objectId');

module.exports = function validateBedPrevalenceInput(data) {
    let errors = {};
    data.sdate = !isEmpty(data.sdate) ? data.sdate : '';
    data.edate = !isEmpty(data.edate) ? data.edate : '';

    if (validator.isEmpty(data.sdate)) {
        errors.sdate = 'Start date is required';
    }
    if (validator.isEmpty(data.edate)) {
        errors.edate = 'End date is required';
    }

    return {
        errors,
        isValid: isEmpty(errors)
    }
}
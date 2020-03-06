const validator = require('validator');
const isEmpty = require('./is-empty');
const validateId = require('./objectId');

module.exports = function validateBulkBedInput(data) {

    let errors = {};
    data.from = !isEmpty(data.from) ? data.from : '';
    data.to = !isEmpty(data.to) ? data.to : '';
    data.variety = !isEmpty(data.variety) ? data.variety : '';
    data.plant_date = !isEmpty(data.plant_date) ? data.plant_date : '';
    data.status = !isEmpty(data.status) ? data.status : '';
    data.block = !isEmpty(data.block) ? data.block : '';
    data.expected_pick_date = !isEmpty(data.expected_pick_date) ? data.expected_pick_date : '';

    if (!validateId(data.block)) {
        errors.block = 'Invalid block provided';
    }

    if (!validateId(data.variety)) {
        errors.variety = 'Invalid variety provided';
    }

    if (data.from > 0) {} else {
        errors.from = 'From is required';
    }

    if (data.to > 0) {} else {
        errors.from = 'To is required';
    }

    if (validator.isEmpty(data.variety)) {
        errors.variety = 'Variety is required';
    }

    if (validator.isEmpty(data.plant_date)) {
        errors.plant_date = 'Plant date is required';
    }

    if (!(data.status >= 0)) {
        errors.status = 'Status is required';
    }

    if (validator.isEmpty(data.block)) {
        errors.block = 'Block is required';
    }

    return {
        errors,
        isValid: isEmpty(errors)
    }
}
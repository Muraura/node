const validator = require('validator');
const isEmpty = require('./is-empty');
const validateId = require('./objectId');

module.exports = function validateScoutInput(data) {
    let errors = {};
    data.date = !isEmpty(data.date) ? data.date : '';
    data.entry = !isEmpty(data.entry) ? data.entry : 0;
    data.point = !isEmpty(data.point) ? data.point : 0;
    data.issue = !isEmpty(data.issue) ? data.issue : 0;
    data.longitude = !isEmpty(data.longitude) ? data.longitude : '';
    data.latitude = !isEmpty(data.latitude) ? data.latitude : '';
    data.issueCategory = !isEmpty(data.issueCategory) ? data.issueCategory : 0;
    data.value = !isEmpty(data.value) ? data.value : 0;

    if (!validateId(data.plant)) {
        errors.plant = 'Plant is required';
    }
    if (!validateId(data.entry)) {
        errors.entry = 'Station is required';
    }
    if (!validateId(data.point)) {
        errors.point = 'Point is required';
    }
    if (!validateId(data.issue)) {
        errors.issue = 'Issue is required';
    }
    if (!validateId(data.value)) {
        errors.value = 'Value is required';
    }

    if (validator.isEmpty(data.date)) {
        errors.date = 'Scout date is required';
    }
    if (validator.isEmpty(data.longitude)) {
        errors.longitude = 'Longitude is required';
    }
    if (validator.isEmpty(data.latitude)) {
        errors.latitude = 'Latitude is required';
    }

    return {
        errors,
        isValid: isEmpty(errors)
    }
}
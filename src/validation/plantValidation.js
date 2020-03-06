const validator = require('validator');
const isEmpty = require('./is-empty');
const validateId = require('./objectId');

module.exports = function validatePlantInput(data) {
    let errors = {};
    data.plant_date = !isEmpty(data.plant_date) ? data.plant_date : '';
    data.expected_pick_date = !isEmpty(data.expected_pick_date) ? data.expected_pick_date : '';
    data.status = !isEmpty(data.status) ? data.status : '';
    data.block = !isEmpty(data.block) ? data.block : '';
    data.bed = !isEmpty(data.bed) ? data.bed : '';
    data.flower = !isEmpty(data.flower) ? data.flower : '';

    if (!validateId(data.block)) {
        errors.block = 'Invalid block provided';
    }
    if (!validateId(data.bed)) {
        errors.bed = 'Invalid bed provided';
    }
    if (!validateId(data.flower)) {
        errors.flower = 'Invalid flower provided';
    }
    if (validator.isEmpty(data.plant_date)) {
        errors.plant_date = 'Plant date is required';
    }
    if (validator.isEmpty(data.expected_pick_date)) {
        errors.expected_pick_date = 'Expected pick date is required';
    }
    if (validator.isEmpty(data.status)) {
        errors.status = 'Status is required';
    }
    if (validator.isEmpty(data.block)) {
        errors.bed = 'Block is required';
    }
    if (validator.isEmpty(data.bed)) {
        errors.bed = 'Bed is required';
    }
    if (validator.isEmpty(data.flower)) {
        errors.flower = 'Flower is required';
    }

    return {
        errors,
        isValid: isEmpty(errors)
    }
}
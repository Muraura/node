module.exports = function validateId(id) {
    if (!isNaN(id) && (id > 0)) {
        return true;
    } else {
        return false;
    }
}
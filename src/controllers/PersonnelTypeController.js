const PersonnelType = require('../../models').PersonnelType;
const {
    createError
} = require('../validation');

module.exports = {
    getAllPersonnelType(result) {
        return PersonnelType
            .findAll({
                attributes: [
                    'personnel_type_name',
                    'id'
                ],
                raw: true
            })
            .then(personneltypes => {
                //console.log(personnels)
                result(null, personneltypes);
            })
            .catch(err => {
                const customError = createError(err);
                result(customError, null);
            });
    },
}
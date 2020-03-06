const {
    PersonnelTypeController,
    PersonnelController,
    ScoreController,
    PointController,
    EntryController
} = require('../controllers');

module.exports = {
    migrate(result) {
        let migrationResult = [];
        PersonnelTypeController.migratePersonnelType((err, personnelType) => {
            if (err) {
                migrationResult.push({
                    personneltype: "Fail"
                });
            } else {
                PersonnelController.migratePersonnel((err, personnel) => {
                    migrationResult.push({
                        personneltype: "Success"
                    });
                    if (err) {
                        migrationResult.push({
                            personnel: "Fail"
                        });
                    } else {
                        migrationResult.push({
                            personnel: "Success"
                        });
                        ScoreController.migrateScore((err, score) => {
                            if (err) {
                                migrationResult.push({
                                    score: "Fail"
                                });
                            } else {
                                migrationResult.push({
                                    score: "Success"
                                });
                            }


                        });
                    }
                });
            }
        });
    }
}
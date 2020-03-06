const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const sequelize = require("sequelize");
const moment = require("moment");
const Op = sequelize.Op;

const ACCEPT_FORMAT = 'YYYY-MM-DD hh:mm:ss';

const Scout = require("../../models").Scout;
const ToleranceType = require("../../models").ToleranceType;
const Tolerance = require("../../models").Tolerance;
const Score = require("../../models").Score;
const Block = require("../../models").Block;
const Bed = require("../../models").Bed;
const Station = require("../../models").Station;
const Point = require("../../models").Point;
const IssueType = require("../../models").IssueType;
const Issue = require("../../models").Issue;
const IssueCategory = require("../../models").IssueCategory;
const Personnel = require("../../models").Personnel;
const Variety = require("../../models").Variety;
const Plant = require("../../models").Plant;
const PersonnelType = require("../../models").PersonnelType;

const {
    createError,
    createMessage,
    validateScoutInput,
    validateBedPrevalenceInput,
    isEmpty,
    validateId,
    validateScoutTimeReport
} = require("../validation");

const calculateThreatLevel = require("../utils/threatLevel");
const calculateParentThreatLevel = require("../utils/parentThreatLevel");
const calculateVarietyThreatLevel = require("../utils/calculateVarietyThreatLevel");

let today = moment().startOf('day');
let tomorrow = moment().startOf('day').add(1, 'days');
let lastThreeDays = moment().startOf('day').subtract(2, 'days');

today = today.format("YYYY-MM-DD").toString();
tomorrow = tomorrow.format("YYYY-MM-DD").toString();
// lastThreeDays = moment("2020-02-12").format("YYYY-MM-DD").toString();
lastThreeDays = lastThreeDays.format("YYYY-MM-DD").toString();

module.exports = {
    findScout(where, result) {
        return Scout.findOne(where)
            .then(scout => {
                return result(null, scout);
            })
            .catch(error => {
                result(error, null);
            });
    },

    saveScout(scout, personnelId, result) {
        const {
            errors,
            isValid
        } = validateScoutInput(scout);
        if (!isValid) {
            const customError = createError(errors);
            result(customError, null);
        } else {
            let newEntry = {
                scout_date: scout.date,
                block_id: scout.block,
                bed_id: scout.bed,
                station_id: scout.entry,
                point_id: scout.point,
                plant_id: scout.plant,
                variety_id: scout.variety,
                issue_type_id: scout.issue_type,
                issue_id: scout.issue,
                scout_value: scout.value,
                scout_longitude: scout.longitude,
                scout_latitude: scout.latitude
            };
            if (scout.issue_category != '') {
                newEntry['issue_category_id'] = scout.issue_category;
            }
            this.findScout({
                    where: newEntry
                },
                (err, scoutDb) => {
                    if (err) {
                        const customError = createError(err.message);
                        result(customError, null);
                    } else {
                        if (scoutDb) {
                            const customError = createError({
                                scout: "Scout entry already exist"
                            });
                            result(customError, null);
                        } else {
                            // Get tolerance
                            this.getToleranceRating(scout.issue, scout.value, (err, tolerance) => {
                                if (err) {
                                    const customError = createError(err.message);
                                    result(customError, null);
                                } else {
                                    if (tolerance != null) {
                                        newEntry['tolerance_id'] = tolerance;
                                    }
                                    newEntry['created_by'] = personnelId;
                                    newEntry['modified_by'] = personnelId;
                                    newEntry['created_at'] = newEntry['updated_at'] = today;
                                    Scout.create(newEntry)
                                        .then(() => {
                                            result(null, {
                                                message: "Success"
                                            });
                                        })
                                        .catch(err => {
                                            const customError = createError(err.message);
                                            result(customError, null);
                                        });
                                }
                            });
                        }
                    }
                }
            );
        }
    },
    getToleranceRating(issue_id, value, result) {
        Issue
            .findOne({
                attributes: [
                    ['id', 'issue_id'], 'issue_name', 'tolerance_type_id', 'score_id',
                    [sequelize.col('issue_tolerances.tolerance_type_name'), 'tolerance_type_name'],
                    [sequelize.col('issue_scores.score_name'), 'score_name']
                ],
                raw: true,
                where: {
                    id: issue_id
                },
                include: [{
                    model: ToleranceType,
                    as: 'issue_tolerances',
                    attributes: [],
                }, {
                    model: Score,
                    as: 'issue_scores',
                    attributes: [],
                }]
            })
            .then(issue => {
                let issueTolerance = null;
                Tolerance
                    .findAll({
                        attributes: ['tolerance_to', 'tolerance_from', 'id'],
                        raw: true,
                        where: {
                            tolerance_type_id: issue.tolerance_type_id
                        }
                    })
                    .then(tolerance => {
                        const totalTolerances = tolerance.length;

                        for (let r = 0; r < totalTolerances; r++) {
                            let to = tolerance[r].tolerance_to;
                            let from = tolerance[r].tolerance_from;
                            let tolerance_id = tolerance[r].id;

                            if ((value >= from) && (value <= to)) {
                                issueTolerance = tolerance_id;
                            }
                        }

                        if (issueTolerance !== null) {
                            result(null, issueTolerance);
                        } else {
                            const customError = createError({
                                tolerance: "Value outside tolerance range"
                            });
                            result(customError, null);
                        }
                    })
                    .catch(err => {
                        const customError = createError(err.message);
                        result(customError, null);
                    })
            })
            .catch(err => {
                const customError = createError(err.message);
                result(customError, null);
            })
    },
    countScout(where, result) {
        Scout.count({
                where: where
            })
            .then(total => {
                result(null, total);
            })
            .catch(error => {
                result(error, null);
            });
    },
    getThreatLevel(tolerance_name, result) {
        let threat = null;
        switch (tolerance_name) {
            case "Score 1":
            case "Score 2":
                threat = "Success";
                break;
            case "Score 3":
            case "Score 4":
                threat = "Warning";
                break;
            case "Score 5":
                threat = "Danger";
                break;
            default:
                threat = "Success";
        }
        result(null, threat);
    },
    getAllScouts(page, limit, order, ordermethod, date, entry, point, issue, tolerance, issueCategory, plant, value, latitude, longitude, created_by, result) {
        let where = {};

        if (!isEmpty(date)) {
            where["scout_date"] = {
                [Op.gte]: moment.utc(date, ACCEPT_FORMAT),
                [Op.lt]: moment.utc(date, ACCEPT_FORMAT).add(1, 'days')
            };
        }
        if (!isEmpty(entry)) {
            where["station_id"] = entry;
        }
        if (!isEmpty(point)) {
            where["point_id"] = point;
        }
        if (!isEmpty(issue)) {
            where["issue_id"] = issue;
        }
        if (!isEmpty(tolerance)) {
            where["tolerance_id"] = tolerance;
        }
        if (!isEmpty(issueCategory)) {
            where["issue_category_id"] = issueCategory;
        }
        if (!isEmpty(plant)) {
            where["plant_id"] = plant;
        }
        if (!isEmpty(value)) {
            where["scout_value"] = value;
        }
        if (!isEmpty(tolerance)) {
            where["tolerance_id"] = tolerance;
        }
        if (!isEmpty(latitude)) {
            where["scout_latitude"] = latitude;
        }
        if (!isEmpty(longitude)) {
            where["scout_longitude"] = longitude;
        }
        if (!isEmpty(created_by)) {
            where["created_by"] = created_by;
        }

        return Scout
            .findAll({
                attributes: ['block_id', 'bed_id', 'station_id', 'point_id', 'plant_id', 'issue_type_id', 'issue_id', 'issue_category_id', 'tolerance_id', 'scout_value', 'scout_longitude', 'scout_latitude', 'scout_date', ['created_by', 'personnel_id'], 'created_at', 'variety_id',
                    [sequelize.col('scout_block.block_name'), 'block_name'],
                    [sequelize.col('scout_bed.bed_name'), 'bed_name'],
                    [sequelize.col('scout_station.station_name'), 'station_name'],
                    [sequelize.col('scout_point.point_name'), 'point_name'],
                    [sequelize.col('scout_issue_type.issue_type_name'), 'issue_type_name'],
                    [sequelize.col('scout_issue.issue_name'), 'issue_name'],
                    [sequelize.col('scout_issue_category.issue_category_name'), 'issue_category_name'],
                    [sequelize.col('scout_tolerance.tolerance_name'), 'tolerance_name'],
                    [sequelize.col('scout_personnel.personnel_first_name'), 'personnel_first_name'],
                    [sequelize.col('scout_personnel.personnel_last_name'), 'personnel_last_name'],
                    [sequelize.col('scout_variety.variety_name'), 'variety_name'],
                ],
                offset: page,
                limit: limit,
                raw: true,
                where: where,
                order: [
                    [order, ordermethod]
                ],
                include: [{
                    model: Block,
                    as: 'scout_block',
                    attributes: [],
                }, {
                    model: Bed,
                    as: 'scout_bed',
                    attributes: [],
                }, {
                    model: Station,
                    as: 'scout_station',
                    attributes: [],
                }, {
                    model: Point,
                    as: 'scout_point',
                    attributes: [],
                }, {
                    model: IssueType,
                    as: 'scout_issue_type',
                    attributes: [],
                }, {
                    model: Issue,
                    as: 'scout_issue',
                    attributes: [],
                }, {
                    model: IssueCategory,
                    as: 'scout_issue_category',
                    attributes: [],
                }, {
                    model: Tolerance,
                    as: 'scout_tolerance',
                    attributes: [],
                }, {
                    model: Personnel,
                    as: 'scout_personnel',
                    attributes: [],
                }, {
                    model: Variety,
                    as: 'scout_variety',
                    attributes: [],
                }]
            })
            .then(scout => {
                this.countScout(where, (err, total) => {
                    if (err) {
                        const customError = createError(err.message);
                        result(customError, null);
                    } else {
                        result(null, {
                            rows: total,
                            items: scout
                        });
                    }
                });
            })
            .catch(err => {
                const customError = createError(err.message);
                result(customError, null);
            });
    },
    getFarm(result) {
        return Block
            .findAll({
                raw: true,
                where: {
                    "block_parent": null
                },
                order: [
                    ['block_number', 'ASC'],
                ]
            })
            .then(parentBlocks => {
                IssueType
                    .findAll({
                        raw: true,
                    })
                    .then((allIssueTypes) => {
                        Scout
                            .findAll({
                                attributes: ['block_id', 'bed_id', 'station_id', 'point_id', 'plant_id', 'issue_type_id', 'issue_id', 'issue_category_id', 'tolerance_id', 'scout_value', 'scout_longitude', 'scout_latitude', 'scout_date', ['created_by', 'personnel_id'], 'created_at', 'variety_id',
                                    [sequelize.col('scout_block.block_name'), 'block_name'],
                                    [sequelize.col('scout_bed.bed_name'), 'bed_name'],
                                    [sequelize.col('scout_station.station_name'), 'station_name'],
                                    [sequelize.col('scout_point.point_name'), 'point_name'],
                                    [sequelize.col('scout_issue_type.issue_type_name'), 'issue_type_name'],
                                    [sequelize.col('scout_issue.issue_name'), 'issue_name'],
                                    [sequelize.col('scout_issue_category.issue_category_name'), 'issue_category_name'],
                                    [sequelize.col('scout_tolerance.tolerance_name'), 'tolerance_name'],
                                    [sequelize.col('scout_personnel.personnel_first_name'), 'personnel_first_name'],
                                    [sequelize.col('scout_personnel.personnel_last_name'), 'personnel_last_name'],
                                    [sequelize.col('scout_variety.variety_name'), 'variety_name'],
                                    [sequelize.col('scout_issue.issue_scores.score_name'), 'score_name'],
                                    [sequelize.col('scout_issue.issue_scores.id'), 'score_id'],
                                ],
                                raw: true,
                                where: {
                                    scout_date: {
                                        [Op.gte]: lastThreeDays
                                    }
                                },
                                include: [{
                                    model: Block,
                                    as: 'scout_block',
                                    attributes: [],
                                }, {
                                    model: Bed,
                                    as: 'scout_bed',
                                    attributes: [],
                                }, {
                                    model: Station,
                                    as: 'scout_station',
                                    attributes: [],
                                }, {
                                    model: Point,
                                    as: 'scout_point',
                                    attributes: [],
                                }, {
                                    model: IssueType,
                                    as: 'scout_issue_type',
                                    attributes: [],
                                }, {
                                    model: Issue,
                                    as: 'scout_issue',
                                    attributes: [],
                                    include: [{
                                        model: Score,
                                        as: 'issue_scores',
                                        attributes: [],
                                    }]
                                }, {
                                    model: IssueCategory,
                                    as: 'scout_issue_category',
                                    attributes: [],
                                }, {
                                    model: Tolerance,
                                    as: 'scout_tolerance',
                                    attributes: [],
                                }, {
                                    model: Personnel,
                                    as: 'scout_personnel',
                                    attributes: [],
                                }, {
                                    model: Variety,
                                    as: 'scout_variety',
                                    attributes: [],
                                }],
                                order: [
                                    ['scout_date', 'DESC']
                                ]
                            })
                            .then(scouts => {
                                let farmArray = [];
                                let issueTypeAlert;
                                let parentAlert;
                                for (let c = 0; c < parentBlocks.length; c++) {

                                    const block_id = parentBlocks[c].id;
                                    const block_name = parentBlocks[c].block_name;
                                    let parent_threat_level = "Default";
                                    parentAlert = {
                                        block_id,
                                        block_name,
                                        scout_alert: "default",
                                        block_issue_types: [],
                                    };
                                    let scoutEntries;
                                    let threat_level = "Default";
                                    let scoutBlockEntries = scouts
                                        .filter(scout => scout.block_id === block_id);

                                    if (scoutBlockEntries.length > 0) {
                                        parentAlert["scout_alert"] = "Success";

                                        // Get max and min scout time for the day
                                        let filteredScoutBlockArr = scoutBlockEntries
                                            .filter(scout => moment(scout.scout_date).format("YYYY-MM-DD").toString() === moment(scoutBlockEntries[0].scout_date).format("YYYY-MM-DD").toString())

                                        const ms = moment(filteredScoutBlockArr[0].scout_date, "DD/MM/YYYY HH:mm:ss").diff(moment(filteredScoutBlockArr[filteredScoutBlockArr.length - 1].scout_date, "DD/MM/YYYY HH:mm:ss"));

                                        const d = moment.duration(ms);
                                        const s = Math.floor(d.asHours()) + moment.utc(ms).format(":mm:ss");

                                        const lastScouted = {
                                            personnel: filteredScoutBlockArr[0].personnel_first_name + " " + filteredScoutBlockArr[0].personnel_last_name,
                                            date: moment(filteredScoutBlockArr[0].scout_date).format('DD/MM/YYYY'),
                                            time: s
                                        }

                                        parentAlert["last_scouted"] = lastScouted;

                                        for (let p = 0; p < allIssueTypes.length; p++) {

                                            const issueTypeId = allIssueTypes[p].id;
                                            const issueTypeName = allIssueTypes[p].issue_type_name;
                                            issueTypeAlert = {
                                                issue_type_name: issueTypeName,
                                                alert: "Default",
                                            };

                                            scoutEntries = scoutBlockEntries
                                                .filter(scout => scout.issue_type_id === issueTypeId);

                                            for (let j = 0; j < scoutEntries.length; j++) {
                                                const score_name = scoutEntries[j].score_name;
                                                const tolerance_name = scoutEntries[j].tolerance_name;
                                                const value = scoutEntries[j].scout_value;
                                                const issue_type = scoutEntries[j].issue_type_name;
                                                threat_level = calculateThreatLevel(threat_level, score_name, tolerance_name, value, issue_type);
                                                issueTypeAlert["alert"] = threat_level

                                            }
                                            parentAlert.block_issue_types.push(issueTypeAlert)
                                            // console.log(parentAlert.block_issue_types)
                                        }
                                    } else {
                                        const lastScouted = {
                                            personnel: "",
                                            date: "",
                                            time: "00:00:00"
                                        }

                                        parentAlert["last_scouted"] = lastScouted;

                                        parentAlert["scout_alert"] = "Danger";
                                        for (let n = 0; n < allIssueTypes.length; n++) {
                                            const issueTypeName = allIssueTypes[n].issue_type_name;
                                            issueTypeAlert = {
                                                issue_type_name: issueTypeName,
                                                alert: "",
                                            };
                                            issueTypeAlert["alert"] = "default"
                                            parentAlert.block_issue_types.push(issueTypeAlert)
                                        }
                                    }

                                    let parentThreatLevelArr = [];
                                    parentThreatLevelArr.push(parentAlert)
                                    let alertArray = [];
                                    for (let t = 0; t < parentThreatLevelArr.length; t++) {
                                        const scoutAlert = parentThreatLevelArr[t].scout_alert;
                                        alertArray.push(scoutAlert)
                                        let childArray = parentThreatLevelArr[t].block_issue_types;
                                        for (let k = 0; k < childArray.length; k++) {
                                            const scoutIssueAlert = childArray[k].alert;
                                            alertArray.push(scoutIssueAlert)

                                            for (let h = 0; h < alertArray.length; h++) {
                                                let alert = alertArray[h];
                                                parent_threat_level = calculateParentThreatLevel(parent_threat_level,
                                                    alert);
                                            }
                                        }
                                        parentAlert["alert"] = parent_threat_level;
                                    }
                                    farmArray.push(parentAlert);
                                }

                                result(null,
                                    farmArray
                                );
                            })
                            .catch(err => {
                                const customError = createError(err.message);
                                result(customError, null);
                            });
                    })
                    .catch(err => {
                        const customError = createError(err.message);
                        result(customError, null);
                    });
            })
            .catch(err => {
                const customError = createError(err.message);
                result(customError, null);
            });
    },
    getBlockReport(block, result) {
        // Need to validate block
        let where = {};
        where["id"] = block;
        Block
            .findOne({
                raw: true,
                attributes: ['id', 'block_name'],
                where: {
                    id: block
                }
            })
            .then((bedsBlock) => {
                Block
                    .findAll({
                        raw: true,
                        attributes: ['id', 'block_name', ],
                        where: {
                            block_parent: block
                        }
                    })
                    .then((blockFetched) => {
                        let childBlockIdArray = [];

                        for (let k = 0; k < blockFetched.length; k++) {
                            const childBlockId = blockFetched[k].id;
                            childBlockIdArray.push(childBlockId)
                        }

                        const block_name = bedsBlock.block_name;
                        Bed
                            .findAll({
                                raw: true,
                                attributes: ['id', 'bed_name', 'bed_number', 'block_id',
                                    [sequelize.col('bed_block.block_name'), 'block_name']
                                ],
                                where: {
                                    block_id: childBlockIdArray
                                },
                                include: [{
                                    model: Block,
                                    as: 'bed_block',
                                    attributes: []
                                }],
                                order: [
                                    ['bed_number', 'ASC']
                                ]
                            })
                            .then((dbBeds) => {

                                // const allBeds = dbBeds.sort(function (a, b) {
                                //     return a.bed_number - b.bed_number;
                                // });
                                const allBeds = dbBeds;

                                Scout
                                    .findAll({
                                        raw: true,
                                        attributes: ['block_id', 'bed_id', 'station_id', 'point_id', 'plant_id', 'issue_type_id', 'issue_id', 'issue_category_id', 'tolerance_id', 'scout_value', 'scout_longitude', 'scout_latitude', 'scout_date', ['created_by', 'personnel_id'], 'created_at', 'variety_id',
                                            [sequelize.col('scout_block.block_name'), 'block_name'],
                                            [sequelize.col('scout_bed.bed_name'), 'bed_name'],
                                            [sequelize.col('scout_station.station_name'), 'station_name'],
                                            [sequelize.col('scout_point.point_name'), 'point_name'],
                                            [sequelize.col('scout_issue_type.issue_type_name'), 'issue_type_name'],
                                            [sequelize.col('scout_issue.issue_name'), 'issue_name'],
                                            [sequelize.col('scout_issue_category.issue_category_name'), 'issue_category_name'],
                                            [sequelize.col('scout_tolerance.tolerance_name'), 'tolerance_name'],
                                            [sequelize.col('scout_personnel.personnel_first_name'), 'personnel_first_name'],
                                            [sequelize.col('scout_personnel.personnel_last_name'), 'personnel_last_name'],
                                            [sequelize.col('scout_variety.variety_name'), 'variety_name'],
                                            [sequelize.col('scout_issue.issue_scores.score_name'), 'score_name'],
                                            [sequelize.col('scout_issue.issue_scores.id'), 'score_id'],
                                        ],
                                        order: [
                                            ['scout_date', 'DESC']
                                        ],
                                        where: {
                                            block_id: block,
                                            scout_date: {
                                                [Op.gte]: lastThreeDays
                                            }
                                        },
                                        include: [{
                                            model: Block,
                                            as: 'scout_block',
                                            attributes: [],
                                        }, {
                                            model: Bed,
                                            as: 'scout_bed',
                                            attributes: [],
                                        }, {
                                            model: Station,
                                            as: 'scout_station',
                                            attributes: [],
                                        }, {
                                            model: Point,
                                            as: 'scout_point',
                                            attributes: [],
                                        }, {
                                            model: IssueType,
                                            as: 'scout_issue_type',
                                            attributes: [],
                                        }, {
                                            model: Issue,
                                            as: 'scout_issue',
                                            attributes: [],
                                            include: [{
                                                model: Score,
                                                as: 'issue_scores',
                                                attributes: [],
                                            }]
                                        }, {
                                            model: IssueCategory,
                                            as: 'scout_issue_category',
                                            attributes: [],
                                        }, {
                                            model: Tolerance,
                                            as: 'scout_tolerance',
                                            attributes: [],
                                        }, {
                                            model: Personnel,
                                            as: 'scout_personnel',
                                            attributes: [],
                                        }, {
                                            model: Variety,
                                            as: 'scout_variety',
                                            attributes: [],
                                        }]
                                    })
                                    .then(scouts => {
                                        let beds = [];

                                        for (let p = 0; p < allBeds.length; p++) {
                                            const bed_id = allBeds[p].id;
                                            const bed_name = allBeds[p].bed_name;
                                            const bed_number = allBeds[p].bed_number;

                                            let lastScouted = {
                                                personnel: "",
                                                date: "",
                                                time: "00:00:00"
                                            }

                                            let BedAlert = {
                                                bed_id,
                                                bed_number,
                                                bed_name
                                            };
                                            let threat_level = "Default";
                                            // const scoutBedsArr = scouts;
                                            const scoutBedsArr = scouts
                                                .filter(scout => scout.bed_id === bed_id);

                                            for (let j = 0; j < scoutBedsArr.length; j++) {
                                                const score_name = scoutBedsArr[j].score_name;
                                                const tolerance_name = scoutBedsArr[j].tolerance_name;
                                                const value = scoutBedsArr[j].scout_value;
                                                const issue_type = scoutBedsArr[j].issue_type_name;
                                                threat_level = calculateThreatLevel(threat_level, score_name, tolerance_name, value, issue_type);
                                            }

                                            if (scoutBedsArr.length > 0) {

                                                // Get max and min scout time for the day
                                                filteredScoutBedArr = scoutBedsArr.filter(scout => moment(scout.scout_date).format("YYYY-MM-DD").toString() === moment(scoutBedsArr[0].scout_date).format("YYYY-MM-DD").toString())

                                                const ms = moment(filteredScoutBedArr[0].scout_date, "DD/MM/YYYY HH:mm:ss").diff(moment(filteredScoutBedArr[filteredScoutBedArr.length - 1].scout_date, "DD/MM/YYYY HH:mm:ss"));
                                                const d = moment.duration(ms);
                                                const s = Math.floor(d.asHours()) + moment.utc(ms).format(":mm:ss");

                                                lastScouted["personnel"] = filteredScoutBedArr[0].personnel_first_name + " " + filteredScoutBedArr[0].personnel_last_name;
                                                lastScouted["date"] = moment(filteredScoutBedArr[0].scout_date).format('DD/MM/YYYY');
                                                lastScouted["time"] = s;
                                            }

                                            BedAlert["last_scouted"] = lastScouted;
                                            BedAlert["alert"] = threat_level;
                                            beds.push(BedAlert);
                                        }

                                        result(null, {
                                            block_name,
                                            beds
                                        });
                                    })
                                    .catch(err => {
                                        const customError = createError(err.message);
                                        result(customError, null);
                                    });
                            })
                    })
                    .catch(err => {
                        const customError = createError(err.message);
                        result(customError, null);
                    });
            })
            .catch(err => {
                const customError = createError(err.message);
                result(customError, null);
            });
    },
    // getBlockReport(block, result) {
    //     // Need to validate block
    //     let where = {};
    //     where["id"] = block;
    //     Block
    //         .findOne({
    //             raw: true,
    //             attributes: ['id', 'block_name'],
    //             where: {
    //                 id: block
    //             }
    //         })
    //         .then((bedsBlock) => {
    //             Block
    //                 .findAll({
    //                     raw: true,
    //                     attributes: ['id', 'block_name', ],
    //                     where: {
    //                         block_parent: block
    //                     }
    //                 })
    //                 .then((blockFetched) => {
    //                     let childBlockIdArray = [];

    //                     for (let k = 0; k < blockFetched.length; k++) {
    //                         const childBlockId = blockFetched[k].id;
    //                         childBlockIdArray.push(childBlockId)
    //                     }

    //                     const block_name = bedsBlock.block_name;
    //                     Bed
    //                         .findAll({
    //                             raw: true,
    //                             attributes: ['id', 'bed_name', 'bed_number', 'block_id',
    //                                 [sequelize.col('bed_block.block_name'), 'block_name']
    //                             ],
    //                             where: {
    //                                 block_id: childBlockIdArray
    //                             },
    //                             include: [{
    //                                 model: Block,
    //                                 as: 'bed_block',
    //                                 attributes: []
    //                             }],
    //                             order: [
    //                                 ['bed_number', 'ASC']
    //                             ]
    //                         })
    //                         .then((dbBeds) => {

    //                             // const allBeds = dbBeds.sort(function (a, b) {
    //                             //     return a.bed_number - b.bed_number;
    //                             // });
    //                             const allBeds = dbBeds;

    //                             Scout
    //                                 .findAll({
    //                                     raw: true,
    //                                     attributes: ['block_id', 'bed_id', 'station_id', 'point_id', 'plant_id', 'issue_type_id', 'issue_id', 'issue_category_id', 'tolerance_id', 'scout_value', 'scout_longitude', 'scout_latitude', 'scout_date', ['created_by', 'personnel_id'], 'created_at', 'variety_id',
    //                                         [sequelize.col('scout_block.block_name'), 'block_name'],
    //                                         [sequelize.col('scout_bed.bed_name'), 'bed_name'],
    //                                         [sequelize.col('scout_station.station_name'), 'station_name'],
    //                                         [sequelize.col('scout_point.point_name'), 'point_name'],
    //                                         [sequelize.col('scout_issue_type.issue_type_name'), 'issue_type_name'],
    //                                         [sequelize.col('scout_issue.issue_name'), 'issue_name'],
    //                                         [sequelize.col('scout_issue_category.issue_category_name'), 'issue_category_name'],
    //                                         [sequelize.col('scout_tolerance.tolerance_name'), 'tolerance_name'],
    //                                         [sequelize.col('scout_personnel.personnel_first_name'), 'personnel_first_name'],
    //                                         [sequelize.col('scout_personnel.personnel_last_name'), 'personnel_last_name'],
    //                                         [sequelize.col('scout_variety.variety_name'), 'variety_name'],
    //                                         [sequelize.col('scout_issue.issue_scores.score_name'), 'score_name'],
    //                                         [sequelize.col('scout_issue.issue_scores.id'), 'score_id'],
    //                                     ],
    //                                     order: [
    //                                         ['scout_date', 'DESC']
    //                                     ],
    //                                     where: {
    //                                         block_id: block,
    //                                         scout_date: {
    //                                             [Op.gte]: lastThreeDays
    //                                         }
    //                                     },
    //                                     include: [{
    //                                         model: Block,
    //                                         as: 'scout_block',
    //                                         attributes: [],
    //                                     }, {
    //                                         model: Bed,
    //                                         as: 'scout_bed',
    //                                         attributes: [],
    //                                     }, {
    //                                         model: Station,
    //                                         as: 'scout_station',
    //                                         attributes: [],
    //                                     }, {
    //                                         model: Point,
    //                                         as: 'scout_point',
    //                                         attributes: [],
    //                                     }, {
    //                                         model: IssueType,
    //                                         as: 'scout_issue_type',
    //                                         attributes: [],
    //                                     }, {
    //                                         model: Issue,
    //                                         as: 'scout_issue',
    //                                         attributes: [],
    //                                         include: [{
    //                                             model: Score,
    //                                             as: 'issue_scores',
    //                                             attributes: [],
    //                                         }]
    //                                     }, {
    //                                         model: IssueCategory,
    //                                         as: 'scout_issue_category',
    //                                         attributes: [],
    //                                     }, {
    //                                         model: Tolerance,
    //                                         as: 'scout_tolerance',
    //                                         attributes: [],
    //                                     }, {
    //                                         model: Personnel,
    //                                         as: 'scout_personnel',
    //                                         attributes: [],
    //                                     }, {
    //                                         model: Variety,
    //                                         as: 'scout_variety',
    //                                         attributes: [],
    //                                     }]
    //                                 })
    //                                 .then(scouts => {
    //                                     let beds = [];

    //                                     for (let p = 0; p < allBeds.length; p++) {
    //                                         const bed_id = allBeds[p].id;
    //                                         const bed_name = allBeds[p].bed_name;
    //                                         const bed_number = allBeds[p].bed_number;

    //                                         let lastScouted = {
    //                                             personnel: "",
    //                                             date: "",
    //                                             time: "00:00:00"
    //                                         }

    //                                         let BedAlert = {
    //                                             bed_id,
    //                                             bed_number,
    //                                             bed_name
    //                                         };
    //                                         let threat_level = "Default";
    //                                         // const scoutBedsArr = scouts;
    //                                         const scoutBedsArr = scouts
    //                                             .filter(scout => scout.bed_id === bed_id);

    //                                         for (let j = 0; j < scoutBedsArr.length; j++) {
    //                                             const score_name = scoutBedsArr[j].score_name;
    //                                             const tolerance_name = scoutBedsArr[j].tolerance_name;
    //                                             const value = scoutBedsArr[j].scout_value;
    //                                             const issue_type = scoutBedsArr[j].issue_type_name;
    //                                             threat_level = calculateThreatLevel(threat_level, score_name, tolerance_name, value, issue_type);
    //                                         }

    //                                         if (scoutBedsArr.length > 0) {

    //                                             // Get max and min scout time for the day
    //                                             filteredScoutBedArr = scoutBedsArr.filter(scout => moment(scout.scout_date).format("YYYY-MM-DD").toString() === moment(scoutBedsArr[0].scout_date).format("YYYY-MM-DD").toString())

    //                                             const ms = moment(filteredScoutBedArr[0].scout_date, "DD/MM/YYYY HH:mm:ss").diff(moment(filteredScoutBedArr[filteredScoutBedArr.length - 1].scout_date, "DD/MM/YYYY HH:mm:ss"));
    //                                             const d = moment.duration(ms);
    //                                             const s = Math.floor(d.asHours()) + moment.utc(ms).format(":mm:ss");

    //                                             lastScouted["personnel"] = filteredScoutBedArr[0].personnel_first_name + " " + filteredScoutBedArr[0].personnel_last_name;
    //                                             lastScouted["date"] = moment(filteredScoutBedArr[0].scout_date).format('DD/MM/YYYY');
    //                                             lastScouted["time"] = s;
    //                                         }

    //                                         BedAlert["last_scouted"] = lastScouted;
    //                                         BedAlert["alert"] = threat_level;
    //                                         beds.push(BedAlert);
    //                                     }

    //                                     result(null, {
    //                                         block_name,
    //                                         beds
    //                                     });
    //                                 })
    //                                 .catch(err => {
    //                                     const customError = createError(err.message);
    //                                     result(customError, null);
    //                                 });
    //                         })
    //                 })
    //                 .catch(err => {
    //                     const customError = createError(err.message);
    //                     result(customError, null);
    //                 });
    //         })
    //         .catch(err => {
    //             const customError = createError(err.message);
    //             result(customError, null);
    //         });
    // },
    getBlockScoutingDate(block, result) {
        Block
            .findOne({
                raw: true,
                where: {
                    id: block
                }
            })
            .then((parentBlock) => {
                Block
                    .findAll({
                        where: {
                            block_parent: block
                        }
                    })
                    .then((subblock) => {

                        let childBlockIdArray = [];

                        for (let k = 0; k < subblock.length; k++) {
                            const childBlockId = subblock[k].id;
                            childBlockIdArray.push(childBlockId)
                        }
                        return Bed
                            .findAll({
                                raw: true,
                                attributes: ['id', 'bed_name', 'bed_number', 'block_id',
                                    [sequelize.col('bed_block.block_name'), 'block_name']
                                ],
                                where: {
                                    block_id: childBlockIdArray
                                },
                                include: [{
                                    model: Block,
                                    as: 'bed_block',
                                    attributes: []
                                }]
                            })
                            .then(beds => {

                                let allBedIdsArray = [];

                                for (let k = 0; k < beds.length; k++) {
                                    allBedIdsArray.push(beds[k].id)
                                }

                                Scout
                                    .findAll({
                                        raw: true,
                                        attributes: ['block_id', 'bed_id', 'station_id', 'point_id', 'plant_id', 'issue_type_id', 'issue_id', 'issue_category_id', 'tolerance_id', 'scout_value', 'scout_longitude', 'scout_latitude', 'scout_date', ['created_by', 'personnel_id'], 'created_at', 'variety_id',
                                            [sequelize.col('scout_block.block_name'), 'block_name'],
                                            [sequelize.col('scout_bed.bed_name'), 'bed_name'],
                                            [sequelize.col('scout_station.station_name'), 'station_name'],
                                            [sequelize.col('scout_point.point_name'), 'point_name'],
                                            [sequelize.col('scout_issue_type.issue_type_name'), 'issue_type_name'],
                                            [sequelize.col('scout_issue.issue_name'), 'issue_name'],
                                            [sequelize.col('scout_issue_category.issue_category_name'), 'issue_category_name'],
                                            [sequelize.col('scout_tolerance.tolerance_name'), 'tolerance_name'],
                                            [sequelize.col('scout_personnel.personnel_first_name'), 'personnel_first_name'],
                                            [sequelize.col('scout_personnel.personnel_last_name'), 'personnel_last_name'],
                                            [sequelize.col('scout_variety.variety_name'), 'variety_name'],
                                            [sequelize.col('scout_issue.issue_scores.score_name'), 'score_name'],
                                            [sequelize.col('scout_issue.issue_scores.id'), 'score_id'],
                                        ],
                                        include: [{
                                            model: Block,
                                            as: 'scout_block',
                                            attributes: [],
                                        }, {
                                            model: Bed,
                                            as: 'scout_bed',
                                            attributes: [],
                                        }, {
                                            model: Station,
                                            as: 'scout_station',
                                            attributes: [],
                                        }, {
                                            model: Point,
                                            as: 'scout_point',
                                            attributes: [],
                                        }, {
                                            model: IssueType,
                                            as: 'scout_issue_type',
                                            attributes: [],
                                        }, {
                                            model: Issue,
                                            as: 'scout_issue',
                                            attributes: [],
                                            include: [{
                                                model: Score,
                                                as: 'issue_scores',
                                                attributes: [],
                                            }]
                                        }, {
                                            model: IssueCategory,
                                            as: 'scout_issue_category',
                                            attributes: [],
                                        }, {
                                            model: Tolerance,
                                            as: 'scout_tolerance',
                                            attributes: [],
                                        }, {
                                            model: Personnel,
                                            as: 'scout_personnel',
                                            attributes: [],
                                        }, {
                                            model: Variety,
                                            as: 'scout_variety',
                                            attributes: [],
                                        }],
                                        where: {
                                            bed_id: allBedIdsArray
                                        },
                                    })
                                    .then(scout => {
                                        let uniqueDates = [];

                                        for (let j = 0; j < scout.length; j++) {
                                            const scoutingDate = scout[j].scout_date;
                                            let date = new Date(scoutingDate);
                                            // date = date.toISOString().slice(0, 10);
                                            let unidates = [today, new Date(date)]
                                            uniqueDates = unidates
                                                .map(s => s.toString())
                                                .filter((s, i, a) => a.indexOf(s) == i)
                                                .map(s => new Date(s));
                                        }
                                        result(null, {
                                            block: parentBlock,
                                            dates: uniqueDates
                                        });
                                    })
                                    .catch(err => {
                                        const customError = createError(err.message);
                                        result(customError, null);
                                    });
                            })
                    })
                    .catch(err => {
                        const customError = createError(err.message);
                        result(customError, null);
                    });
            })
            .catch(err => {
                const customError = createError(err.message);
                result(customError, null);
            });

    },
    getBlockPrintReport(block, variety, created_by, created, issue, result) {
        let where = {};
        let plantWhere = {};

        let startDate = moment(created);

        where["block_id"] = block;

        if (!isEmpty(created_by)) {
            where["created_by"] = created_by;
        }
        if (!isEmpty(issue)) {
            where["issue_id"] = issue;
        }
        if (!isEmpty(created)) {
            where["scout_date"] = {
                // [Op.gte]: moment.utc(created, ACCEPT_FORMAT),
                [Op.gte]: moment.utc(created, ACCEPT_FORMAT),
                [Op.lt]: moment.utc(created, ACCEPT_FORMAT).add(1, 'days')
            };
        } else {
            where["scout_date"] = {
                [Op.gte]: moment.utc(lastThreeDays, ACCEPT_FORMAT),
                // [Op.lt]: tomorrow
            };
        }
        if (!isEmpty(variety)) {
            plantWhere['variety_id'] = variety;
        }
        Block
            .findOne({
                raw: true,
                where: {
                    id: block
                }
            })
            .then((parentblock) => {
                // 
                Block
                    .findAll({
                        raw: true,
                        where: {
                            block_parent: block
                        }
                    })
                    .then((subblocks) => {
                        //console.log(subblocks)
                        const bedBlock = subblocks.map((obj) => {
                            return obj.id;
                        });
                        //console.log(bedBlock)
                        Bed
                            .findAll({
                                raw: true,
                                where: {
                                    block_id: bedBlock
                                }
                            })
                            .then((dbBeds) => {
                                // console.log(dbBeds)
                                const allBlockBeds = dbBeds.map((obj) => {
                                    return obj.id;
                                });
                                // console.log(allBlockBeds)
                                plantWhere['bed_id'] = allBlockBeds;
                                //console.log(plantWhere)
                                Plant
                                    .findAll({
                                        raw: true,
                                        attributes: ['id', 'bed_id', 'variety_id',
                                            [sequelize.col('plant_bed.bed_name'), 'bed_name'],
                                            [sequelize.col('plant_bed.bed_number'), 'bed_number'],
                                            [sequelize.col('plant_variety.variety_name'), 'variety_name'],
                                            [sequelize.col("plant_bed.bed_block.block_name"), "block_name"],
                                            [sequelize.col("plant_bed.bed_block.id"), "block_id"]
                                        ],
                                        where: plantWhere,
                                        include: [{
                                            model: Variety,
                                            as: 'plant_variety',
                                            attributes: []
                                        }, {
                                            model: Bed,
                                            as: 'plant_bed',
                                            attributes: [],
                                            include: [{
                                                model: Block,
                                                as: "bed_block",
                                                attributes: []
                                            }]
                                        }],
                                        order: [
                                            [sequelize.col('plant_bed.bed_name'), 'ASC'],
                                        ]
                                    })
                                    .then((allPlants) => {

                                        const plants = allPlants.sort(function (a, b) {
                                            return a.bed_number - b.bed_number;
                                        });

                                        let plantBeds = allPlants.map((plant) => {
                                            return plant.bed_id;
                                        });
                                        where['bed_id'] = plantBeds;
                                        //console.log(plantBeds)
                                        Station
                                            .findAll()
                                            .then(entries => {
                                                //console.log(where)
                                                Scout
                                                    .findAll({
                                                        raw: true,
                                                        attributes: ["id", 'block_id', 'bed_id', 'station_id', 'point_id', 'plant_id', 'issue_type_id', 'issue_id', 'issue_category_id', 'tolerance_id', 'scout_value', 'scout_longitude', 'scout_latitude', 'scout_date', ['created_by', 'personnel_id'], 'created_at', 'variety_id',
                                                            [sequelize.col('scout_block.block_name'), 'block_name'],
                                                            [sequelize.col('scout_block.id'), 'block_id'],
                                                            // [sequelize.col("scout_block.children.block_name"), "parent_name"],
                                                            // [sequelize.col("scout_block.children.id"), "parent_id"]
                                                            [sequelize.col('scout_bed.bed_name'), 'bed_name'],
                                                            [sequelize.col('scout_station.station_name'), 'station_name'],
                                                            [sequelize.col('scout_point.point_name'), 'point_name'],
                                                            [sequelize.col('scout_issue_type.issue_type_name'), 'issue_type_name'],
                                                            [sequelize.col('scout_issue.issue_name'), 'issue_name'],
                                                            [sequelize.col('scout_issue_category.issue_category_name'), 'issue_category_name'],
                                                            [sequelize.col('scout_tolerance.tolerance_name'), 'tolerance_name'],
                                                            [sequelize.col('scout_personnel.personnel_first_name'), 'personnel_first_name'],
                                                            [sequelize.col('scout_personnel.personnel_last_name'), 'personnel_last_name'],
                                                            [sequelize.col('scout_variety.variety_name'), 'variety_name'],
                                                            [sequelize.col('scout_issue.issue_scores.score_name'), 'score_name'],
                                                            [sequelize.col('scout_issue.issue_scores.id'), 'score_id'],
                                                        ],
                                                        include: [{
                                                            model: Block,
                                                            as: 'scout_block',
                                                            attributes: [],
                                                        }, {
                                                            model: Bed,
                                                            as: 'scout_bed',
                                                            attributes: [],
                                                        }, {
                                                            model: Station,
                                                            as: 'scout_station',
                                                            attributes: [],
                                                        }, {
                                                            model: Point,
                                                            as: 'scout_point',
                                                            attributes: [],
                                                        }, {
                                                            model: IssueType,
                                                            as: 'scout_issue_type',
                                                            attributes: [],
                                                        }, {
                                                            model: Issue,
                                                            as: 'scout_issue',
                                                            attributes: [],
                                                            include: [{
                                                                model: Score,
                                                                as: 'issue_scores',
                                                                attributes: [],
                                                            }]
                                                        }, {
                                                            model: IssueCategory,
                                                            as: 'scout_issue_category',
                                                            attributes: [],
                                                        }, {
                                                            model: Tolerance,
                                                            as: 'scout_tolerance',
                                                            attributes: [],
                                                        }, {
                                                            model: Personnel,
                                                            as: 'scout_personnel',
                                                            attributes: [],
                                                        }, {
                                                            model: Variety,
                                                            as: 'scout_variety',
                                                            attributes: [],
                                                        }],
                                                        where: where,
                                                    })
                                                    .then(scouts => {

                                                        let bedArray = [];
                                                        for (let b = 0; b < plants.length; b++) {
                                                            // const bed = plants[b].bed_id;
                                                            // const variety = plants[b].variety_0d;
                                                            let scoutingPersonnel;
                                                            let scoutingDate;

                                                            const bed_id = plants[b].bed_id;
                                                            const bedName = plants[b].bed_name;
                                                            const bedNumber = plants[b].bed_number;
                                                            const variety_id = plants[b].variety_id;
                                                            const varietyName = plants[b].variety_name;
                                                            const bedBlockName = plants[b].block_name;

                                                            let currentBed = {
                                                                bed_name: bedName,
                                                                bed_id: bed_id,
                                                                bed_number: bedNumber,
                                                                bed_block_name: bedBlockName,
                                                                variety: varietyName,
                                                                personnel: "",
                                                                date: "",
                                                                stations: []
                                                            };

                                                            for (let t = 0; t < entries.length; t++) {
                                                                let threat_level = "Default";

                                                                const entry_id = entries[t].id;
                                                                const entry_name = entries[t].station_name;
                                                                let currentEntry = {
                                                                    entry_name: entry_name,
                                                                    entry_id: entry_id,
                                                                    alert: ""
                                                                };

                                                                const scoutEntries = scouts
                                                                    .filter(scout => scout.bed_id === bed_id && scout.station_id === entry_id);

                                                                if (scoutEntries.length > 0) {
                                                                    for (let j = 0; j < scoutEntries.length; j++) {
                                                                        const currentScout = scoutEntries[j];
                                                                        scoutingPersonnel = currentScout.created_by;
                                                                        scoutingDate = currentScout.scout_date;
                                                                        const value = currentScout.scout_value;
                                                                        const tolerance_name = currentScout.tolerance_name;
                                                                        const score_name = currentScout.score_name;
                                                                        const issue_type = currentScout.issue_type_name;

                                                                        threat_level = calculateThreatLevel(threat_level, score_name, tolerance_name, value, issue_type);
                                                                    }
                                                                }

                                                                currentEntry["alert"] = threat_level;
                                                                currentBed["stations"].push(currentEntry);
                                                                //  break;
                                                            }
                                                            currentBed["created_by"] = scoutingPersonnel;
                                                            currentBed["scoutDate"] = scoutingDate;

                                                            bedArray.push(currentBed);
                                                            //break;
                                                        }
                                                        result(null, bedArray);
                                                    })
                                                    .catch(err => {
                                                        const customError = createError(err.message);
                                                        result(customError, null);
                                                    });
                                            })
                                    })
                                    .catch(err => {
                                        const customError = createError(err.message);
                                        result(customError, null);
                                    });
                            })
                            .catch(err => {
                                const customError = createError(err.message);
                                result(customError, null);
                            });

                    })
                    .catch(err => {
                        const customError = createError(err.message);
                        result(customError, null);
                    });

            })
            .catch(err => {
                const customError = createError(err.message);
                result(customError, null);
            });
    },
    getBeds(bed, created, result) {
        let where = {
            bed_id: bed
        };
        const searchDate = lastThreeDays;
        // let startDate = moment(created);
        // let searchDate;

        // if (!isEmpty(created)) {
        //     where["scout_date"] = {
        //         [Op.gte]: moment.utc(created, ACCEPT_FORMAT),
        //         [Op.lt]: moment.utc(created, ACCEPT_FORMAT).add(1, 'days')
        //     };
        //     searchDate = created;
        // } else {
        //     where["scout_date"] = {
        //         [Op.gte]: lastThreeDays
        //     };
        //     searchDate = lastThreeDays;
        // }
        where["scout_date"] = {
            [Op.gte]: lastThreeDays
        };

        Bed
            .findOne({
                raw: true,
                where: {
                    id: bed
                }
            })
            .then((bedFetched) => {
                const fetchedBedId = bedFetched.id;
                const bed_number = bedFetched.bed_number;
                const bed_name = bedFetched.bed_name;
                Station
                    .findAll()
                    .then((allEntries) => {
                        Scout
                            .findAll({
                                raw: true,
                                attributes: ['block_id', 'bed_id', 'station_id', 'point_id', 'plant_id', 'issue_type_id', 'issue_id', 'issue_category_id', 'tolerance_id', 'scout_value', 'scout_longitude', 'scout_latitude', 'scout_date', ['created_by', 'personnel_id'], 'created_at', 'variety_id',
                                    [sequelize.col('scout_block.block_name'), 'block_name'],
                                    [sequelize.col('scout_bed.bed_name'), 'bed_name'],
                                    [sequelize.col('scout_station.station_name'), 'station_name'],
                                    [sequelize.col('scout_point.point_name'), 'point_name'],
                                    [sequelize.col('scout_issue_type.issue_type_name'), 'issue_type_name'],
                                    [sequelize.col('scout_issue.issue_name'), 'issue_name'],
                                    [sequelize.col('scout_issue_category.issue_category_name'), 'issue_category_name'],
                                    [sequelize.col('scout_tolerance.tolerance_name'), 'tolerance_name'],
                                    [sequelize.col('scout_personnel.personnel_first_name'), 'personnel_first_name'],
                                    [sequelize.col('scout_personnel.personnel_last_name'), 'personnel_last_name'],
                                    [sequelize.col('scout_variety.variety_name'), 'variety_name'],
                                    [sequelize.col('scout_issue.issue_scores.score_name'), 'score_name'],
                                    [sequelize.col('scout_issue.issue_scores.id'), 'score_id'],
                                ],
                                include: [{
                                    model: Block,
                                    as: 'scout_block',
                                    attributes: [],
                                }, {
                                    model: Bed,
                                    as: 'scout_bed',
                                    attributes: [],
                                }, {
                                    model: Station,
                                    as: 'scout_station',
                                    attributes: [],
                                }, {
                                    model: Point,
                                    as: 'scout_point',
                                    attributes: [],
                                }, {
                                    model: IssueType,
                                    as: 'scout_issue_type',
                                    attributes: [],
                                }, {
                                    model: Issue,
                                    as: 'scout_issue',
                                    attributes: [],
                                    include: [{
                                        model: Score,
                                        as: 'issue_scores',
                                        attributes: [],
                                    }]
                                }, {
                                    model: IssueCategory,
                                    as: 'scout_issue_category',
                                    attributes: [],
                                }, {
                                    model: Tolerance,
                                    as: 'scout_tolerance',
                                    attributes: [],
                                }, {
                                    model: Personnel,
                                    as: 'scout_personnel',
                                    attributes: [],
                                }, {
                                    model: Variety,
                                    as: 'scout_variety',
                                    attributes: [],
                                }],
                                where: where,
                            })
                            .then(scouts => {

                                let bedArray = [];
                                for (let c = 0; c < allEntries.length; c++) {
                                    const entry_id = allEntries[c].id;
                                    const entry_name = allEntries[c].station_name;
                                    let EntryAlert = {
                                        entry_id: entry_id,
                                        entry_name: entry_name,
                                        date: "",
                                        alert: ""
                                    };
                                    let threat_level = "Default";

                                    let scoutedEntries = scouts
                                        .filter(scout => scout.station_id === entry_id);

                                    for (let j = 0; j < scoutedEntries.length; j++) {
                                        const score_name = scoutedEntries[j].score_name;
                                        const tolerance_name = scoutedEntries[j].tolerance_name;
                                        const value = scoutedEntries[j].scout_value;
                                        const issue_type = scoutedEntries[j].issue_type_name;
                                        threat_level = calculateThreatLevel(threat_level, score_name, tolerance_name, value, issue_type);
                                    }
                                    EntryAlert["date"] = searchDate;
                                    EntryAlert["alert"] = threat_level;
                                    bedArray.push(EntryAlert);
                                }

                                result(null, {
                                    fetchedBedId,
                                    bed_name,
                                    bed_number,
                                    bedArray
                                });
                            })
                            .catch(err => {
                                const customError = createError(err.message);
                                result(customError, null);
                            });
                    })
            })
            .catch(err => {
                const customError = createError(err.message);
                result(customError, null);
            });
    },
    getEntries(entry, bed, date, result) {

        let where = {
            bed_id: bed
        };
        let startDate = moment(date);
        const today = moment().startOf('day');

        if (!isEmpty(entry)) {
            where["station_id"] = entry;
        }
        if (!isEmpty(date)) {
            // where["scout_date"] = {
            //     [Op.gte]: moment.utc(date, ACCEPT_FORMAT),
            //     [Op.lt]: moment.utc(date, ACCEPT_FORMAT).add(1, 'days')
            // };
            where["scout_date"] = {
                [Op.gte]: moment.utc(date, ACCEPT_FORMAT)
            };
        } else {
            // where["scout_date"] = {
            //     [Op.gte]: today,
            //     [Op.lt]: tomorrow
            // };
            where["scout_date"] = {
                [Op.gte]: lastThreeDays
            };
        }

        Station
            .findOne({
                where: {
                    id: entry
                }
            })
            .then((fetchedEntry) => {

                const fetchedEntryId = fetchedEntry.id;
                const fetchedEntryName = fetchedEntry.station_name;

                Scout
                    .findAll({
                        raw: true,
                        attributes: ['block_id', 'bed_id', 'station_id', 'point_id', 'plant_id', 'issue_type_id', 'issue_id', 'issue_category_id', 'tolerance_id', 'scout_value', 'scout_longitude', 'scout_latitude', 'scout_date', ['created_by', 'personnel_id'], 'created_at', 'variety_id',
                            [sequelize.col('scout_block.block_name'), 'block_name'],
                            [sequelize.col('scout_bed.bed_name'), 'bed_name'],
                            [sequelize.col('scout_station.station_name'), 'station_name'],
                            [sequelize.col('scout_point.point_name'), 'point_name'],
                            [sequelize.col('scout_issue_type.issue_type_name'), 'issue_type_name'],
                            [sequelize.col('scout_issue.issue_name'), 'issue_name'],
                            [sequelize.col('scout_issue_category.issue_category_name'), 'issue_category_name'],
                            [sequelize.col('scout_tolerance.tolerance_name'), 'tolerance_name'],
                            [sequelize.col('scout_personnel.personnel_first_name'), 'personnel_first_name'],
                            [sequelize.col('scout_personnel.personnel_last_name'), 'personnel_last_name'],
                            [sequelize.col('scout_variety.variety_name'), 'variety_name'],
                            [sequelize.col('scout_issue.issue_scores.score_name'), 'score_name'],
                            [sequelize.col('scout_issue.issue_scores.id'), 'score_id'],
                        ],
                        include: [{
                            model: Block,
                            as: 'scout_block',
                            attributes: [],
                        }, {
                            model: Bed,
                            as: 'scout_bed',
                            attributes: [],
                        }, {
                            model: Station,
                            as: 'scout_station',
                            attributes: [],
                        }, {
                            model: Point,
                            as: 'scout_point',
                            attributes: [],
                        }, {
                            model: IssueType,
                            as: 'scout_issue_type',
                            attributes: [],
                        }, {
                            model: Issue,
                            as: 'scout_issue',
                            attributes: [],
                            include: [{
                                model: Score,
                                as: 'issue_scores',
                                attributes: [],
                            }]
                        }, {
                            model: IssueCategory,
                            as: 'scout_issue_category',
                            attributes: [],
                        }, {
                            model: Tolerance,
                            as: 'scout_tolerance',
                            attributes: [],
                        }, {
                            model: Personnel,
                            as: 'scout_personnel',
                            attributes: [],
                        }, {
                            model: Variety,
                            as: 'scout_variety',
                            attributes: [],
                        }],
                        where: where,
                    })
                    .then(scouts => {
                        let entryArray = [];
                        let issueName;
                        let issueCategory;
                        let issueTypeName;
                        let value;
                        let score_name;

                        let scoutedPoints = scouts;

                        for (let c = 0; c < scoutedPoints.length; c++) {

                            let scoutPointName = scoutedPoints[c].point_name;
                            let scoutPointId = scoutedPoints[c].point_id;
                            let threat_level = "Default";
                            let PointAlert = {
                                point_id: scoutPointId,
                                point_name: scoutPointName,
                                issue_name: "",
                                issue_category: "",
                                issue_type_name: "",
                                scoring: "",
                                value: "",
                                alert: ""
                            };
                            issueName = scoutedPoints[c].issue_name;
                            issueCategory = scoutedPoints[c].issue_category_name;
                            issueTypeName = scoutedPoints[c].issue_type_name;
                            score_name = scoutedPoints[c].score_name;
                            const tolerance_name = scoutedPoints[c].tolerance_name;
                            const issue_type = scoutedPoints[c].issue_type_name;
                            value = scoutedPoints[c].scout_value;
                            threat_level = calculateThreatLevel(threat_level, score_name, tolerance_name, value, issue_type);
                            PointAlert["issue_name"] = issueName;
                            PointAlert["issue_category"] = issueCategory;
                            PointAlert["issue_type_name"] = issueTypeName;
                            PointAlert["scoring"] = score_name;
                            PointAlert["value"] = value;
                            PointAlert["alert"] = threat_level;
                            entryArray.push(PointAlert);
                        }

                        result(null, {
                            fetchedEntryId,
                            fetchedEntryName,
                            entryArray,
                        });
                    })
                    .catch(err => {
                        const customError = createError(err.message);
                        result(customError, null);
                    });

            })
            .catch(err => {
                const customError = createError(err.message);
                result(customError, null);
            });
    },
    getAllScoutsPersonnel(
        personnelId,
        date,
        plant,
        entry,
        point,
        issue,
        issueCategory,
        value,
        result
    ) {
        let where = {
            created_by: personnelId
        };

        if (!isEmpty(date)) {
            where["scout_date"] = {
                [Op.gte]: moment.utc(date, ACCEPT_FORMAT),
                [Op.lt]: moment.utc(date, ACCEPT_FORMAT).add(1, 'days')
            };
        }
        if (!isEmpty(plant)) {
            where["plant_id"] = plant;
        }
        if (!isEmpty(entry)) {
            where["station_id"] = entry;
        }
        if (!isEmpty(point)) {
            where["point_id"] = point;
        }
        if (!isEmpty(issue)) {
            where["issue_id"] = issue;
        }
        if (!isEmpty(issueCategory)) {
            where["issue_category_id"] = issueCategory;
        }
        if (!isEmpty(value)) {
            where["scout_value"] = value;
        }

        return Scout
            .findAll({
                raw: true,
                attributes: ['block_id', 'bed_id', 'station_id', 'point_id', 'plant_id', 'issue_type_id', 'issue_id', 'issue_category_id', 'tolerance_id', 'scout_value', 'scout_longitude', 'scout_latitude', 'scout_date', ['created_by', 'personnel_id'], 'created_at', 'variety_id',
                    [sequelize.col('scout_block.block_name'), 'block_name'],
                    [sequelize.col('scout_bed.bed_name'), 'bed_name'],
                    [sequelize.col('scout_station.station_name'), 'station_name'],
                    [sequelize.col('scout_point.point_name'), 'point_name'],
                    [sequelize.col('scout_issue_type.issue_type_name'), 'issue_type_name'],
                    [sequelize.col('scout_issue.issue_name'), 'issue_name'],
                    [sequelize.col('scout_issue_category.issue_category_name'), 'issue_category_name'],
                    [sequelize.col('scout_tolerance.tolerance_name'), 'tolerance_name'],
                    [sequelize.col('scout_personnel.personnel_first_name'), 'personnel_first_name'],
                    [sequelize.col('scout_personnel.personnel_last_name'), 'personnel_last_name'],
                    [sequelize.col('scout_variety.variety_name'), 'variety_name'],
                    [sequelize.col('scout_issue.issue_scores.score_name'), 'score_name'],
                    [sequelize.col('scout_issue.issue_scores.id'), 'score_id'],
                ],
                include: [{
                    model: Block,
                    as: 'scout_block',
                    attributes: [],
                }, {
                    model: Bed,
                    as: 'scout_bed',
                    attributes: [],
                }, {
                    model: Station,
                    as: 'scout_station',
                    attributes: [],
                }, {
                    model: Point,
                    as: 'scout_point',
                    attributes: [],
                }, {
                    model: IssueType,
                    as: 'scout_issue_type',
                    attributes: [],
                }, {
                    model: Issue,
                    as: 'scout_issue',
                    attributes: [],
                    include: [{
                        model: Score,
                        as: 'issue_scores',
                        attributes: [],
                    }]
                }, {
                    model: IssueCategory,
                    as: 'scout_issue_category',
                    attributes: [],
                }, {
                    model: Tolerance,
                    as: 'scout_tolerance',
                    attributes: [],
                }, {
                    model: Personnel,
                    as: 'scout_personnel',
                    attributes: [],
                }, {
                    model: Variety,
                    as: 'scout_variety',
                    attributes: [],
                }],
                where: where,
                order: [
                    ['scout_date', 'ASC']
                ]
            })
            .then(scout => {
                this.countScout(where, (err, total) => {
                    if (err) {
                        const customError = createError(err.message);
                        result(customError, null);
                    } else {
                        result(null, {
                            rows: total,
                            items: scout
                        });
                    }
                });
            })
            .catch(err => {
                const customError = createError(err.message);
                result(customError, null);
            });
    },
    getFarmPrevalence(sdate, edate, block, variety, issue, created_by, result) {

        const startDate = moment.utc(sdate, ACCEPT_FORMAT);
        const endDate = moment.utc(edate, ACCEPT_FORMAT).add(1, 'days');

        let where = {
            scout_date: {
                [Op.gte]: startDate,
                [Op.lt]: endDate
            }
        };
        sdate = new Date(sdate);
        edate = new Date(edate);

        let dateRange = [],
            currentDate = sdate,
            addDays = function (days) {
                let date = new Date(this.valueOf());
                date.setDate(date.getDate() + days);
                return date;
            };
        while (currentDate <= edate) {
            dateRange.push(currentDate);
            currentDate = addDays.call(currentDate, 1);
        }

        if (!isEmpty(issue)) {
            where["issue_id"] = issue;
        }

        if (!isEmpty(block)) {
            where["block_id"] = block;
        }

        if (!isEmpty(variety)) {
            where["variety_id"] = variety;
        }

        if (!isEmpty(created_by)) {
            where["created_by"] = created_by;
        }
        Tolerance
            .findAll({
                attributes: ['tolerance_name', 'id',
                    [sequelize.col('tolerance_tolerance_type.tolerance_type_name'), 'tolerance_type_name'],
                    [sequelize.col('tolerance_tolerance_type.id'), 'tolerance_type_id'],
                ],
                include: [{
                    model: ToleranceType,
                    as: 'tolerance_tolerance_type',
                    attributes: []
                }]
            })
            .then((allTolerances) => {
                Scout
                    .findAll({
                        raw: true,
                        attributes: ['block_id', 'bed_id', 'station_id', 'point_id', 'plant_id', 'issue_type_id', 'issue_id', 'issue_category_id', 'tolerance_id', 'scout_value', 'scout_longitude', 'scout_latitude', 'scout_date', ['created_by', 'personnel_id'], 'created_at', 'variety_id',
                            [sequelize.col('scout_block.block_name'), 'block_name'],
                            [sequelize.col('scout_bed.bed_name'), 'bed_name'],
                            [sequelize.col('scout_station.station_name'), 'station_name'],
                            [sequelize.col('scout_point.point_name'), 'point_name'],
                            [sequelize.col('scout_issue_type.issue_type_name'), 'issue_type_name'],
                            [sequelize.col('scout_issue.issue_name'), 'issue_name'],
                            [sequelize.col('scout_issue_category.issue_category_name'), 'issue_category_name'],
                            [sequelize.col('scout_tolerance.tolerance_name'), 'tolerance_name'],
                            [sequelize.col('scout_personnel.personnel_first_name'), 'personnel_first_name'],
                            [sequelize.col('scout_personnel.personnel_last_name'), 'personnel_last_name'],
                            [sequelize.col('scout_variety.variety_name'), 'variety_name'],
                            [sequelize.col('scout_issue.issue_scores.score_name'), 'score_name'],
                            [sequelize.col('scout_issue.issue_scores.id'), 'score_id'],
                        ],
                        include: [{
                            model: Block,
                            as: 'scout_block',
                            attributes: [],
                        }, {
                            model: Bed,
                            as: 'scout_bed',
                            attributes: [],
                        }, {
                            model: Station,
                            as: 'scout_station',
                            attributes: [],
                        }, {
                            model: Point,
                            as: 'scout_point',
                            attributes: [],
                        }, {
                            model: IssueType,
                            as: 'scout_issue_type',
                            attributes: [],
                        }, {
                            model: Issue,
                            as: 'scout_issue',
                            attributes: [],
                            include: [{
                                model: Score,
                                as: 'issue_scores',
                                attributes: [],
                            }]
                        }, {
                            model: IssueCategory,
                            as: 'scout_issue_category',
                            attributes: [],
                        }, {
                            model: Tolerance,
                            as: 'scout_tolerance',
                            attributes: [],
                        }, {
                            model: Personnel,
                            as: 'scout_personnel',
                            attributes: [],
                        }, {
                            model: Variety,
                            as: 'scout_variety',
                            attributes: [],
                        }],
                        where: where,
                        order: [
                            ['scout_date', 'ASC']
                        ]
                    })
                    .then(allScouts => {
                        //console.log(allScouts)
                        let issuesArray = [];

                        if (allScouts.length > 1) {
                            let uniqueScoutIssueArr;
                            let color;
                            let currentColor = 0;
                            let formattedDates;
                            let currentToleranceColor = 0;
                            let toleColor;
                            let scoutIssueName;
                            let allColors = [
                                ["#ff6384", "rgba(255, 99, 132, .1)"],
                                ["#ec407a", "rgba(236, 64, 122, .1)"],
                                ["#ab47bc", "rgba(171, 71, 188, .1)"],
                                ["#7e57c2", "rgba(126, 87, 194, .1)"],
                                ["#5c6bc0", "rgba(92, 107, 192, .1)"],
                                ["#42a5f5", "rgba(66, 165, 245, .1)"],
                                ["#29b6f6", "rgba(41, 182, 246, .1)"],
                                ["#26c6da", "rgba(38, 198, 218, .1)"],
                                ["#26a69a", "rgba(38, 166, 154, .1)"],
                                ["#66bb6a", "rgba(102, 187, 106, .1)"],
                                ["#9ccc65", "rgba(156, 204, 101, .1)"],
                                ["#d4e157", "rgba(212, 225, 87, .1)"],
                                ["#f57f17", "rgba(245, 127, 23, .1)"],
                                ["#ffd600", "rgba(255, 214, 0, .1)"],
                                ["#ffab00", "rgba(255, 171, 0, .1)"],
                                ["#e65100", "rgba(230, 81, 0, .1)"],
                                ["#bf360c", "rgba(191, 54, 12, .1)"],
                                ["#3e2723", "rgba(62, 39, 35, .1)"],
                                ["#8d6e63", "rgba(141, 110, 99, .1)"],
                                ["#607d8b", "rgba(96, 125, 139, .1)"],
                                ["#cfd8dc", "rgba(207, 216, 220, .1)"],
                                ["#c51162", "rgba(197, 17, 98, .1)"],
                                ["#e1bee7", "rgba(225, 190, 231, .1)"],
                                ["#6200ea", "rgba(98, 0, 234, .1)"],
                                ["#00bfa5", "rgba(0, 191, 165, .1)"],
                                ["#004d40", "rgba(0, 77, 64, .1)"],
                                ["#006064", "rgba(0, 96, 100, .1)"],
                                ["#01579b", "rgba(1, 87, 155, .1)"],
                            ];
                            let toleranceColors = [
                                ["#4C9A2A", "rgba(1, 87, 155, .1"],
                                ["#ffc100", "rgba(236, 64, 122, .1)"],
                                ["#ff9a00", "rgba(171, 71, 188, .1)"],
                                ["#ff0000", "rgba(255, 99, 132, .1)"],
                            ];
                            let totalToleranceColors = toleranceColors.length;
                            let totalColors = allColors.length;
                            let uniqueIssuesName;
                            let resultObj;
                            let scoutToleranceArr;
                            let toleranceObj;
                            let scouts = allScouts;

                            let scoutIssues = scouts.map((scout) => {
                                return scout.issue_name;
                            });

                            let uniqueIssues = Array.from(new Set(scoutIssues));

                            for (let i = 0; i < uniqueIssues.length; i++) {
                                uniqueIssuesName = uniqueIssues[i];
                                color = allColors[currentColor];
                                currentColor++;
                                if (currentColor >= totalColors) {
                                    currentColor = 0;
                                };
                                resultObj = {
                                    issue_name: uniqueIssuesName,
                                    issue_data: {},
                                };
                                let issueDataObj = {
                                    labels: "",
                                    datasets: [],
                                }

                                let issue = {
                                    label: "",
                                    backgroundColor: color[1],
                                    borderColor: color[0],
                                    data: []
                                }
                                let scoutToleranceTypeId;

                                dateRange.forEach((date) => {
                                    let totalValues = 0;
                                    let count = 0;
                                    let average = 0;

                                    uniqueScoutIssueArr = scouts
                                        .filter(scout => scout.issue_name === uniqueIssuesName && scout.scout_date.toISOString().slice(0, 10) == date.toISOString().slice(0, 10));

                                    for (let r = 0; r < uniqueScoutIssueArr.length; r++) {

                                        scoutToleranceId = uniqueScoutIssueArr[r].tolerance_id;
                                        scoutIssueName = uniqueScoutIssueArr[r].issue_name;

                                        const value = uniqueScoutIssueArr[r].scout_value;

                                        totalValues += +value;
                                        count++;
                                        average = Math.round(totalValues / count);
                                        issue["label"] = scoutIssueName;

                                        scoutToleranceArr = allTolerances
                                            .filter(toleranceType => toleranceType.id === scoutToleranceId && toleranceType.tolerance_type_name != "Score 5");

                                    }
                                    issue.data.push(average);
                                    formattedDates = dateRange.map(date => {
                                        return moment(date).format("DD/MM/YYYY");
                                    });

                                });
                                issueDataObj["labels"] = formattedDates;
                                issueDataObj.datasets.push(issue);
                                const dateLength = formattedDates.length;
                                for (let q = 0; q < scoutToleranceArr.length; q++) {

                                    toleColor = toleranceColors[currentToleranceColor];
                                    currentToleranceColor++;

                                    if (currentToleranceColor >= totalToleranceColors) {
                                        currentToleranceColor = 0;
                                    };
                                    const toleranceName = scoutToleranceArr[q].tolerance_name;
                                    const toleranceTo = scoutToleranceArr[q].tolerance_to;
                                    toleranceObj = {
                                        label: "",
                                        backgroundColor: toleColor[1],
                                        borderColor: toleColor[0],
                                        data: []
                                    }
                                    toleranceObj["label"] = toleranceName;
                                    let toleranceArr = new Array(dateLength).fill(toleranceTo);
                                    toleranceObj["data"] = toleranceArr;
                                    issueDataObj.datasets.push(toleranceObj);
                                }
                                resultObj["issue_data"] = issueDataObj;
                                issuesArray.push(resultObj);
                            }
                        } else {
                            issuesArray = [];
                        }

                        for (let n = 0; n < issuesArray.length; n++) {
                            let issueDataDatasets = issuesArray[n].issue_data.datasets[0].data;
                            // console.log(issueDataDatasets)
                            var sum = issueDataDatasets.reduce(function (issueDataDatasets, b) {
                                return issueDataDatasets + b;
                            }, 0);

                            issuesArray.sort(function (a, b) {
                                return a.sum - b.sum;
                            });
                            //console.log(issuesArray)

                        }
                        result(null,
                            issuesArray
                        );
                    })
                    .catch(err => {
                        const customError = createError(err.message);
                        result(customError, null);
                    });
            })
            .catch(err => {
                const customError = createError(err.message);
                result(customError, null);
            });

    },
    fetchAllScoutsWithoutPagination(date, entry, point, issue, tolerance, issueCategory, plant, value, latitude, longitude, created_by, result) {

        let where = {};
        const startDate = moment.utc(date, ACCEPT_FORMAT);
        const endDate = moment.utc(date, ACCEPT_FORMAT).add(1, 'days');

        if (!isEmpty(date)) {
            where["scout_date"] = {
                [Op.gte]: startDate,
                [Op.lt]: endDate
            };
        }

        if (!isEmpty(entry)) {
            where["station_id"] = entry;
        }
        if (!isEmpty(point)) {
            where["point_id"] = point;
        }
        if (!isEmpty(issue)) {
            where["issue_id"] = issue;
        }
        if (!isEmpty(tolerance)) {
            where["tolerance_id"] = tolerance;
        }
        if (!isEmpty(issueCategory)) {
            where["issue_category_id"] = issueCategory;
        }
        if (!isEmpty(plant)) {
            where["plant_id"] = plant;
        }

        if (!isEmpty(value)) {
            where["scout_value"] = value;
        }

        if (!isEmpty(tolerance)) {
            where["tolerance_id"] = tolerance;
        }

        if (!isEmpty(latitude)) {
            where["scout_latitude"] = latitude;
        }
        if (!isEmpty(longitude)) {
            where["scout_longitude"] = longitude;
        }
        if (!isEmpty(created_by)) {
            where["created_by"] = created_by;
        }

        return Scout
            .findAll({
                raw: true,
                attributes: ['block_id', 'bed_id', 'station_id', 'point_id', 'plant_id', 'issue_type_id', 'issue_id', 'issue_category_id', 'tolerance_id', 'scout_value', 'scout_longitude', 'scout_latitude', 'scout_date', ['created_by', 'personnel_id'], 'created_at', 'variety_id',
                    [sequelize.col('scout_block.block_name'), 'block_name'],
                    [sequelize.col('scout_bed.bed_name'), 'bed_name'],
                    [sequelize.col('scout_station.station_name'), 'station_name'],
                    [sequelize.col('scout_point.point_name'), 'point_name'],
                    [sequelize.col('scout_issue_type.issue_type_name'), 'issue_type_name'],
                    [sequelize.col('scout_issue.issue_name'), 'issue_name'],
                    [sequelize.col('scout_issue_category.issue_category_name'), 'issue_category_name'],
                    [sequelize.col('scout_tolerance.tolerance_name'), 'tolerance_name'],
                    [sequelize.col('scout_personnel.personnel_first_name'), 'personnel_first_name'],
                    [sequelize.col('scout_personnel.personnel_last_name'), 'personnel_last_name'],
                    [sequelize.col('scout_variety.variety_name'), 'variety_name'],
                    [sequelize.col('scout_issue.issue_scores.score_name'), 'score_name'],
                    [sequelize.col('scout_issue.issue_scores.id'), 'score_id'],
                ],
                include: [{
                    model: Block,
                    as: 'scout_block',
                    attributes: [],
                }, {
                    model: Bed,
                    as: 'scout_bed',
                    attributes: [],
                }, {
                    model: Station,
                    as: 'scout_station',
                    attributes: [],
                }, {
                    model: Point,
                    as: 'scout_point',
                    attributes: [],
                }, {
                    model: IssueType,
                    as: 'scout_issue_type',
                    attributes: [],
                }, {
                    model: Issue,
                    as: 'scout_issue',
                    attributes: [],
                    include: [{
                        model: Score,
                        as: 'issue_scores',
                        attributes: [],
                    }]
                }, {
                    model: IssueCategory,
                    as: 'scout_issue_category',
                    attributes: [],
                }, {
                    model: Tolerance,
                    as: 'scout_tolerance',
                    attributes: [],
                }, {
                    model: Personnel,
                    as: 'scout_personnel',
                    attributes: [],
                }, {
                    model: Variety,
                    as: 'scout_variety',
                    attributes: [],
                }],
                where: where,
                order: [
                    ['scout_date', 'ASC']
                ]
            })
            .then(scout => {
                result(null, scout);
            })
            .catch(err => {
                const customError = createError(err.message);
                result(customError, null);
            });
    },
    getScoutReportingDate(date, block, result) {
        let where = {};
        const startDate = moment.utc(moment(date), ACCEPT_FORMAT);
        const endDate = moment.utc(moment(date), ACCEPT_FORMAT).add(1, 'days');

        if (!isEmpty(date)) {
            where["scout_date"] = {
                [Op.gte]: startDate,
                [Op.lt]: endDate
            };
        } else {
            where["scout_date"] = {
                [Op.gte]: today,
                [Op.lt]: tomorrow
            };
        }

        Bed
            .findAll({
                raw: true,
                attributes: ['id', 'bed_name', 'bed_number',
                    [sequelize.col('bed_block.block_name'), 'block_name'],
                    [sequelize.col('bed_block.id'), 'block_id'],
                    [sequelize.col("bed_block.children.block_name"), "parent_name"],
                    [sequelize.col("bed_block.children.id"), "parent_id"]
                ],
                include: [{
                    model: Block,
                    as: 'bed_block',
                    attributes: [],
                    include: [{
                        model: Block,
                        as: "children",
                        attributes: []
                    }]
                }]
            })
            .then((dbBeds) => {
                PersonnelType
                    .findOne({
                        where: {
                            personnel_type_name: 'Scout'
                        }
                    })
                    .then(personnelType => {
                        if (personnelType.id) {
                            Personnel
                                .findAll({
                                    where: {
                                        personnel_type_id: personnelType.id
                                    }
                                })
                                .then(personnel => {
                                    if (personnel.length > 0) {
                                        Scout
                                            .findAll({
                                                raw: true,
                                                attributes: ['block_id', 'bed_id', 'station_id', 'point_id', 'plant_id', 'issue_type_id', 'issue_id', 'issue_category_id', 'tolerance_id', 'scout_value', 'scout_longitude', 'scout_latitude', 'scout_date', ['created_by', 'personnel_id'], 'created_at', 'variety_id',
                                                    [sequelize.col('scout_block.block_name'), 'block_name'],
                                                    [sequelize.col('scout_bed.bed_name'), 'bed_name'],
                                                    [sequelize.col('scout_station.station_name'), 'station_name'],
                                                    [sequelize.col('scout_point.point_name'), 'point_name'],
                                                    [sequelize.col('scout_issue_type.issue_type_name'), 'issue_type_name'],
                                                    [sequelize.col('scout_issue.issue_name'), 'issue_name'],
                                                    [sequelize.col('scout_issue_category.issue_category_name'), 'issue_category_name'],
                                                    [sequelize.col('scout_tolerance.tolerance_name'), 'tolerance_name'],
                                                    [sequelize.col('scout_personnel.personnel_first_name'), 'personnel_first_name'],
                                                    [sequelize.col('scout_personnel.personnel_last_name'), 'personnel_last_name'],
                                                    [sequelize.col('scout_variety.variety_name'), 'variety_name'],
                                                    [sequelize.col('scout_issue.issue_scores.score_name'), 'score_name'],
                                                    [sequelize.col('scout_issue.issue_scores.id'), 'score_id'],
                                                ],
                                                include: [{
                                                    model: Block,
                                                    as: 'scout_block',
                                                    attributes: [],
                                                }, {
                                                    model: Bed,
                                                    as: 'scout_bed',
                                                    attributes: [],
                                                }, {
                                                    model: Station,
                                                    as: 'scout_station',
                                                    attributes: [],
                                                }, {
                                                    model: Point,
                                                    as: 'scout_point',
                                                    attributes: [],
                                                }, {
                                                    model: IssueType,
                                                    as: 'scout_issue_type',
                                                    attributes: [],
                                                }, {
                                                    model: Issue,
                                                    as: 'scout_issue',
                                                    attributes: [],
                                                    include: [{
                                                        model: Score,
                                                        as: 'issue_scores',
                                                        attributes: [],
                                                    }]
                                                }, {
                                                    model: IssueCategory,
                                                    as: 'scout_issue_category',
                                                    attributes: [],
                                                }, {
                                                    model: Tolerance,
                                                    as: 'scout_tolerance',
                                                    attributes: [],
                                                }, {
                                                    model: Personnel,
                                                    as: 'scout_personnel',
                                                    attributes: [],
                                                }, {
                                                    model: Variety,
                                                    as: 'scout_variety',
                                                    attributes: [],
                                                }],
                                                where: where,
                                                order: [
                                                    ['scout_date', 'ASC']
                                                ]
                                            })
                                            .then(scouts => {
                                                let scoutBed;
                                                let scoutTime;
                                                let scoutBlock;
                                                let blockAverangeTimeDec;
                                                let bedAverageTimeDec;
                                                let allBlocksAverageTime;
                                                let totalScoutTimeArr = [];
                                                let scoutBedArr = [];
                                                let scoutBlockArr = [];
                                                let uniqueBedArr;
                                                let uniqueBlockArr;
                                                let stationAverageTimeDec;

                                                let personnelObj;
                                                let blockAverageTime;
                                                let bedAverageTime;
                                                let stationAverageTime;
                                                const personnelArray = [];
                                                let scoutEntries;

                                                let timeArray = [];

                                                for (let s = 0; s < personnel.length; s++) {

                                                    const personnelId = personnel[s].id;
                                                    const personnelName = personnel[s].personnel_first_name;

                                                    personnelObj = {
                                                        personnel_id: personnelId,
                                                        personnel_name: personnelName,
                                                        average_block_time: "",
                                                        average_bed_time: "",
                                                        average_station_time: "",
                                                        scouted_blocks: "",
                                                        total_beds: "",
                                                        scouted_beds: "",
                                                        total_stations: "",
                                                        scouted_stations: "",
                                                    };


                                                    if (!isEmpty(block)) {

                                                        scoutEntries = scouts
                                                            .filter(scout => scout.block_id === block);

                                                    } else {
                                                        scoutEntries = scouts;
                                                    }
                                                    for (let r = 0; r < scoutEntries.length; r++) {
                                                        const scoutPersonnelId = scoutEntries[r].personnel_id;

                                                        if (personnelId === scoutPersonnelId) {
                                                            scoutBlock = scoutEntries[r].block_id;
                                                            scoutBed = scoutEntries[r].bed_id;
                                                            scoutTime = scoutEntries[r].scout_date;
                                                            scoutBlockArr.push(scoutBlock)
                                                            totalScoutTimeArr.push(scoutTime);
                                                            scoutBedArr.push(scoutBed);
                                                            uniqueBedArr = scoutBedArr.filter((item, i, ar) => ar.indexOf(item) === i);
                                                            uniqueBlockArr = scoutBlockArr.filter((item, i, ar) => ar.indexOf(item) === i);
                                                            const scoutBlockNumber = uniqueBlockArr.length;
                                                            const maxScoutDate = new Date(Math.max.apply(null, totalScoutTimeArr));

                                                            const scoutPerPersonnel = totalScoutTimeArr.length;
                                                            const minScoutDate = new Date(Math.min.apply(null, totalScoutTimeArr));
                                                            allBlocksAverageTime = (maxScoutDate.getTime() - minScoutDate.getTime()) / 1000;
                                                            allBlocksAverageTime /= 60;
                                                            blockAverangeTimeDec = allBlocksAverageTime / scoutBlockNumber;
                                                            blockAverageTime = Math.round(blockAverangeTimeDec)
                                                            const scoutBedNumber = uniqueBedArr.length;
                                                            const totalBedNumArr = [];
                                                            let totalBedNum;
                                                            let totalStations;
                                                            for (let u = 0; u < uniqueBlockArr.length; u++) {
                                                                const uniqueBlockId = uniqueBlockArr[u];
                                                                for (let b = 0; b < dbBeds.length; b++) {
                                                                    const blockBedId = dbBeds[b].parent_id;
                                                                    if (uniqueBlockId === blockBedId) {
                                                                        const uni = uniqueBlockId;
                                                                        totalBedNumArr.push(uni);
                                                                        totalBedNum = totalBedNumArr.length;
                                                                        totalStations = totalBedNum * 10;
                                                                    }
                                                                }
                                                            }

                                                            bedAverageTimeDec = allBlocksAverageTime / scoutBedNumber;
                                                            bedAverageTime = Math.round(bedAverageTimeDec)
                                                            stationAverageTimeDec = allBlocksAverageTime / scoutPerPersonnel;
                                                            stationAverageTime = Math.round(stationAverageTimeDec);
                                                            personnelObj["personnel_name"] = personnelName;
                                                            personnelObj["average_block_time"] = blockAverageTime;
                                                            personnelObj["average_bed_time"] = bedAverageTime;
                                                            personnelObj["average_station_time"] = stationAverageTime;
                                                            personnelObj["scouted_blocks"] = scoutBlockNumber;
                                                            personnelObj["total_beds"] = totalBedNum;
                                                            personnelObj["scouted_beds"] = scoutBedNumber;
                                                            personnelObj["total_stations"] = totalStations;
                                                            personnelObj["scouted_stations"] = scoutPerPersonnel;
                                                        }
                                                    }
                                                    personnelArray.push(personnelObj)
                                                }

                                                result(null, personnelArray);

                                            })
                                            .catch(err => {
                                                const customError = createError(err.message);
                                                result(customError, null);
                                            })
                                    } else {
                                        const customError = createError("scouts not found");
                                        result(customError, null);
                                    }
                                })
                                .catch(err => {
                                    const customError = createError(err.message);
                                    result(customError, null);
                                });
                        } else {
                            const customError = createError("Personnel Type Scout not found");
                            result(customError, null);
                        }
                    })
            })
            .catch(err => {
                const customError = createError(err.message);
                result(customError, null);
            })
            .catch(err => {
                const customError = createError(err.message);
                result(customError, null);
            })
    },
    getScoutLocation(date, created_by, block, result) {
        let where = {
            "block_id": block
        };

        const startDate = moment.utc(date, ACCEPT_FORMAT);
        const endDate = moment.utc(date, ACCEPT_FORMAT).add(1, 'days');

        const now = moment().startOf('day');
        const today = moment.utc(now, ACCEPT_FORMAT);
        const tomorrow = moment.utc(now, ACCEPT_FORMAT).add(1, 'days');

        if (!isEmpty(date)) {
            where["scout_date"] = {
                [Op.gte]: startDate,
                [Op.lt]: endDate
            };
        } else {
            where["scout_date"] = {
                [Op.gte]: today,
                [Op.lt]: tomorrow
            };
        }
        if (!isEmpty(created_by)) {
            where["created_by"] = created_by;
        }
        Scout
            .findAll({
                raw: true,
                attributes: [
                    'scout_longitude', 'scout_latitude', 'scout_date',
                ],
                where: where,
                order: [
                    ['scout_date', 'ASC']
                ]
            })
            .then((scoutLocation) => {

                let scoutLocArr = [];
                let allScoutLocArray = [];

                scoutLocArr = scoutLocation;

                for (let s = 0; s < scoutLocArr.length; s += 200) {
                    let scoutLocObj = {
                        lat: "",
                        lng: "",
                    };
                    const scoutLatitude = parseFloat(scoutLocArr[s].scout_latitude);
                    const scoutLongitude = parseFloat(scoutLocArr[s].scout_longitude);

                    scoutLocObj["lat"] = scoutLatitude;
                    scoutLocObj["lng"] = scoutLongitude;
                    allScoutLocArray.push(scoutLocObj);
                }
                result(null, allScoutLocArray);
            })
            .catch(err => {
                const customError = createError(err.message);
                result(customError, null);
            });
    },
    getVarietyAlerts(block, variety, result) {
        let where = {};
        if (!isEmpty(variety)) {
            where["variety_id"] = variety;
        }
        if (!isEmpty(block)) {
            where["plant_bed.bed_block.children.id"] = block;
        }
        Plant
            .findAll({
                attributes: [
                    [sequelize.col("plant_bed.id"), "bed_id"],
                    [sequelize.col("plant_bed.bed_name"), "bed_name"],
                    [sequelize.col("plant_variety.id"), "variety_id"],
                    [sequelize.col("plant_variety.variety_name"), "variety_name"],
                    [sequelize.col("plant_bed.bed_block.children.id"), "block_id"],
                    [sequelize.col("plant_bed.bed_block.children.block_name"), "block_id"]
                ],
                where,
                include: [{
                    models: Bed,
                    as: 'plant_bed',
                    attributes: [],
                    include: [{
                        models: Block,
                        as: 'bed_block',
                        attributes: [],
                        include: [{
                            model: Block,
                            as: "children",
                            attributes: []
                        }]
                    }]
                }, {
                    models: Variety,
                    as: 'plant_variety',
                    attributes: []
                }]
            })
            .then((blockPlants) => {
                Scout
                    .findAll({
                        raw: true,
                        attributes: ['block_id', 'bed_id', 'station_id', 'point_id', 'plant_id', 'issue_type_id', 'issue_id', 'issue_category_id', 'tolerance_id', 'scout_value', 'scout_longitude', 'scout_latitude', 'scout_date', ['created_by', 'personnel_id'], 'created_at', 'variety_id',
                            [sequelize.col('scout_block.block_name'), 'block_name'],
                            [sequelize.col('scout_bed.bed_name'), 'bed_name'],
                            [sequelize.col('scout_station.station_name'), 'station_name'],
                            [sequelize.col('scout_point.point_name'), 'point_name'],
                            [sequelize.col('scout_issue_type.issue_type_name'), 'issue_type_name'],
                            [sequelize.col('scout_issue.issue_name'), 'issue_name'],
                            [sequelize.col('scout_issue_category.issue_category_name'), 'issue_category_name'],
                            [sequelize.col('scout_tolerance.tolerance_name'), 'tolerance_name'],
                            [sequelize.col('scout_personnel.personnel_first_name'), 'personnel_first_name'],
                            [sequelize.col('scout_personnel.personnel_last_name'), 'personnel_last_name'],
                            [sequelize.col('scout_variety.variety_name'), 'variety_name'],
                            [sequelize.col('scout_issue.issue_scores.score_name'), 'score_name'],
                            [sequelize.col('scout_issue.issue_scores.id'), 'score_id'],
                        ],
                        include: [{
                            model: Block,
                            as: 'scout_block',
                            attributes: [],
                        }, {
                            model: Bed,
                            as: 'scout_bed',
                            attributes: [],
                        }, {
                            model: Station,
                            as: 'scout_station',
                            attributes: [],
                        }, {
                            model: Point,
                            as: 'scout_point',
                            attributes: [],
                        }, {
                            model: IssueType,
                            as: 'scout_issue_type',
                            attributes: [],
                        }, {
                            model: Issue,
                            as: 'scout_issue',
                            attributes: [],
                            include: [{
                                model: Score,
                                as: 'issue_scores',
                                attributes: [],
                            }]
                        }, {
                            model: IssueCategory,
                            as: 'scout_issue_category',
                            attributes: [],
                        }, {
                            model: Tolerance,
                            as: 'scout_tolerance',
                            attributes: [],
                        }, {
                            model: Personnel,
                            as: 'scout_personnel',
                            attributes: [],
                        }, {
                            model: Variety,
                            as: 'scout_variety',
                            attributes: [],
                        }],
                        where: {
                            scout_date: {
                                [Op.gte]: new Date((today.getTime() - (3 * 24 * 60 * 60 * 1000)))
                            }
                        },
                        order: [
                            ['scout_date', 'ASC']
                        ]
                    })
                    .then((allScouts) => {
                        IssueType
                            .find()
                            .then((allIssueTypes) => {
                                let farmArray = [];
                                let issueTypeAlert;
                                let parent_threat_level = "Default"
                                let varietyAlerts;
                                let BlockVarArr = [];
                                let allVar;
                                let blockPlantsArr;

                                if (!isEmpty(block)) {
                                    blockPlantsArr = blockPlants.filter(blockPlant => blockPlant.bed.block.parent._id.equals(block));
                                } else {
                                    blockPlantsArr = blockPlants;
                                }
                                //console.log(blockPlantsArr);

                                for (let u = 0; u < blockPlantsArr.length; u++) {
                                    allVar = blockPlantsArr[u].variety.name;
                                    BlockVarArr.push(allVar);
                                }
                                const blockVarietyArr = [...new Set(BlockVarArr)];
                                //console.log(blockVarietyArr)

                                for (let v = 0; v < blockVarietyArr.length; v++) {

                                    let threat_level = "Default";
                                    let variety_name = blockVarietyArr[v];

                                    varietyAlerts = {
                                        variety_name: variety_name,
                                        scout_alert: "",
                                        alert: "Default",
                                        variety_issue_types: [],
                                    };

                                    let scoutsRegisteredArr = allScouts
                                        .filter(scout => scout.plant.variety.name === variety_name);

                                    if (scoutsRegisteredArr.length > 0) {

                                        varietyAlerts["scout_alert"] = "Success";

                                        for (let q = 0; q < allIssueTypes.length; q++) {
                                            let issueTypeId = allIssueTypes[q]._id;
                                            let issueTypeName = allIssueTypes[q].name;
                                            issueTypeAlert = {
                                                issue_type_name: issueTypeName,
                                                issue_type_alert: "",
                                            };

                                            let issueTypesArr = scoutsRegisteredArr.filter(scout => scout.issue.issue_type._id.equals(issueTypeId));

                                            for (let p = 0; p < issueTypesArr.length; p++) {

                                                const score_name = issueTypesArr[p].issue.score.name;
                                                const tolerance_name = (issueTypesArr[p].tolerance) ? issueTypesArr[p].tolerance.name : null;
                                                const value = issueTypesArr[p].value;
                                                const issue_type = issueTypesArr[p].issue.issue_type.name;
                                                threat_level = calculateThreatLevel(threat_level, score_name, tolerance_name, value, issue_type);
                                                issueTypeAlert["issue_type_alert"] = threat_level;
                                            }
                                            varietyAlerts["variety_issue_types"].push(issueTypeAlert);
                                        }

                                    } else {

                                        varietyAlerts["scout_alert"] = "Danger";

                                        for (let n = 0; n < allIssueTypes.length; n++) {
                                            const issueTypeName = allIssueTypes[n].name;
                                            issueTypeAlert = {
                                                issue_type_name: issueTypeName,
                                                alert: "",
                                            };
                                            issueTypeAlert["alert"] = "Default"
                                            varietyAlerts.variety_issue_types.push(issueTypeAlert)
                                        }
                                    }
                                    //console.log(varietyAlerts);

                                    let parentThreatLevelArr = [];
                                    parentThreatLevelArr.push(varietyAlerts)
                                    //console.log(parentThreatLevelArr)
                                    let alertArray = [];
                                    for (let t = 0; t < parentThreatLevelArr.length; t++) {

                                        const scoutAlert = parentThreatLevelArr[t].scout_alert;
                                        alertArray.push(scoutAlert);
                                        let childArray = parentThreatLevelArr[t].variety_issue_types;

                                        for (let k = 0; k < childArray.length; k++) {
                                            const scoutIssueAlert = childArray[k].issue_type_alert;
                                            alertArray.push(scoutIssueAlert)

                                            for (let h = 0; h < alertArray.length; h++) {
                                                let alert = alertArray[h];

                                                parent_threat_level = calculateParentThreatLevel(parent_threat_level,
                                                    alert);
                                            }
                                        }
                                        varietyAlerts["alert"] = parent_threat_level;
                                        farmArray.push(varietyAlerts);
                                    }

                                }
                                result(null, farmArray)
                            })
                            .catch(err => {
                                const customError = createError(err.message);
                                result(customError, null);
                            });


                    })
                    .catch(err => {
                        const customError = createError(err.message);
                        result(customError, null);
                    });
            })
            .catch(err => {
                const customError = createError(err.message);
                result(customError, null);

            });

    },
    getBedScoutingDate(bed, result) {
        let where = {};

        if (!isEmpty(bed)) {
            where["bed"] = bed;
        }
        Bed
            .findById(bed)
            .then((bedFetched) => {
                // console.log(bedFetched)
                const queryBedName = bedFetched.bed_name;

                Scout
                    .find()
                    .populate({
                        path: 'entry point issue tolerance issueCategory plant ',
                        populate: {
                            path: 'issue_type score tolerance_type bed variety',
                            populate: {
                                path: 'block ',
                            }
                        },
                    })
                    .then(scout => {
                        let bedName;
                        let uniqueDates = [];
                        for (let j = 0; j < scout.length; j++) {
                            bedName = scout[j].plant.bed.bed_name;

                            if (bedName == queryBedName) {
                                const scoutingDate = scout[j].scout_date;

                                let date = new Date(scoutingDate);
                                date = date.toISOString().slice(0, 10);

                                let unidates = [today, new Date(date)]

                                uniqueDates = unidates
                                    .map(s => s.toString())
                                    .filter((s, i, a) => a.indexOf(s) == i)
                                    .map(s => new Date(s));
                            }
                        }
                        result(null, uniqueDates);
                    })
                    .catch(err => {
                        const customError = createError(err.message);
                        result(customError, null);
                    });

            })
            .catch(err => {
                const customError = createError(err.message);
                result(customError, null);
            });
    }
};
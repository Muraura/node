const sequelize = require("sequelize");
const Op = sequelize.Op;
const Bed = require("../../models").Bed;
const Block = require("../../models").Block;
const Plant = require("../../models").Plant;
const Variety = require("../../models").Variety;
const moment = require("moment");
const {
  createError,
  validateBedInput,
  isEmpty,
  validateId,
  validateBedUpdateInput
} = require("../validation");

module.exports = {
  findBed(where, result) {
    Bed.findOne({
        raw: true,
        attributes: [`bed_number`, `bed_name`],
        where: where
      })
      .then(bed => {
        return result(null, bed);
      })
      .catch(error => {
        result(error, null);
      });
  },
  saveBed(bed, personnelId, result) {
    const {
      errors,
      isValid
    } = validateBedInput(bed);

    if (!isValid) {
      const customError = createError(errors);
      result(customError, null);
    } else {
      const {
        bed_number,
        bed_name,
        block_id,
        variety_id,
        plant_status,
        plant_expected_pick_date,
        plant_date
      } = bed;

      this.findBed({
        bed_number: bed_number
      }, (err, dbBed) => {
        if (err) {
          const customError = createError({
            bed: err.message
          });
          result(customError, null);
        } else {
          if (dbBed) {
            const customError = createError({
              bed: "Bed already exist"
            });
            result(customError, null);
          } else {
            Bed.create({
                bed_number: bed_number,
                bed_name: bed_name,
                block_id: block_id,
                created_by: personnelId
              })
              .then(fetchedBed => {
                Plant.create({
                    plant_expected_pick_date: plant_expected_pick_date,
                    plant_date: plant_date,
                    plant_status: plant_status,
                    bed_id: fetchedBed.id,
                    block_id: block_id,
                    variety_id: variety_id,
                    created_by: personnelId
                  })
                  .then(fetchedPlant => {
                    result(null, {
                      message: "Success"
                    });
                  })
                  .catch(err => {
                    const customError = createError({
                      bed: err.message
                    });
                    result(customError, null);
                  });
              })
              .catch(err => {
                const customError = createError({
                  bed: err.message
                });
                result(customError, null);
              });
          }
        }
      });
    }
  },
  bulkSaveBed(bed, personnelId, result) {
    const {
      errors,
      isValid
    } = validateBedInput(bed);
    if (!isValid) {
      const customError = createError(errors);
      result(customError, null);
    } else {
      let allBeds = [];
      let bedNumbers = [];
      let allPlants = [];

      let fetchedBedNames;
      for (let r = bed.from; r <= bed.to; r++) {
        const bed_number = r;
        const bed_name = "Bed " + r;

        bedNumbers.push(r);

        allBeds.push({
          bed_number: bed_number,
          bed_name: bed_name,
          block_id: bed.block_id,
          created_by: personnelId
        });
      }
      Bed.findAll({
        raw: true,
        where: {
          block_id: bed.block_id,
          bed_number: bedNumbers
        }
      }).then(beds => {
        if (beds.length > 0) {
          fetchedBedNames = allBeds.filter(x => {
            return beds.findIndex(t => t.bed_number === x.bed_number) === 1
          })
          //console.log(fetchedBedNames)
          Bed.bulkCreate(fetchedBedNames, {
              fields: ["bed_number", "bed_name", "block_id", "created_by"],
            })
            .then(fetchedBed => {
              fetchedBedIds = fetchedBed.map((obj) => {
                return obj.id;
              })
              for (let i = 0; i < fetchedBedIds.length; i++) {
                allPlants.push({
                  bed_id: fetchedBedIds[i],
                  plant_expected_pick_date: bed.expected_pick_date,
                  plant_date: bed.plant_date,
                  plant_status: bed.status,
                  block_id: bed.block_id,
                  variety_id: bed.variety_id,
                  created_by: personnelId,
                  // created_at:Date.now()
                });
              }
              Plant.bulkCreate(allPlants, {
                  fields: ["bed_id", "plant_expected_pick_date", "plant_date", "plant_status", "block_id", "variety_id", "created_by"],
                })
                .then(() => {
                  result(null, {
                    message: "Success"
                  });
                }).catch(err => {
                  console.log(err)
                  result({
                    error: err.message
                  }, null);
                })
            })
            .catch(err => {
              console.log(err)
              result({
                error: err.message
              }, null);
            });
        } else {
          Bed.bulkCreate(allBeds, {
              fields: ["bed_number", "bed_name", "block_id", "created_by"],
            })
            .then(fetchedBed => {
              fetchedBedIds = fetchedBed.map((obj) => {
                return obj.id;
              })
              for (let i = 0; i < fetchedBedIds.length; i++) {
                allPlants.push({
                  bed_id: fetchedBedIds[i],
                  plant_expected_pick_date: bed.expected_pick_date,
                  plant_date: bed.plant_date,
                  plant_status: bed.status,
                  block_id: bed.block_id,
                  variety_id: bed.variety_id,
                  created_by: personnelId,
                  //screated_at:Date.now()
                });
              }
              Plant.bulkCreate(allPlants, {
                  fields: ["bed_id", "plant_expected_pick_date", "plant_date", "plant_status", "block_id", "variety_id", "created_by"],
                })
                .then(() => {
                  result(null, {
                    message: "Success"
                  });
                }).catch(err => {
                  console.log(err)
                  result({
                    error: err.message
                  }, null);
                })
            })
            .catch(err => {
              console.log(err)
              result({
                error: err.message
              }, null);
            });
        }
      });
    }
  },
  getAllBeds(
    page,
    limit,
    order,
    ordermethod,
    bed_name,
    bed_number,
    block,
    sub_block_name,
    variety,
    plant_date,
    expected_pick_date,
    status,
    result
  ) {
    let where = {};
    let bedwhere = {};
    let subblockwhere = {};
    let blockwhere = {};
    let varietywhere = {};

    if (!isEmpty(bed_name)) {
      bedwhere["bed_name"] = {
        [Op.like]: "%" + bed_name + "%"
      };
    }
    if (!isEmpty(bed_number)) {
      bedwhere["bed_number"] = {
        [Op.like]: "%" + bed_number + "%"
      };
    }

    if (!isEmpty(block)) {
      subblockwhere["block_name"] = {
        [Op.like]: "%" + block + "%"
      };
    }

    if (!isEmpty(sub_block_name)) {
      blockwhere["block_name"] = {
        [Op.like]: "%" + sub_block_name + "%"
      };
    }

    if (!isEmpty(variety)) {
      varietywhere["variety_name"] = {
        [Op.like]: "%" + variety + "%"
      };
    }
    if (!isEmpty(plant_date)) {
      where["plant_date"] = {
        [Op.like]: "%" + plant_date + "%"
      };
    }
    if (!isEmpty(expected_pick_date)) {
      where["plant_expected_pick_date"] = {
        [Op.like]: "%" + expected_pick_date + "%"
      };
    }

    if (!isEmpty(status)) {
      where["parent_status"] = {
        [Op.like]: "%" + status + "%"
      };
    }
    Plant.findAll({
        attributes: [
          "id",
          "plant_expected_pick_date",
          "plant_date",
          "bed_id",
          "block_id",
          "plant_status",
          "variety_id",
          [sequelize.col("plant_bed.bed_name"), "bed_name"],
          [sequelize.col("plant_bed.bed_number"), "bed_number"],
          [sequelize.col("plant_block.block_name"), "block_name"],
          [sequelize.col("plant_variety.variety_name"), "variety_name"],
          [sequelize.col("plant_block.children.block_name"), "parent_block"],
          [sequelize.col("plant_block.children.id"), "parent_id"]
        ],
        offset: page * limit,
        limit: limit,
        raw: true,
        where: where,

        include: [{
            model: Bed,
            as: "plant_bed",
            required: true,
            where: bedwhere,
            attributes: []
          },
          {
            model: Block,
            as: "plant_block",
            required: true,
            where: blockwhere,
            attributes: [],

            include: [{
              model: Block,
              as: "children",
              required: true,
              where: subblockwhere,
              attributes: []
            }]
          },
          {
            model: Variety,
            as: "plant_variety",
            required: true,
            where: varietywhere,
            attributes: []
          }
        ]
      })
      .then(bed => {
        this.countBed(where, (err, total) => {
          if (err) {
            result(err, null);
          } else {
            result(null, {
              rows: total,
              items: bed
            });
          }
        });
      })
      .catch(err => {
        result(err, null);
      });
  },

  updateBed(bedId, bed, personnelId, result) {
    const {
      errors,
      isValid
    } = validateBedUpdateInput(bed);
    if (!isValid) {
      const customError = createError(errors);
      result(customError, null);
    } else {
      this.findBed({
          bed_number: bed.bed_number,
          bed_name: bed.bed_name,
          block_id: bed.block_id
        },
        (err, dbBed) => {
          if (err) {
            const customError = createError(err);
            result(customError, null);
          } else {
            if (dbBed) {
              const customError = createError({
                bed: "Bed already exist"
              });
              result(customError, null);
            } else {
              Bed.findOne({
                  raw: true,
                  attributes: [`bed_number`, `bed_name`],
                  where: {
                    id: bedId
                  }
                })
                .then(fetchedBed => {
                  if (fetchedBed) {
                    Bed.update({
                        bed_number: bed.bed_number,
                        bed_name: bed.bed_name,
                        modified_by: personnelId
                      }, {
                        where: {
                          id: bedId
                        }
                      })
                      .then(updatedBed => {
                        Plant.findOne({
                            raw: true,
                            attributes: [`*`],
                            where: {
                              bed_id: bedId,
                              plant_status: 1
                            }
                          })
                          .then(dbPlant => {
                            const dbPlantVariety = dbPlant.variety_id;
                            if (dbPlantVariety == bed.variety_id) {
                              Plant.update({
                                variety_id: bed.variety_id,
                                bed_id: bedId,
                                plant_date: bed.plant_date,
                                block_id: bed.block_id,
                                status: bed.status,
                                expected_pick_date: bed.expected_pick_date,
                                modified_by: personnelId
                              }, {
                                where: {
                                  bed_id: bedId
                                }
                              });
                            }
                          })
                          .then(() => {});
                        result(null, {
                          message: "Success"
                        }).catch(err => {
                          result(err, null);
                        });
                      })
                      .catch(err => {
                        result(err, null);
                      });
                  } else {
                    const customError = createError({
                      id: "Bed does not exist"
                    });
                    result(customError, null);
                  }
                })
                .catch(err => {
                  result(err, null);
                });
            }
          }
        }
      );
    }
  },

  deleteBed(bedId, result) {
    Bed.findOne({
        raw: true,
        attributes: [`id`, `bed_number`, `bed_name`],
        where: {
          id: bedId
        }
      })
      .then(bed => {
        if (bed) {
          Bed.destroy({
              where: {
                id: bedId
              }
            })
            .then(() => {
              Plant.destroy({
                  where: {
                    bed_id: bedId
                  }
                })
                .then(deletePlant => {
                  // console.log(deletePlant)
                  result(null, {
                    message: "Success"
                  });
                })
                .catch(err => {
                  result(err, null);
                });
            })
            .catch(err => {
              result(err, null);
            });
        } else {
          const customError = createError({
            id: "Bed does not exist"
          });
          result(customError, null);
        }
      })
      .catch(err => {
        const customError = createError(err);
        result(customError, null);
      });
  },

  countBed(where, result) {
    Bed.count({
        where: where
      })
      .then(total => {
        result(null, total);
      })
      .catch(error => {
        result(error, null);
      });
  },
  fetchAllBeds(
    order, ordermethod, result
  ) {

    Plant.findAll({
        attributes: [
          "id",
          "plant_expected_pick_date",
          "plant_date",
          "bed_id",
          "block_id",
          "plant_status",
          "variety_id",
          [sequelize.col("plant_bed.bed_name"), "bed_name"],
          [sequelize.col("plant_bed.bed_number"), "bed_number"],
          [sequelize.col("plant_block.block_name"), "block_name"],
          [sequelize.col("plant_variety.variety_name"), "variety_name"],
          [sequelize.col("plant_block.children.block_name"), "parent_block"],
          [sequelize.col("plant_block.children.id"), "parent_id"]
        ],


        raw: true,


        include: [{
            model: Bed,
            as: "plant_bed",
            required: true,
            // where: bedwhere,
            order: [
              [order, ordermethod]
            ],
            attributes: []
          },
          {
            model: Block,
            as: "plant_block",
            required: true,
            //where: blockwhere,
            attributes: [],

            include: [{
              model: Block,
              as: "children",
              required: true,
              // where: subblockwhere,
              attributes: []
            }]
          },
          {
            model: Variety,
            as: "plant_variety",
            required: true,
            // where: varietywhere,
            attributes: []
          }
        ]
      })

      .then(bed => {
        result(null, bed);
      })

      .catch(err => {
        result(err, null);
      });
  },
  // fetchAllBeds(result) {
  //   Plant.findAll({
  //     attributes: [
  //       "expected_pick_date",
  //       "plant_date",
  //       "bed_id",
  //       "block_id",
  //       "status",
  //       "variety_id",
  //       [sequelize.col("plant_bed.bed_name"), "bed_name"],
  //       [sequelize.col("plant_bed.bed_number"), "bed_number"],
  //       [sequelize.col("plant_block.name"), "name"],
  //       [sequelize.col("plant_variety.variety_name"), "variety_name"]
  //     ],
  //     raw: true,
  //     include: [
  //       {
  //         model: Bed,
  //         as: "plant_bed",
  //         attributes: []
  //       },
  //       {
  //         model: Block,
  //         as: "plant_block",
  //         attributes: []
  //       },
  //       {
  //         model: Variety,
  //         as: "plant_variety",
  //         attributes: []
  //       }
  //     ]
  //   })
  //     .then(beds => {
  //       return result(null, beds);
  //     })
  //     .catch(err => {
  //       result(err, null);
  //     });
  // }
};
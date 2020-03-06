const sequelize = require("sequelize");
const Op = sequelize.Op;

const {
  createError,
  validateBlockInput,
  isEmpty
} = require("../validation");
const Block = require("../../models").Block;
module.exports = {
  findBlock(where, result) {
    Block.findOne({
        raw: true,
        attributes: ["*"],
        where: where
      })
      .then(block => {
        return result(null, block);
      })
      .catch(err => {
        const customError = createError(err.message);
        result(customError, null);
      });
  },
  saveBlock(block, personnelId, result) {
    console.log(block)
    const {
      errors,
      isValid
    } = validateBlockInput(block);
    if (!isValid) {
      const customError = createError(errors);
      result(customError, null);
    } else {
      this.findBlock({
          block_name: block.name
        },
        (err, dbBlock) => {
          if (err) {
            const customError = createError(err);
            result(customError, null);
          } else {
            if (dbBlock) {
              const customError = createError({
                block: "Block already exist"
              });
              result(customError, null);
            } else {
              const attributes = {
                block_name: block.name,
                block_number: block.number,
                created_by: personnelId
              };
              if (!isEmpty(block.parent)) {
                attributes["block_parent"] = block.parent;
              }
              if (!isEmpty(block.block_point_one_latitude)) {
                attributes["block_point_one_latitude"] = block.block_point_one_latitude;
              }
              if (!isEmpty(block.block_point_one_longitude)) {
                attributes["block_point_one_longitude"] = block.block_point_one_longitude;
              }
              if (!isEmpty(block.block_point_two_latitude)) {
                attributes["block_point_two_latitude"] = block.block_point_two_latitude;
              }
              if (!isEmpty(block.block_point_two_longitude)) {
                attributes["block_point_two_longitude"] = block.block_point_two_longitude;
              }
              if (!isEmpty(block.block_point_three_latitude)) {
                attributes["block_point_three_latitude"] = block.block_point_three_latitude;
              }
              if (!isEmpty(block.block_point_four_latitude)) {
                attributes["block_point_four_latitude"] = block.block_point_four_latitude;
              }
              if (!isEmpty(block.block_point_four_latitude)) {
                attributes["block_point_four_latitude"] = block.block_point_four_latitude;
              }
              console.log(attributes)
              Block.create(attributes)
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
          }
        }
      );
    }
  },

  getAllBlocks(page, limit, order, ordermethod, name, parent, result) {
    let where = {};

    if (!isEmpty(name)) {
      where["block_name"] = {
        [Op.like]: "%" + name + "%"
      };
    }
    if (!isEmpty(parent)) {
      where["block_parent"] = {
        [Op.like]: "%" + parent + "%"
      };
    }
    //console.log(where);
    Block.findAll({
        attributes: [
          "id",
          "block_name",
          "block_parent",
          "block_number",
          [sequelize.col("children.block_name"), "parent_name"],
          [sequelize.col("children.id"), "parent_id"]
        ],
        offset: page * limit,
        limit: limit,
        raw: true,
        where: where,
        include: [{
          model: Block,
          as: "children",
          attributes: []
        }]
      })
      .then(block => {
        this.countBlock(where, (err, total) => {
          if (err) {
            result(err, null);
          } else {
            result(null, {
              rows: total,
              items: block
            });
          }
        });
      })
      .catch(err => {
        const customError = createError(err.message);
        result(customError, null);
      });
  },
  updateBlock(blockId, block, personnelId, result) {
    const {
      errors,
      isValid
    } = validateBlockInput(block);
    if (!isValid) {
      const customError = createError(errors);
      result(customError, null);
    } else {
      this.findBlock({
          block_name: block.name
          //number: block.number
          //parent: block.parent
        },
        (err, dbBlock) => {
          if (err) {
            const customError = createError(err);
            result(customError, null);
          } else {
            if (dbBlock) {
              const customError = createError({
                block: "Block already exist"
              });
              result(customError, null);
            } else {
              Block.findByPk(blockId)
                .then(fetchedBlock => {
                  if (fetchedBlock) {
                    const parentBlock = fetchedBlock.parent;
                    //console.log(parentBlock)
                    if (parentBlock != undefined) {
                      Block.update({
                          block_name: block.name,
                          block_parent: block.parent,
                          modified_by: personnelId,
                          updated_at: sequelize.literal("CURRENT_TIMESTAMP")
                        }, {
                          where: {
                            id: blockId
                          }
                        })
                        .then(updatedParentBlock => {
                          result(null, {
                            message: "Success"
                          });
                        })
                        .catch(err => {
                          const customError = createError(err.message);
                          result(customError, null);
                        });
                    } else {
                      Block.update({
                          block_name: block.name,
                          block_number: block.number,
                          modified_by: personnelId,
                          updated_at: sequelize.literal("CURRENT_TIMESTAMP")
                        }, {
                          where: {
                            id: blockId
                          }
                        })
                        .then(updatedParentBlock => {
                          result(null, {
                            message: "Success"
                          });
                        })
                        .catch(err => {
                          const customError = createError(err.message);
                          result(customError, null);
                        });
                    }
                  } else {
                    const customError = createError({
                      id: "Block does not exist"
                    });
                    result(customError, null);
                  }
                })
                .catch(err => {
                  const customError = createError(err.message);
                  result(customError, null);
                });
            }
          }
        }
      );
    }
  },
  deleteBlock(blockId, result) {
    Block.findByPk(blockId)
      .then(block => {
        // console.log(block)

        if (block) {
          const parent = block.block_parent;

          if (parent == undefined) {
            Block.destroy({
                where: {
                  [Op.or]: [{
                      id: blockId
                    },
                    {
                      block_parent: blockId
                    }
                  ]
                }
              })
              .then(() => {
                result(null, {
                  message: "Success"
                });
              })
              .catch(err => {
                const customError = createError(err.message);
                result(customError, null);
              });
          } else {
            Block.destroy({
                where: {
                  id: blockId
                }
              })
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
        } else {
          const customError = createError({
            id: "Block does not exist"
          });
          result(customError, null);
        }
      })
      .catch(err => {
        const customError = createError(err);
        result(customError, null);
      });
  },
  getAllParentBlocks(result) {
    return Block.findAll({
        where: sequelize.literal("block_parent IS NULL")
      })
      .then(block => {
        result(null, block);
      })
      .catch(err => {
        const customError = createError(err.message);
        result(customError, null);
      });
  },
  countBlock(where, result) {
    Block.count({
        where: where
      })
      .then(total => {
        result(null, total);
      })
      .catch(error => {
        result(error, null);
      });
  },
  exportBlock(result) {
    Block.findAll({
        attributes: ["*"],
        raw: true
      })
      .then(block => {
        result(null, block);
      })
      .catch(err => {
        const customError = createError(err.message);
        result(customError, null);
      });
  }
};
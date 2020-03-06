const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const sequelize = require("sequelize");
const Op = sequelize.Op;

const Personnel = require("../../models").Personnel;

const {
  cleanPhone,
  createError,
  validatePersonnelInput,
  validateLoginInput,
  isEmpty,
  validateId
} = require("../validation");

const { keys } = require("../../config");

module.exports = {
  findById(id, result) {
    if (id > 0) {
      Personnel.findOne({
        attributes: [
          "id",
          "personnel_first_name",
          "personnel_phone",
          "personnel_password",
          "personnel_last_name",
          "personnel_reset_password"
        ],
        where: {
          id: id
        }
      })
        .then(personnel => {
          if (personnel) {
            result(null, personnel);
          } else {
            let err = {
              error: "Personel does not exist"
            };
            result(err, null);
          }
        })
        .catch(error => {
          result(error, null);
        });
    } else {
      let err = {
        error: "The ID is not a number"
      };
      result(err, null);
    }
  },
  findPersonnel(where, result) {
    Personnel.findOne({
      raw: true,
      attributes: ["*"],
      where: where
    })
      .then(user => {
        return result(null, user);
      })
      .catch(error => {
        result(error, null);
      });
  },
  login(personnel, result) {
    const { errors, isValid } = validateLoginInput(personnel);

    if (!isValid) {
      const customError = createError(errors);
      result(customError, null);
    } else {
      this.findPersonnel(
        {
          personnel_phone: personnel.phone
        },
        (err, user) => {
          if (err) {
            result(err, null);
          } else {
            if (user) {
              if (user.personnel_reset_password === 1) {
                const customError = createError({
                  password: "Please reset your password"
                });
                result(customError, null);
              } else {
                bcrypt
                  .compare(personnel.password, user.personnel_password)
                  .then(isMatch => {
                    if (isMatch) {
                      const payload = {
                        id: user.id,
                        personnel_first_name: user.personnel_first_name,
                        last_name: user.last_name,
                        phone: user.phone,
                        personnel_type_id: user.personnel_type_id
                      };
                      jwt.sign(
                        payload,
                        keys.secretKey,
                        {
                          expiresIn: 31536000
                        },
                        (err, token) => {
                          if (err) {
                            const customError = createError(err);
                            result(customError, null);
                          } else {
                            const res = {
                              personnel_reset_password: 0,
                              accessToken: token,
                              expires_in: "24h"
                            };
                            result(null, res);
                          }
                        }
                      );
                    } else {
                      const customError = createError({
                        password: "You have entered an incorrect password"
                      });
                      result(customError, null);
                    }
                  });
              }
            } else {
              const customError = createError({
                phone: "Phone does not exist"
              });
              result(customError, null);
            }
          }
        }
      );
    }
  },
  resetPassword(personnel, result) {
    const { errors, isValid } = validateLoginInput(personnel);
    if (!isValid) {
      const customError = createError(errors);
      result(customError, null);
    } else {
      this.findPersonnel(
        {
          personnel_phone: personnel.phone
        },
        (err, user) => {
          if (err) {
            const customError = createError(err);
            result(customError, null);
          } else {
            if (user) {
              if (user.personnel_reset_password !== 1) {
                const customError = createError({
                  password:
                    "Please request an admin permission to reset your password"
                });
                result(customError, null);
              } else {
                // console.log('lusso')

                bcrypt.genSalt(10, (err, salt) => {
                  if (err) {
                    const customError = createError(err);
                    result(customError, null);
                  } else {
                    bcrypt.hash(
                      personnel.personnel_password,
                      salt,
                      (err, hash) => {
                        if (err) {
                          const customError = createError(err);
                          result(customError, null);
                        } else {
                          Personnel.update(
                            {
                              personnel_password: hash,
                              personnel_reset_password: 0
                            },
                            {
                              where: {
                                personnel_phone: personnel.phone
                              }
                            }
                          )
                            .then(() => {
                              result(null, {
                                message: "password successfully reset"
                              });
                            })
                            .catch(err => {
                              const customError = createError(err);
                              result(customError, null);
                            });
                        }
                      }
                    );
                  }
                });
              }
            } else {
              const customError = createError({
                phone: "Phone number does not exist"
              });
              result(customError, null);
            }
          }
        }
      );
    }
  },
  savePersonnel(personnel, personnelId, result) {
    const { errors, isValid } = validatePersonnelInput(personnel);
    if (!isValid) {
      const customError = createError(errors);
      result(customError, null);
    } else {
      this.findPersonnel(
        {
          personnel_phone: personnel.phone
        },
        (err, user) => {
          if (err) {
            const customError = createError(err);
            result(customError, null);
          } else {
            const password = "123456";
            if (user) {
              const customError = createError({
                phone: "Phone already exist"
              });
              result(customError, null);
            } else {
              bcrypt.genSalt(10, (err, salt) => {
                bcrypt.hash(password, salt, (err, hash) => {
                  if (err) {
                    const customError = createError(err);
                    result(customError, null);
                  } else {
                    Personnel.create({
                      personnel_first_name: personnel.first_name,
                      personnel_last_name: personnel.last_name,
                      personnel_phone: personnel.phone,
                      personnel_status: personnel.status,
                      personnel_type_id: personnel.personnel_type_id,
                      personnel_reset_password: 1,
                      personnel_password: hash,
                      created_by: personnelId,
                      modified_by: personnelId
                    })
                      .then(() => {
                        result(null, {
                          message: "Success"
                        });
                      })
                      .catch(err => {
                        const customError = createError(err);
                        result(customError, null);
                      });
                  }
                });
              });
            }
          }
        }
      );
    }
  },
  getAllPersonnel(
    page,
    limit,
    order,
    ordermethod,
    personnel_first_name,
    last_name,
    phone,
    status,
    personnel_type_id,
    result
  ) {
    let where = {};

    if (!isEmpty(phone)) {
      where["personnel_phone"] = {
        [Op.like]: "%" + phone + "%"
      };
    }
    if (!isEmpty(personnel_first_name)) {
      where["personnel_first_name"] = {
        [Op.like]: "%" + personnel_first_name + "%"
      };
    }
    if (!isEmpty(last_name)) {
      where["personnel_last_name"] = {
        [Op.like]: "%" + last_name + "%"
      };
    }
    if (!isEmpty(status)) {
      where["personnel_status"] = {
        [Op.like]: "%" + status + "%"
      };
    }
    if (!isEmpty(personnel_type_id)) {
      where["personnel_type_id"] = {
        [Op.like]: "%" + personnel_type_id + "%"
      };
    }

    Personnel.findAll({
      attributes: [
        ["personnel_first_name", "first_name"],
        ["personnel_last_name", "last_name"],
        ["personnel_phone", "phone"],
        ["personnel_status", "status"],
        "personnel_type_id",
        "id"
      ],
      offset: page * limit,
      limit: limit,
      raw: true,
      where: where,
      order: [[order, ordermethod]]
    })
      .then(personnel => {
        this.countPersonnel(where, (err, total) => {
          if (err) {
            result(err, null);
          } else {
            result(null, {
              rows: total,
              items: personnel
            });
          }
        });
      })
      .catch(err => {
        result(err, null);
      });
  },
  countPersonnel(where, result) {
    Personnel.count({
      where: where
    })
      .then(total => {
        result(null, total);
      })
      .catch(error => {
        result(error, null);
      });
  },
  updatePersonnel(personnelId, personnel, loggedPersonnel, result) {
    const { errors, isValid } = validatePersonnelInput(personnel);
    if (!isValid) {
      const customError = createError(errors);
      result(customError, null);
    } else {
      this.findPersonnel(
        {
          personnel_first_name: personnel.first_name,
          personnel_last_name: personnel.last_name,
          personnel_phone: personnel.phone,
          personnel_status: personnel.status,
          personnel_type_id: personnel.personnel_type_id
        },
        (err, user) => {
          if (err) {
            const customError = createError(err);
            result(customError, null);
          } else {
            if (user) {
              const customError = createError({
                personnel: "Personnel already exist"
              });
              result(customError, null);
            } else {
              Personnel.findByPk(personnelId)
                .then(fetchedPersonnel => {
                  //console.log(fetchedPersonnel)
                  if (fetchedPersonnel) {
                    Personnel.update(
                      {
                        personnel_first_name: personnel.first_name,
                        personnel_last_name: personnel.last_name,
                        personnel_phone: personnel.phone,
                        personnel_status: personnel.status,
                        personnel_type_id: personnel.personnel_type_id,
                        modified_by: loggedPersonnel
                      },
                      {
                        where: {
                          id: personnelId
                        }
                      }
                    )
                      .then(updatedPersonnel => {
                        result(null, {
                          message: "Success"
                        });
                      })
                      .catch(err => {
                        result(err, null);
                      });
                  } else {
                    const customError = createError({
                      id: "Personnel does not exist"
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
  deletePersonnel(personnelId, result) {
    Personnel.findByPk(personnelId)
      .then(personnel => {
        if (personnel) {
          Personnel.destroy({
            where: {
              id: personnelId
            }
          })
            .then(removedPersonnel => {
              result(null, {
                message: "Success"
              });
            })
            .catch(err => {
              result(err, null);
            });
        } else {
          const customError = createError({
            id: "Personnel does not exist"
          });
          result(customError, null);
        }
      })
      .catch(err => {
        const customError = createError(err);
        result(customError, null);
      });
  },
  getScouts(result) {
    where = {
      personnel_type_id: 2
    };

    Personnel.findAll({
      attributes: [
        "id",
        ["personnel_first_name", "first_name"],
        ["personnel_last_name", "last_name"],
        ["personnel_phone", "phone"],
        ["personnel_status", "status"],
        "personnel_type_id"
      ],
      raw: true,
      where: where
    })
      .then(personnel => {
        result(null, personnel);
      })
      .catch(err => {
        result(err, null);
      });
  },
  exportPersonnel(result) {
    Personnel.findAll({
      attributes: [
        ["personnel_first_name", "first_name"],
        ["personnel_last_name", "last_name"],
        ["personnel_phone", "phone"],
        ["personnel_status", "status"],
        "personnel_type_id"
      ],
      raw: true
    })
      .then(personnel => {
        result(null, personnel);
      })
      .catch(err => {
        result(err, null);
      });
  }
};

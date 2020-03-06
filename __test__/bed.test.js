const request = require("supertest");
const app = require("../src/app");

const Bed = require("../models").Bed;
const Plant = require("../models").Plant;
const sequelize = require("sequelize");
const Op = sequelize.Op;

jest.setTimeout(10000);

const phone = "0700000000";
const password = "123456";

const newBed = {
  from: 11000,
  to: 11002,
  block_id: 1,
  variety_id: 1,
  plant_date: "07/02/2020",
  expected_pick_date: "07/02/2022"
};
const newGetBed = {
  from: 1000,
  to: 1005,
  block_id: 1,
  variety_id: 1,
  plant_date: "07/02/2020",
  expected_pick_date: "07/02/2022"
};
const newTestBed = {
  from: 1000000,
  to: 1000000,
  block_id: 1,
  variety_id: 1,
  plant_date: "07/02/2020",
  expected_pick_date: "07/02/2022"
};
let testBed = {
  bed_number: 1000000,
  bed_name: "Bed 1000000",
  block_id: 1,
  created_by: 1
};

describe("Bed", () => {
  //  Create bed
  describe("POST /bed", () => {
    test("Should bulk save beds", done => {
      // jest.setTimeout(30000);
      //login user
      request(app)
        .post("/personnel/login")
        .send({
          phone: phone,
          password: password
        })
        .end((err, res) => {
          if (err) {
            return done(err);
          } else {
            const accessToken = res.body.accessToken;
            Bed.destroy({ where: { bed_number: [11002, 11001, 11000] } })
              .then(() => {
                request(app)
                  .post("/bed")
                  .send(newBed)
                  .set("Authorization", "Bearer " + accessToken)
                  .end((err, res) => {
                    if (err) {
                      return done(err);
                    } else {
                      Bed.findOne({
                        raw: true,
                        where: {
                          bed_number: 11000
                        }
                      })
                        .then(bed => {
                          console.log(bed);
                          expect(res.statusCode).toBe(200);
                          expect(res.body.message).toBe("Success");

                          //Validate bed
                          expect(bed.bed_name).toBe("Bed 11000");
                          expect(bed.bed_number).toBe(11000);
                          // done();

                          Bed.destroy({
                            where: { bed_number: [11000, 11001, 11002] }
                          })
                            .then(() => {
                              Plant.destroy({
                                where: {
                                  plant_date: "07/02/2020"
                                }
                              });
                              done();
                            })
                            .catch(err => {
                              return done(err);
                            });
                        })
                        .catch(err => {
                          return done(err);
                        });
                    }
                  });
              })
              .catch(err => {
                return done(err);
              });
          }
        });
    });
    test("Should return error if bed exist", done => {
      const saveTestBed = {
        from: 1000000,
        to: 1000000,
        block_id: 1,
        variety_id: 1,
        plant_date: "07/02/2020",
        expected_pick_date: "07/02/2022"
      };

      Bed.create(testBed)
        .then(() => {
          request(app)
            .post("/personnel/login")
            .send({
              phone: phone,
              password: password
            })
            .end((err, res) => {
              if (err) {
                return done(err);
              } else {
                const accessToken = res.body.accessToken;
                request(app)
                  .post("/bed")
                  .send(saveTestBed)
                  .set("Authorization", "Bearer " + accessToken)
                  .end((err, res) => {
                    if (err) {
                      return done(err);
                    } else {
                      expect(res.statusCode).toBe(400);
                      expect(res.body.error.bed).toBe("Bed already exist");
                      Bed.destroy({
                        where: { bed_number: [11002, 11001, 11000, 1000000] }
                      })
                        .then(() => {
                          Plant.destroy({
                            where: {
                              plant_date: "07/02/2020"
                            }
                          });
                          done();
                        })
                        .catch(err => {
                          return done(err);
                        });
                    }
                  });
              }
            });
        })
        .catch(err => {
          return done(err);
        });
    });

    test("Should return error if empty fields are provided", done => {
      Bed.destroy({
        where: { bed_number: [11000, 11001, 11002, 1000000] }
      })
        .then(() => {
          request(app)
            .post("/personnel/login")
            .send({
              phone: phone,
              password: password
            })
            .end((err, res) => {
              if (err) {
                return done();
              } else {
                const accessToken = res.body.accessToken;
                const emptyBed = {
                  from: "",
                  to: "",
                  block_id: "",
                  variety_id: "",
                  plant_date: "07/02/2020",
                  expected_pick_date: "07/02/2022"
                };
                request(app)
                  .post("/bed")
                  .send(emptyBed)
                  .set("Authorization", "Bearer " + accessToken)
                  .end((err, res) => {
                    if (err) {
                      return done(err);
                    } else {
                      // console.log(res);
                      const error = res.body.error;
                      expect(res.statusCode).toBe(400);
                      expect(error.from).toBe("From is required");
                      expect(error.to).toBe("To is required");
                      expect(error.block_id).toBe("Block id is required");
                      expect(error.variety_id).toBe("Variety id is required");
                      done();
                    }
                  });
              }
            });
        })
        .catch(err => {
          return done(err);
        });
    });

    test("Should return error if personnel is not logged in", done => {
      request(app)
        .post(`/bed`)
        .end((err, res) => {
          if (err) {
            return done(err);
          } else {
            expect(res.statusCode).toBe(401);
            done();
          }
        });
    });
  });

  // Patch request on bed
  describe("PATCH /bed/:bedId", () => {
    test("Should update bed", done => {
      Bed.destroy({ where: { bed_number: [1000000, 1100000] } })
        .then(() => {
          request(app)
            .post("/personnel/login")
            .send({
              phone: phone,
              password: password
            })
            .end((err, res) => {
              const accessToken = res.body.accessToken;

              request(app)
                .post("/bed")
                .set("Authorization", "Bearer " + accessToken)
                .send(newTestBed)
                .end((err, resCreate) => {
                  if (err) {
                    return done(err);
                  } else {
                    Bed.findOne({
                      bed_number: 1000000
                    }).then(dbBed => {
                      const id = dbBed.id;
                      request(app)
                        .patch("/bed/" + id)
                        .set("Authorization", "Bearer " + accessToken)
                        .send({
                          bed_number: 1100000,
                          bed_name: "test bed",
                          block_id: 1,
                          variety_id: 1,
                          plant_date: "07/02/2021",
                          expected_pick_date: "07/02/2021"
                        })
                        .end((err, resUpdate) => {
                          Bed.findOne({
                            raw: true,
                            attributes: [`bed_number`, `bed_name`],
                            where: {
                              bed_number: 1100000
                            }
                          })
                            .then(bed => {
                              expect(resUpdate.statusCode).toBe(200);
                              expect(resUpdate.body.message).toBe("Success");
                              //Validate bed
                              expect(bed.bed_number).toBe(1100000);
                              expect(bed.bed_name).toBe("test bed");
                              Bed.destroy({
                                where: { bed_number: [1000000, 1100000] }
                              }).then(() => {
                                Plant.destroy({
                                  where: {
                                    plant_date: "07/02/2021"
                                  }
                                }).then(() => {
                                  done();
                                });
                              });
                            })
                            .catch(err => {
                              return done(err);
                            });
                        });
                    });
                  }
                });
            });
        })
        .catch(err => {
          return done(err);
        });
    });

    test("Update should return error if empty fields are provided", done => {
      Bed.destroy({ where: { bed_number: [1000000, 1100000] } })
        .then(() => {
          request(app)
            .post("/personnel/login")
            .send({
              phone: phone,
              password: password
            })
            .end((err, res) => {
              const accessToken = res.body.accessToken;

              request(app)
                .post("/bed")
                .set("Authorization", "Bearer " + accessToken)
                .send(newTestBed)
                .end((err, resCreate) => {
                  if (err) {
                    return done(err);
                  } else {
                    Bed.findOne({
                      bed_number: 1000000
                    }).then(dbBed => {
                      const id = dbBed.id;
                      request(app)
                        .patch("/bed/" + id)
                        .set("Authorization", "Bearer " + accessToken)
                        .send({
                          bed_number: "",
                          bed_name: "",
                          block_id: "",
                          variety_id: "",
                          plant_date: "07/02/2021",
                          expected_pick_date: "07/02/2021"
                        })
                        .end((err, resUpdate) => {
                          expect(resUpdate.statusCode).toBe(400);
                          const error = resUpdate.body.error;
                          //Validate bed
                          expect(error.bed_number).toBe(
                            "Bed number is required"
                          );
                          expect(error.block_id).toBe("Block id is required");
                          expect(error.variety_id).toBe(
                            "Variety id is required"
                          );
                          Bed.destroy({
                            where: { bed_number: [1000000, 1100000] }
                          }).then(() => {
                            Plant.destroy({
                              where: {
                                plant_date: "07/02/2021"
                              }
                            }).then(() => {
                              done();
                            });
                          });
                        });
                    });
                  }
                });
            });
        })
        .catch(err => {
          return done(err);
        });
    });

    test("Should return error if bed exist", done => {
      Bed.destroy({ where: { bed_number: [1000000, 1100000] } })
        .then(() => {
          request(app)
            .post("/personnel/login")
            .send({
              phone: phone,
              password: password
            })
            .end((err, res) => {
              const accessToken = res.body.accessToken;

              request(app)
                .post("/bed")
                .set("Authorization", "Bearer " + accessToken)
                .send(newTestBed)
                .end((err, resCreate) => {
                  if (err) {
                    return done(err);
                  } else {
                    Bed.findOne({
                      bed_number: 1000000
                    }).then(dbBed => {
                      const id = dbBed.id;
                      request(app)
                        .patch("/bed/" + id)
                        .set("Authorization", "Bearer " + accessToken)
                        .send({
                          bed_number: 1000000,
                          bed_name: "Bed 1000000",
                          block_id: 1,
                          variety_id: 1,
                          plant_date: "07/02/2020",
                          expected_pick_date: "07/02/2022"
                        })
                        .end((err, resUpdate) => {
                          expect(resUpdate.statusCode).toBe(400);
                          expect(resUpdate.body.error.bed).toBe(
                            "Bed already exist"
                          );
                          Bed.destroy({
                            where: { bed_number: [1000000, 1100000] }
                          }).then(() => {
                            Plant.destroy({
                              where: {
                                plant_date: ["07/02/2020", "07/02/2021"]
                              }
                            }).then(() => {
                              done();
                            });
                          });
                        });
                    });
                  }
                });
            });
        })
        .catch(err => {
          return done(err);
        });
    });

    test("Should return error if id does not exist", done => {
      const id = "1000000";
      request(app)
        .post("/personnel/login")
        .send({
          phone: phone,
          password: password
        })
        .end((err, res) => {
          const accessToken = res.body.accessToken;
          const url = `/bed/${id}`;
          request(app)
            .patch(url)
            .set("Authorization", "Bearer " + accessToken)
            .send({
              bed_number: 1000000,
              bed_name: "Bed1000000",
              block_id: 1,
              variety_id: 1,
              plant_date: "07/02/2020",
              expected_pick_date: "07/02/2022"
            })
            .end((err, res) => {
              if (err) {
                return done(err);
              }
              expect(res.statusCode).toBe(400);
              const error = res.body.error;
              expect(error.id).toBe("Bed does not exist");
              done();
            });
        });
    });
    test("Update should return error if personnel is not logged in", done => {
      request(app)
        .patch(`/bed/8`)
        .end((err, res) => {
          if (err) {
            return done(err);
          } else {
            expect(res.statusCode).toBe(401);
            done();
          }
        });
    });
  });

  describe("GET /bed", () => {
    test("Should get all beds", done => {
      Bed.destroy({
        where: { bed_number: [1000, 1001, 1002, 1003, 1004, 1005] }
      })
        .then(() => {
          request(app)
            .post("/personnel/login")
            .send({
              phone: phone,
              password: password
            })
            .end((err, res) => {
              const accessToken = res.body.accessToken;

              request(app)
                .post("/bed")
                .set("Authorization", "Bearer " + accessToken)
                .send(newGetBed)
                .end((err, resCreate) => {
                  if (err) {
                    return done(err);
                  } else {
                    request(app)
                      .get(`/bed?page=0&limit=5`)
                      .set("Authorization", "Bearer " + accessToken)
                      .end((err, res) => {
                        if (err) {
                          return done(err);
                        } else {
                          expect(res.statusCode).toBe(200);
                          expect(res.body.items.length).toBe(5);

                          const bed = res.body.items[1];
                          //console.log(bed);
                          expect(bed.expected_pick_date).toBeDefined();
                          expect(bed.plant_date).toBeDefined();
                          expect(bed.bed_id).toBeDefined();
                          expect(bed.block_id).toBeDefined();
                          expect(bed.bed_name).toBeDefined();
                          expect(bed.bed_number).toBeDefined();
                          Bed.destroy({
                            where: {
                              bed_number: [1000, 1001, 1002, 1003, 1004, 1005]
                            }
                          }).then(() => {
                            Plant.destroy({
                              where: {
                                plant_date: [
                                  "07/02/2020",
                                  "07/02/2021",
                                  "07/02/2022"
                                ]
                              }
                            }).then(() => {
                              done();
                            });
                          });
                        }
                      });
                  }
                });
            });
        })
        .catch(err => {
          return done(err);
        });
    });
    test("Should search bed by block name", done => {
      Bed.destroy({
        where: { bed_number: [1000, 1001, 1002, 1003, 1004, 1005] }
      })
        .then(() => {
          request(app)
            .post("/personnel/login")
            .send({
              phone: phone,
              password: password
            })
            .end((err, res) => {
              const accessToken = res.body.accessToken;

              request(app)
                .post("/bed")
                .set("Authorization", "Bearer " + accessToken)
                .send(newGetBed)
                .end((err, resCreate) => {
                  if (err) {
                    return done(err);
                  } else {
                    request(app)
                      .get(`/bed?page=0&limit=5&block_name=13`)
                      .set("Authorization", "Bearer " + accessToken)
                      .end((err, res) => {
                        if (err) {
                          return done(err);
                        } else {
                          expect(res.statusCode).toBe(200);

                          const bed = res.body.items[0];
                          //console.log(bed);
                          expect(bed.expected_pick_date).toBeDefined();
                          expect(bed.plant_date).toBeDefined();
                          expect(bed.bed_id).toBeDefined();
                          expect(bed.block_id).toBeDefined();
                          expect(bed.bed_name).toBeDefined();
                          expect(bed.bed_number).toBeDefined();
                          done();
                          Bed.destroy({
                            where: {
                              bed_number: [1000, 1001, 1002, 1003, 1004, 1005]
                            }
                          }).then(() => {
                            Plant.destroy({
                              where: {
                                plant_date: [
                                  "07/02/2020",
                                  "07/02/2021",
                                  "07/02/2022"
                                ]
                              }
                            }).then(() => {
                              done();
                            });
                          });
                        }
                      });
                  }
                });
            });
        })
        .catch(err => {
          return done(err);
        });
    });
    test("Should search bed by expected pick date", done => {
      Bed.destroy({
        where: { bed_number: [1000, 1001, 1002, 1003, 1004, 1005] }
      })
        .then(() => {
          request(app)
            .post("/personnel/login")
            .send({
              phone: phone,
              password: password
            })
            .end((err, res) => {
              const accessToken = res.body.accessToken;

              request(app)
                .post("/bed")
                .set("Authorization", "Bearer " + accessToken)
                .send(newGetBed)
                .end((err, resCreate) => {
                  if (err) {
                    return done(err);
                  } else {
                    request(app)
                      .get(
                        `/bed?page=0&limit=5&expected_pick_date= "07/02/2022"`
                      )
                      .set("Authorization", "Bearer " + accessToken)
                      .end((err, res) => {
                        if (err) {
                          return done(err);
                        } else {
                          expect(res.statusCode).toBe(200);

                          const bed = res.body.items[0];
                          //console.log(bed);
                          expect(bed.expected_pick_date).toBeDefined();
                          expect(bed.plant_date).toBeDefined();
                          expect(bed.bed_id).toBeDefined();
                          expect(bed.block_id).toBeDefined();
                          expect(bed.bed_name).toBeDefined();
                          expect(bed.bed_number).toBeDefined();
                          done();
                          Bed.destroy({
                            where: {
                              bed_number: [1000, 1001, 1002, 1003, 1004, 1005]
                            }
                          }).then(() => {
                            Plant.destroy({
                              where: {
                                plant_date: [
                                  "07/02/2020",
                                  "07/02/2021",
                                  "07/02/2022"
                                ]
                              }
                            }).then(() => {
                              done();
                            });
                          });
                        }
                      });
                  }
                });
            });
        })
        .catch(err => {
          return done(err);
        });
    });
    test("Should search bed by plant date", done => {
      Bed.destroy({
        where: { bed_number: [1000, 1001, 1002, 1003, 1004, 1005] }
      })
        .then(() => {
          request(app)
            .post("/personnel/login")
            .send({
              phone: phone,
              password: password
            })
            .end((err, res) => {
              const accessToken = res.body.accessToken;

              request(app)
                .post("/bed")
                .set("Authorization", "Bearer " + accessToken)
                .send(newGetBed)
                .end((err, resCreate) => {
                  if (err) {
                    return done(err);
                  } else {
                    request(app)
                      .get(`/bed?page=0&limit=5& plant_date: "07/02/2020","`)
                      .set("Authorization", "Bearer " + accessToken)
                      .end((err, res) => {
                        if (err) {
                          return done(err);
                        } else {
                          expect(res.statusCode).toBe(200);

                          const bed = res.body.items[0];
                          //console.log(bed);
                          expect(bed.expected_pick_date).toBeDefined();
                          expect(bed.plant_date).toBeDefined();
                          expect(bed.bed_id).toBeDefined();
                          expect(bed.block_id).toBeDefined();
                          expect(bed.bed_name).toBeDefined();
                          expect(bed.bed_number).toBeDefined();
                          done();
                          Bed.destroy({
                            where: {
                              bed_number: [1000, 1001, 1002, 1003, 1004, 1005]
                            }
                          }).then(() => {
                            Plant.destroy({
                              where: {
                                plant_date: [
                                  "07/02/2020",
                                  "07/02/2021",
                                  "07/02/2022"
                                ]
                              }
                            }).then(() => {
                              done();
                            });
                          });
                        }
                      });
                  }
                });
            });
        })
        .catch(err => {
          return done(err);
        });
    });
  });

  describe("GET /bed/all", () => {
    test("Should get all beds without pagination", done => {
      Bed.destroy({
        where: { bed_number: [1000, 1001, 1002, 1003, 1004, 1005] }
      })
        .then(() => {
          request(app)
            .post("/personnel/login")
            .send({
              phone: phone,
              password: password
            })
            .end((err, res) => {
              const accessToken = res.body.accessToken;

              request(app)
                .post("/bed")
                .set("Authorization", "Bearer " + accessToken)
                .send(newGetBed)
                .end((err, resCreate) => {
                  if (err) {
                    return done(err);
                  } else {
                    request(app)
                      .get(`/bed/all`)
                      .set("Authorization", "Bearer " + accessToken)
                      .end((err, res) => {
                        if (err) {
                          return done(err);
                        } else {
                          expect(res.statusCode).toBe(200);
                          const bed = res.body[1];
                          //console.log(bed);
                          expect(bed.expected_pick_date).toBeDefined();
                          expect(bed.plant_date).toBeDefined();
                          expect(bed.bed_id).toBeDefined();
                          expect(bed.block_id).toBeDefined();
                          expect(bed.bed_name).toBeDefined();
                          expect(bed.bed_number).toBeDefined();
                          Bed.destroy({
                            where: {
                              bed_number: [1000, 1001, 1002, 1003, 1004, 1005]
                            }
                          }).then(() => {
                            Plant.destroy({
                              where: {
                                plant_date: [
                                  "07/02/2020",
                                  "07/02/2021",
                                  "07/02/2022"
                                ]
                              }
                            }).then(() => {
                              done();
                            });
                          });
                        }
                      });
                  }
                });
            });
        })
        .catch(err => {
          return done(err);
        });
    });
  });
});

const request = require("supertest");
const app = require("../src/app");

const Block = require("../models").Block;
const sequelize = require("sequelize");
const Op = sequelize.Op;

jest.setTimeout(10000);

const phone = "0700000000";
const password = "123456";

const newParentBlock = {
  name: "Test parent Block",
  number: 1
};
const newChildBlock = {
  name: "Test child Block",
  parent: 1
};

describe("Block", () => {
  //  Create block
  describe("POST /block", () => {
    test("Should save a block", done => {
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
            Block.destroy({
              where: {
                block_name: newParentBlock.name
              }
            })
              .then(() => {
                request(app)
                  .post("/block")
                  .send(newParentBlock)
                  .set("Authorization", "Bearer " + accessToken)
                  .end((err, res) => {
                    if (err) {
                      return done(err);
                    } else {
                      Block.findOne({
                        raw: true,
                        where: {
                          block_name: newParentBlock.name
                        }
                      })
                        .then(block => {
                          expect(res.statusCode).toBe(200);
                          expect(res.body.message).toBe("Success");

                          //Validate block
                          expect(newParentBlock.name).toBe(block.block_name);
                          expect(newParentBlock.number).toBe(
                            block.block_number
                          );

                          Block.destroy({
                            where: {
                              block_name: newParentBlock.name
                            }
                          })
                            .then(() => {
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

    test("Should return error if block exist", done => {
      let testBlock = {
        block_name: "Test parent Block",
        block_number: 1,
        created_by: 1,
        modified_by: 1
      };

      Block.create(testBlock)
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
                  .post("/block")
                  .send(newParentBlock)
                  .set("Authorization", "Bearer " + accessToken)
                  .end((err, res) => {
                    if (err) {
                      return done(err);
                    } else {
                      expect(res.statusCode).toBe(400);
                      expect(res.body.error.block).toBe("Block already exist");
                      Block.destroy({
                        where: {
                          block_name: newParentBlock.name
                        }
                      })
                        .then(() => {
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
      const newChildBlockT = {
        block_name: ""
      };

      Block.destroy({
        where: {
          block_name: newParentBlock.name
        }
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
                request(app)
                  .post("/block")
                  .send(newChildBlockT)
                  .set("Authorization", "Bearer " + accessToken)
                  .end((err, res) => {
                    if (err) {
                      return done(err);
                    } else {
                      const error = res.body.error;

                      expect(res.statusCode).toBe(400);
                      expect(error.name).toBe("Block name is required");
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
        .post(`/block`)
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

  // Get request on block
  describe("GET /block", () => {
    test("Should get all block", done => {
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
              .get(`/block?page=0&limit=5`)
              .set("Authorization", "Bearer " + accessToken)
              .end((err, res) => {
                if (err) {
                  return done(err);
                } else {
                  expect(res.statusCode).toBe(200);
                  expect(res.body.items.length).toBe(5);
                  const block = res.body.items[1];
                  expect(block.block_name).toBeDefined();
                  done();
                }
              });
          }
        });
    });

    test("Should search block by name", done => {
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
              .get(`/block?page=0&limit=5&name=Block 1`)
              .set("Authorization", "Bearer " + accessToken)
              .end((err, res) => {
                if (err) {
                  return done(err);
                } else {
                  expect(res.statusCode).toBe(200);
                  const block = res.body.items[0];
                  expect(block.block_name).toBe("Block 1");
                  expect(block.block_number).toBeDefined();
                  done();
                }
              });
          }
        });
    });

    test("Should search block by parent", done => {
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
              .get(`/block?page=0&limit=5&parent=1`)
              .set("Authorization", "Bearer " + accessToken)
              .end((err, res) => {
                if (err) {
                  return done(err);
                } else {
                  expect(res.statusCode).toBe(200);
                  const block = res.body.items[0];
                  expect(block.block_parent).toBe(1);
                  expect(block.block_number).toBeDefined();
                  expect(block.block_parent).toBeDefined();
                  done();
                }
              });
          }
        });
    });

    test("Should return error if personnel is not logged in", done => {
      request(app)
        .get(`/block`)
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

  // // Patch request on block
  describe("PATCH /block/:blockId", () => {
    test("Should update block", done => {
      Block.destroy({
        where: {
          [Op.or]: [
            {
              block_name: newParentBlock.name
            },
            {
              block_name: "Updated parent block"
            }
          ]
        }
      })
        .then(() => {
          let testBlock = {
            block_name: "Test parent Block",
            block_number: 1,
            created_by: 1,
            modified_by: 1
          };

          Block.create(testBlock)
            .then(block => {
              const id = block.id;
              request(app)
                .post("/personnel/login")
                .send({
                  phone: phone,
                  password: password
                })
                .end((err, res) => {
                  const accessToken = res.body.accessToken;

                  request(app)
                    .patch("/block/" + id)
                    .set("Authorization", "Bearer " + accessToken)
                    .send({
                      name: "Updated parent block",
                      number: 3
                    })
                    .end((err, resUpdate) => {
                      if (err) {
                        return done(err);
                      } else {
                        Block.findOne({
                          where: {
                            id: id
                          }
                        })
                          .then(block => {
                            expect(resUpdate.statusCode).toBe(200);
                            expect(resUpdate.body.message).toBe("Success");

                            //Validate block
                            expect(block.block_name).toBe(
                              "Updated parent block"
                            );
                            expect(block.block_number).toBe(3);

                            Block.destroy({
                              where: {
                                [Op.or]: [
                                  {
                                    block_name: newParentBlock.name
                                  },
                                  {
                                    block_name: "Updated parent block"
                                  }
                                ]
                              }
                            })
                              .then(() => {
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
                });
            })
            .catch(err => {
              return done(err);
            });
        })
        .catch(err => {
          return done(err);
        });
    });

    test("Update should return error if empty fields are provided", done => {
      Block.destroy({
        where: {
          [Op.or]: [
            {
              block_name: newParentBlock.name
            },
            {
              block_name: "Updated parent block"
            }
          ]
        }
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
                return done(err);
              }
              const accessToken = res.body.accessToken;
              const url = `/block/1`;
              request(app)
                .patch(url)
                .set("Authorization", "Bearer " + accessToken)
                .send({
                  name: "",
                  number: ""
                })
                .end((err, res) => {
                  if (err) {
                    return done();
                  } else {
                    expect(res.statusCode).toBe(400);
                    const error = res.body.error;
                    //Validate personnel
                    expect(error.name).toBe("Block name is required");
                    done();
                  }
                });
            });
        })
        .catch(err => {
          return done(err);
        });
    });

    test("Update should return error if block details exist", done => {
      Block.destroy({
        where: {
          [Op.or]: [
            {
              block_name: "Test parent Block"
            },
            {
              block_name: "Updated parent block"
            }
          ]
        }
      })
        .then(() => {
          let testBlock = {
            block_name: "Test parent Block",
            block_number: 1,
            created_by: 1,
            modified_by: 1
          };

          Block.create(testBlock)
            .then(block => {
              const id = block.id;
              request(app)
                .post("/personnel/login")
                .send({
                  phone: phone,
                  password: password
                })
                .end((err, res) => {
                  if (err) {
                    return done(err);
                  }
                  const accessToken = res.body.accessToken;
                  const url = `/block/${id}`;
                  request(app)
                    .patch(url)
                    .set("Authorization", "Bearer " + accessToken)
                    .send({
                      name: "Test parent Block",
                      number: 1
                    })
                    .end((err, res) => {
                      if (err) {
                        return done();
                      } else {
                        expect(res.statusCode).toBe(400);
                        const error = res.body.error;
                        expect(error.block).toBe("Block already exist");
                        Block.destroy({
                          where: {
                            [Op.or]: [
                              {
                                block_name: testBlock.block_name
                              },
                              {
                                block_name: "Updated parent block"
                              }
                            ]
                          }
                        })
                          .then(() => {
                            done();
                          })
                          .catch(err => {
                            return done(err);
                          });
                      }
                    });
                });
            })
            .catch(err => {
              return done(err);
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
          const url = `/block/${id}`;
          request(app)
            .patch(url)
            .set("Authorization", "Bearer " + accessToken)
            .send({
              name: "Block21",
              number: 21
            })
            .end((err, res) => {
              if (err) {
                return done(err);
              }
              expect(res.statusCode).toBe(400);

              const error = res.body.error;

              expect(error.id).toBe("Block does not exist");

              done();
            });
        });
    });

    test("Update should return error if personnel is not logged in", done => {
      request(app)
        .patch(`/block/8`)
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

  //  Delete block
  describe("DELETE /block/:blockId", () => {
    test("Should delete a block", done => {
      Block.destroy({
        where: {
          block_name: newParentBlock.name
        }
      })
        .then(() => {
          let testBlock = {
            block_name: "Test parent Block",
            block_number: 1,
            created_by: 1,
            modified_by: 1
          };

          Block.create(testBlock)
            .then(block => {
              const id = block.id;
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
                    const url = `/block/${id}`;
                    request(app)
                      .delete(url)
                      .set("Authorization", "Bearer " + accessToken)
                      .end((err, res) => {
                        if (err) {
                          return done(err);
                        } else {
                          expect(res.statusCode).toBe(200);
                          expect(res.body.message).toBe("Success");
                          done();
                        }
                      });
                  }
                });
            })
            .catch(err => {
              return done(err);
            });
        })
        .catch(err => {
          return done(err);
        });
    });

    test("Delete should return error if id is not a number", done => {
      const id = "s";
      request(app)
        .post("/personnel/login")
        .send({
          phone: phone,
          password: password
        })
        .end((err, res) => {
          const accessToken = res.body.accessToken;
          const url = `/block/${id}`;
          request(app)
            .delete(url)
            .set("Authorization", "Bearer " + accessToken)
            .end((err, res) => {
              if (err) {
                return done(err);
              }
              expect(res.statusCode).toBe(400);

              const error = res.body.error;

              expect(error.id).toBe("No id provided");

              done();
            });
        });
    });

    test("Update should return error if personnel is not logged in", done => {
      request(app)
        .delete(`/block/8`)
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

  // Get request on all parent block
  describe("GET /block/parent-block", () => {
    test("Should get all parent blocks", done => {
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
              .get(`/block/parent-block`)
              .set("Authorization", "Bearer " + accessToken)
              .end((err, res) => {
                if (err) {
                  return done(err);
                } else {
                  expect(res.statusCode).toBe(200);
                  done();
                }
              });
          }
        });
    });
  });

  // // Get request on all  block without pagination
  describe("GET /block/all", () => {
    test("Should get all  blocks without pagination", done => {
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
              .get(`/block/all`)
              .set("Authorization", "Bearer " + accessToken)
              .end((err, res) => {
                if (err) {
                  return done(err);
                } else {
                  expect(res.statusCode).toBe(200);
                  done();
                }
              });
          }
        });
    });
  });
});

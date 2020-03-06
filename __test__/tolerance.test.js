const request = require("supertest");
const app = require("../src/app");

const Tolerance = require("../models").Tolerance;
const sequelize = require("sequelize");
const Op = sequelize.Op;

jest.setTimeout(10000);

const phone = "0700000000";
const password = "123456";
const newTolerance = {
    tolerance_name: "Score 12",
    tolerance_type_id: 1,
    tolerance_from: 1,
    tolerance_to: 10,
    created_by: 1,
    modified_by: 1,
    created_at: new Date(),
    updated_at: new Date(),
};

const testTolerance = {
    tolerance_name: "Score 13",
    tolerance_type_id: 1,
    tolerance_from: 2,
    tolerance_to: 9,
    created_by: 1,
    modified_by: 1,
    created_at: new Date(),
    updated_at: new Date(),
};

describe("Tolerance", () => {
    //  Create tolerance
    describe("POST /tolerance", () => {
        test("Should save a tolerance", done => {
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
                        Tolerance.destroy({
                            where: {
                                tolerance_name: newTolerance.tolerance_name
                            }
                        })
                            .then(() => {
                                request(app)
                                    .post("/tolerance")
                                    .send(newTolerance)
                                    .set("Authorization", "Bearer " + accessToken)
                                    .end((err, res) => {
                                        if (err) {
                                            return done(err);
                                        } else {
                                            Tolerance.findOne({
                                                    where: {
                                                        tolerance_name: newTolerance.tolerance_name
                                                    }
                                                })
                                                .then(tolerance => {
                                                    expect(res.statusCode).toBe(200);
                                                    expect(res.body.message).toBe("Success");

                                                    //Validate personnel
                                                    expect(tolerance.tolerance_name).toBe("Score 12");
                                                    expect(tolerance.tolerance_type_id).toBe(1);

                                                    Tolerance.destroy({
                                                            where: {
                                                                tolerance_name: newTolerance.tolerance_name
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

        test('Should return an error if tolerance exists', (done) => {
            //login user
            request(app)
                .post('/personnel/login')
                .send({
                    phone: phone,
                    password: password
                })
                .end((err, res) => {
                    if (err) {
                        return done(err);
                    } else {
                        const accessToken = res.body.accessToken;

                        Tolerance.create(testTolerance)
                            .then(() => {
                                request(app)
                                    .post("/tolerance")
                                    .send(newTolerance)
                                    .set("Authorization", "Bearer " + accessToken)
                                    .end((err, res) => {
                                        if (err) {
                                            return done(err);
                                        } else {
                                            Tolerance.findOne({
                                                    where: {
                                                        tolerance_name: newTolerance.tolerance_name
                                                    }
                                                })
                                                .then(tolerance => {
                                                    expect(res.statusCode).toBe(400);
                                                    expect(res.body.error.tolerance).toBe("Tolerance already exist");

                                                    Tolerance.destroy({
                                                            where: {
                                                                tolerance_name: newTolerance.tolerance_name
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
                })
        });

        test('Tolerance should return an error if empty fields are provided', (done) => {
            //login user
            request(app)
                .post('/personnel/login')
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
                            .post("/tolerance")
                            .send({
                                tolerance_name: "",
                                tolerance_type_id: ""
                            })
                            .set('Authorization', 'Bearer ' + accessToken)
                            .end((err, res) => {
                                if (err) {
                                    return done(err);
                                } else {
                                    expect(res.statusCode).toBe(400);
                                    expect("Tolerance name is required").toBe(res.body.error.tolerance_name);
                                    expect("Tolerance type ID is required").toBe(res.body.error.tolerance_type_id);
                                    done();
                                }
                            });
                    }
                })
        });

        test('Tolerance should return an error if personnel is not logged in', (done) => {
            request(app)
                .post(`/tolerance`)
                .end((err, res) => {
                    if (err) {
                        return done(err);
                    } else {
                        expect(res.statusCode).toBe(401);
                        done();
                    }
                })
        })
    });

    //  List tolerances
    describe("GET /tolerance", () => {
        test('Should get all tolerances', (done) => {
            request(app)
                .post('/personnel/login')
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
                            .get(`/tolerance?page=0&limit=5`)
                            .set('Authorization', 'Bearer ' + accessToken)
                            .end((err, res) => {
                                if (err) {
                                    return done(err);
                                } else {
                                    expect(res.statusCode).toBe(200);
                                    expect(res.body.items.length).toBe(5);

                                    expect(res.body.items[1].tolerance_name).toBe('Score 1');
                                    expect(res.body.items[1].tolerance_type_id).toBe(2);
                                    done();
                                }
                            })
                    }
                });
        });

        test('Should search tolerance by tolerance name', (done) => {
            request(app)
                .post('/personnel/login')
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
                            .get(`/tolerance?page=0&limit=5&tolerance_name="Score 1"`)
                            .set('Authorization', 'Bearer ' + accessToken)
                            .end((err, res) => {
                                if (err) {
                                    return done(err);
                                } else {
                                    expect(res.statusCode).toBe(200);
                                    expect(res.body.items.length).toBe(1);

                                    expect(res.body.items[0].tolerance_name).toBe('score 1');
                                    expect(res.body.items[0].tolerance_type_id).toBe(1);
                                    done();
                                }
                            })
                    }
                })
        });

        test('Should search tolerance by tolerance type id', (done) => {
            request(app)
                .post('/personnel/login')
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
                            .get(`/tolerance?page=0&limit=5&tolerance_type_id=2`)
                            .set('Authorization', 'Bearer ' + accessToken)
                            .end((err, res) => {
                                if (err) {
                                    return done(err);
                                } else {
                                    expect(res.statusCode).toBe(200);
                                    expect(res.body.items.length).toBe(2);

                                    expect(res.body.items[0].tolerance_name).toBe('Score 1');
                                    expect(res.body.items[0].tolerance_type_id).toBe(4);
                                    done();
                                }
                            })
                    }
                });
        });

        test('Should return error if personnel is not logged in', (done) => {
            request(app)
                .get(`/tolerance`)
                .end((err, res) => {
                    if (err) {
                        return done(err);
                    } else {
                        expect(res.statusCode).toBe(401);
                        done();
                    }
                })
        });
    });

    // Update tolerance
    describe("PATCH /tolerance/:toleranceId", () => {
        test('Should update tolerance', (done) => {
            request(app)
                .post('/personnel/login')
                .send({
                    phone: phone,
                    password: password
                })
                .end((err, res) => {
                    if (err) {
                        return done(err);
                    } else {
                        const accessToken = res.body.accessToken;
                        const url = `/tolerance/1`;
                        request(app)
                            .patch(url)
                            .set('Authorization', 'Bearer ' + accessToken)
                            .send({
                                "tolerance_name": "update tolerance name",
                                "tolerance_from": 3,
                                "tolerance_to": 7,
                                "tolerance_type_id": 1
                            })
                            .set('Authorization', 'Bearer ' + accessToken)
                            .end((err, resUpdate) => {
                                if (err) {
                                    return done(err);
                                } else {
                                    Tolerance
                                        .findOne({
                                            where: {
                                                id: 1
                                            }
                                        })
                                        .then((tolerance) => {
                                            expect(resUpdate.statusCode).toBe(200);
                                            expect(resUpdate.body.message).toBe("Success");
                                            expect(tolerance.tolerance_name).toBe("update tolerance name");
                                            expect(tolerance.tolerance_type_id).toBe(3);
                                            expect(tolerance.tolerance_from).toBe(3);
                                            expect(tolerance.tolerance_to).toBe(8);

                                            Tolerance
                                                .update({
                                                    tolerance_name: "Downey Mildew-Fresh",
                                                    tolerance_type_id: 2,
                                                    tolerance_from: 4,
                                                    tolerance_to: 2
                                                }, {
                                                    where: {
                                                        id: 1
                                                    }
                                                })
                                                .then(() => {
                                                    done();
                                                })
                                                .catch(err => {
                                                    return done(err);
                                                })
                                        })
                                        .catch(err => {
                                            return done(err);
                                        })
                                }
                            })
                    }
                })
        });

        test('Should return error if empty fields are provided', (done) => {
            //Login user
            request(app)
                .post('/personnel/login')
                .send({
                    phone: phone,
                    password: password
                })
                .end((err, res) => {
                    if (err) {
                        return done(err);
                    } else {
                        const accessToken = res.body.accessToken;
                        const url = `/tolerance/1`;
                        request(app)
                            .patch(url)
                            .set('Authorization', 'Bearer ' + accessToken)
                            .send({
                                tolerance_name: "",
                                tolerance_from: "",
                                tolerance_to: "",
                                tolerance_type_id: ""
                            })
                            .end((err, resUpdate) => {
                                if (err) {
                                    return done(err);
                                } else {
                                    expect(resUpdate.statusCode).toBe(400);
                                    const error = resUpdate.body.error;

                                    expect(error.tolerance_name).toBe("Tolerance name is required");
                                    expect(error.tolerance_from).toBe("Tolerance from is required");
                                    expect(error.tolerance_from).toBe("Tolerance to is required");
                                    expect(error.tolerance_type_id).toBe("Tolerance type is required");

                                    done();
                                }
                            });
                    }
                });
        });

        test('Should return error if update details exist', (done) => {
            const newTolerance = {
                tolerance_name: "Score 2",
                tolerance_from: 2,
                tolerance_type_id: 4,
                tolerance_to: 2
            };
            //Login user
            request(app)
                .post('/personnel/login')
                .send({
                    phone: phone,
                    password: password
                })
                .end((err, res) => {
                    if (err) {
                        return done(err);
                    } else {
                        const accessToken = res.body.accessToken;
                        const url = `/tolerance/1`;
                        request(app)
                            .patch(url)
                            .set('Authorization', 'Bearer ' + accessToken)
                            .send(newTolerance)
                            .end((err, resUpdate) => {
                                if (err) {
                                    return done(err);
                                } else {
                                    expect(resUpdate.statusCode).toBe(400);
                                    expect("Tolerance already exist").toBe(resUpdate.body.error.tolerance);

                                    done();
                                }
                            });
                    }
                });
        });

        test('Should return error if id is invalid number', (done) => {
            request(app)
                .post('/personnel/login')
                .send({
                    phone: phone,
                    password: password
                })
                .end((err, res) => {
                    const accessToken = res.body.accessToken;
                    const url = '/tolerance/reges';
                    request(app)
                        .patch(url)
                        .set('Authorization', 'Bearer ' + accessToken)
                        .send({
                            tolerance_name: "update tolerance name",
                            tolerance_from: 2,
                            tolerance_type_id: 4,
                            tolerance_to: 2
                        })
                        .end((err, res) => {
                            if (err) {
                                return done(err);
                            }
                            expect(res.statusCode).toBe(400);
                            expect("Invalid id provided").toBe(res.body.error.id);

                            done();
                        })
                })
        });

        test('Should return error if tolerance id does not exist', (done) => {
            const id = 2222222222222222222;
            request(app)
                .post('/personnel/login')
                .send({
                    phone: phone,
                    password: password
                })
                .end((err, res) => {
                    const accessToken = res.body.accessToken;
                    const url = `/tolerance/${id}`;
                    request(app)
                        .patch(url)
                        .set('Authorization', 'Bearer ' + accessToken)
                        .send({
                            tolerance_name: "caterp",
                            tolerance_from: 1,
                            tolerance_to: 1,
                            tolerance_type_id: 1,
                        })
                        .end((err, res) => {
                            if (err) {
                                return done(err);
                            }
                            expect(res.statusCode).toBe(400);
                            expect(res.body.error.id).toBe("Tolerance does not exist");
                            done();
                        })
                })
        });

        test('Should return error if personnel is not logged in', (done) => {
            const id = 5;
            request(app)
            const url = `/tolerance/${id}`;
            request(app)
                .patch(url)
                .send({
                    tolerance_name: "caterp",
                    tolerance_from: 1,
                    tolerance_to: 1,
                    tolerance_type_id: 1,
                })
                .end((err, res) => {
                    if (err) {
                        return done(err);
                    }
                    expect(res.statusCode).toBe(401);
                    done();
                })
        });
    });

    //  Delete tolerance
    describe("DELETE /tolerance/:toleranceId", () => {
        test('Should delete tolerance', (done) => {
            const newTolerance = {
                tolerance_name: 'tolerance.tolerance_name',
                tolerance_from: 1,
                tolerance_type_id: 1,
                tolerance_to: 1,
                created_by: 1,
                modified_by: 1,
                created_at: new Date(),
                updated_at: new Date()
            };
            Tolerance
                .destroy({
                    where: {
                        tolerance_name: newTolerance.tolerance_name
                    }
                })
                .then(() => {
                    Tolerance
                        .create(newTolerance)
                        .then((tolerance) => {
                            const id = tolerance.id;
                            //Login user
                            request(app)
                                .post('/personnel/login')
                                .send({
                                    phone: phone,
                                    password: password
                                })
                                .end((err, res) => {
                                    if (err) {
                                        return done(err);
                                    } else {
                                        const accessToken = res.body.accessToken;
                                        const url = `/tolerance/${id}`;
                                        request(app)
                                            .delete(url)
                                            .set('Authorization', 'Bearer ' + accessToken)
                                            .end((err, res) => {
                                                if (err) {
                                                    return done(err);
                                                } else {
                                                    expect(res.statusCode).toBe(200);
                                                    expect(res.body.message).toBe("Success");

                                                    Tolerance
                                                        .findOne({
                                                            where: {
                                                                id: id
                                                            }
                                                        })
                                                        .then(deletedTolerance => {
                                                            expect(deletedTolerance).toBe(null);
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
                })
                .catch(err => {
                    return done(err);
                });
        });

        test('Should return error if id is invalid hex', (done) => {
            const id = "xxxxxx";
            request(app)
                .post('/personnel/login')
                .send({
                    phone: phone,
                    password: password
                })
                .end((err, res) => {
                    const accessToken = res.body.accessToken;
                    const url = `/tolerance/${id}`;
                    request(app)
                        .delete(url)
                        .set('Authorization', 'Bearer ' + accessToken)
                        .end((err, res) => {
                            if (err) {
                                return done(err);
                            }
                            expect(res.statusCode).toBe(400);
                            expect(res.body.error.id).toBe("Invalid id provided");
                            done();
                        })
                })
        });

        test('Should return error if id does not exist', (done) => {
            const id = 222222222222222222222222;
            request(app)
                .post('/personnel/login')
                .send({
                    phone: phone,
                    password: password
                })
                .end((err, res) => {
                    const accessToken = res.body.accessToken;
                    const url = `/tolerance/${id}`;
                    request(app)
                        .delete(url)
                        .set('Authorization', 'Bearer ' + accessToken)
                        .end((err, res) => {
                            if (err) {
                                return done(err);
                            }
                            expect(res.statusCode).toBe(400);
                            expect(res.body.error.id).toBe("Tolerance does not exist");
                            done();
                        })
                })
        });

        test('Should return error if personnel is not logged in', (done) => {
            const id = 88;
            request(app)
            const url = `/tolerance/${id}`;
            request(app)
                .delete(url)
                .end((err, res) => {
                    if (err) {
                        return done(err);
                    }
                    expect(res.statusCode).toBe(401);
                    done();
                })
        });
    });

    //  List tolerance  without pagination
    describe("GET /tolerance/all", () => {
        test('Should get all tolerance', (done) => {
            //Login user
            request(app)
                .post('/personnel/login')
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
                            .get(`/tolerance/all`)
                            .set('Authorization', 'Bearer ' + accessToken)
                            .end((err, res) => {
                                if (err) {
                                    return done(err);
                                } else {
                                    expect(res.statusCode).toBe(200);
                                    expect(res.body[1].tolerance_name).toBe('Score 1');
                                    expect(res.body[1].tolerance_from).toBe(2);
                                    expect(res.body[1].tolerance_to).toBe(9);
                                    expect(res.body[1].tolerance_type_id).toBe(2);
                                    done();
                                }
                            });
                    }
                });
        });

        test('Tolerance should return an error if personnel is not logged in', (done) => {
            request(app)
                .get(`/tolerance/all`)
                .end((err, res) => {
                    if (err) {
                        return done(err);
                    } else {
                        expect(res.statusCode).toBe(401);
                        done();
                    }
                })
        })
    });
});
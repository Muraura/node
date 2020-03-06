const request = require("supertest");
const app = require("../src/app");

const Issue = require("../models").Issue;
const sequelize = require("sequelize");
const Op = sequelize.Op;

jest.setTimeout(10000);

const phone = "0700000000";
const password = "123456";
const newIssue = {
    issue_name: "Downey Mildew-Freshly",
    issue_type: 1,
    tolerance_type: 1,
    score: 1
};

const testIssue = {
    issue_name: "Downey Mildew-Freshly",
    issue_type_id: 1,
    tolerance_type_id: 1,
    score_id: 1,
    created_by: 1,
    modified_by: 1,
    created_at: new Date(),
    updated_at: new Date(),
};

describe("Issue", () => {
    //  Create issue
    describe("POST /issue", () => {
        test("Should save an issue", done => {
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

                        Issue.destroy({
                                where: {
                                    issue_name: newIssue.issue_name
                                }
                            })
                            .then(() => {
                                request(app)
                                    .post("/issue")
                                    .send(newIssue)
                                    .set("Authorization", "Bearer " + accessToken)
                                    .end((err, res) => {
                                        if (err) {
                                            return done(err);
                                        } else {
                                            Issue.findOne({
                                                    where: {
                                                        issue_name: newIssue.issue_name
                                                    }
                                                })
                                                .then(issue => {
                                                    expect(res.statusCode).toBe(200);
                                                    expect(res.body.message).toBe("Success");

                                                    //Validate personnel
                                                    expect(newIssue.issue_name).toBe(issue.issue_name);
                                                    expect(newIssue.issue_type).toBe(issue.issue_type_id);
                                                    expect(newIssue.tolerance_type).toBe(issue.tolerance_type_id);
                                                    expect(newIssue.score).toBe(issue.score_id);

                                                    Issue.destroy({
                                                            where: {
                                                                issue_name: newIssue.issue_name
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

        test('Should return an error if issue exists', (done) => {
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

                        Issue.create(testIssue)
                            .then(() => {
                                request(app)
                                    .post("/issue")
                                    .send(newIssue)
                                    .set("Authorization", "Bearer " + accessToken)
                                    .end((err, res) => {
                                        if (err) {
                                            return done(err);
                                        } else {
                                            Issue.findOne({
                                                    where: {
                                                        issue_name: newIssue.issue_name
                                                    }
                                                })
                                                .then(issue => {
                                                    expect(res.statusCode).toBe(400);
                                                    expect(res.body.error.issue).toBe("Issue already exist");

                                                    Issue.destroy({
                                                            where: {
                                                                issue_name: newIssue.issue_name
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

        test('Issue should return an error if empty fields are provided', (done) => {
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
                            .post("/issue")
                            .send({
                                issue_name: "",
                                score: "",
                                issue_type: "",
                                tolerance_type: ""
                            })
                            .set('Authorization', 'Bearer ' + accessToken)
                            .end((err, res) => {
                                if (err) {
                                    return done(err);
                                } else {
                                    expect(res.statusCode).toBe(400);
                                    expect("Issue name is required").toBe(res.body.error.issue_name);
                                    expect("Issue type is required").toBe(res.body.error.issue_type);
                                    expect("Tolerance type is required").toBe(res.body.error.tolerance_type);
                                    expect("Score is required").toBe(res.body.error.score);

                                    done();
                                }
                            });
                    }
                })
        });

        test('Issue should return an error if personnel is not logged in', (done) => {
            request(app)
                .post(`/issue`)
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

    //  List issues
    describe("GET /issue", () => {
        test('Should get all issues', (done) => {
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
                            .get(`/issue?page=0&limit=5`)
                            .set('Authorization', 'Bearer ' + accessToken)
                            .end((err, res) => {
                                if (err) {
                                    return done(err);
                                } else {
                                    expect(res.statusCode).toBe(200);
                                    expect(res.body.items[1].issue_name).toBe('Powdery Mildew-Fresh');
                                    expect(res.body.items[1].issue_type_id).toBe(1);
                                    expect(res.body.items[1].issue_type_name).toBe('200');
                                    expect(res.body.items[1].tolerance_type_id).toBe(200);
                                    expect(res.body.items[1].tolerance_type_name).toBe('200');
                                    expect(res.body.items[1].score_id).toBe(200);
                                    expect(res.body.items[1].score_name).toBe('200');
                                    Issue
                                        .deleteMany({
                                            issue_name: issueName
                                        })
                                        .then(() => {
                                            Score
                                                .deleteMany({
                                                    name: scoreName,
                                                })
                                                .then(() => {
                                                    ToleranceType
                                                        .deleteMany({
                                                            name: toleranceTypeName,
                                                        })
                                                        .then(() => {
                                                            IssueType
                                                                .deleteMany({
                                                                    name: issueTypeName
                                                                })
                                                                .then(() => {
                                                                    done()
                                                                })
                                                                .catch(err => {
                                                                    return done(err);
                                                                })
                                                        })
                                                        .catch(err => {
                                                            return done(err);
                                                        })
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
                });
        });

        // test('Should search issue by issue name', (done) => {
        //     Issue
        //         .deleteMany({
        //             "issue_name": issueName
        //         })
        //         .then(() => {
        //             IssueType
        //                 .create({
        //                     "name": issueTypeName,
        //                 })
        //                 .then((issuetype) => {
        //                     ToleranceType
        //                         .create({
        //                             name: toleranceTypeName,
        //                         })
        //                         .then((tolerancetype) => {
        //                             Score
        //                                 .create({
        //                                     "name": scoreName
        //                                 })
        //                                 .then((score) => {
        //                                     Issue
        //                                     const newIssue = {
        //                                         "issue_name": issueName,
        //                                         "score": score.id,
        //                                         "issue_type": issuetype.id,
        //                                         "tolerance_type": tolerancetype.id
        //                                     }
        //                                     Issue
        //                                         .create(newIssue)
        //                                         .then(() => {
        //                                             //Login user
        //                                             request(app)
        //                                                 .post('/personnel/login')
        //                                                 .send({
        //                                                     phone: phone,
        //                                                     password: password
        //                                                 })
        //                                                 .end((err, res) => {
        //                                                     if (err) {
        //                                                         return done(err);
        //                                                     } else {
        //                                                         const accessToken = res.body.accessToken;
        //                                                         request(app)
        //                                                             .get(`/issue?page=0&limit=5&issue_name=${issueName}`)
        //                                                             .set('Authorization', 'Bearer ' + accessToken)
        //                                                             .end((err, res) => {
        //                                                                 if (err) {
        //                                                                     return done(err);
        //                                                                 } else {
        //                                                                     res.should.have.status(200);
        //                                                                     res.body.should.be.a('object');
        //                                                                     res.body.rows.should.not.be.undefined;
        //                                                                     res.body.items.should.not.be.undefined;
        //                                                                     res.body.items.should.be.a('array');
        //                                                                     res.body.items[0].issue_name.should.not.be.undefined;
        //                                                                     res.body.items[0].issue_type.should.not.be.undefined;
        //                                                                     res.body.items[0].tolerance_type.should.not.be.undefined;
        //                                                                     res.body.items[0].score.should.not.be.undefined;
        //                                                                     res.body.items[0].issue_type.should.be.a('object');
        //                                                                     res.body.items[0].tolerance_type.should.be.a('object');
        //                                                                     res.body.items[0].score.should.be.a('object');
        //                                                                     assert.equal(issueName, res.body.items[0].issue_name);
        //                                                                     Issue
        //                                                                         .deleteMany({
        //                                                                             issue_name: issueName
        //                                                                         })
        //                                                                         .then(() => {
        //                                                                             Score
        //                                                                                 .deleteMany({
        //                                                                                     name: scoreName,
        //                                                                                 })
        //                                                                                 .then(() => {
        //                                                                                     ToleranceType
        //                                                                                         .deleteMany({
        //                                                                                             name: toleranceTypeName,
        //                                                                                         })
        //                                                                                         .then(() => {
        //                                                                                             IssueType
        //                                                                                                 .deleteMany({
        //                                                                                                     name: issueTypeName
        //                                                                                                 })
        //                                                                                                 .then(() => {
        //                                                                                                     done()
        //                                                                                                 })
        //                                                                                                 .catch(err => {
        //                                                                                                     return done(err);
        //                                                                                                 })
        //                                                                                         })
        //                                                                                         .catch(err => {
        //                                                                                             return done(err);
        //                                                                                         })
        //                                                                                 })
        //                                                                                 .catch(err => {
        //                                                                                     return done(err);
        //                                                                                 })
        //                                                                         })
        //                                                                         .catch(err => {
        //                                                                             return done(err);
        //                                                                         })
        //                                                                 }
        //                                                             })
        //                                                     }
        //                                                 })
        //                                         })
        //                                         .catch(err => {
        //                                             return done(err);
        //                                         })
        //                                 })
        //                                 .catch(err => {
        //                                     return done(err);
        //                                 })
        //                         })
        //                         .catch(err => {
        //                             return done(err);
        //                         })
        //                 })
        //                 .catch(err => {
        //                     return done(err);
        //                 })
        //         })
        //         .catch(err => {
        //             return done(err);
        //         })
        // });
        // test('Should search issue by issue type', (done) => {
        //     Issue
        //         .deleteMany({
        //             "issue_name": issueName
        //         })
        //         .then(() => {
        //             IssueType
        //                 .create({
        //                     "name": issueTypeName,
        //                 })
        //                 .then((issuetype) => {
        //                     ToleranceType
        //                         .create({
        //                             name: toleranceTypeName,
        //                         })
        //                         .then((tolerancetype) => {
        //                             Score
        //                                 .create({
        //                                     "name": scoreName
        //                                 })
        //                                 .then((score) => {
        //                                     Issue
        //                                     const newIssue = {
        //                                         "issue_name": issueName,
        //                                         "score": score.id,
        //                                         "issue_type": issuetype.id,
        //                                         "tolerance_type": tolerancetype.id
        //                                     }
        //                                     Issue
        //                                         .create(newIssue)
        //                                         .then(() => {
        //                                             //Login user
        //                                             request(app)
        //                                                 .post('/personnel/login')
        //                                                 .send({
        //                                                     phone: phone,
        //                                                     password: password
        //                                                 })
        //                                                 .end((err, res) => {
        //                                                     if (err) {
        //                                                         return done(err);
        //                                                     } else {
        //                                                         const accessToken = res.body.accessToken;
        //                                                         request(app)
        //                                                             .get(`/issue?page=0&limit=5&issue_type=${issuetype.id}`)
        //                                                             .set('Authorization', 'Bearer ' + accessToken)
        //                                                             .end((err, res) => {
        //                                                                 if (err) {
        //                                                                     return done(err);
        //                                                                 } else {
        //                                                                     res.should.have.status(200);
        //                                                                     res.body.should.be.a('object');
        //                                                                     res.body.rows.should.not.be.undefined;
        //                                                                     res.body.items.should.not.be.undefined;
        //                                                                     res.body.items.should.be.a('array');
        //                                                                     res.body.items[0].issue_name.should.not.be.undefined;
        //                                                                     res.body.items[0].issue_type.should.not.be.undefined;
        //                                                                     res.body.items[0].tolerance_type.should.not.be.undefined;
        //                                                                     res.body.items[0].score.should.not.be.undefined;
        //                                                                     res.body.items[0].issue_type.should.be.a('object');
        //                                                                     res.body.items[0].tolerance_type.should.be.a('object');
        //                                                                     res.body.items[0].score.should.be.a('object');
        //                                                                     Issue
        //                                                                         .deleteMany({
        //                                                                             issue_name: issueName
        //                                                                         })
        //                                                                         .then(() => {
        //                                                                             Score
        //                                                                                 .deleteMany({
        //                                                                                     name: scoreName,
        //                                                                                 })
        //                                                                                 .then(() => {
        //                                                                                     ToleranceType
        //                                                                                         .deleteMany({
        //                                                                                             name: toleranceTypeName,
        //                                                                                         })
        //                                                                                         .then(() => {
        //                                                                                             IssueType
        //                                                                                                 .deleteMany({
        //                                                                                                     name: issueTypeName
        //                                                                                                 })
        //                                                                                                 .then(() => {
        //                                                                                                     done()
        //                                                                                                 })
        //                                                                                                 .catch(err => {
        //                                                                                                     return done(err);
        //                                                                                                 })
        //                                                                                         })
        //                                                                                         .catch(err => {
        //                                                                                             return done(err);
        //                                                                                         })
        //                                                                                 })
        //                                                                                 .catch(err => {
        //                                                                                     return done(err);
        //                                                                                 })
        //                                                                         })
        //                                                                         .catch(err => {
        //                                                                             return done(err);
        //                                                                         })
        //                                                                 }
        //                                                             })
        //                                                     }
        //                                                 })
        //                                         })
        //                                         .catch(err => {
        //                                             return done(err);
        //                                         })
        //                                 })
        //                                 .catch(err => {
        //                                     return done(err);
        //                                 })
        //                         })
        //                         .catch(err => {
        //                             return done(err);
        //                         })
        //                 })
        //                 .catch(err => {
        //                     return done(err);
        //                 })
        //         })
        //         .catch(err => {
        //             return done(err);
        //         })
        // });
        // test('Should search issue by tolerance type', (done) => {
        //     Issue
        //         .deleteMany({
        //             "issue_name": issueName
        //         })
        //         .then(() => {
        //             IssueType
        //                 .create({
        //                     "name": issueTypeName,
        //                 })
        //                 .then((issuetype) => {
        //                     ToleranceType
        //                         .create({
        //                             name: toleranceTypeName,
        //                         })
        //                         .then((tolerancetype) => {
        //                             Score
        //                                 .create({
        //                                     "name": scoreName
        //                                 })
        //                                 .then((score) => {
        //                                     Issue
        //                                     const newIssue = {
        //                                         "issue_name": issueName,
        //                                         "score": score.id,
        //                                         "issue_type": issuetype.id,
        //                                         "tolerance_type": tolerancetype.id
        //                                     }
        //                                     Issue
        //                                         .create(newIssue)
        //                                         .then(() => {
        //                                             //Login user
        //                                             request(app)
        //                                                 .post('/personnel/login')
        //                                                 .send({
        //                                                     phone: phone,
        //                                                     password: password
        //                                                 })
        //                                                 .end((err, res) => {
        //                                                     if (err) {
        //                                                         return done(err);
        //                                                     } else {
        //                                                         const accessToken = res.body.accessToken;
        //                                                         request(app)
        //                                                             .get(`/issue?page=0&limit=5&tolerance_type=${tolerancetype.id}`)
        //                                                             .set('Authorization', 'Bearer ' + accessToken)
        //                                                             .end((err, res) => {
        //                                                                 if (err) {
        //                                                                     return done(err);
        //                                                                 } else {
        //                                                                     res.should.have.status(200);
        //                                                                     res.body.should.be.a('object');
        //                                                                     res.body.rows.should.not.be.undefined;
        //                                                                     res.body.items.should.not.be.undefined;
        //                                                                     res.body.items.should.be.a('array');
        //                                                                     res.body.items[0].issue_name.should.not.be.undefined;
        //                                                                     res.body.items[0].issue_type.should.not.be.undefined;
        //                                                                     res.body.items[0].tolerance_type.should.not.be.undefined;
        //                                                                     res.body.items[0].score.should.not.be.undefined;
        //                                                                     res.body.items[0].issue_type.should.be.a('object');
        //                                                                     res.body.items[0].tolerance_type.should.be.a('object');
        //                                                                     res.body.items[0].score.should.be.a('object');
        //                                                                     Issue
        //                                                                         .deleteMany({
        //                                                                             issue_name: issueName
        //                                                                         })
        //                                                                         .then(() => {
        //                                                                             Score
        //                                                                                 .deleteMany({
        //                                                                                     name: scoreName,
        //                                                                                 })
        //                                                                                 .then(() => {
        //                                                                                     ToleranceType
        //                                                                                         .deleteMany({
        //                                                                                             name: toleranceTypeName,
        //                                                                                         })
        //                                                                                         .then(() => {
        //                                                                                             IssueType
        //                                                                                                 .deleteMany({
        //                                                                                                     name: issueTypeName
        //                                                                                                 })
        //                                                                                                 .then(() => {
        //                                                                                                     done()
        //                                                                                                 })
        //                                                                                                 .catch(err => {
        //                                                                                                     return done(err);
        //                                                                                                 })
        //                                                                                         })
        //                                                                                         .catch(err => {
        //                                                                                             return done(err);
        //                                                                                         })
        //                                                                                 })
        //                                                                                 .catch(err => {
        //                                                                                     return done(err);
        //                                                                                 })
        //                                                                         })
        //                                                                         .catch(err => {
        //                                                                             return done(err);
        //                                                                         })
        //                                                                 }
        //                                                             })
        //                                                     }
        //                                                 })
        //                                         })
        //                                         .catch(err => {
        //                                             return done(err);
        //                                         })
        //                                 })
        //                                 .catch(err => {
        //                                     return done(err);
        //                                 })
        //                         })
        //                         .catch(err => {
        //                             return done(err);
        //                         })
        //                 })
        //                 .catch(err => {
        //                     return done(err);
        //                 })
        //         })
        //         .catch(err => {
        //             return done(err);
        //         })
        // });
        // test('Should search issue by score', (done) => {
        //     Issue
        //         .deleteMany({
        //             "issue_name": issueName
        //         })
        //         .then(() => {
        //             IssueType
        //                 .create({
        //                     "name": issueTypeName,
        //                 })
        //                 .then((issuetype) => {
        //                     ToleranceType
        //                         .create({
        //                             name: toleranceTypeName,
        //                         })
        //                         .then((tolerancetype) => {
        //                             Score
        //                                 .create({
        //                                     "name": scoreName
        //                                 })
        //                                 .then((score) => {
        //                                     Issue
        //                                     const newIssue = {
        //                                         "issue_name": issueName,
        //                                         "score": score.id,
        //                                         "issue_type": issuetype.id,
        //                                         "tolerance_type": tolerancetype.id
        //                                     }
        //                                     Issue
        //                                         .create(newIssue)
        //                                         .then(() => {
        //                                             //Login user
        //                                             request(app)
        //                                                 .post('/personnel/login')
        //                                                 .send({
        //                                                     phone: phone,
        //                                                     password: password
        //                                                 })
        //                                                 .end((err, res) => {
        //                                                     if (err) {
        //                                                         return done(err);
        //                                                     } else {
        //                                                         const accessToken = res.body.accessToken;
        //                                                         request(app)
        //                                                             .get(`/issue?page=0&limit=5&score=${score.id}`)
        //                                                             .set('Authorization', 'Bearer ' + accessToken)
        //                                                             .end((err, res) => {
        //                                                                 if (err) {
        //                                                                     return done(err);
        //                                                                 } else {
        //                                                                     res.should.have.status(200);
        //                                                                     res.body.should.be.a('object');
        //                                                                     res.body.rows.should.not.be.undefined;
        //                                                                     res.body.items.should.not.be.undefined;
        //                                                                     res.body.items.should.be.a('array');
        //                                                                     res.body.items[0].issue_name.should.not.be.undefined;
        //                                                                     res.body.items[0].issue_type.should.not.be.undefined;
        //                                                                     res.body.items[0].tolerance_type.should.not.be.undefined;
        //                                                                     res.body.items[0].score.should.not.be.undefined;
        //                                                                     res.body.items[0].issue_type.should.be.a('object');
        //                                                                     res.body.items[0].tolerance_type.should.be.a('object');
        //                                                                     res.body.items[0].score.should.be.a('object');
        //                                                                     Issue
        //                                                                         .deleteMany({
        //                                                                             issue_name: issueName
        //                                                                         })
        //                                                                         .then(() => {
        //                                                                             Score
        //                                                                                 .deleteMany({
        //                                                                                     name: scoreName,
        //                                                                                 })
        //                                                                                 .then(() => {
        //                                                                                     ToleranceType
        //                                                                                         .deleteMany({
        //                                                                                             name: toleranceTypeName,
        //                                                                                         })
        //                                                                                         .then(() => {
        //                                                                                             IssueType
        //                                                                                                 .deleteMany({
        //                                                                                                     name: issueTypeName
        //                                                                                                 })
        //                                                                                                 .then(() => {
        //                                                                                                     done()
        //                                                                                                 })
        //                                                                                                 .catch(err => {
        //                                                                                                     return done(err);
        //                                                                                                 })
        //                                                                                         })
        //                                                                                         .catch(err => {
        //                                                                                             return done(err);
        //                                                                                         })
        //                                                                                 })
        //                                                                                 .catch(err => {
        //                                                                                     return done(err);
        //                                                                                 })
        //                                                                         })
        //                                                                         .catch(err => {
        //                                                                             return done(err);
        //                                                                         })
        //                                                                 }
        //                                                             })
        //                                                     }
        //                                                 })
        //                                         })
        //                                         .catch(err => {
        //                                             return done(err);
        //                                         })
        //                                 })
        //                                 .catch(err => {
        //                                     return done(err);
        //                                 })
        //                         })
        //                         .catch(err => {
        //                             return done(err);
        //                         })
        //                 })
        //                 .catch(err => {
        //                     return done(err);
        //                 })
        //         })
        //         .catch(err => {
        //             return done(err);
        //         })
        // });
        // test('Should return error if personnel is not logged in', (done) => {
        //     request(app)
        //         .get(`/issue`)
        //         .end((err, res) => {
        //             if (err) {
        //                 return done(err);
        //             } else {
        //                 res.should.have.status(401);
        //                 done();
        //             }
        //         })
        // });
    });

    // Update issue
    describe("PATCH /issue/:issueId", () => {
        // test('Should update issue', (done) => {
        //     Issue
        //         .deleteMany({
        //             $or: [{
        //                 "issue_name": issueName
        //             }, {
        //                 "issue_name": "update issue name"
        //             }]
        //         })
        //         .then(() => {
        //             IssueType
        //                 .create({
        //                     "name": issueTypeName,
        //                 })
        //                 .then((issuetype) => {
        //                     ToleranceType
        //                         .create({
        //                             name: toleranceTypeName,
        //                         })
        //                         .then((tolerancetype) => {
        //                             // console.log(tolerancetype)
        //                             Score
        //                                 .create({
        //                                     "name": scoreName
        //                                 })
        //                                 .then((score) => {
        //                                     const newIssue = {
        //                                         "issue_name": issueName,
        //                                         "issue_type": issuetype.id,
        //                                         "tolerance_type": tolerancetype.id,
        //                                         "score": score.id
        //                                     };
        //                                     Issue
        //                                         .create(newIssue)
        //                                         .then((issue) => {
        //                                             const id = issue.id;
        //                                             //Login user
        //                                             request(app)
        //                                                 .post('/personnel/login')
        //                                                 .send({
        //                                                     phone: phone,
        //                                                     password: password
        //                                                 })
        //                                                 .end((err, res) => {
        //                                                     if (err) {
        //                                                         return done(err);
        //                                                     } else {
        //                                                         const accessToken = res.body.accessToken;
        //                                                         const url = `/issue/${id}`;
        //                                                         request(app)
        //                                                             .patch(url)
        //                                                             .set('Authorization', 'Bearer ' + accessToken)
        //                                                             .send({
        //                                                                 "issue_name": "update issue name",
        //                                                                 "issue_type": "5d7cf2369f9e4b1c48e1911c",
        //                                                                 "tolerance_type": tolerancetype.id,
        //                                                                 "score": score.id
        //                                                             })
        //                                                             .set('Authorization', 'Bearer ' + accessToken)
        //                                                             .end((err, resUpdate) => {
        //                                                                 if (err) {
        //                                                                     return done(err);
        //                                                                 } else {
        //                                                                     Issue
        //                                                                         .findOne({
        //                                                                             "_id": id
        //                                                                         })
        //                                                                         .then((issue) => {
        //                                                                             console.log(issue);
        //                                                                             resUpdate.should.have.status(200);
        //                                                                             resUpdate.should.be.a('object');
        //                                                                             resUpdate.body.message.should.not.be.undefined;
        //                                                                             assert.equal("Success", resUpdate.body.message);
        //                                                                             //Validate issue-category
        //                                                                             assert.equal("update issue name", issue.issue_name);
        //                                                                             Issue
        //                                                                                 .deleteMany({
        //                                                                                     $or: [{
        //                                                                                         "issue_name": issueName
        //                                                                                     }, {
        //                                                                                         "issue_name": "update issue name"
        //                                                                                     }]
        //                                                                                 })
        //                                                                                 .then(() => {
        //                                                                                     Score
        //                                                                                         .deleteMany({
        //                                                                                             name: scoreName,
        //                                                                                         })
        //                                                                                         .then(() => {
        //                                                                                             ToleranceType
        //                                                                                                 .deleteMany({
        //                                                                                                     name: toleranceTypeName,
        //                                                                                                 })
        //                                                                                                 .then(() => {
        //                                                                                                     IssueType
        //                                                                                                         .deleteMany({
        //                                                                                                             name: issueTypeName
        //                                                                                                         })
        //                                                                                                         .then(() => {
        //                                                                                                             done()
        //                                                                                                         })
        //                                                                                                         .catch(err => {
        //                                                                                                             return done(err);
        //                                                                                                         })
        //                                                                                                 })
        //                                                                                                 .catch(err => {
        //                                                                                                     return done(err);
        //                                                                                                 })
        //                                                                                         })
        //                                                                                         .catch(err => {
        //                                                                                             return done(err);
        //                                                                                         })
        //                                                                                 })
        //                                                                                 .catch(err => {
        //                                                                                     return done(err);
        //                                                                                 })
        //                                                                             //done();
        //                                                                         })
        //                                                                         .catch(err => {
        //                                                                             return done(err);
        //                                                                         })
        //                                                                 }
        //                                                             })
        //                                                     }
        //                                                 })
        //                                         })
        //                                         .catch(err => {
        //                                             return done(err);
        //                                         });
        //                                 })
        //                                 .catch(err => {
        //                                     return done(err);
        //                                 })
        //                         })
        //                         .catch(err => {
        //                             return done(err);
        //                         })
        //                 })
        //                 .catch(err => {
        //                     return done(err);
        //                 })
        //         })
        //         .catch(err => {
        //             return done(err);
        //         })
        // });
        // test('Should return error if empty fields are provided', (done) => {
        //     Issue
        //         .deleteMany({
        //             $or: [{
        //                 "issue_name": issueName
        //             }, {
        //                 "issue_name": "update issue name"
        //             }]
        //         })
        //         .then(() => {
        //             IssueType
        //                 .create({
        //                     "name": issueTypeName,
        //                 })
        //                 .then((issuetype) => {
        //                     ToleranceType
        //                         .create({
        //                             name: toleranceTypeName,
        //                         })
        //                         .then((tolerancetype) => {
        //                             Score
        //                                 .create({
        //                                     "name": scoreName
        //                                 })
        //                                 .then((score) => {
        //                                     const newIssue = {
        //                                         "issue_name": issueName,
        //                                         "issue_type": issuetype.id,
        //                                         "tolerance_type": tolerancetype.id,
        //                                         "score": score.id
        //                                     };
        //                                     Issue
        //                                         .create(newIssue)
        //                                         .then((issue) => {
        //                                             const id = issue.id;
        //                                             //Login user
        //                                             request(app)
        //                                                 .post('/personnel/login')
        //                                                 .send({
        //                                                     phone: phone,
        //                                                     password: password
        //                                                 })
        //                                                 .end((err, res) => {
        //                                                     if (err) {
        //                                                         return done(err);
        //                                                     } else {
        //                                                         const accessToken = res.body.accessToken;
        //                                                         const url = `/issue/${id}`;
        //                                                         request(app)
        //                                                             .patch(url)
        //                                                             .set('Authorization', 'Bearer ' + accessToken)
        //                                                             .send({
        //                                                                 "issue_name": "",
        //                                                                 "issue_type": "",
        //                                                                 "tolerance_type": "",
        //                                                                 "score": ""
        //                                                             })
        //                                                             .set('Authorization', 'Bearer ' + accessToken)
        //                                                             .end((err, resUpdate) => {
        //                                                                 if (err) {
        //                                                                     return done(err);
        //                                                                 } else {
        //                                                                     Issue
        //                                                                         .findOne({
        //                                                                             "_id": id
        //                                                                         })
        //                                                                         .then((issue) => {
        //                                                                             resUpdate.should.have.status(400);
        //                                                                             resUpdate.should.be.a('object');
        //                                                                             resUpdate.body.error.issue_name.should.not.be.undefined;
        //                                                                             resUpdate.body.error.issue_type.should.not.be.undefined;
        //                                                                             resUpdate.body.error.tolerance_type.should.not.be.undefined;
        //                                                                             resUpdate.body.error.score.should.not.be.undefined;
        //                                                                             assert.equal("Issue name is required", resUpdate.body.error.issue_name);
        //                                                                             assert.equal("Issue type is required", resUpdate.body.error.issue_type);
        //                                                                             assert.equal("Tolerance type is required", resUpdate.body.error.tolerance_type);
        //                                                                             assert.equal("Score is required", resUpdate.body.error.score);
        //                                                                             Issue
        //                                                                                 .deleteMany({
        //                                                                                     $or: [{
        //                                                                                         "issue_name": issueName
        //                                                                                     }, {
        //                                                                                         "issue_name": "update issue name"
        //                                                                                     }]
        //                                                                                 })
        //                                                                                 .then(() => {
        //                                                                                     Score
        //                                                                                         .deleteMany({
        //                                                                                             name: scoreName,
        //                                                                                         })
        //                                                                                         .then(() => {
        //                                                                                             ToleranceType
        //                                                                                                 .deleteMany({
        //                                                                                                     name: toleranceTypeName,
        //                                                                                                 })
        //                                                                                                 .then(() => {
        //                                                                                                     IssueType
        //                                                                                                         .deleteMany({
        //                                                                                                             name: issueTypeName
        //                                                                                                         })
        //                                                                                                         .then(() => {
        //                                                                                                             done()
        //                                                                                                         })
        //                                                                                                         .catch(err => {
        //                                                                                                             return done(err);
        //                                                                                                         })
        //                                                                                                 })
        //                                                                                                 .catch(err => {
        //                                                                                                     return done(err);
        //                                                                                                 })
        //                                                                                         })
        //                                                                                         .catch(err => {
        //                                                                                             return done(err);
        //                                                                                         })
        //                                                                                 })
        //                                                                                 .catch(err => {
        //                                                                                     return done(err);
        //                                                                                 })
        //                                                                             //done();
        //                                                                         })
        //                                                                         .catch(err => {
        //                                                                             return done(err);
        //                                                                         })
        //                                                                 }
        //                                                             })
        //                                                     }
        //                                                 })
        //                                         })
        //                                         .catch(err => {
        //                                             return done(err);
        //                                         });
        //                                 })
        //                                 .catch(err => {
        //                                     return done(err);
        //                                 })
        //                         })
        //                         .catch(err => {
        //                             return done(err);
        //                         })
        //                 })
        //                 .catch(err => {
        //                     return done(err);
        //                 })
        //         })
        //         .catch(err => {
        //             return done(err);
        //         })
        // });
        // test('Should return error if update details exist', (done) => {
        //     Issue
        //         .deleteMany({
        //             $or: [{
        //                 "issue_name": issueName
        //             }, {
        //                 "issue_name": "update issue name"
        //             }]
        //         })
        //         .then(() => {
        //             IssueType
        //                 .create({
        //                     "name": issueTypeName,
        //                 })
        //                 .then((issuetype) => {
        //                     ToleranceType
        //                         .create({
        //                             name: toleranceTypeName,
        //                         })
        //                         .then((tolerancetype) => {
        //                             Score
        //                                 .create({
        //                                     "name": scoreName
        //                                 })
        //                                 .then((score) => {
        //                                     const newIssue = {
        //                                         "issue_name": issueName,
        //                                         "issue_type": issuetype.id,
        //                                         "tolerance_type": tolerancetype.id,
        //                                         "score": score.id
        //                                     };
        //                                     Issue
        //                                         .create(newIssue)
        //                                         .then((issue) => {
        //                                             const id = issue.id;
        //                                             //Login user
        //                                             request(app)
        //                                                 .post('/personnel/login')
        //                                                 .send({
        //                                                     phone: phone,
        //                                                     password: password
        //                                                 })
        //                                                 .end((err, res) => {
        //                                                     if (err) {
        //                                                         return done(err);
        //                                                     } else {
        //                                                         const accessToken = res.body.accessToken;
        //                                                         const url = `/issue/${id}`;
        //                                                         request(app)
        //                                                             .patch(url)
        //                                                             .set('Authorization', 'Bearer ' + accessToken)
        //                                                             .send(newIssue)
        //                                                             .set('Authorization', 'Bearer ' + accessToken)
        //                                                             .end((err, resUpdate) => {
        //                                                                 if (err) {
        //                                                                     return done(err);
        //                                                                 } else {
        //                                                                     Issue
        //                                                                         .findOne({
        //                                                                             "_id": id
        //                                                                         })
        //                                                                         .then((issue) => {
        //                                                                             resUpdate.should.have.status(400);
        //                                                                             resUpdate.should.be.a('object');
        //                                                                             resUpdate.body.error.issue.should.not.be.undefined;
        //                                                                             assert.equal("Issue already exist", resUpdate.body.error.issue);
        //                                                                             Issue
        //                                                                                 .deleteMany({
        //                                                                                     $or: [{
        //                                                                                         "issue_name": issueName
        //                                                                                     }, {
        //                                                                                         "issue_name": "update issue name"
        //                                                                                     }]
        //                                                                                 })
        //                                                                                 .then(() => {
        //                                                                                     Score
        //                                                                                         .deleteMany({
        //                                                                                             name: scoreName,
        //                                                                                         })
        //                                                                                         .then(() => {
        //                                                                                             ToleranceType
        //                                                                                                 .deleteMany({
        //                                                                                                     name: toleranceTypeName,
        //                                                                                                 })
        //                                                                                                 .then(() => {
        //                                                                                                     IssueType
        //                                                                                                         .deleteMany({
        //                                                                                                             name: issueTypeName
        //                                                                                                         })
        //                                                                                                         .then(() => {
        //                                                                                                             done()
        //                                                                                                         })
        //                                                                                                         .catch(err => {
        //                                                                                                             return done(err);
        //                                                                                                         })
        //                                                                                                 })
        //                                                                                                 .catch(err => {
        //                                                                                                     return done(err);
        //                                                                                                 })
        //                                                                                         })
        //                                                                                         .catch(err => {
        //                                                                                             return done(err);
        //                                                                                         })
        //                                                                                 })
        //                                                                                 .catch(err => {
        //                                                                                     return done(err);
        //                                                                                 })
        //                                                                             //done();
        //                                                                         })
        //                                                                         .catch(err => {
        //                                                                             return done(err);
        //                                                                         })
        //                                                                 }
        //                                                             })
        //                                                     }
        //                                                 })
        //                                         })
        //                                         .catch(err => {
        //                                             return done(err);
        //                                         });
        //                                 })
        //                                 .catch(err => {
        //                                     return done(err);
        //                                 })
        //                         })
        //                         .catch(err => {
        //                             return done(err);
        //                         })
        //                 })
        //                 .catch(err => {
        //                     return done(err);
        //                 })
        //         })
        //         .catch(err => {
        //             return done(err);
        //         })
        // });
        // test('Should return error if id is invalid hex', (done) => {
        //     const id = "xxxxxx";
        //     request(app)
        //         .post('/personnel/login')
        //         .send({
        //             phone: phone,
        //             password: password
        //         })
        //         .end((err, res) => {
        //             const accessToken = res.body.accessToken;
        //             const url = `/issue/${id}`;
        //             request(app)
        //                 .patch(url)
        //                 .set('Authorization', 'Bearer ' + accessToken)
        //                 .send({
        //                     "issue_name": "update issue name",
        //                     "issue_type": "8fb15451d578f906d8eb769c",
        //                     "tolerance_type": "8fb15451d578f906d8eb769c",
        //                     "score": "8fb15451d578f906d8eb769c"
        //                 })
        //                 .end((err, res) => {
        //                     if (err) {
        //                         return done(err);
        //                     }
        //                     // console.log(res.body);
        //                     res.should.have.status(400);
        //                     res.should.be.a('object');
        //                     res.body.error.id.should.not.be.undefined;
        //                     assert.equal("Invalid id provided", res.body.error.id);
        //                     done();
        //                 })
        //         })
        // });
        // test('Should return error if issue id does not exist', (done) => {
        //     const id = "8fb15451d578f906d8eb769c";
        //     request(app)
        //         .post('/personnel/login')
        //         .send({
        //             phone: phone,
        //             password: password
        //         })
        //         .end((err, res) => {
        //             const accessToken = res.body.accessToken;
        //             const url = `/issue/${id}`;
        //             request(app)
        //                 .patch(url)
        //                 .set('Authorization', 'Bearer ' + accessToken)
        //                 .send({
        //                     issue_name: "caterp",
        //                     issue_type: "8fb15451d578f906d8eb769c",
        //                     tolerance_type: "8fb15451d578f906d8eb769c",
        //                     score: "8fb15451d578f906d8eb769c",
        //                 })
        //                 .end((err, res) => {
        //                     if (err) {
        //                         return done(err);
        //                     }
        //                     res.should.have.status(400);
        //                     res.should.be.a('object');
        //                     res.body.error.id.should.not.be.undefined;
        //                     assert.equal("Issue does not exist", res.body.error.id);
        //                     done();
        //                 })
        //         })
        // });
        // test('Should return error if personnel is not logged in', (done) => {
        //     const id = "8fb15451d578f906d8eb769c";
        //     request(app)
        //     const url = `/tolerance/${id}`;
        //     request(app)
        //         .patch(url)
        //         .send({
        //             issue_name: "caterp",
        //             issue_type: "8fb15451d578f906d8eb769c",
        //             tolerance_type: "8fb15451d578f906d8eb769c",
        //             score: "8fb15451d578f906d8eb769c",
        //         })
        //         .end((err, res) => {
        //             if (err) {
        //                 return done(err);
        //             }
        //             res.should.have.status(401);
        //             done();
        //         })
        // });
    });

    //  Delete issue
    describe("DELETE /issue/:issueId", () => {
        // test('Should delete issue', (done) => {
        //     Issue
        //         .deleteMany({
        //             $or: [{
        //                 "name": issueName
        //             }, {
        //                 "name": "update issue name"
        //             }]
        //         })
        //         .then(() => {
        //             IssueType
        //                 .create({
        //                     "name": issueTypeName,
        //                 })
        //                 .then((issuetype) => {
        //                     ToleranceType
        //                         .create({
        //                             name: toleranceTypeName,
        //                         })
        //                         .then((tolerancetype) => {
        //                             Score
        //                                 .create({
        //                                     "name": scoreName
        //                                 })
        //                                 .then((score) => {
        //                                     const newIssue = {
        //                                         "issue_name": issueName,
        //                                         "score": score.id,
        //                                         "issue_type": issuetype.id,
        //                                         "tolerance_type": tolerancetype.id
        //                                     };
        //                                     Issue
        //                                         .create(newIssue)
        //                                         .then((issue) => {
        //                                             const id = issue.id;
        //                                             //Login user
        //                                             request(app)
        //                                                 .post('/personnel/login')
        //                                                 .send({
        //                                                     phone: phone,
        //                                                     password: password
        //                                                 })
        //                                                 .end((err, res) => {
        //                                                     if (err) {
        //                                                         return done(err);
        //                                                     } else {
        //                                                         const accessToken = res.body.accessToken;
        //                                                         const url = `/issue/${id}`;
        //                                                         request(app)
        //                                                             .delete(url)
        //                                                             .set('Authorization', 'Bearer ' + accessToken)
        //                                                             .end((err, res) => {
        //                                                                 if (err) {
        //                                                                     return done(err);
        //                                                                 } else {
        //                                                                     res.should.have.status(200);
        //                                                                     res.should.be.a('object');
        //                                                                     res.body.message.should.not.be.undefined;
        //                                                                     assert.equal("Success", res.body.message);
        //                                                                     Issue.findOne({
        //                                                                             id: id
        //                                                                         })
        //                                                                         .then(deletedIssue => {
        //                                                                             assert.equal(deletedIssue, null);
        //                                                                             Issue
        //                                                                                 .deleteMany({
        //                                                                                     issue_name: issueName
        //                                                                                 })
        //                                                                                 .then(() => {
        //                                                                                     Score
        //                                                                                         .deleteMany({
        //                                                                                             name: scoreName,
        //                                                                                         })
        //                                                                                         .then(() => {
        //                                                                                             ToleranceType
        //                                                                                                 .deleteMany({
        //                                                                                                     name: toleranceTypeName,
        //                                                                                                 })
        //                                                                                                 .then(() => {
        //                                                                                                     IssueType
        //                                                                                                         .deleteMany({
        //                                                                                                             name: issueTypeName
        //                                                                                                         })
        //                                                                                                         .then(() => {
        //                                                                                                             done()
        //                                                                                                         })
        //                                                                                                         .catch(err => {
        //                                                                                                             return done(err);
        //                                                                                                         })
        //                                                                                                 })
        //                                                                                                 .catch(err => {
        //                                                                                                     return done(err);
        //                                                                                                 })
        //                                                                                         })
        //                                                                                         .catch(err => {
        //                                                                                             return done(err);
        //                                                                                         })
        //                                                                                 })
        //                                                                                 .catch(err => {
        //                                                                                     return done(err);
        //                                                                                 })
        //                                                                         })
        //                                                                         .catch(err => {
        //                                                                             return done(err);
        //                                                                         })
        //                                                                 }
        //                                                             })
        //                                                     }
        //                                                 })
        //                                         })
        //                                         .catch(err => {
        //                                             return done(err);
        //                                         });
        //                                 })
        //                                 .catch(err => {
        //                                     return done(err);
        //                                 })
        //                         })
        //                         .catch(err => {
        //                             return done(err);
        //                         })
        //                 })
        //                 .catch(err => {
        //                     return done(err);
        //                 })
        //         })
        //         .catch(err => {
        //             return done(err);
        //         })
        // });
        // test('Should return error if id is invalid hex', (done) => {
        //     const id = "xxxxxx";
        //     request(app)
        //         .post('/personnel/login')
        //         .send({
        //             phone: phone,
        //             password: password
        //         })
        //         .end((err, res) => {
        //             const accessToken = res.body.accessToken;
        //             const url = `/issue/${id}`;
        //             request(app)
        //                 .delete(url)
        //                 .set('Authorization', 'Bearer ' + accessToken)
        //                 .end((err, res) => {
        //                     if (err) {
        //                         return done(err);
        //                     }
        //                     // console.log(res.body);
        //                     res.should.have.status(400);
        //                     res.should.be.a('object');
        //                     res.body.error.id.should.not.be.undefined;
        //                     assert.equal("Invalid id provided", res.body.error.id);
        //                     done();
        //                 })
        //         })
        // });
        // test('Should return error if id does not exist', (done) => {
        //     const id = "8fb15451d578f906d8eb769c";
        //     request(app)
        //         .post('/personnel/login')
        //         .send({
        //             phone: phone,
        //             password: password
        //         })
        //         .end((err, res) => {
        //             const accessToken = res.body.accessToken;
        //             const url = `/issue/${id}`;
        //             request(app)
        //                 .delete(url)
        //                 .set('Authorization', 'Bearer ' + accessToken)
        //                 .end((err, res) => {
        //                     if (err) {
        //                         return done(err);
        //                     }
        //                     // console.log(res.body);
        //                     res.should.have.status(400);
        //                     res.should.be.a('object');
        //                     res.body.error.id.should.not.be.undefined;
        //                     assert.equal("Issue does not exist", res.body.error.id);
        //                     done();
        //                 })
        //         })
        // });
        // test('Should return error if personnel is not logged in', (done) => {
        //     const id = "8fb15451d578f906d8eb769c";
        //     request(app)
        //     const url = `/tolerance/${id}`;
        //     request(app)
        //         .delete(url)
        //         .end((err, res) => {
        //             if (err) {
        //                 return done(err);
        //             }
        //             res.should.have.status(401);
        //             done();
        //         })
        // });
    });

    //  List issue  without pagination
    describe("GET /issue/all", () => {
        // test('Should get all issue', (done) => {
        //     Issue
        //         .deleteMany({
        //             "issue_name": issueName
        //         })
        //         .then(() => {
        //             IssueType
        //                 .create({
        //                     "name": issueTypeName,
        //                 })
        //                 .then((issuetype) => {
        //                     ToleranceType
        //                         .create({
        //                             name: toleranceTypeName,
        //                         })
        //                         .then((tolerancetype) => {
        //                             Score
        //                                 .create({
        //                                     "name": scoreName
        //                                 })
        //                                 .then((score) => {
        //                                     Issue
        //                                     const newIssue = {
        //                                         "issue_name": issueName,
        //                                         "score": score.id,
        //                                         "issue_type": issuetype.id,
        //                                         "tolerance_type": tolerancetype.id
        //                                     }
        //                                     const saveIssue = [newIssue, newIssue, newIssue, newIssue, newIssue];
        //                                     Issue
        //                                         .insertMany(saveIssue)
        //                                         .then(() => {
        //                                             //Login user
        //                                             request(app)
        //                                                 .post('/personnel/login')
        //                                                 .send({
        //                                                     phone: phone,
        //                                                     password: password
        //                                                 })
        //                                                 .end((err, res) => {
        //                                                     if (err) {
        //                                                         return done(err);
        //                                                     } else {
        //                                                         const accessToken = res.body.accessToken;
        //                                                         request(app)
        //                                                             .get(`/issue/all`)
        //                                                             .set('Authorization', 'Bearer ' + accessToken)
        //                                                             .end((err, res) => {
        //                                                                 if (err) {
        //                                                                     return done(err);
        //                                                                 } else {
        //                                                                     res.should.have.status(200);
        //                                                                     res.body.should.be.a('array');
        //                                                                     Issue
        //                                                                         .deleteMany({
        //                                                                             issue_name: issueName
        //                                                                         })
        //                                                                         .then(() => {
        //                                                                             Score
        //                                                                                 .deleteMany({
        //                                                                                     name: scoreName,
        //                                                                                 })
        //                                                                                 .then(() => {
        //                                                                                     ToleranceType
        //                                                                                         .deleteMany({
        //                                                                                             name: toleranceTypeName,
        //                                                                                         })
        //                                                                                         .then(() => {
        //                                                                                             IssueType
        //                                                                                                 .deleteMany({
        //                                                                                                     name: issueTypeName
        //                                                                                                 })
        //                                                                                                 .then(() => {
        //                                                                                                     done()
        //                                                                                                 })
        //                                                                                                 .catch(err => {
        //                                                                                                     return done(err);
        //                                                                                                 })
        //                                                                                         })
        //                                                                                         .catch(err => {
        //                                                                                             return done(err);
        //                                                                                         })
        //                                                                                 })
        //                                                                                 .catch(err => {
        //                                                                                     return done(err);
        //                                                                                 })
        //                                                                         })
        //                                                                         .catch(err => {
        //                                                                             return done(err);
        //                                                                         })
        //                                                                 }
        //                                                             })
        //                                                     }
        //                                                 })
        //                                         })
        //                                         .catch(err => {
        //                                             return done(err);
        //                                         })
        //                                 })
        //                                 .catch(err => {
        //                                     return done(err);
        //                                 })
        //                         })
        //                         .catch(err => {
        //                             return done(err);
        //                         })
        //                 })
        //                 .catch(err => {
        //                     return done(err);
        //                 })
        //         })
        //         .catch(err => {
        //             return done(err);
        //         })
        // });
    });
});
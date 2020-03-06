const request = require("supertest");
const app = require("../src/app");

const IssueCategory = require("../models").IssueCategory;
const sequelize = require("sequelize");

jest.setTimeout(10000);

const phone = "0700000000";
const password = "123456";

const newIssueCategory = {
    name: 'Larvae test',
    issue: 1
};

const testIssueCategory = {
    issue_category_name: 'Larvae test',
    issue_id: 1,
    created_by: 1,
    modified_by: 1,
    created_at: new Date(),
    updated_at: new Date(),
};

describe("Issuecategory", () => {

    //   Create issue category
    describe("POST /issue-category", () => {

        test('Should save a issue category', (done) => {
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
                            .post("/issue-category")
                            .send(newIssueCategory)
                            .set('Authorization', 'Bearer ' + accessToken)
                            .end((err, res) => {
                                if (err) {
                                    return done(err);
                                } else {
                                    IssueCategory
                                        .findOne({
                                            where: {
                                                issue_category_name: newIssueCategory.name
                                            }
                                        })
                                        .then(issueCategory => {
                                            expect(res.statusCode).toBe(200);
                                            expect(res.body.message).toBe("Success");

                                            //Validate personnel
                                            expect(newIssueCategory.name).toBe(issueCategory.issue_category_name);
                                            expect(newIssueCategory.issue).toBe(issueCategory.issue_id);

                                            IssueCategory.destroy({
                                                    where: {
                                                        issue_category_name: newIssueCategory.name
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
                                        })
                                }
                            });
                    }
                })
        });

        test('Should return error if issue category exist', (done) => {
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
                            .post("/issue-category")
                            .send({
                                name: 'Larvae',
                                issue: 6,
                            })
                            .set('Authorization', 'Bearer ' + accessToken)
                            .end((err, res) => {
                                if (err) {
                                    return done(err);
                                } else {
                                    expect(res.statusCode).toBe(400);
                                    expect(res.body.error.issueCategory).toBe("Issue category already exist");
                                    done();
                                }
                            });;
                    }
                });
        });

        test('Should return error if empty fields are provided', (done) => {
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
                            .post("/issue-category")
                            .send({
                                name: "",
                                issue: ""
                            })
                            .set('Authorization', 'Bearer ' + accessToken)
                            .end((err, res) => {
                                if (err) {
                                    return done(err);
                                } else {
                                    expect(res.statusCode).toBe(400);
                                    expect(res.body.error.name).toBe("Name is required");
                                    expect(res.body.error.issue).toBe("Issue is required");
                                    done();
                                }
                            });
                    }
                })
        });

        test('Should return error if invalid issue id are provided', (done) => {
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
                            .post("/issue-category")
                            .send({
                                name: 'Larvae',
                                issue: 2222222222,
                            })
                            .set('Authorization', 'Bearer ' + accessToken)
                            .end((err, res) => {
                                if (err) {
                                    return done(err);
                                } else {
                                    expect(res.statusCode).toBe(400);
                                    expect(res.body.error.issue).toBe("Invalid issue provided");
                                    done();
                                }
                            });
                    }
                })
        });

        test('Should return error if personnel is not logged in', (done) => {
            request(app)
                .post(`/issue-category`)
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

    //  List issue category
    describe("GET /issue-category", () => {

        test('Should get all issue categories', (done) => {
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
                            .get(`/issue-category?page=0&limit=5`)
                            .set('Authorization', 'Bearer ' + accessToken)
                            .end((err, res) => {
                                if (err) {
                                    return done(err);
                                } else {
                                    expect(res.statusCode).toBe(200);
                                    const items = res.body.items;
                                    expect(items.length).toBe(5);
                                    expect(items[1].id).toBe(2);
                                    expect(items[1].issue_category_name).toBe("Adult");
                                    expect(items[1].issue_id).toBe(6);
                                    expect(items[1].issue_name).toBe("Thrips");
                                    done();
                                }
                            });
                    }
                });
        });

        test('Should search issue category by issue', (done) => {
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
                            .get(`/issue-category?page=0&limit=5&issue=6`)
                            .set('Authorization', 'Bearer ' + accessToken)
                            .end((err, res) => {
                                console.log(res.error)
                                if (err) {
                                    return done(err);
                                } else {
                                    expect(res.statusCode).toBe(200);
                                    const items = res.body.items;
                                    expect(items.length).toBe(3);
                                    expect(items[1].id).toBe(2);
                                    expect(items[1].issue_category_name).toBe("Adult");
                                    expect(items[1].issue_id).toBe(6);
                                    expect(items[1].issue_name).toBe("Thrips");
                                    done();
                                }
                            });
                    }
                });
        });

        test('Should search issue category by issue category name', (done) => {
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
                            .get(`/issue-category?page=0&limit=5&name=Adult`)
                            .set('Authorization', 'Bearer ' + accessToken)
                            .end((err, res) => {
                                if (err) {
                                    return done(err);
                                } else {
                                    expect(res.statusCode).toBe(200);
                                    const items = res.body.items;
                                    expect(items.length).toBe(2);
                                    expect(items[1].id).toBe(7);
                                    expect(items[1].issue_category_name).toBe("Adult Caterpillar");
                                    expect(items[1].issue_id).toBe(9);
                                    expect(items[1].issue_name).toBe("Caterpillars");
                                    done();
                                }
                            })
                    }
                })
        });

        test('Should return error if personnel is not logged in', (done) => {
            request(app)
                .get(`/issue-category`)
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

    //  Patch request on issue category
    describe("PATCH /issue-category/:issueCategoryId", () => {

        test('Should update issueCategory', (done) => {
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
                        const id = 4;

                        const url = `/issue-category/${id}`;
                        request(app)
                            .patch(url)
                            .set('Authorization', 'Bearer ' + accessToken)
                            .send({
                                name: "test category",
                                issue: 2,
                            })
                            .end((err, resUpdate) => {
                                if (err) {
                                    return done(err);
                                } else {
                                    IssueCategory
                                        .findOne({
                                            where: {
                                                "id": id
                                            }
                                        })
                                        .then((issueCategory) => {
                                            expect(resUpdate.statusCode).toBe(200);

                                            expect(issueCategory.issue_id).toBe(2);
                                            expect(issueCategory.issue_category_name).toBe("test category");
                                            expect(resUpdate.body.message).toBe("Success");

                                            IssueCategory
                                                .update({
                                                    issue_category_name: "Eggs",
                                                    issue_id: 9
                                                }, {
                                                    where: {
                                                        id: id
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
                        const id = 1;
                        const accessToken = res.body.accessToken;
                        const url = `/issue-category/${id}`;

                        request(app)
                            .patch(url)
                            .set('Authorization', 'Bearer ' + accessToken)
                            .send({
                                name: "",
                                issue: "",
                            })
                            .end((err, resUpdate) => {
                                if (err) {
                                    return done(err);
                                } else {
                                    expect(resUpdate.statusCode).toBe(400);

                                    expect(resUpdate.body.error.name).toBe("Name is required");
                                    expect(resUpdate.body.error.issue).toBe("Issue is required");
                                    done();
                                }
                            })
                    }
                })
        });

        test('Should return error if details of another issue category are given', (done) => {
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
                        const url = `/issue-category/8`;

                        request(app)
                            .patch(url)
                            .set('Authorization', 'Bearer ' + accessToken)
                            .send({
                                name: 'Eggs RSM',
                                issue: 8
                            })
                            .end((err, resUpdate) => {
                                if (err) {
                                    return done(err);
                                } else {
                                    expect(resUpdate.statusCode).toBe(400);
                                    expect(resUpdate.body.error.name).toBe("Issue category already exist");
                                    done();
                                }
                            })
                    }
                })
        });

        test('Should return error if id is invalid', (done) => {
            const id = "xxxxxx";
            request(app)
                .post('/personnel/login')
                .send({
                    phone: phone,
                    password: password
                })
                .end((err, res) => {
                    const accessToken = res.body.accessToken;
                    const url = `/issue-category/${id}`;
                    request(app)
                        .patch(url)
                        .set('Authorization', 'Bearer ' + accessToken)
                        .send({
                            name: "tole",
                            issue: 7,
                        })
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
            const id = 33333333333333333333333;
            request(app)
                .post('/personnel/login')
                .send({
                    phone: phone,
                    password: password
                })
                .end((err, res) => {
                    const accessToken = res.body.accessToken;
                    const url = `/issue-category/${id}`;
                    request(app)
                        .patch(url)
                        .set('Authorization', 'Bearer ' + accessToken)
                        .send({
                            name: "tole",
                            issue: 7,
                        })
                        .end((err, res) => {
                            if (err) {
                                return done(err);
                            }
                            expect(res.statusCode).toBe(400);
                            expect(res.body.error.id).toBe("Issue category does not exist");
                            done();
                        })

                })
        });

        test('Should return error if invalid issue id is provided', (done) => {
            const id = 5;
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
                        const url = `/issue-category/${id}`;

                        request(app)
                            .patch(url)
                            .set('Authorization', 'Bearer ' + accessToken)
                            .send({
                                name: 'test category',
                                issue: 88888888888888888888888,
                            })
                            .end((err, resUpdate) => {
                                if (err) {
                                    return done(err);
                                } else {
                                    expect(resUpdate.statusCode).toBe(400);
                                    expect(resUpdate.body.error.issue).toBe("Invalid issue provided");
                                    done();
                                }
                            })
                    }
                })
        });

        test('Should return error if personnel is not logged in', (done) => {
            const id = 2;
            request(app)
            const url = `/issue-category/${id}`;

            request(app)
                .patch(url)
                .send({
                    name: "New Issue category",
                    issue: 3
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

    //  Delete issue category
    describe("DELETE /issue-category/:issueCategoryId", () => {

        test('Should delete issueCategory', (done) => {
            IssueCategory
                .create(testIssueCategory)
                .then((issueCategory) => {
                    const id = issueCategory.id;
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
                                const url = `/issue-category/${id}`;

                                request(app)
                                    .delete(url)
                                    .set('Authorization', 'Bearer ' + accessToken)
                                    .end((err, resDel) => {
                                        // console.log(resDel);
                                        if (err) {
                                            return done(err);
                                        } else {
                                            expect(resDel.statusCode).toBe(200);
                                            expect(resDel.body.message).toBe("Success");

                                            IssueCategory.destroy({
                                                    where: testIssueCategory
                                                })
                                                .then(() => {
                                                    done();
                                                })
                                                .catch(err => {
                                                    return done(err);
                                                })
                                        }
                                    })
                            }
                        })
                })
                .catch(err => {
                    return done(err);
                });
        });

        test('Should return error if id is invalid number', (done) => {
            const id = "xxxxxx";
            request(app)
                .post('/personnel/login')
                .send({
                    phone: phone,
                    password: password
                })
                .end((err, res) => {
                    const accessToken = res.body.accessToken;
                    const url = `/issue-category/${id}`;
                    request(app)
                        .delete(url)
                        .set('Authorization', 'Bearer ' + accessToken)
                        .end((err, resDel) => {
                            if (err) {
                                return done(err);
                            }
                            expect(resDel.statusCode).toBe(400);
                            expect(resDel.body.error.id).toBe("Invalid id provided");
                            done();
                        })

                })
        });

        test('Should return error if id does not exist', (done) => {
            const id = 888888888888888888888;
            request(app)
                .post('/personnel/login')
                .send({
                    phone: phone,
                    password: password
                })
                .end((err, res) => {
                    if (err) {
                        return done(err);
                    }
                    const accessToken = res.body.accessToken;
                    const url = `/issue-category/${id}`;
                    request(app)
                        .delete(url)
                        .set('Authorization', 'Bearer ' + accessToken)
                        .end((err, resDel) => {
                            if (err) {
                                return done(err);
                            }
                            expect(resDel.statusCode).toBe(400);
                            expect(resDel.body.error.id).toBe("Issue category does not exist");
                            done();
                        })

                })
        });

        test('Should return error if personnel is not logged in', (done) => {
            const id = 8;
            const url = `/issue-category/${id}`;
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


    //  List issue category without pagination
    describe("GET /issue-category/all", () => {
        test('Should get all issue category', (done) => {
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
                            .get(`/issue-category/all`)
                            .set('Authorization', 'Bearer ' + accessToken)
                            .end((err, res) => {
                                if (err) {
                                    return done(err);
                                } else {
                                    expect(res.statusCode).toBe(200);
                                    const items = res.body;
                                    expect(items.length).toBe(10);
                                    expect(items[1].id).toBe(2);
                                    expect(items[1].issue_category_name).toBe("Adult");
                                    expect(items[1].issue_id).toBe(6);
                                    expect(items[1].issue_name).toBe("Thrips");
                                    done();
                                }
                            })
                    }
                })
        });

        test('Should return error if personnel is not logged in', (done) => {
            const id = 8;
            request(app)
                .get(`/issue-category/all`)
                .end((err, res) => {
                    if (err) {
                        return done(err);
                    }
                    expect(res.statusCode).toBe(401);
                    done();
                })
        });
    })

});
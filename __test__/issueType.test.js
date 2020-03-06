const request = require("supertest");
const app = require("../src/app");

const IssueType = require("../models").IssueType;
const sequelize = require("sequelize");

jest.setTimeout(10000);

const phone = "0700000000";
const password = "123456";

describe("IssueType", () => {

    //  List issue-type
    describe("GET /issue-type", () => {
        test('Should get all issue-type', (done) => {
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
                            .get(`/issue-type?page=0&limit=5`)
                            .set('Authorization', 'Bearer ' + accessToken)
                            .end((err, res) => {
                                if (err) {
                                    return done(err);
                                } else {
                                    expect(res.statusCode).toBe(200);
                                    const items = res.body.items;
                                    expect(items.length).toBe(4);
                                    expect(items[1].id).toBe(2);
                                    expect(items[1].issue_type_name).toBe("Diseases");
                                    done();
                                }
                            })
                    }
                })
        });

        test('Should search issue-type by name', (done) => {
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
                            .get(`/issue-type?page=0&limit=5&name=Diseases`)
                            .set('Authorization', 'Bearer ' + accessToken)
                            .end((err, res) => {
                                if (err) {
                                    return done(err);
                                } else {
                                    expect(res.statusCode).toBe(200);
                                    const items = res.body.items;
                                    expect(items.length).toBe(1);
                                    expect(items[0].id).toBe(2);
                                    expect(items[0].issue_type_name).toBe("Diseases");
                                    done();
                                }
                            })
                    }
                });
        });

        test('Should return error if personnel is not logged in', (done) => {
            request(app)
                .get(`/issue-type`)
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

    // List issue-type without pagination
    describe("GET /issue-type/all", () => {
        test('Should get all issue types without pagination', (done) => {
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
                            .get(`/issue-type/all`)
                            .set('Authorization', 'Bearer ' + accessToken)
                            .end((err, res) => {
                                if (err) {
                                    return done(err);
                                } else {
                                    expect(res.statusCode).toBe(200);
                                    const items = res.body;
                                    expect(items.length).toBe(4);
                                    expect(items[1].id).toBe(2);
                                    expect(items[1].issue_type_name).toBe("Diseases");
                                    done();
                                }
                            })
                    }
                })
        });

        test('Should return error if personnel is not logged in', (done) => {
            request(app)
                .get(`/issue-type/all`)
                .end((err, res) => {
                    if (err) {
                        return done(err);
                    } else {
                        expect(res.statusCode).toBe(401);
                        done();
                    }
                })
        });
    })
});
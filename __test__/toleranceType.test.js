const request = require("supertest");
const app = require("../src/app");

const IssueType = require("../models").ToleranceType;
const sequelize = require("sequelize");

jest.setTimeout(10000);

const phone = "0700000000";
const password = "123456";

describe("ToleranceType", () => {

    //  List issue-type
    describe("GET /tolerance-type", () => {
        test('Should get all tolerance-type', (done) => {
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
                            .get(`/tolerance-type?page=0&limit=5`)
                            .set('Authorization', 'Bearer ' + accessToken)
                            .end((err, res) => {
                                if (err) {
                                    return done(err);
                                } else {
                                    expect(res.statusCode).toBe(200);
                                    const items = res.body.items;
                                    expect(items.length).toBe(4);
                                    expect(items[1].id).toBe(2);
                                    expect(items[1].tolerance_type_name).toBe("Pest1");
                                    done();
                                }
                            })
                    }
                })
        });

        test('Should search tolerance-type by name', (done) => {
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
                            .get(`/tolerance-type?page=0&limit=5&name=Pest1`)
                            .set('Authorization', 'Bearer ' + accessToken)
                            .end((err, res) => {
                                if (err) {
                                    return done(err);
                                } else {
                                    expect(res.statusCode).toBe(200);
                                    const items = res.body.items;
                                    expect(items.length).toBe(1);
                                    expect(items[0].id).toBe(2);
                                    expect(items[0].tolerance_type_name).toBe("Pest1");
                                    done();
                                }
                            })
                    }
                });
        });

        test('Should return error if personnel is not logged in', (done) => {
            request(app)
                .get(`/tolerance-type`)
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
    describe("GET /tolerance-type/all", () => {
        test('Should get all tolerance types without pagination', (done) => {
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
                            .get(`/tolerance-type/all`)
                            .set('Authorization', 'Bearer ' + accessToken)
                            .end((err, res) => {
                                if (err) {
                                    return done(err);
                                } else {
                                    expect(res.statusCode).toBe(200);
                                    const items = res.body;
                                    expect(items.length).toBe(4);
                                    expect(items[1].id).toBe(2);
                                    expect(items[1].tolerance_type_name).toBe("Pest 1");
                                    done();
                                }
                            })
                    }
                })
        });

        test('Should return error if tolerance type is not logged in', (done) => {
            request(app)
                .get(`/tolerance-type/all`)
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
const request = require("supertest");
const app = require("../src/app");

jest.setTimeout(10000);

const phone = "0700000000";
const password = "123456";

describe("GET /personnel-type", () => {
    test('Should get all personneltypes', (done) => {
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
                        .get(`/personnel-type`)
                        .set('Authorization', 'Bearer ' + accessToken)
                        .end((err, res) => {
                            if (err) {
                                return done(err);
                            } else {
                                expect(res.statusCode).toBe(200);
                                const items = res.body;
                                expect(items.length).toBe(2);
                                expect(items[1].id).toBe(2);
                                expect(items[1].personnel_type_name).toBe("Scout");
                                done();
                            }
                        })
                }
            })
    });
});
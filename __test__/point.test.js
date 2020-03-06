const request = require("supertest");
const app = require("../src/app");
const sequelize = require("sequelize");

jest.setTimeout(10000);

const phone = "0700000000";
const password = "123456";

describe("Point", () => {
  // Get request on point
  describe("GET /point", () => {
    test("Should get all points", done => {
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
              .get(`/point?page=0&limit=3`)
              .set("Authorization", "Bearer " + accessToken)
              .end((err, res) => {
                if (err) {
                  return done(err);
                } else {
                  expect(res.statusCode).toBe(200);
                  expect(res.body.items.length).toBe(3);
                  const point = res.body.items[1];
                  expect(point.point_name).toBeDefined();
                  done();
                }
              });
          }
        });
    });

    test("Should search point by point name", done => {
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
            const searchPoint = "Top";
            request(app)
              .get(`/point?page=0&limit=5&name=${searchPoint}`)
              .set("Authorization", "Bearer " + accessToken)
              .end((err, res) => {
                if (err) {
                  return done(err);
                } else {
                  expect(res.statusCode).toBe(200);
                  expect(res.body.items.length).toBe(1);

                  const point = res.body.items[0];
                  expect(point.point_name).toBe("Top");
                  expect(point.point_name).toBeDefined();
                  done();
                }
              });
          }
        });
    });
  });
  // Get request on point without pagination
  describe("GET /point/all", () => {
    test("Should get all points without pagination", done => {
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
              .get(`/point/all`)
              .set("Authorization", "Bearer " + accessToken)
              .end((err, res) => {
                if (err) {
                  return done(err);
                } else {
                  expect(res.statusCode).toBe(200);
                  expect(res.body.length).toBe(3);
                  const point = res.body[1];
                  expect(point.point_name).toBeDefined();
                  done();
                }
              });
          }
        });
    });
  });
});

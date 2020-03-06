const request = require("supertest");
const app = require("../src/app");
const sequelize = require("sequelize");

jest.setTimeout(10000);

const phone = "0700000000";
const password = "123456";

describe("Station", () => {
  // Get request on station
  describe("GET /station", () => {
    test("Should get all stations", done => {
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
              .get(`/station?page=0&limit=5`)
              .set("Authorization", "Bearer " + accessToken)
              .end((err, res) => {
                if (err) {
                  return done(err);
                } else {
                  expect(res.statusCode).toBe(200);
                  expect(res.body.items.length).toBe(5);
                  const station = res.body.items[1];
                  expect(station.station_name).toBeDefined();
                  done();
                }
              });
          }
        });
    });

    test("Should search station by station name", done => {
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
            const searchStation = "Station 2";
            request(app)
              .get(`/station?page=0&limit=5&name=${searchStation}`)
              .set("Authorization", "Bearer " + accessToken)
              .end((err, res) => {
                if (err) {
                  return done(err);
                } else {
                  expect(res.statusCode).toBe(200);
                  expect(res.body.items.length).toBe(1);

                  const station = res.body.items[0];
                  expect(station.station_name).toBe("Station 2");
                  expect(station.station_name).toBeDefined();
                  done();
                }
              });
          }
        });
    });
  });

  // Get request on station without pagination
  describe("GET /station/all", () => {
    test("Should get all stations without pagination", done => {
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
              .get(`/station/all`)
              .set("Authorization", "Bearer " + accessToken)
              .end((err, res) => {
                if (err) {
                  return done(err);
                } else {
                  expect(res.statusCode).toBe(200);
                  expect(res.body.length).toBe(15);
                  const station = res.body[1];
                  expect(station.station_name).toBeDefined();
                  done();
                }
              });
          }
        });
    });
  });
});

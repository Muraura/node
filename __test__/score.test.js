const request = require("supertest");
const app = require("../src/app");

jest.setTimeout(10000);

const phone = "0700000000";
const password = "123456";

describe("Score", () => {
  // Get request on score without pagination
  describe("GET /score", () => {
    test("Should get all scores without pagination", done => {
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
              .get(`/score/all`)
              .set("Authorization", "Bearer " + accessToken)
              .end((err, res) => {
                if (err) {
                  return done(err);
                } else {
                  expect(res.statusCode).toBe(200);
                  expect(res.body.length).toBe(2);
                  const score = res.body[1];
                  expect(score.score_name).toBeDefined();
                  done();
                }
              });
          }
        });
    });
  });
});

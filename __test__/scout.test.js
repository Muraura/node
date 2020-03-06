const request = require("supertest");
const app = require("../src/app");

const Scout = require("../models").Scout;
const sequelize = require("sequelize");
const Op = sequelize.Op;

jest.setTimeout(10000);

const phone = "0700000000";
const password = "123456";
// const bulkScout = 
// const bulkScout = [
//   {
//     block: 2,
//     bed: 1,
//     entry: 1,
//     point: 1,
//     personnel: "0774834466",
//     date: "2020-01-08T09:44:48+03:00",
//     issue_type: 2,
//     issue: 1,
//     issue_category: "",
//     value: 4,
//     plant: 1,
//     variety: 1,
//     longitude: "37.0110113",
//     latitude: "-0.1092173"
//   },
//   {
//     block: 2,
//     bed: 1,
//     entry: 1,
//     point: 1,
//     personnel: "0774834466",
//     date: "2020-01-08T09:44:48+03:00",
//     issue_type: 2,
//     issue: 1,
//     issue_category: "",
//     value: 4,
//     plant: 1,
//     variety: 1,
//     longitude: "37.0110113",
//     latitude: "-0.1092173"
//   },
//   {
//     block: 2,
//     bed: 1,
//     entry: 2,
//     point: 2,
//     personnel: "0774834466",
//     date: "2020-01-08T09:45:07+03:00",
//     issue_type: 1,
//     issue: 1,
//     issue_category: 1,
//     value: 1,
//     plant: 1,
//     variety: 1,
//     longitude: "37.0110113",
//     latitude: "-0.1092173"
//   },
//   {
//     block: 2,
//     bed: 1,
//     entry: "3",
//     point: 2,
//     personnel: "0774834466",
//     date: "2020-01-08T09:45:31+03:00",
//     issue_type: 1,
//     issue: 1,
//     issue_category: 1,
//     value: 1,
//     plant: 1,
//     variety: 1,
//     longitude: "37.0110113",
//     latitude: "-0.1092173"
//   },
//   {
//     block: 2,
//     bed: 1,
//     entry: "4",
//     point: "4",
//     personnel: "0774834466",
//     date: "2020-01-08T09:45:56+03:00",
//     issue_type: 1,
//     issue: 1,
//     issue_category: 1,
//     value: 1,
//     plant: 1,
//     variety: 1,
//     longitude: "37.0110113",
//     latitude: "-0.1092173"
//   },
//   {
//     block: 2,
//     bed: 1,
//     entry: "4",
//     point: 1,
//     personnel: "0774834466",
//     date: "2020-01-08T09:44:48+03:00",
//     issue_type: 2,
//     issue: 1,
//     issue_category: "",
//     value: 4,
//     plant: 1,
//     variety: 1,
//     longitude: "36.9875794",
//     latitude: "-0.0790282"
//   },
//   {
//     block: 2,
//     bed: 1,
//     entry: "4",
//     point: 1,
//     personnel: "0774834466",
//     date: "2020-01-08T09:45:56+03:00",
//     issue_type: 1,
//     issue: 1,
//     issue_category: 1,
//     value: 1,
//     plant: 1,
//     variety: 1,
//     longitude: "36.9875794",
//     latitude: "-0.0790282"
//   }
// ];

const testScout = {
  plant_id: 1,
  station_id: 1,
  point_id: 1,
  issue_id: 1,
  issue_category_id: 1,
  tolerance_id: 1,
  scout_value: 2,
  scout_longitude: "0.0223319",
  scout_latitude: "37.0722295",
  scout_date: "2020-01-08T09:44:48+03:00",
  created_by: 1,
  modified_by: 1,
  created_at: new Date(),
  updated_at: new Date()
};

describe("Scout", () => {
  describe("POST /scout/bulkInsert", () => {
    test("Should save bulk scout entries", (done) => {
        request(app)
            .post("/personnel/login")
            .send({
                phone: "0712005524",
                password: "1988"
            })
            .end((err, res) => {
                if (err) {
                    return done(err);
                }
                const accessToken = res.body.accessToken;
                request(app)
                    .post("/scout/bulkInsert")
                    .send({
                        fileContent: JSON.stringify(bulkScout),
                        fileName: "0774834466-20200110"
                    })
                    .set("Authorization", "Bearer " + accessToken)
                    .end((err, res) => {
                        if (err) {
                            return done(err);
                        }
                        expect(res.statusCode).toBe(200);
                        expect(res.body.message).toBe("Success");
                        done()
                        Scout
                            .destroy({
                                where: {
                                    created_by: 4
                                }
                            })
                            .then(() => {
                                done();
                            })
                            .catch(err => {
                                return done(err);
                            });
                    });
            });
    });
  });

  //  Fetch scout
  describe("GET /scout", () => {
    test("It should get all scouts", done => {
      // Login user
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
              .get(`/scout?page=0&limit=5`)
              .set("Authorization", "Bearer " + accessToken)
              .end((err, res) => {
                if (err) {
                  return done(err);
                } else {
                  expect(res.statusCode).toBe(200);
                  expect(res.body.rows).toBeDefined();
                  expect(res.body.items).toBeDefined();
                  expect(res.body.items[0].scout_date).toBeDefined();
                  expect(res.body.items[0].block_id).toBeDefined();
                  expect(res.body.items[0].block_name).toBeDefined();
                  expect(res.body.items[0].bed_id).toBeDefined();
                  expect(res.body.items[0].bed_name).toBeDefined();
                  expect(res.body.items[0].station_id).toBeDefined();
                  expect(res.body.items[0].station_name).toBeDefined();
                  expect(res.body.items[0].point_id).toBeDefined();
                  expect(res.body.items[0].point_name).toBeDefined();
                  expect(res.body.items[0].issue_type_id).toBeDefined();
                  expect(res.body.items[0].issue_type_name).toBeDefined();
                  expect(res.body.items[0].issue_id).toBeDefined();
                  expect(res.body.items[0].issue_name).toBeDefined();
                  expect(res.body.items[0].issue_category_id).toBeDefined();
                  expect(res.body.items[0].issue_category_name).toBeDefined();
                  expect(res.body.items[0].scout_value).toBeDefined();
                  expect(res.body.items[0].tolerance_id).toBeDefined();
                  expect(res.body.items[0].tolerance_name).toBeDefined();
                  done();
                }
              });
          }
        });
    });
  });

  //  Farm reporting test
  describe("GET /scout/tolerance/farm", () => {
    test("It should fetch all parent block and threat status (Success, Warning or danger)", done => {
      // Login user
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
              .get(`/scout/tolerance/farm`)
              .set("Authorization", "Bearer " + accessToken)
              .end((err, res) => {
                if (err) {
                  return done(err);
                } else {
                  console.log(res.error);
                  expect(res.statusCode).toBe(200);
                  const farmArray = res.body[0];
                  expect(farmArray.block_id).toBeDefined();
                  expect(farmArray.block_name).toBeDefined();
                  expect(farmArray.scout_alert).toBeDefined();
                  expect(farmArray.block_issue_types).toBeDefined();
                  expect(farmArray.block_issue_types[0].issue_type_name).toBe(
                    "Pests"
                  );
                  expect(farmArray.block_issue_types[0].alert).toBeDefined();
                  expect(farmArray.block_issue_types[1].issue_type_name).toBe(
                    "Diseases"
                  );
                  expect(farmArray.block_issue_types[1].alert).toBeDefined();
                  expect(farmArray.block_issue_types[2].issue_type_name).toBe(
                    "Beneficials"
                  );
                  expect(farmArray.block_issue_types[2].alert).toBeDefined();
                  expect(farmArray.block_issue_types[3].issue_type_name).toBe(
                    "Others"
                  );
                  expect(farmArray.block_issue_types[3].alert).toBeDefined();
                  done();
                }
              });
          }
        });
    });
  });

  // //  Block reporting test
  describe("GET /scout/tolerance/block", () => {
    test("It should fetch all beds in a block and threat status (Success, Warning or danger)", done => {
      // Login user
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
            const blockId = 1;
            request(app)
              .get(`/scout/tolerance/block?block=${blockId}`)
              .set("Authorization", "Bearer " + accessToken)
              .end((err, res) => {
                if (err) {
                  return done(err);
                } else {
                  expect(res.statusCode).toBe(200);
                  expect(res.body.block_name).toBeDefined();
                  expect(res.body.beds).toBeDefined();
                  const blockArray = res.body.beds[0];
                  expect(blockArray.bed_id).toBeDefined();
                  expect(blockArray.bed_number).toBeDefined();
                  expect(blockArray.bed_name).toBeDefined();
                  expect(blockArray.alert).toBeDefined();
                  done();
                }
              });
          }
        });
    });

    test("It should return an error if block id is not given", done => {
      // Login user
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
              .get(`/scout/tolerance/block`)
              .set("Authorization", "Bearer " + accessToken)
              .end((err, res) => {
                if (err) {
                  return done(err);
                } else {
                  expect(res.statusCode).toBe(400);
                  expect(res.body.error).toBe("Invalid block id");
                  done();
                }
              });
          }
        });
    });
  });

  //  Farm reporting test
  describe("GET /scout/block/entry/date", () => {
    test("It should fetch all entries per block", done => {
      // Login user
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
              .get(`/scout/block/entry/date?block=1`)
              .set("Authorization", "Bearer " + accessToken)
              .end((err, res) => {
                if (err) {
                  return done(err);
                } else {
                  expect(res.statusCode).toBe(200);
                  expect(res.body.block).toBeDefined();
                  expect(res.body.dates).toBeDefined();
                  done();
                }
              });
          }
        });
    });

    test("Entry dates should return an error if block id is not given", done => {
      // Login user
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
              .get(`/scout/block/entry/date`)
              .set("Authorization", "Bearer " + accessToken)
              .end((err, res) => {
                if (err) {
                  return done(err);
                } else {
                  expect(res.statusCode).toBe(400);
                  expect(res.body.error).toBe("Invalid block id");
                  done();
                }
              });
          }
        });
    });
  });

  //  Block print reporting test(print)
  describe("GET scout/bed/entry/report", () => {
    test("It should get beds in a block with their threat level", done => {
      // Login user
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
            const blockId = 1;
            request(app)
              .get(`/scout/bed/entry/report?block=${blockId}`)
              .set("Authorization", "Bearer " + accessToken)
              .end((err, res) => {
                if (err) {
                  return done(err);
                } else {
                  expect(res.statusCode).toBe(200);

                  const bed = res.body[0];
                  expect(bed.bed_id).toBeDefined();
                  expect(bed.bed_name).toBeDefined();
                  expect(bed.bed_number).toBeDefined();
                  expect(bed.bed_block_name).toBeDefined();
                  expect(bed.variety).toBeDefined();
                  expect(bed.personnel).toBeDefined();
                  expect(bed.date).toBeDefined();
                  expect(bed.stations).toBeDefined();
                  expect(bed.personnel).toBeDefined();
                  expect(bed.date).toBeDefined();

                  const bedArray = bed.stations[0];
                  expect(bedArray.entry_name).toBeDefined();
                  expect(bedArray.entry_id).toBeDefined();
                  expect(bedArray.alert).toBeDefined();
                  done();
                }
              });
          }
        });
    });
  });

  // Bed reporting test
  describe("GET /scout/entry/all/", () => {
    test("It should fetch all entries per bed", done => {
      // Login user
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
              .get(`/scout/entry/all?bed=1`)
              .set("Authorization", "Bearer " + accessToken)
              .end((err, res) => {
                if (err) {
                  return done(err);
                } else {
                  expect(res.statusCode).toBe(200);

                  expect(res.body.fetchedBedId).toBeDefined();
                  expect(res.body.bed_name).toBeDefined();
                  expect(res.body.bed_number).toBeDefined();
                  expect(res.body.bedArray).toBeDefined();

                  const entry = res.body.bedArray[0];
                  expect(entry.entry_id).toBeDefined();
                  expect(entry.entry_name).toBeDefined();
                  expect(entry.date).toBeDefined();
                  expect(entry.alert).toBeDefined();
                  done();
                }
              });
          }
        });
    });
    test("It should fetch bed with its scouting date", done => {
      // Login user
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
              .get(`/scout/entry/all?bed=1&created=2020-01-07`)
              .set("Authorization", "Bearer " + accessToken)
              .end((err, res) => {
                if (err) {
                  return done(err);
                } else {
                  expect(res.statusCode).toBe(200);

                  expect(res.body.fetchedBedId).toBeDefined();
                  expect(res.body.bed_name).toBeDefined();
                  expect(res.body.bed_number).toBeDefined();
                  expect(res.body.bedArray).toBeDefined();

                  const entry = res.body.bedArray[0];
                  expect(entry.entry_id).toBeDefined();
                  expect(entry.entry_name).toBeDefined();
                  expect(entry.date).toBeDefined();
                  expect(entry.date).toBe("2020-01-07");
                  expect(entry.alert).toBeDefined();
                  done();
                }
              });
          }
        });
    });
  });

  //  Entry reporting test
  describe("GET /scout/tolerance/entry", () => {
    test("It should fetch all points in an entry and threat status (Success, Warning or danger)", done => {
      // Login user
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
              .get(`/scout/tolerance/entry?bed=1&entry=4`)
              .set("Authorization", "Bearer " + accessToken)
              .end((err, res) => {
                if (err) {
                  return done(err);
                } else {
                  expect(res.statusCode).toBe(200);

                  expect(res.body.fetchedEntryId).toBeDefined();
                  expect(res.body.fetchedEntryName).toBeDefined();
                  expect(res.body.entryArray).toBeDefined();
                  done();
                }
              });
          }
        });
    });

    test("It should fetch all points in an entry filtered by date and threat status (Success, Warning or danger)", done => {
      // Login user
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
              .get(`/scout/tolerance/entry?bed=1&entry=4&date=2020-01-07`)
              .set("Authorization", "Bearer " + accessToken)
              .end((err, res) => {
                if (err) {
                  return done(err);
                } else {
                  expect(res.statusCode).toBe(200);

                  expect(res.body.fetchedEntryId).toBeDefined();
                  expect(res.body.fetchedEntryName).toBeDefined();
                  expect(res.body.entryArray).toBeDefined();

                  const entry = res.body.entryArray[0];
                  expect(entry.point_id).toBeDefined();
                  expect(entry.point_name).toBeDefined();
                  expect(entry.issue_name).toBeDefined();
                  expect(entry.issue_category).toBeDefined();
                  expect(entry.issue_type_name).toBeDefined();
                  expect(entry.scoring).toBeDefined();
                  expect(entry.value).toBeDefined();
                  expect(entry.alert).toBeDefined();

                  done();
                }
              });
          }
        });
    });
  });

  describe("GET /scout/personnel", () => {
    test("It should get each scouts latest 10 entries", done => {
      // Login user
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
              .get(`/scout/personnel`)
              .set("Authorization", "Bearer " + accessToken)
              .end((err, res) => {
                if (err) {
                  return done(err);
                } else {
                  expect(res.statusCode).toBe(200);
                  expect(res.body.rows).toBeDefined();
                  expect(res.body.items).toBeDefined();
                  done();
                }
              });
          }
        });
    });
    test("It should get each scouts entries filtered by date", done => {
      // Login user
      request(app)
        .post("/personnel/login")
        .send({
          phone: "0712345678",
          password: password
        })
        .end((err, res) => {
          if (err) {
            return done(err);
          } else {
            const accessToken = res.body.accessToken;
            request(app)
              .get(`/scout/personnel?date=2020-01-07`)
              .set("Authorization", "Bearer " + accessToken)
              .end((err, res) => {
                if (err) {
                  return done(err);
                } else {
                  console.log(res.error);
                  expect(res.statusCode).toBe(200);
                  expect(res.body.rows).toBeDefined();
                  expect(res.body.items).toBeDefined();
                  expect(res.body.items[0].scout_date).toBeDefined();
                  expect(res.body.items[0].block_id).toBeDefined();
                  expect(res.body.items[0].block_name).toBeDefined();
                  expect(res.body.items[0].bed_id).toBeDefined();
                  expect(res.body.items[0].bed_name).toBeDefined();
                  expect(res.body.items[0].station_id).toBeDefined();
                  expect(res.body.items[0].station_name).toBeDefined();
                  expect(res.body.items[0].point_id).toBeDefined();
                  expect(res.body.items[0].point_name).toBeDefined();
                  expect(res.body.items[0].issue_type_id).toBeDefined();
                  expect(res.body.items[0].issue_type_name).toBeDefined();
                  expect(res.body.items[0].issue_id).toBeDefined();
                  expect(res.body.items[0].issue_name).toBeDefined();
                  expect(res.body.items[0].issue_category_id).toBeDefined();
                  expect(res.body.items[0].issue_category_name).toBeDefined();
                  expect(res.body.items[0].scout_value).toBeDefined();
                  expect(res.body.items[0].tolerance_id).toBeDefined();
                  expect(res.body.items[0].tolerance_name).toBeDefined();
                  expect(res.body.items[0].score_id).toBeDefined();
                  expect(res.body.items[0].score_name).toBeDefined();
                  done();
                }
              });
          }
        });
    });
  });

  //  Farm prevalence
  describe("GET scout/farm/prevalence/", () => {
    test("It should get farm with its prevalence level", done => {
      // Login user
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
            const sdate = "2020-01-07";
            const edate = "2020-01-08";
            request(app)
              .get(`/scout/farm/prevalence?sdate=${sdate}&edate=${edate}`)
              .set("Authorization", "Bearer " + accessToken)
              .end((err, res) => {
                if (err) {
                  return done(err);
                } else {
                  expect(res.statusCode).toBe(200);
                  const items = res.body[0];
                  expect(items.issue_name).toBeDefined();
                  expect(items.issue_data).toBeDefined();
                  expect(items.issue_data.labels).toBeDefined();
                  expect(items.issue_data.datasets).toBeDefined();
                  done();
                }
              });
          }
        });
    });
    test("It should filter block in a farm with its prevalence level", done => {
      // Login user
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
            const sdate = "2020-01-07";
            const edate = "2020-01-08";
            const blockId = 1;
            request(app)
              .get(
                `/scout/farm/prevalence?sdate=${sdate}&edate=${edate}&block=${blockId}`
              )
              .set("Authorization", "Bearer " + accessToken)
              .end((err, res) => {
                if (err) {
                  return done(err);
                } else {
                  expect(res.statusCode).toBe(200);
                  const items = res.body[0];
                  expect(items.issue_name).toBeDefined();
                  expect(items.issue_data).toBeDefined();
                  expect(items.issue_data.labels).toBeDefined();
                  expect(items.issue_data.datasets).toBeDefined();
                  done();
                }
              });
          }
        });
    });

    test("It should filter issue in a farm  with its prevalence level", done => {
      // Login user
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
            const sdate = "2020-01-07";
            const edate = "2020-01-08";
            const issue = 1;
            request(app)
              .get(
                `/scout/farm/prevalence?sdate=${sdate}&edate=${edate}&issue=${issue}`
              )
              .set("Authorization", "Bearer " + accessToken)
              .end((err, res) => {
                if (err) {
                  return done(err);
                } else {
                  expect(res.statusCode).toBe(200);
                  const items = res.body[0];
                  expect(items.issue_name).toBeDefined();
                  expect(items.issue_data).toBeDefined();
                  expect(items.issue_data.labels).toBeDefined();
                  expect(items.issue_data.datasets).toBeDefined();
                  done();
                }
              });
          }
        });
    });

    test("It should filter personnel in a farm  with its prevalence level", done => {
      // Login user
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
            const sdate = "2020-01-07";
            const edate = "2020-01-08";
            const created_by = 3;
            request(app)
              .get(
                `/scout/farm/prevalence?sdate=${sdate}&edate=${edate}&created_by=${created_by}`
              )
              .set("Authorization", "Bearer " + accessToken)
              .end((err, res) => {
                if (err) {
                  return done(err);
                } else {
                  expect(res.statusCode).toBe(200);
                  const items = res.body[0];
                  expect(items.issue_name).toBeDefined();
                  expect(items.issue_data).toBeDefined();
                  expect(items.issue_data.labels).toBeDefined();
                  expect(items.issue_data.datasets).toBeDefined();
                  done();
                }
              });
          }
        });
    });
  });

  describe("GET scout/all", () => {
    test("It should get all scout without pagination", done => {
      // Login user
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
              .get(`/scout/all`)
              .set("Authorization", "Bearer " + accessToken)
              .end((err, res) => {
                if (err) {
                  return done(err);
                } else {
                  expect(res.statusCode).toBe(200);
                  const items = res.body[0];
                  expect(items.scout_date).toBeDefined();
                  expect(items.block_id).toBeDefined();
                  expect(items.block_name).toBeDefined();
                  expect(items.bed_id).toBeDefined();
                  expect(items.bed_name).toBeDefined();
                  expect(items.station_id).toBeDefined();
                  expect(items.station_name).toBeDefined();
                  expect(items.point_id).toBeDefined();
                  expect(items.point_name).toBeDefined();
                  expect(items.issue_type_id).toBeDefined();
                  expect(items.issue_type_name).toBeDefined();
                  expect(items.issue_id).toBeDefined();
                  expect(items.issue_name).toBeDefined();
                  expect(items.issue_category_id).toBeDefined();
                  expect(items.issue_category_name).toBeDefined();
                  expect(items.scout_value).toBeDefined();
                  expect(items.tolerance_id).toBeDefined();
                  expect(items.tolerance_name).toBeDefined();
                  done();
                }
              });
          }
        });
    });
  });

  describe("GET scout/update-tolerance", () => {
    // test('Add tolerance to scout', (done) => {
    //     // Login user
    //     request(app)
    //         .post('/personnel/login')
    //         .send({
    //             phone: phone,
    //             password: password
    //         })
    //         .end((err, res) => {
    //             if (err) {
    //                 return done(err);
    //             } else {
    //                 const accessToken = res.body.accessToken;
    //                 request(app)
    //                     .get(`/scout/update-tolerance`)
    //                     .set('Authorization', 'Bearer ' + accessToken)
    //                     .end((err, res) => {
    //                         if (err) {
    //                             return done(err);
    //                         } else {
    //                             // console.log(res.body)
    //                             res.should.have.status(200);
    //                             res.body.should.be.a('object');
    //                             done();
    //                         }
    //                     })
    //             }
    //         })
    // });
  });

  describe("GET scout/time-report", () => {
    test("It should get average time of block, bed & station for all scouts per day", done => {
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
            const scoutDate1 = "2020-01-07";
            const accessToken = res.body.accessToken;
            const blockId = 1;

            request(app)
              .get(`/scout/time-report?date=${scoutDate1}&block=${blockId}`)
              .set("Authorization", "Bearer " + accessToken)
              .end((err, res) => {
                if (err) {
                  return done(err);
                } else {
                  expect(res.statusCode).toBe(200);
                  const items = res.body[0];
                  expect(items.personnel_id).toBeDefined();
                  expect(items.personnel_name).toBeDefined();
                  expect(items.average_block_time).toBeDefined();
                  expect(items.average_bed_time).toBeDefined();
                  expect(items.average_station_time).toBeDefined();
                  expect(items.scouted_blocks).toBeDefined();
                  expect(items.total_beds).toBeDefined();
                  expect(items.total_stations).toBeDefined();
                  expect(items.scouted_stations).toBeDefined();
                  done();
                }
              });
          }
        });
    });
  });

  describe("Get /scout/location", () => {
    test("It should get scout location", done => {
      // Login user
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
            const date = "2020-01-08";
            const block = 1;
            request(app)
              .get(`/scout/location?date=${date}&block=${block}`)
              .set("Authorization", "Bearer " + accessToken)
              .end((err, res) => {
                if (err) {
                  return done(err);
                } else {
                  console.log(res.error);
                  expect(res.statusCode).toBe(200);
                  const items = res.body[0];
                  expect(items.lng).toBeDefined();
                  expect(items.lat).toBeDefined();
                  done();
                }
              });
          }
        });
    });

    // test('It should get scout location of given scout', (done) => {
    //     // Login user
    //     request(app)
    //         .post('/personnel/login')
    //         .send({
    //             phone: phone,
    //             password: password
    //         })
    //         .end((err, res) => {
    //             if (err) {
    //                 return done(err);
    //             } else {
    //                 const accessToken = res.body.accessToken;
    //                 let scoutId = "5d887623fe1e846914abb697";
    //                 request(app)
    //                     .get(`/scout/location?created_by=${scoutId}`)
    //                     .set('Authorization', 'Bearer ' + accessToken)
    //                     .end((err, res) => {
    //                         if (err) {
    //                             return done(err);
    //                         } else {
    //                             // console.log(res.body)
    //                             res.should.have.status(200);
    //                             res.body.should.be.a('array');
    //                             res.body[0].lng.should.not.be.undefined;
    //                             res.body[0].lat.should.not.be.undefined;
    //                             done();
    //                         }
    //                     })
    //             }
    //         })
    // });
    // test('It should get scout location of given scout', (done) => {
    //     // Login user
    //     request(app)
    //         .post('/personnel/login')
    //         .send({
    //             phone: phone,
    //             password: password
    //         })
    //         .end((err, res) => {
    //             if (err) {
    //                 return done(err);
    //             } else {
    //                 const accessToken = res.body.accessToken;
    //                 let scoutId = "5d887623fe1e846914abb697";
    //                 let blockId = "5d87b95a6de14122f4b12e30";
    //                 request(app)
    //                     .get(`/scout/location?created_by=${scoutId}&block=${blockId}`)
    //                     .set('Authorization', 'Bearer ' + accessToken)
    //                     .end((err, res) => {
    //                         if (err) {
    //                             return done(err);
    //                         } else {
    //                             //console.log(res.body)
    //                             res.should.have.status(200);
    //                             res.body.should.be.a('array');
    //                             done();
    //                         }
    //                     })
    //             }
    //         })
    // });
    // test('It should get scout location of given scout', (done) => {
    //     // Login user
    //     request(app)
    //         .post('/personnel/login')
    //         .send({
    //             phone: phone,
    //             password: password
    //         })
    //         .end((err, res) => {
    //             if (err) {
    //                 return done(err);
    //             } else {
    //                 const accessToken = res.body.accessToken;
    //                 let scoutId = "5d887623fe1e846914abb697";
    //                 let blockId = "1";
    //                 const date = "2019-11-28"
    //                 request(app)
    //                     //  .get(`/scout/location`)
    //                     .get(`/scout/location?date=${date}&created_by=${scoutId}&block=${blockId}`)
    //                     .set('Authorization', 'Bearer ' + accessToken)
    //                     .end((err, res) => {
    //                         if (err) {
    //                             return done(err);
    //                         } else {
    //                             // console.log(res.body)
    //                             res.should.have.status(200);
    //                             res.body.should.be.a('array');
    //                             done();
    //                         }
    //                     })
    //             }
    //         })
    // });
  });

  //  Alert per variety test
  // describe("GET /scout/tolerance/farm/variety", () => {
  //   test('It should get varieties with their threat alerts', (done) => {
  //     // Login user
  //     request(app)
  //       .post('/personnel/login')
  //       .send({
  //         phone: phone,
  //         password: password
  //       })
  //       .end((err, res) => {
  //         if (err) {
  //           return done(err);
  //         } else {
  //           const accessToken = res.body.accessToken;
  //           request(app)
  //             .get(`/scout/tolerance/farm/variety`)
  //             .set('Authorization', 'Bearer ' + accessToken)
  //             .end((err, res) => {
  //               if (err) {
  //                 return done(err);
  //               } else {
  //                 console.log(res.error)
  //                 expect(res.statusCode).toBe(200);
  //                 const items = res.body[0];
  //                 expect(items.personnel_id).toBeDefined();
  //                 expect(items.personnel_name).toBeDefined();
  //                 expect(items.average_block_time).toBeDefined();
  //                 expect(items.average_bed_time).toBeDefined();
  //                 expect(items.average_station_time).toBeDefined();
  //                 expect(items.scouted_blocks).toBeDefined();
  //                 expect(items.total_beds).toBeDefined();
  //                 expect(items.total_stations).toBeDefined();
  //                 expect(items.scouted_stations).toBeDefined();
  //                 done();
  //               }
  //             })
  //         }
  //       })
  //   });
  //   // test('It should filter  varieties  in a block with their threat alerts', (done) => {
  //   //     // Login user
  //   //     request(app)
  //   //         .post('/personnel/login')
  //   //         .send({
  //   //             phone: phone,
  //   //             password: password
  //   //         })
  //   //         .end((err, res) => {
  //   //             if (err) {
  //   //                 return done(err);
  //   //             } else {
  //   //                 const accessToken = res.body.accessToken;
  //   //                 const blockId = "1"
  //   //                 request(app)
  //   //                     .get(`/scout/tolerance/farm/variety?block=${blockId}`)
  //   //                     .set('Authorization', 'Bearer ' + accessToken)
  //   //                     .end((err, res) => {
  //   //                         if (err) {
  //   //                             return done(err);
  //   //                         } else {
  //   //                             //console.log(res.body)
  //   //                             res.should.have.status(200);
  //   //                             res.body.should.be.a('array');
  //   //                             done();
  //   //                         }
  //   //                     })
  //   //             }
  //   //         })
  //   // });
  //   // test('It should filter  a variety in a farm with its their threat alerts', (done) => {
  //   //     // Login user
  //   //     request(app)
  //   //         .post('/personnel/login')
  //   //         .send({
  //   //             phone: phone,
  //   //             password: password
  //   //         })
  //   //         .end((err, res) => {
  //   //             if (err) {
  //   //                 return done(err);
  //   //             } else {
  //   //                 const accessToken = res.body.accessToken;
  //   //                 const blockId = "1"
  //   //                 const varietyId = "5d87bc696de14122f4b12e51";
  //   //                 request(app)
  //   //                     .get(`/scout/tolerance/farm/variety?variety=${varietyId}`)
  //   //                     .set('Authorization', 'Bearer ' + accessToken)
  //   //                     .end((err, res) => {
  //   //                         if (err) {
  //   //                             return done(err);
  //   //                         } else {
  //   //                             //console.log(res.body)
  //   //                             res.should.have.status(200);
  //   //                             res.body.should.be.a('array');
  //   //                             done();
  //   //                         }
  //   //                     })
  //   //             }
  //   //         })
  //   // });
  // });
});

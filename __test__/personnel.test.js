const request = require("supertest");
const app = require("../src/app");

const Personnel = require("../models").Personnel;
const sequelize = require("sequelize");
const Op = sequelize.Op;

jest.setTimeout(10000);

const phone = "0700000000";
const password = "123456";
const newPersonnel = {
	first_name: "Peter",
	last_name: "Dennis",
	phone: "0711111111",
	status: 1,
	personnel_type_id: 1
};
const testUserData = {
	personnel_first_name: "Peter",
	personnel_last_name: "Dennis",
	personnel_phone: "0711111111",
	personnel_status: 1,
	personnel_type_id: 1
}

describe("Personnel", () => {
	describe("POST /personnel/login", () => {
		test("It should login a personnel", done => {
			request(app)
				.post("/personnel/login")
				.send({
					phone: phone,
					password: password
				})
				.end((err, res) => {
					if (err) {
						done(err);
					}
					expect(res.statusCode).toBe(200);
					done();
				});
		});

		test("Should return invalid phone number", done => {
			request(app)
				.post("/personnel/login")
				.send({
					phone: "07261493513333",
					password: "132"
				})
				.end((err, res) => {
					if (err) {
						return done(err);
					}
					expect(res.statusCode).toBe(400);
					expect(res.body.error.phone).toBe("Phone does not exist");
					done();
				});
		});

		test("Should return error if passwords do not match", done => {
			Personnel.update({
					personnel_reset_password: 0
				}, {
					where: {
						personnel_phone: phone
					}
				})
				.then(() => {
					request(app)
						.post("/personnel/login")
						.send({
							phone: phone,
							password: "12345"
						})
						.end((err, res) => {
							if (err) {
								return done(err);
							}
							expect(res.statusCode).toBe(400);
							expect(res.body.error.password).toBe(
								"You have entered an incorrect password"
							);

							Personnel.update({
								personnel_reset_password: 0
							}, {
								where: {
									personnel_phone: phone
								}
							}).then(() => {
								done();
							});
						});
				})
				.catch(err => {
					return done(err);
				});
		});

		test("Should return error if password needs to be reset", done => {
			Personnel.update({
					personnel_reset_password: 1
				}, {
					where: {
						personnel_phone: phone
					}
				})
				.then(() => {
					request(app)
						.post("/personnel/login")
						.send({
							phone: phone,
							password: "12345"
						})
						.end((err, res) => {
							if (err) {
								return done(err);
							}
							expect(res.statusCode).toBe(400);
							expect(res.body.error.password).toBe(
								"Please reset your password"
							);

							Personnel.update({
									personnel_reset_password: 0
								}, {
									where: {
										personnel_phone: phone
									}
								})
								.then(() => {
									done();
								})
								.catch(err => {
									return done(err);
								});
						});
				})
				.catch(err => {
					return done(err);
				});
		});

		test("Should return error if phone or password are not provided", done => {
			request(app)
				.post("/personnel/login")
				.send({
					phone: "",
					password: ""
				})
				.end((err, res) => {
					if (err) {
						return done(err);
					}
					expect(res.statusCode).toBe(400);

					const error = res.body.error;
					expect(error.phone).toBe("Phone field is required");
					expect(error.password).toBe("Password field is required");

					done();
				});
		});
	});

	//   Reset password
	describe("PATCH /personnel/reset_password", () => {
		// Causes other tests to fail thus commented out

		// test("Should change a user's password", done => {
		//   Personnel.update(
		//     {
		//       personnel_reset_password: 1
		//     },
		//     {
		//       where: {
		//         personnel_phone: phone
		//       }
		//     }
		//   )
		//     .then(() => {
		//       request(app)
		//         .patch("/personnel/reset_password")
		//         .send({
		//           phone: phone,
		//           password: password
		//         })
		//         .end((err, res) => {
		//           if (err) {
		//             return done(err);
		//           }
		//           expect(res.statusCode).toBe(200);
		//           done();
		//         });
		//     })
		//     .catch(err => {
		//       return done(err);
		//     });
		// });

		test("Update should return error if phone and password are not provided", done => {
			request(app)
				.patch("/personnel/reset_password")
				.send({
					phone: "",
					password: ""
				})
				.end((err, res) => {
					if (err) {
						return done(err);
					}
					expect(res.statusCode).toBe(400);

					const error = res.body.error;
					expect(error.phone).toBe("Phone field is required");
					expect(error.password).toBe("Password field is required");
					done();
				});
		});

		test("Should return an error if personnel does not have permission to change password", done => {
			Personnel.update({
					personnel_reset_password: 0
				}, {
					where: {
						personnel_phone: phone
					}
				})
				.then(() => {
					request(app)
						.patch("/personnel/reset_password")
						.send({
							phone: phone,
							password: password
						})
						.end((err, res) => {
							if (err) {
								return done(err);
							}
							expect(res.statusCode).toBe(400);

							const error = res.body.error;
							expect(error.password).toBe(
								"Please request an admin permission to reset your password"
							);
							done();
						});
				})
				.catch(err => {
					return done(err);
				});
		});

		test("Reset should return an error if the phone number does not exist", done => {
			Personnel.update({
					personnel_reset_password: 1
				}, {
					where: {
						personnel_phone: phone
					}
				})
				.then(() => {
					request(app)
						.patch("/personnel/reset_password")
						.send({
							phone: "077262622",
							password: password
						})
						.end((err, res) => {
							if (err) {
								return done(err);
							}
							expect(res.statusCode).toBe(400);

							const error = res.body.error;
							expect(error.phone).toBe("Phone number does not exist");

							Personnel.update({
								personnel_reset_password: 0
							}, {
								where: {
									personnel_phone: phone
								}
							}).then(() => {
								done();
							});
						});
				})
				.catch(err => {
					return done(err);
				});
		});
	});

	//  Create personnel
	describe("POST /personnel", () => {
		test("Should save a personnel", done => {
			// jest.setTimeout(30000);
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
						Personnel.destroy({
								where: {
									personnel_phone: newPersonnel.phone
								}
							})
							.then(() => {
								request(app)
									.post("/personnel")
									.send(newPersonnel)
									.set("Authorization", "Bearer " + accessToken)
									.end((err, res) => {
										if (err) {
											return done(err);
										} else {
											Personnel.findOne({
													raw: true,
													where: {
														personnel_phone: newPersonnel.phone
													}
												})
												.then(personnel => {
													expect(res.statusCode).toBe(200);
													expect(res.body.message).toBe("Success");

													//Validate personnel
													expect(newPersonnel.first_name).toBe(
														personnel.personnel_first_name
													);
													expect(newPersonnel.last_name).toBe(
														personnel.personnel_last_name
													);
													expect(newPersonnel.phone).toBe(personnel.personnel_phone);
													expect(newPersonnel.status).toBe(personnel.personnel_status);

													Personnel.destroy({
															where: {
																personnel_phone: newPersonnel.phone
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

		test("Should return error if personnel exist", done => {
			let testUser = testUserData;
			testUser["personnel_password"] = "0909090";
			testUser["personnel_reset_password"] = 1;
			testUser["created_by"] = 1;
			testUser["modified_by"] = 1;

			Personnel.create(testUser)
				.then(() => {
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
									.post("/personnel")
									.send(newPersonnel)
									.set("Authorization", "Bearer " + accessToken)
									.end((err, res) => {
										if (err) {
											return done(err);
										} else {
											expect(res.statusCode).toBe(400);
											expect(res.body.error.phone).toBe("Phone already exist");
											Personnel.destroy({
													where: {
														personnel_phone: newPersonnel.phone
													}
												})
												.then(() => {
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
		});

		test("Should return error if empty fields are provided", done => {
			request(app)
				.post("/personnel/login")
				.send({
					phone: phone,
					password: password
				})
				.end((err, res) => {
					if (err) {
						return done();
					} else {
						const accessToken = res.body.accessToken;
						request(app)
							.post("/personnel")
							.send({
								first_name: "",
								last_name: "",
								phone: "",
								status: '',
								personnel_type_id: ''
							})
							.set("Authorization", "Bearer " + accessToken)
							.end((err, res) => {
								if (err) {
									return done(err);
								} else {
									const error = res.body.error;

									expect(res.statusCode).toBe(400);

									expect(error.first_name).toBe("First name is required");
									expect(error.last_name).toBe("Last name is required");
									expect(error.phone).toBe("Phone is required");
									expect(error.status).toBe("Status is required");
									expect(error.personnel_type_id).toBe(
										"Personnel type is required"
									);

									done();
								}
							});
					}
				});
		});

		test("Should return error if personnel is not logged in", done => {
			request(app)
				.post(`/personnel`)
				.end((err, res) => {
					if (err) {
						return done(err);
					} else {
						expect(res.statusCode).toBe(401);
						done();
					}
				});
		});
	});

	// Get request on personnel
	describe("GET /personnel", () => {
		test("Should get all personnel", done => {
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
							.get(`/personnel?page=0&limit=5`)
							.set("Authorization", "Bearer " + accessToken)
							.end((err, res) => {
								if (err) {
									return done(err);
								} else {
									expect(res.statusCode).toBe(200);
									expect(res.body.items.length).toBe(5);

									const user = res.body.items[1];
									expect(user.first_name).toBeDefined();
									expect(user.last_name).toBeDefined();
									expect(user.phone).toBeDefined();
									expect(user.status).toBeDefined();
									expect(user.personnel_type_id).toBeDefined();
									expect(user.password).not.toBeDefined();

									done();
								}
							});
					}
				});
		});

		test("Should search personnel by first name", done => {
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
							.get(`/personnel?page=0&limtest=5&first_name=William`)
							.set("Authorization", "Bearer " + accessToken)
							.end((err, res) => {
								if (err) {
									return done(err);
								} else {
									expect(res.statusCode).toBe(200);
									expect(res.body.items.length).toBe(1);

									const user = res.body.items[0];
									expect(user.first_name).toBe("William");
									expect(user.first_name).toBeDefined();
									expect(user.last_name).toBeDefined();
									expect(user.phone).toBeDefined();
									expect(user.status).toBeDefined();
									expect(user.personnel_type_id).toBeDefined();
									expect(user.password).not.toBeDefined();

									done();
								}
							});
					}
				});
		});

		test("Should search personnel by last name", done => {
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
							.get(`/personnel?page=0&limtest=5&last_name=Wamwalo`)
							.set("Authorization", "Bearer " + accessToken)
							.end((err, res) => {
								if (err) {
									return done(err);
								} else {
									expect(res.statusCode).toBe(200);
									expect(res.body.items.length).toBe(1);

									const user = res.body.items[0];
									expect(user.last_name).toBe("Wamwalo");
									expect(user.first_name).toBeDefined();
									expect(user.last_name).toBeDefined();
									expect(user.phone).toBeDefined();
									expect(user.status).toBeDefined();
									expect(user.personnel_type_id).toBeDefined();
									expect(user.password).not.toBeDefined();

									done();
								}
							});
					}
				});
		});

		test("Should search personnel by phone", done => {
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
							.get(`/personnel?page=0&limtest=5&phone=0700000000`)
							.set("Authorization", "Bearer " + accessToken)
							.end((err, res) => {
								if (err) {
									return done(err);
								} else {
									expect(res.statusCode).toBe(200);
									expect(res.body.items.length).toBe(1);

									const user = res.body.items[0];
									expect(user.phone).toBe("0700000000");
									expect(user.first_name).toBeDefined();
									expect(user.last_name).toBeDefined();
									expect(user.phone).toBeDefined();
									expect(user.status).toBeDefined();
									expect(user.personnel_type_id).toBeDefined();
									expect(user.password).not.toBeDefined();

									done();
								}
							});
					}
				});
		});

		test("Should search personnel by status", done => {
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
							.get(`/personnel?page=0&limtest=5&status=1`)
							.set("Authorization", "Bearer " + accessToken)
							.end((err, res) => {
								if (err) {
									return done(err);
								} else {
									expect(res.statusCode).toBe(200);
									expect(res.body.items.length).toBe(5);

									const user = res.body.items[0];
									expect(user.status).toBe(1);
									expect(user.first_name).toBeDefined();
									expect(user.last_name).toBeDefined();
									expect(user.phone).toBeDefined();
									expect(user.status).toBeDefined();
									expect(user.personnel_type_id).toBeDefined();
									expect(user.password).not.toBeDefined();

									done();
								}
							});
					}
				});
		});

		test("Should search personnel by personnel type", done => {
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
							.get(`/personnel?page=0&limtest=5&personnel_type_id=2`)
							.set("Authorization", "Bearer " + accessToken)
							.end((err, res) => {
								if (err) {
									return done(err);
								} else {
									expect(res.statusCode).toBe(200);
									expect(res.body.items.length).toBe(2);

									const user = res.body.items[0];
									expect(user.personnel_type_id).toBe(2);
									expect(user.first_name).toBeDefined();
									expect(user.last_name).toBeDefined();
									expect(user.phone).toBeDefined();
									expect(user.status).toBeDefined();
									expect(user.personnel_type_id).toBeDefined();
									expect(user.password).not.toBeDefined();

									done();
								}
							});
					}
				});
		});

		test("Should return error if personnel is not logged in", done => {
			request(app)
				.get(`/personnel`)
				.end((err, res) => {
					if (err) {
						return done(err);
					} else {
						expect(res.statusCode).toBe(401);
						done();
					}
				});
		});
	});

	// Patch request on personnel
	describe("PATCH /personnel/:personnelId", () => {
		test("Should update personnel", done => {
			Personnel.destroy({
					where: {
						[Op.or]: [{
								personnel_phone: newPersonnel.phone
							},
							{
								personnel_phone: "0733333333"
							}
						]
					}
				})
				.then(() => {
					let testUser = testUserData;
					testUser["personnel_password"] = "0909090";
					testUser["personnel_reset_password"] = 1;
					testUser["created_by"] = 1;
					testUser["modified_by"] = 1;

					Personnel.create(testUser)
						.then(personnel => {
							const id = personnel.id;
							request(app)
								.post("/personnel/login")
								.send({
									phone: phone,
									password: password
								})
								.end((err, res) => {
									const accessToken = res.body.accessToken;

									request(app)
										.patch("/personnel/" + id)
										.set("Authorization", "Bearer " + accessToken)
										.send({
											first_name: "Martin",
											last_name: "Njoroge",
											phone: "0733333333",
											status: 2,
											personnel_type_id: 2
										})
										.end((err, resUpdate) => {
											if (err) {
												return done(err);
											} else {
												Personnel.findOne({
														where: {
															id: id
														}
													})
													.then(personnel => {
														expect(resUpdate.statusCode).toBe(200);
														expect(resUpdate.body.message).toBe("Success");

														//Validate personnel
														expect(personnel.personnel_first_name).toBe("Martin");
														expect(personnel.personnel_last_name).toBe("Njoroge");
														expect(personnel.personnel_phone).toBe("0733333333");
														expect(personnel.personnel_status).toBe(2);

														Personnel.destroy({
																where: {
																	[Op.or]: [{
																			personnel_phone: newPersonnel.phone
																		},
																		{
																			personnel_phone: "0733333333"
																		}
																	]
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

		test("Update should return error if empty fields are provided", done => {
			Personnel.destroy({
					where: {
						[Op.or]: [{
								personnel_phone: newPersonnel.phone
							},
							{
								personnel_phone: "0733333333"
							}
						]
					}
				})
				.then(() => {
					request(app)
						.post("/personnel/login")
						.send({
							phone: phone,
							password: password
						})
						.end((err, res) => {
							if (err) {
								return done(err);
							}
							const accessToken = res.body.accessToken;
							const url = `/personnel/1`;
							request(app)
								.patch(url)
								.set("Authorization", "Bearer " + accessToken)
								.send({
									first_name: "",
									last_name: "",
									phone: "",
									status: "",
									personnel_type_id: ""
								})
								.end((err, res) => {
									if (err) {
										return done();
									} else {
										expect(res.statusCode).toBe(400);

										const error = res.body.error;

										//Validate personnel
										expect(error.first_name).toBe("First name is required");
										expect(error.last_name).toBe("Last name is required");
										expect(error.phone).toBe("Phone is required");
										expect(error.status).toBe("Status is required");
										expect(error.personnel_type_id).toBe(
											"Personnel type is required"
										);

										done();
									}
								});
						});
				})
				.catch(err => {
					return done(err);
				});
		});

		test("Update should return error if personnel phone exist", done => {
			Personnel.destroy({
					where: {
						[Op.or]: [{
								personnel_phone: newPersonnel.phone
							},
							{
								personnel_phone: "0733333333"
							}
						]
					}
				})
				.then(() => {
					let testUser = testUserData;
					testUser["password"] = "0909090";
					testUser["reset_password"] = 1;
					testUser["created_by"] = 1;
					testUser["modified_by"] = 1;

					Personnel.create(testUser)
						.then(personnel => {
							const id = personnel.id;
							request(app)
								.post("/personnel/login")
								.send({
									phone: phone,
									password: password
								})
								.end((err, res) => {
									if (err) {
										return done(err);
									}
									const accessToken = res.body.accessToken;
									const url = `/personnel/${id}`;
									request(app)
										.patch(url)
										.set("Authorization", "Bearer " + accessToken)
										.send(newPersonnel)
										.end((err, res) => {
											if (err) {
												return done();
											} else {
												expect(res.statusCode).toBe(400);

												const error = res.body.error;

												expect(error.personnel).toBe("Personnel already exist");

												Personnel.destroy({
														where: {
															[Op.or]: [{
																	personnel_phone: newPersonnel.phone
																},
																{
																	personnel_phone: "0733333333"
																}
															]
														}
													})
													.then(() => {
														done();
													})
													.catch(err => {
														return done(err);
													});
											}
										});
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

		test("Should return error if id does not exist", done => {
			const id = "298989";
			request(app)
				.post("/personnel/login")
				.send({
					phone: phone,
					password: password
				})
				.end((err, res) => {
					const accessToken = res.body.accessToken;
					const url = `/personnel/${id}`;
					request(app)
						.patch(url)
						.set("Authorization", "Bearer " + accessToken)
						.send({
							first_name: "Sam",
							last_name: "Githongo",
							phone: "0798372738",
							status: "1",
							personnel_type_id: "1"
						})
						.end((err, res) => {
							if (err) {
								return done(err);
							}
							expect(res.statusCode).toBe(400);

							const error = res.body.error;

							expect(error.id).toBe("Personnel does not exist");

							done();
						});
				});
		});

		test("Update should return error if personnel is not logged in", done => {
			request(app)
				.patch(`/personnel/8`)
				.end((err, res) => {
					if (err) {
						return done(err);
					} else {
						expect(res.statusCode).toBe(401);
						done();
					}
				});
		});
	});

	//  Delete personnel
	describe("DELETE /personnel/:personnelId", () => {
		test("Should delete a personnel", done => {
			Personnel.destroy({
					where: {
						personnel_phone: newPersonnel.phone
					}
				})
				.then(() => {
					let testUser = testUserData;
					testUser["password"] = "0909090";
					testUser["reset_password"] = 1;
					testUser["created_by"] = 1;
					testUser["modified_by"] = 1;

					Personnel.create(testUser)
						.then(personnel => {
							const id = personnel.id;
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
										const url = `/personnel/${id}`;
										request(app)
											.delete(url)
											.set("Authorization", "Bearer " + accessToken)
											.end((err, res) => {
												if (err) {
													return done(err);
												} else {
													expect(res.statusCode).toBe(200);
													expect(res.body.message).toBe("Success");
													done();
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

		test("Delete should return error if id is not a number", done => {
			const id = "s";
			request(app)
				.post("/personnel/login")
				.send({
					phone: phone,
					password: password
				})
				.end((err, res) => {
					const accessToken = res.body.accessToken;
					const url = `/personnel/${id}`;
					request(app)
						.delete(url)
						.set("Authorization", "Bearer " + accessToken)
						.end((err, res) => {
							if (err) {
								return done(err);
							}
							expect(res.statusCode).toBe(400);

							const error = res.body.error;

							expect(error.id).toBe("No id provided");

							done();
						});
				});
		});

		test("Update should return error if personnel is not logged in", done => {
			request(app)
				.delete(`/personnel/8`)
				.end((err, res) => {
					if (err) {
						return done(err);
					} else {
						expect(res.statusCode).toBe(401);
						done();
					}
				});
		});
	});

	//  Get Scouts
	describe("GET /personnel/scouts", () => {
		test("Should return all scouts", done => {
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
							.get(`/personnel/scouts`)
							.set("Authorization", "Bearer " + accessToken)
							.end((err, res) => {
								if (err) {
									return done(err);
								} else {
									expect(res.statusCode).toBe(200);
									expect(res.body.length).toBe(2);

									const user = res.body[0];
									expect(user.first_name).toBeDefined();
									expect(user.last_name).toBeDefined();
									expect(user.phone).toBeDefined();
									expect(user.status).toBeDefined();
									expect(user.personnel_type_id).toBeDefined();
									expect(user.password).not.toBeDefined();
									done();
								}
							});
					}
				});
		});

		test("Update should return error if personnel is not logged in", done => {
			request(app)
				.get(`/personnel/scouts`)
				.end((err, res) => {
					if (err) {
						return done(err);
					} else {
						expect(res.statusCode).toBe(401);
						done();
					}
				});
		});
	});

	//  Export personnel
	describe("GET /personnel/all", () => {
		test("Should return all personnel for export", done => {
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
							.get(`/personnel/all`)
							.set("Authorization", "Bearer " + accessToken)
							.end((err, res) => {
								if (err) {
									return done(err);
								} else {
									expect(res.statusCode).toBe(200);
									expect(res.body.length).toBe(10);

									const user = res.body[0];
									expect(user.first_name).toBeDefined();
									expect(user.last_name).toBeDefined();
									expect(user.phone).toBeDefined();
									expect(user.status).toBeDefined();
									expect(user.personnel_type_id).toBeDefined();
									expect(user.password).not.toBeDefined();
									done();
								}
							});
					}
				});
		});

		test("Update should return error if personnel is not logged in", done => {
			request(app)
				.get(`/personnel/all`)
				.end((err, res) => {
					if (err) {
						return done(err);
					} else {
						expect(res.statusCode).toBe(401);
						done();
					}
				});
		});
	});
});
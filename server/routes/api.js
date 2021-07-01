const express = require("express");
const router = express.Router();
var sha1 = require("sha1");
const axios = require("axios");
const API = "https://jsonplaceholder.typicode.com";
const mysql = require("mysql");
var fs = require("fs");
const path = require("path");
const passwordGenerate = require("generate-password");
var request = require("request");
const logger = require("./logger");
const ftpUploadSMS = require("./ftpUploadSMS");

var link = "http://localhost:3000/api/";

/*var connection = mysql.createPool({
  host: "185.178.193.141",
  user: "appproduction.",
  password: "jBa9$6v7",
  database: "management"
});*/

var connection = mysql.createPool({
  host: "185.178.193.141",
  user: "appproduction.",
  password: "jBa9$6v7",
  database: "management_prod",
});

/*var connection = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'management'
});*/

/*var connection = mysql.createPool({
  host: '116.203.85.82',
  user: 'appprodu_appproduction_prod',
  password: 'CJr4eUqWg33tT97mxPFx',
  database: 'appprodu_management_prod_1'
})*/

/*var connection = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'appprodu_management_prod'
});*/

/*var connection = mysql.createPool({
    host: '144.76.112.98',
    user: 'aparatiz_koja',
    password: 'Iva03042019',
    database: 'aparatiz_management'
})*/

connection.getConnection(function (err, conn) {});

/* GET api listing. */
router.get("/", (req, res) => {
  res.send("api works");
});

router.get("/posts", (req, res) => {
  // Get posts from the mock api
  // This should ideally be replaced with a service that connects to MongoDB
  axios
    .get(`${API}/posts`)
    .then((posts) => {
      res.status(200).json(posts.data);
    })
    .catch((error) => {
      res.status(500).send(error);
    });
});

router.post("/signUp", function (req, res, next) {
  connection.getConnection(function (err, conn) {
    if (err) {
      logger.log("error", err.sql + ". " + err.sqlMessage);
      res.json(err);
    }

    var email = req.body.email;
    var shortname = req.body.shortname;
    var pass = sha1(req.body.password);

    test = {};
    var podaci = {
      password: pass,
      shortname: shortname,
      firstname: "",
      lastname: "",
      street: "",
      zipcode: "",
      place: "",
      email: email,
      telephone: "",
      mobile: "",
      birthday: "",
      incompanysince: "",
      type: 0,
      active: 0,
      img: "",
    };

    conn.query(
      "SELECT * FROM users_superadmin WHERE email=?",
      [req.body.email],
      function (err, rows, fields) {
        if (err) {
          res.json(err);
          logger.log("error", err.sql + ". " + err.sqlMessage);
        }
        if (rows.length >= 1) {
          test.success = false;
          test.info = "Email already exists!";
          res.json(test);
        } else {
          conn.query(
            "insert into users_superadmin SET ?",
            podaci,
            function (err, rows) {
              conn.release();
              if (!err) {
                logger.log(
                  "info",
                  `User ${req.body.email} is CREATED ACCOUNT!`
                );
                test.id = rows.insertId;
                test.success = true;
              } else {
                logger.log(
                  "warn",
                  `User ${req.body.email} is NOT CREATED ACCOUNT!`
                );
                test.success = false;
                test.info = "Error";
              }
              res.json(test);
            }
          );
        }
      }
    );
  });
});

router.post("/createTask", function (req, res, next) {
  connection.getConnection(function (err, conn) {
    if (err) {
      logger.log("error", err.sql + ". " + err.sqlMessage);
      res.json(err);
    }

    test = {};
    var podaci = {
      creator_id: req.body.creator_id,
      customer_id: req.body.user.id,
      title: req.body.title,
      colorTask: req.body.colorTask,
      start: req.body.start,
      end: req.body.end,
      telephone: req.body.telephone,
      therapy_id: req.body.therapy_id,
      superadmin: req.body.superadmin,
      confirm: req.body.confirm,
      online: req.body?.online,
    };
    if (req.body.storeId !== undefined) {
      podaci["storeId"] = req.body.storeId;
    }
    conn.query("insert into tasks SET ?", podaci, function (err, rows) {
      conn.release();
      if (!err) {
        if (!err) {
          test.id = rows.insertId;
          test.success = true;
        } else {
          test.success = false;
        }
        res.json(test);
      } else {
        logger.log("error", err.sql + ". " + err.sqlMessage);
        res.json(err);
      }
    });
  });
});

router.post("/updateTask", function (req, res, next) {
  req.setMaxListeners(0);
  connection.getConnection(function (err, conn) {
    if (err) {
      logger.log("error", err.sql + ". " + err.sqlMessage);
      res.json(err);
    }

    test = {};

    var customer_id = null;
    if (req.body.user !== undefined && req.body.user.id !== undefined) {
      customer_id = req.body.user.id;
    } else {
      customer_id = req.body.customer_id;
    }

    var data = {
      id: req.body.id,
      creator_id: req.body.creator_id,
      customer_id: customer_id,
      title: req.body.title,
      colorTask: req.body.colorTask,
      start: req.body.start,
      end: req.body.end,
      telephone: req.body.telephone,
      therapy_id: req.body.therapy_id,
      superadmin: req.body.superadmin,
      confirm: req.body.confirm,
      online: req.body?.online,
    };
    if (req.body.storeId !== undefined) {
      data["storeId"] = req.body.storeId;
    }

    conn.query(
      "update tasks SET ? where id = '" + data.id + "'",
      [data],
      function (err, rows) {
        conn.release();
        if (!err) {
          if (!err) {
            test.id = rows.insertId;
            test.success = true;
          } else {
            test.success = false;
          }
          res.json(test);
        } else {
          logger.log("error", err.sql + ". " + err.sqlMessage);
          res.json(err);
        }
      }
    );
  });
});

router.get("/deleteTask/:id", (req, res, next) => {
  try {
    var reqObj = req.params.id;

    connection.getConnection(function (err, conn) {
      if (err) {
        logger.log("error", err.sql + ". " + err.sqlMessage);
        res.json(err);
      } else {
        conn.query(
          "delete from tasks where id = '" + reqObj + "'",
          function (err, rows, fields) {
            conn.release();
            if (err) {
              res.json(err);
              logger.log("error", err.sql + ". " + err.sqlMessage);
            } else {
              res.json(true);
            }
          }
        );
      }
    });
  } catch (ex) {
    logger.log("error", err.sql + ". " + err.sqlMessage);
    res.json(ex);
  }
});

router.get("/getTasks/:id", function (req, res, next) {
  var reqObj = req.params.id;
  connection.getConnection(function (err, conn) {
    if (err) {
      logger.log("error", err.sql + ". " + err.sqlMessage);
      res.json(err);
    }
    conn.query(
      "select t.*, e.color from tasks t join event_category e on t.colorTask = e.id where e.superadmin = '" +
        reqObj +
        "'",
      function (err, rows) {
        conn.release();
        if (!err) {
          res.json(rows);
        } else {
          res.json(err);
          logger.log("error", err.sql + ". " + err.sqlMessage);
        }
      }
    );
  });
});

router.get("/getTasksForUser/:id", function (req, res, next) {
  connection.getConnection(function (err, conn) {
    if (err) {
      logger.log("error", err.sql + ". " + err.sqlMessage);
      res.json(err);
    }

    var id = req.params.id;
    conn.query(
      "select t.*, e.color from tasks t join event_category e on t.colorTask = e.id where creator_id = ?",
      [id],
      function (err, rows) {
        conn.release();
        if (!err) {
          res.json(rows);
        } else {
          res.json(err);
          logger.log("error", err.sql + ". " + err.sqlMessage);
        }
      }
    );
  });
});

router.get(
  "/getTasksForStore/:id/:idUser/:typeOfUser",
  function (req, res, next) {
    connection.getConnection(function (err, conn) {
      if (err) {
        logger.log("error", err.sql + ". " + err.sqlMessage);
        res.json(err);
      }

      var id = req.params.id;
      var typeOfUser = req.params.typeOfUser;
      var idUser = req.params.idUser;
      if (typeOfUser === "0") {
        conn.query(
          "select t.*, e.color from tasks t join event_category e on t.colorTask = e.id where storeId = ?",
          [id],
          function (err, rows) {
            conn.release();
            if (!err) {
              res.json(rows);
            } else {
              res.json(err);
              logger.log("error", err.sql + ". " + err.sqlMessage);
            }
          }
        );
      } else {
        conn.query(
          "SELECT u.*,t.*, e.color from users u join tasks t on u.id = t.creator_id join event_category e on t.colorTask = e.id where u.storeId = ?",
          [id],
          function (err, rows) {
            conn.release();
            if (!err) {
              res.json(rows);
            } else {
              res.json(err);
              logger.log("error", err.sql + ". " + err.sqlMessage);
            }
          }
        );
      }

      conn.on("error", function (err) {
        logger.log("error", err.sql + ". " + err.sqlMessage);
        res.json(err);
      });
    });
  }
);

router.post("/login", (req, res, next) => {
  try {
    var reqObj = req.body;
    connection.getConnection(function (err, conn) {
      if (err) {
        logger.log("error", err.sql + ". " + err.sqlMessage);
        res.json(err);
      } else {
        conn.query(
          "SELECT * FROM users WHERE email=? AND password=?",
          [reqObj.email, sha1(reqObj.password)],
          function (err, rows, fields) {
            if (err) {
              logger.log("error", err.sql + ". " + err.sqlMessage);
              res.json(err);
            }
            if (rows.length >= 1 && rows[0].active === 1) {
              conn.release();
              logger.log(
                "info",
                `User ${req.body.email} is SUCCESS login on a system like a USER!`
              );
              res.send({
                login: true,
                notVerified: rows[0].active,
                user: rows[0].shortname,
                type: rows[0].type,
                id: rows[0].id,
                storeId: rows[0].storeId,
                superadmin: rows[0].superadmin,
              });
            } else {
              conn.query(
                "SELECT * FROM users_superadmin WHERE email=? AND password=?",
                [reqObj.email, sha1(reqObj.password)],
                function (err, rows, fields) {
                  if (err) {
                    logger.log("error", err.sql + ". " + err.sqlMessage);
                    res.json(err);
                  }
                  if (rows.length >= 1 && rows[0].active === 1) {
                    conn.release();
                    logger.log(
                      "info",
                      `User ${req.body.email} is SUCCESS login on a system like a SUPERADMIN!`
                    );
                    res.send({
                      login: true,
                      notVerified: rows[0].active,
                      user: rows[0].shortname,
                      type: rows[0].type,
                      id: rows[0].id,
                      storeId: 0,
                      superadmin: rows[0].id,
                    });
                  } else {
                    conn.query(
                      "SELECT * FROM customers WHERE email=? AND password=?",
                      [reqObj.email, sha1(reqObj.password)],
                      function (err, rows, fields) {
                        if (err) {
                          logger.log("error", err.sql + ". " + err.sqlMessage);
                          res.json(err);
                        }

                        if (rows.length >= 1) {
                          conn.release();
                          logger.log(
                            "info",
                            `User ${req.body.email} is SUCCESS login on a system like a PATIENT!`
                          );
                          res.send({
                            login: true,
                            type: 4,
                            notVerified: 1,
                            user: rows[0].shortname,
                            id: rows[0].id,
                            storeId: rows[0].storeId,
                            superadmin: rows[0].storeId,
                          });
                        } else {
                          // logger.log('error', `Bad username and password for users ${req.body.email}`);
                          logger.log(
                            "warn",
                            `User ${req.body.email} is NOT SUCCESS login on a system!`
                          );
                          res.send({
                            login: false,
                          });
                        }
                      }
                    );
                  }
                }
              );
            }
          }
        );
      }
    });
  } catch (ex) {
    logger.log("error", ex);
    res.json(ex);
  }
});

router.post("/createUser", function (req, res, next) {
  connection.getConnection(function (err, conn) {
    if (err) {
      logger.log("error", err.sql + ". " + err.sqlMessage);
      res.json(err);
    }

    var firstname = req.body.firstname;
    var lastname = req.body.lastname;
    var email = req.body.email;
    var user = req.body.username;
    var shortname = req.body.shortname;
    var pass = sha1(req.body.password);

    test = {};
    var podaci = {
      shortname: req.body.shortname,
      password: sha1(req.body.password),
      firstname: req.body.firstname,
      lastname: req.body.lastname,
      shortname: req.body.shortname,
      alias_name: req.body.alias_name,
      street: req.body.street,
      zipcode: req.body.zipcode,
      place: req.body.place,
      email: req.body.email,
      telephone: req.body.telephone,
      mobile: req.body.mobile,
      birthday: req.body.birthday,
      incompanysince: req.body.incompanysince,
      type: req.body.type,
      storeId: req.body.storeId,
      superadmin: req.body.superadmin,
      img: "",
      active: 1,
    };

    conn.query(
      "SELECT * FROM users WHERE email=? and superadmin=?",
      [req.body.email, req.body.superadmin],
      function (err, rows, fields) {
        if (err) {
          res.json(err);
          logger.log("error", err.sql + ". " + err.sqlMessage);
        }
        if (rows.length >= 1) {
          test.success = false;
          test.info = "Email already exists!";
          logger.log(
            "warn",
            `Error creating user! Email ${req.body.email} already exists!`
          );
          res.json(test);
        } else {
          conn.query("insert into users SET ?", podaci, function (err, rows) {
            conn.release();
            if (!err) {
              logger.log(
                "info",
                `Created users with Email:${req.body.email} and ID: ${rows.insertId} SUCCESS!`
              );
              test.id = rows.insertId;
              test.success = true;
            } else {
              logger.log("error", err.sql + ". " + err.sqlMessage);
              test.success = false;
              test.info = "Error";
            }
            res.json(test);
          });
        }
      }
    );
  });
});

router.get("/getUsers/:id", function (req, res, next) {
  connection.getConnection(function (err, conn) {
    if (err) {
      logger.log("error", err.sql + ". " + err.sqlMessage);
      res.json(err);
    }
    var id = req.params.id;

    conn.query(
      "SELECT u.id, u.shortname, u.firstname, u.lastname, u.email, u.street, u.active from users u join store s on u.storeId = s.id where s.superadmin = ?",
      [id],
      function (err, rows) {
        conn.release();

        if (!err) {
          res.json(rows);
        } else {
          res.json(err);
          logger.log("error", err.sql + ". " + err.sqlMessage);
        }
      }
    );
  });
});

router.get("/getUsersInCompany/:id", function (req, res, next) {
  connection.getConnection(function (err, conn) {
    if (err) {
      logger.log("error", err.sql + ". " + err.sqlMessage);
      res.json(err);
    }
    var id = req.params.id;
    conn.query(
      "SELECT * from users where storeId = ?",
      [id],
      function (err, rows) {
        conn.release();
        if (!err) {
          res.json(rows);
        } else {
          res.json(err);
          logger.log("error", err.sql + ". " + err.sqlMessage);
        }
      }
    );
  });
});

router.get("/getUsersAllowedOnlineInCompany/:id", function (req, res, next) {
  connection.getConnection(function (err, conn) {
    if (err) {
      logger.log("error", err.sql + ". " + err.sqlMessage);
      res.json(err);
    }
    var id = req.params.id;
    conn.query(
      "SELECT * from users where allowed_online = 1 and storeId = ?",
      [id],
      function (err, rows) {
        conn.release();
        if (!err) {
          res.json(rows);
        } else {
          res.json(err);
          logger.log("error", err.sql + ". " + err.sqlMessage);
        }
      }
    );
  });
});

//we gave a bug here, we need to check by id and mail address, not just id, because same id can have in different database
router.get("/getMe/:id", function (req, res, next) {
  connection.getConnection(function (err, conn) {
    if (err) {
      logger.log("error", err.sql + ". " + err.sqlMessage);
      res.json(err);
    }
    var id = req.params.id;
    conn.query("SELECT * from users where id = ?", [id], function (err, rows) {
      if (!err && rows.length >= 1) {
        conn.release();
        res.json(rows);
      } else {
        conn.query(
          "SELECT * from users_superadmin where id = ?",
          [id],
          function (err, rows) {
            if (!err) {
              if (rows.length !== 0) {
                conn.release();
                res.json(rows);
              } else {
                conn.query(
                  "SELECT * from customers where id = ?",
                  [id],
                  function (err, rows) {
                    conn.release();
                    if (!err) {
                      res.json(rows);
                    } else {
                      logger.log("error", err.sql + ". " + err.sqlMessage);
                    }
                  }
                );
              }
            } else {
              res.json(err);
              logger.log("error", err.sql + ". " + err.sqlMessage);
            }
          }
        );
      }
    });
  });
});

router.get("/getCompany/:id", function (req, res, next) {
  connection.getConnection(function (err, conn) {
    if (err) {
      logger.log("error", err.sql + ". " + err.sqlMessage);
      res.json(err);
    }
    var id = req.params.id;
    conn.query("SELECT * from store where id = ?", [id], function (err, rows) {
      conn.release();
      if (!err) {
        res.json(rows);
      } else {
        logger.log("error", err.sql + ". " + err.sqlMessage);
        res.json(err);
      }
    });
  });
});

router.post("/createStore", function (req, res, next) {
  connection.getConnection(function (err, conn) {
    if (err) {
      logger.log("error", err.sql + ". " + err.sqlMessage);
      res.json(err);
    }

    test = {};
    var podaci = {
      storename: req.body.storename,
      street: req.body.street,
      zipcode: req.body.zipcode,
      place: req.body.place,
      email: req.body.email,
      telephone: req.body.telephone,
      mobile: req.body.mobile,
      comment: req.body.comment,
      start_work: req.body.start_work,
      end_work: req.body.end_work,
      time_duration: req.body.time_duration,
      time_therapy: req.body.time_therapy,
      superadmin: req.body.superadmin,
    };

    conn.query(
      "SELECT * FROM store WHERE email=? and superadmin=?",
      [req.body.email, req.body.superadmin],
      function (err, rows, fields) {
        if (err) {
          res.json(err);
          logger.log("error", err.sql + ". " + err.sqlMessage);
        }

        if (rows.length >= 1) {
          test.success = false;
          test.info = "exist";
          logger.log(
            "warn",
            `Error creating store! Store with ${req.body.email} already exists!`
          );
          res.json(test);
        } else {
          conn.query("insert into store SET ?", podaci, function (err, rows) {
            conn.release();
            if (!err) {
              if (!err) {
                logger.log(
                  "info",
                  `Created store with Email:${req.body.email} and ID: ${rows.insertId} SUCCESS!`
                );
                test.id = rows.insertId;
                test.success = true;
              } else {
                logger.log("error", err.sql + ". " + err.sqlMessage);
                test.success = false;
                test.info = "notAdded";
              }
              res.json(test);
            } else {
              res.json(err);
              logger.log("error", err.sql + ". " + err.sqlMessage);
            }
          });
        }
      }
    );
  });
});

router.get("/getStore/:id", function (req, res, next) {
  connection.getConnection(function (err, conn) {
    if (err) {
      logger.log("error", err.sql + ". " + err.sqlMessage);
      res.json(err);
    }
    var id = req.params.id;
    conn.query(
      "SELECT * from store where superadmin = ?",
      [id],
      function (err, rows) {
        conn.release();
        if (!err) {
          res.json(rows);
        } else {
          res.json(err);
          logger.log("error", err.sql + ". " + err.sqlMessage);
        }
      }
    );
  });
});

router.get("/getStoreAllowedOnline/:id", function (req, res, next) {
  connection.getConnection(function (err, conn) {
    if (err) {
      logger.log("error", err.sql + ". " + err.sqlMessage);
      res.json(err);
    }
    var id = req.params.id;
    conn.query(
      "SELECT * from store where allowed_online = 1 and superadmin = ?",
      [id],
      function (err, rows) {
        conn.release();
        if (!err) {
          res.json(rows);
        } else {
          res.json(err);
          logger.log("error", err.sql + ". " + err.sqlMessage);
        }
      }
    );
  });
});

router.post("/updateStore", function (req, res, next) {
  connection.getConnection(function (err, conn) {
    if (err) {
      logger.log("error", err.sql + ". " + err.sqlMessage);
      res.json(err);
    }

    var response = null;
    var podaci = {
      id: req.body.id,
      storename: req.body.storename,
      street: req.body.street,
      zipcode: req.body.zipcode,
      place: req.body.place,
      email: req.body.email,
      telephone: req.body.telephone,
      mobile: req.body.mobile,
      comment: req.body.comment,
      start_work: req.body.start_work,
      end_work: req.body.end_work,
      time_duration: req.body.time_duration,
      time_therapy: req.body.time_therapy,
      superadmin: req.body.superadmin,
      allowed_online: req.body.allowed_online,
    };

    conn.query(
      "update store set ? where id = '" + req.body.id + "'",
      podaci,
      function (err, rows, fields) {
        conn.release();
        if (err) {
          res.json(err);
          logger.log("error", err.sql + ". " + err.sqlMessage);
        } else {
          response = true;
          res.json(response);
        }
      }
    );
  });
});

router.get("/deleteStore/:id", (req, res, next) => {
  try {
    var reqObj = req.params.id;
    connection.getConnection(function (err, conn) {
      if (err) {
        console.error("SQL Connection error: ", err);
        logger.log("error", err.sql + ". " + err.sqlMessage);
        res.json(err);
      } else {
        conn.query(
          "delete from store where id = '" + reqObj + "'",
          function (err, rows, fields) {
            conn.release();
            if (err) {
              res.json(err);
              logger.log("error", err.sql + ". " + err.sqlMessage);
            } else {
              logger.log("info", `Store ID:${reqObj} SUCCESSED DELETE!`);
              res.json(true);
            }
          }
        );
      }
    });
  } catch (ex) {
    logger.log("error", err.sql + ". " + err.sqlMessage);
    res.json(ex);
  }
});

router.post("/createCustomer", function (req, res, next) {
  connection.getConnection(function (err, conn) {
    if (err) {
      logger.log("error", err.sql + ". " + err.sqlMessage);
      res.json(err);
    }

    test = {};
    var password = passwordGenerate.generate({
      length: 10,
      numbers: true,
    });
    var notShaPassword = password;
    var podaci = {
      shortname: req.body.lastname + " " + req.body.firstname,
      firstname: req.body.firstname,
      lastname: req.body.lastname,
      gender: req.body.gender,
      street: req.body.street,
      streetnumber: req.body.streetnumber,
      city: req.body.city,
      telephone: req.body.telephone,
      mobile: req.body.mobile,
      email: req.body.email,
      password: sha1(password),
      birthday: req.body.birthday,
      attention: req.body.attention,
      physicalComplaint: req.body.physicalComplaint,
      storeId: req.body.storeId,
      isConfirm: req.body.isConfirm,
    };

    conn.query(
      "SELECT * from customers where email = ?",
      [req.body.email],
      function (err, rows) {
        if (!err) {
          if (rows.length === 0) {
            conn.query(
              "insert into customers SET ?",
              podaci,
              function (err, rows) {
                conn.release();
                if (!err) {
                  logger.log(
                    "info",
                    `Created new patient from employee with EMAIL: ${req.body.email} and ID: ${rows.insertId} for STORE: ${req.body.storeId}`
                  );
                  test.id = rows.insertId;
                  test.success = true;
                  test.password = notShaPassword;
                } else {
                  logger.log("error", err.sql + ". " + err.sqlMessage);
                  test.success = false;
                  test.info = "Error";
                }
                res.json(test);
              }
            );
          } else {
            conn.release();
            logger.log("warn", `Patient ${req.body.email} already EXISTS!`);
            test.success = false;
            test.info = "exists";
            res.json(test);
          }
        } else {
          conn.release();
          res.json(null);
        }
      }
    );
  });
});

router.post("/createCustomerFromPatientForm", function (req, res, next) {
  connection.getConnection(function (err, conn) {
    if (err) {
      logger.log("error", err.sql + ". " + err.sqlMessage);
      res.json(err);
    }

    test = {};
    var podaci = {
      shortname: req.body.lastname + " " + req.body.firstname,
      firstname: req.body.firstname,
      lastname: req.body.lastname,
      gender: req.body.gender,
      telephone: req.body.telephone,
      email: req.body.email,
      password: sha1(req.body.password),
      birthday: req.body.birthday,
      storeId: req.body.storeId,
    };

    conn.query(
      "SELECT * from customers where email = ?",
      [req.body.email],
      function (err, rows) {
        if (!err) {
          if (rows.length === 0) {
            conn.query(
              "insert into customers SET ?",
              podaci,
              function (err, rows) {
                conn.release();
                if (!err) {
                  logger.log(
                    "info",
                    `Created new patient from patient form with EMAIL: ${req.body.email} and ID: ${rows.insertId} for STORE: ${req.body.storeId}`
                  );
                  test.id = rows.insertId;
                  test.success = true;
                  test.info = 200;
                  res.json(test);
                } else {
                  logger.log("error", err);
                  res.json(err);
                }
              }
            );
          } else {
            conn.release();
            test.success = false;
            test.info = 409;
            res.json(test);
          }
        } else {
          conn.release();
          res.json(null);
        }
      }
    );
  });
});

router.get("/getCustomers/:id", function (req, res, next) {
  connection.getConnection(function (err, conn) {
    if (err) {
      logger.log("error", err.sql + ". " + err.sqlMessage);
      res.json(err);
    }
    var id = req.params.id;
    conn.query(
      "SELECT * from customers where storeId = ?",
      [id],
      function (err, rows) {
        conn.release();
        if (!err) {
          res.json(rows);
        } else {
          res.json(null);
        }
      }
    );
  });
});

router.get("/getSuperadmin/:id", function (req, res, next) {
  connection.getConnection(function (err, conn) {
    if (err) {
      logger.log("error", err.sql + ". " + err.sqlMessage);
      res.json(err);
    }
    var id = req.params.id;
    conn.query(
      "SELECT * from users_superadmin where id = ?",
      [id],
      function (err, rows) {
        conn.release();
        if (!err) {
          res.json(rows);
        } else {
          res.json(null);
        }
      }
    );
  });
});

router.post("/updateSuperadmin", function (req, res, next) {
  connection.getConnection(function (err, conn) {
    if (err) {
      logger.log("error", err.sql + ". " + err.sqlMessage);
      res.json(err);
    }
    test = {};
    var id = req.body.id;

    conn.query(
      "UPDATE users_superadmin SET ? where id = '" + id + "'",
      [req.body],
      function (err, rows) {
        conn.release();
        if (!err) {
          if (!err) {
            test.success = true;
          } else {
            test.success = false;
          }
          res.json(test);
        } else {
          res.json(err);
          logger.log("error", err.sql + ". " + err.sqlMessage);
        }
      }
    );
  });
});

router.post("/updatePasswordForSuperadmin", function (req, res, next) {
  connection.getConnection(function (err, conn) {
    if (err) {
      logger.log("error", err.sql + ". " + err.sqlMessage);
      res.json(err);
    }

    conn.query(
      "UPDATE users_superadmin SET password = '" +
        sha1(req.body.newPassword) +
        "' where id = '" +
        req.body.id +
        "'",
      function (err, rows) {
        conn.release();
        if (!err) {
          res.json(true);
        } else {
          res.json(err);
        }
      }
    );
  });
});

router.post("/updatePasswordForUser", function (req, res, next) {
  connection.getConnection(function (err, conn) {
    if (err) {
      logger.log("error", err.sql + ". " + err.sqlMessage);
      res.json(err);
    }

    conn.query(
      "UPDATE users SET password = '" +
        sha1(req.body.newPassword) +
        "' where id = '" +
        req.body.id +
        "'",
      function (err, rows) {
        conn.release();
        if (!err) {
          res.json(true);
        } else {
          res.json(err);
        }
      }
    );
  });
});

router.post("/updatePasswordForCustomer", function (req, res, next) {
  connection.getConnection(function (err, conn) {
    if (err) {
      logger.log("error", err.sql + ". " + err.sqlMessage);
      res.json(err);
    }

    conn.query(
      "UPDATE customers SET password = '" +
        sha1(req.body.newPassword) +
        "' where id = '" +
        req.body.id +
        "'",
      function (err, rows) {
        conn.release();
        if (!err) {
          res.json(true);
        } else {
          res.json(err);
        }
      }
    );
  });
});

router.post("/updateUserFromSettings", function (req, res, next) {
  connection.getConnection(function (err, conn) {
    if (err) {
      logger.log("error", err.sql + ". " + err.sqlMessage);
      res.json(err);
    }
    test = {};
    var id = req.body.id;

    conn.query(
      "UPDATE user SET ? where id = '" + id + "'",
      [req.body],
      function (err, rows) {
        conn.release();
        if (!err) {
          if (!err) {
            test.success = true;
          } else {
            test.success = false;
          }
          res.json(test);
        } else {
          res.json(err);
          logger.log("error", err.sql + ". " + err.sqlMessage);
        }
      }
    );
  });
});

router.get("/getInfoForCustomer/:id", function (req, res, next) {
  connection.getConnection(function (err, conn) {
    if (err) {
      logger.log("error", err.sql + ". " + err.sqlMessage);
      res.json(err);
    }
    var id = req.params.id;
    conn.query(
      "SELECT * from customers where id = ?",
      [id],
      function (err, rows) {
        conn.release();
        if (!err) {
          res.json(rows);
        } else {
          res.json(null);
        }
      }
    );
  });
});

router.post("/searchCustomer", function (req, res, next) {
  connection.getConnection(function (err, conn) {
    if (err) {
      logger.log("error", err.sql + ". " + err.sqlMessage);
      res.json(err);
    }
    var superadmin = req.body.superadmin;
    var filter = req.body.filter;

    conn.query(
      "SELECT * from customers where storeId = ? and shortname like '%" +
        filter +
        "%'",
      [superadmin],
      function (err, rows) {
        conn.release();
        if (!err) {
          res.json(rows);
        } else {
          res.json(null);
        }
      }
    );
  });
});

router.get("/getCustomerWithId/:id", function (req, res, next) {
  connection.getConnection(function (err, conn) {
    if (err) {
      logger.log("error", err.sql + ". " + err.sqlMessage);
      res.json(err);
    }
    var id = req.params.id;
    conn.query(
      "SELECT * from customers where id = ?",
      [id],
      function (err, rows) {
        conn.release();
        if (!err) {
          res.json(rows);
        } else {
          res.json(null);
        }
      }
    );
  });
});

router.get("/getDocuments/:id", function (req, res, next) {
  connection.getConnection(function (err, conn) {
    if (err) {
      logger.log("error", err.sql + ". " + err.sqlMessage);
      res.json(err);
    }
    var id = req.params.id;
    conn.query(
      "SELECT * from documents  where customer_id = ?",
      [id],
      function (err, rows) {
        conn.release();
        if (!err) {
          res.json(rows);
        } else {
          res.json(err);
          logger.log("error", err.sql + ". " + err.sqlMessage);
        }
      }
    );
  });
});

router.get("/deleteDocumentFromDatabase/:id", (req, res, next) => {
  try {
    var reqObj = req.params.id;
    connection.getConnection(function (err, conn) {
      if (err) {
        console.error("SQL Connection error: ", err);
        logger.log("error", err.sql + ". " + err.sqlMessage);
        res.json(err);
      } else {
        conn.query(
          "delete from documents where id = '" + reqObj + "'",
          function (err, rows, fields) {
            conn.release();
            if (err) {
              res.json(err);
              logger.log("error", err.sql + ". " + err.sqlMessage);
            } else {
              res.json(true);
            }
          }
        );
      }
    });
  } catch (ex) {
    logger.log("error", err.sql + ". " + err.sqlMessage);
    res.json(ex);
  }
});

router.post("/deleteDocument", function (req, res, next) {
  fs.unlinkSync(req.body.path, function (err) {
    if (err) {
      res(false);
    } else {
      res(true);
    }
  });
});

router.post("/updateDocument", function (req, res, next) {
  connection.getConnection(function (err, conn) {
    if (err) {
      logger.log("error", err.sql + ". " + err.sqlMessage);
      res.json(err);
    }
    test = {};
    var id = req.body.id;

    conn.query(
      "UPDATE documents SET ? where id = '" + id + "'",
      [req.body],
      function (err, rows) {
        conn.release();
        if (!err) {
          if (!err) {
            test.success = true;
          } else {
            test.success = false;
          }
          res.json(test);
        } else {
          res.json(err);
          logger.log("error", err.sql + ". " + err.sqlMessage);
        }
      }
    );
  });
});

router.post("/download", function (req, res, next) {
  filepath = path.join(__dirname, "./uploads") + "/" + req.body.filename;
  res.sendFile(filepath);
});

router.post("/getPdfFile", function (req, res, next) {
  filepath = path.join(__dirname, "./uploads") + "/" + req.body.filename;
  res.sendFile(filepath);
});

router.get("/activeUser/:id", function (req, res, next) {
  connection.getConnection(function (err, conn) {
    if (err) {
      logger.log("error", err.sql + ". " + err.sqlMessage);
      res.json(err);
    }
    test = {};
    var id = req.params.id;

    conn.query(
      "UPDATE users SET active = 1 where id = ?",
      [id],
      function (err, rows) {
        conn.release();
        if (!err) {
          if (!err) {
            logger.log("info", `User with ID: ${id} is SUCCESSED ACTIVE!`);
            test.success = true;
          } else {
            logger.log(
              "warn",
              `User with ID: ${id} is NOT SUCCESSED ACTIVE!. ${err}`
            );
            test.success = false;
          }
          res.json(test);
        } else {
          res.json(err);
          logger.log("error", err.sql + ". " + err.sqlMessage);
        }
      }
    );
  });
});

router.post("/uploadImage", function (req, res, next) {
  connection.getConnection(function (err, conn) {
    if (err) {
      logger.log("error", err.sql + ". " + err.sqlMessage);
      res.json(err);
    }
    test = {};

    var id = req.body.id;
    var img = fs.readFileSync(
      "C:\\Users\\Aleksandar\\Pictures\\" + req.body.img
    );

    conn.query(
      "UPDATE users SET img = ? where id = '" + id + "'",
      [img],
      function (err, rows) {
        conn.release();
        if (!err) {
          if (!err) {
            test = {
              img: img,
            };
          } else {
            test.success = false;
          }
          res.json(test);
        } else {
          res.json(err);
          logger.log("error", err.sql + ". " + err.sqlMessage);
        }
      }
    );
  });
});

router.get("/deactiveUser/:id", function (req, res, next) {
  connection.getConnection(function (err, conn) {
    if (err) {
      logger.log("error", err.sql + ". " + err.sqlMessage);
      res.json(err);
    }
    test = {};
    var id = req.params.id;

    conn.query(
      "UPDATE users SET active = 0 where id = ?",
      [id],
      function (err, rows) {
        conn.release();
        if (!err) {
          if (!err) {
            logger.log("info", `User with ID: ${id} is SUCCESSED DEACTIVE!`);
            test.success = true;
          } else {
            logger.log(
              "warn",
              `User with ID: ${id} is NOT SUCCESSED DEACTIVE!. ${err}`
            );
            test.success = false;
          }
          res.json(test);
        } else {
          res.json(err);
          logger.log("error", err.sql + ". " + err.sqlMessage);
        }
      }
    );
  });
});

router.post("/addUser", function (req, res, next) {
  connection.getConnection(function (err, conn) {
    if (err) {
      logger.log("error", err.sql + ". " + err.sqlMessage);
      res.json(err);
    }

    var nameOfClinic = req.body.nameOfClinic;
    var firstname = req.body.firstname;
    var lastname = req.body.lastname;
    var phoneNumber = req.body.phoneNumber;
    var email = req.body.email;
    var user = req.body.username;
    var pass = sha1(req.body.password);
    var confirmPassword = sha1(req.body.confirmPassword);
    var active;
    if (req.body.active) {
      active = 1;
    } else {
      active = 0;
    }
    test = {};
    var podaci = {
      nameOfClinic: nameOfClinic,
      firstname: firstname,
      lastname: lastname,
      phoneNumber: phoneNumber,
      email: email,
      username: user,
      password: pass,
      confirmPassword: confirmPassword,
      active: active,
      typeOfUser: "2",
    };

    conn.query("insert into users SET ?", podaci, function (err, rows) {
      conn.release();
      if (!err) {
        if (!err) {
          test.id = rows.insertId;
          test.success = true;
        } else {
          test.success = false;
        }
        res.json(test);
      } else {
        logger.log("error", err.sql + ". " + err.sqlMessage);
        res.json(err);
      }
    });
  });
});

router.post("/updateUser", function (req, res, next) {
  connection.getConnection(function (err, conn) {
    if (err) {
      logger.log("error", err.sql + ". " + err.sqlMessage);
      res.json(err);
    }

    var bodyPassword = null;
    if (req.body.password.length >= 40) {
      bodyPassword = req.body.password;
    } else {
      bodyPassword = sha1(req.body.password);
    }

    var id = req.body.id;
    var response = null;
    var data = {
      shortname: req.body.shortname,
      alias_name: req.body.alias_name,
      password: bodyPassword,
      firstname: req.body.firstname,
      lastname: req.body.lastname,
      street: req.body.street,
      zipcode: req.body.zipcode,
      place: req.body.place,
      email: req.body.email,
      telephone: req.body.telephone,
      mobile: req.body.mobile,
      birthday: req.body.birthday,
      incompanysince: req.body.incompanysince,
      type: req.body.type,
      storeId: req.body.storeId,
      superadmin: req.body.superadmin,
      active: req.body.active,
      allowed_online: req.body.allowed_online,
    };

    conn.query(
      "update users SET ? where id = '" + id + "'",
      data,
      function (err, rows) {
        conn.release();
        if (!err) {
          if (!err) {
            response = true;
          } else {
            response = false;
          }
          res.json(response);
        } else {
          res.json(err);
          logger.log("error", err.sql + ". " + err.sqlMessage);
        }
      }
    );
  });
});

router.get("/deleteUser/:id", (req, res, next) => {
  try {
    var reqObj = req.params.id;
    connection.getConnection(function (err, conn) {
      if (err) {
        console.error("SQL Connection error: ", err);
        logger.log("error", err.sql + ". " + err.sqlMessage);
        res.json(err);
      } else {
        conn.query(
          "delete from users where id = '" + reqObj + "'",
          function (err, rows, fields) {
            conn.release();
            if (err) {
              res.json(err);
              logger.log("error", err.sql + ". " + err.sqlMessage);
            } else {
              res.send(true);
            }
          }
        );
      }
    });
  } catch (ex) {
    logger.log("error", err.sql + ". " + err.sqlMessage);
    res.json(ex);
  }
});

router.get("/deleteCustomer/:id", (req, res, next) => {
  try {
    var reqObj = req.params.id;

    connection.getConnection(function (err, conn) {
      if (err) {
        console.error("SQL Connection error: ", err);
        logger.log("error", err.sql + ". " + err.sqlMessage);
        res.json(err);
      } else {
        conn.query(
          "delete from customers where id = '" + reqObj + "'",
          function (err, rows, fields) {
            conn.release();
            if (err) {
              res.json(err);
              logger.log("error", err.sql + ". " + err.sqlMessage);
            } else {
              logger.log("info", `DELETED customer SUCCESS with ID: ${reqObj}`);
              res.json(true);
            }
          }
        );
      }
    });
  } catch (ex) {
    logger.log("error", err.sql + ". " + err.sqlMessage);
    res.json(ex);
  }
});

router.post("/updateCustomer", function (req, res, next) {
  connection.getConnection(function (err, conn) {
    if (err) {
      logger.log("error", err.sql + ". " + err.sqlMessage);
      res.json(err);
    }
    test = {};
    var id = req.body.id;

    conn.query(
      "UPDATE customers SET ? where id = '" + id + "'",
      [req.body],
      function (err, rows) {
        conn.release();
        if (!err) {
          if (!err) {
            test.success = true;
          } else {
            test.success = false;
          }
          res.json(test);
        } else {
          res.json(err);
          logger.log("error", err.sql + ". " + err.sqlMessage);
        }
      }
    );
  });
});

router.post("/updateAttentionAndPhysical", function (req, res, next) {
  connection.getConnection(function (err, conn) {
    if (err) {
      logger.log("error", err.sql + ". " + err.sqlMessage);
      res.json(err);
    }
    test = {};
    var id = req.body.id;

    conn.query(
      "UPDATE customers SET attention = '" +
        req.body.attention +
        "', physicalComplaint = '" +
        req.body.physicalComplaint +
        "' where id = '" +
        id +
        "'",
      [req.body],
      function (err, rows) {
        conn.release();
        if (!err) {
          if (!err) {
            test.success = true;
          } else {
            test.success = false;
          }
          res.json(test);
        } else {
          res.json(err);
          logger.log("error", err.sql + ". " + err.sqlMessage);
        }
      }
    );
  });
});

router.get("/korisnik/verifikacija/:id", (req, res, next) => {
  try {
    var reqObj = req.params.id;

    connection.getConnection(function (err, conn) {
      if (err) {
        console.error("SQL Connection error: ", err);
        logger.log("error", err.sql + ". " + err.sqlMessage);
        res.json(err);
      } else {
        conn.query(
          "UPDATE users_superadmin SET active='1' WHERE SHA1(email)='" +
            reqObj +
            "'",
          function (err, rows, fields) {
            conn.release();
            if (err) {
              res.json(err);
              logger.log("error", err.sql + ". " + err.sqlMessage);
            } else {
              logger.log("info", `Verification FOR EMAIL: ${reqObj}!`);
              res.writeHead(302, {
                Location: "/login",
              });
            }
          }
        );
      }
    });
  } catch (ex) {
    logger.log("error", err.sql + ". " + err.sqlMessage);
    res.json(ex);
  }
});

router.get("/sendChangePassword/:id", (req, res, next) => {
  try {
    var reqObj = req.params.id;

    connection.getConnection(function (err, conn) {
      if (err) {
        console.error("SQL Connection error: ", err);
        logger.log("error", err.sql + ". " + err.sqlMessage);
        res.json(err);
      } else {
        conn.query(
          "UPDATE users_superadmin SET password='" +
            reqObj +
            "' WHERE SHA1(email)='" +
            reqObj +
            "'",
          function (err, rows, fields) {
            conn.release();
            if (err) {
              res.json(err);
              logger.log("error", err.sql + ". " + err.sqlMessage);
            } else {
              res.writeHead(302, {
                Location: "/changePassword",
              });
            }
          }
        );
      }
    });
  } catch (ex) {
    logger.log("error", err.sql + ". " + err.sqlMessage);
    res.json(ex);
  }
});

router.post("/postojikorisnik", (req, res, next) => {
  try {
    var reqObj = req.body;
    connection.getConnection(function (err, conn) {
      if (err) {
        console.error("SQL Connection error: ", err);
        logger.log("error", err.sql + ". " + err.sqlMessage);
        res.json(err);
      } else {
        conn.query(
          "SELECT * FROM users u WHERE u.email=?",
          [reqObj.email],
          function (err, rows, fields) {
            if (err) {
              res.json(err);
            }

            if (rows.length >= 1 && rows[0].active == "1") {
              conn.release();
              res.send({
                exist: true,
                notVerified: false,
              });
            } else if (rows.length >= 1) {
              conn.release();
              res.send({
                exist: true,
                notVerified: true,
              });
            } else {
              conn.query(
                "SELECT * FROM users_superadmin u WHERE u.email=?",
                [reqObj.email],
                function (err, rows, fields) {
                  if (err) {
                    res.json(err);
                  }

                  if (rows.length >= 1 && rows[0].active == "1") {
                    conn.release();
                    res.send({
                      exist: true,
                      notVerified: false,
                    });
                  } else if (rows.length >= 1) {
                    conn.release();
                    res.send({
                      exist: true,
                      notVerified: true,
                    });
                  } else {
                    conn.query(
                      "SELECT * FROM customers u WHERE u.email=?",
                      [reqObj.email],
                      function (err, rows, fields) {
                        conn.release();
                        if (err) {
                          res.json(err);
                          logger.log("error", err.sql + ". " + err.sqlMessage);
                        }

                        if (rows.length >= 1 && rows[0].active == "1") {
                          res.send({
                            exist: true,
                            notVerified: false,
                          });
                        } else if (rows.length >= 1) {
                          res.send({
                            exist: true,
                            notVerified: true,
                          });
                        } else {
                          res.send({
                            exist: false,
                            notVerified: true,
                          });
                        }
                      }
                    );
                  }
                }
              );
            }
          }
        );
      }
    });
  } catch (ex) {
    logger.log("error", err.sql + ". " + err.sqlMessage);
    res.json(ex);
  }
});

// Promena zaboravljene lozinke
router.post("/korisnik/forgotpasschange", (req, res, next) => {
  try {
    var reqObj = req.body;

    var email = reqObj.email;
    var newPassword1 = reqObj.password;
    var newPassword2 = reqObj.password2;
    logger.log("info", `Forgot password for EMAIL: ${email}!`);

    connection.getConnection(function (err, conn) {
      if (err) {
        console.error("SQL Connection error: ", err);
        logger.log("error", err.sql + ". " + err.sqlMessage);
        res.json(err);
      } else {
        if (newPassword1 == newPassword2) {
          conn.query(
            "select * from users WHERE  sha1(email)='" + email + "'",
            function (err, rows, fields) {
              if (err) {
                res.json(err);
              } else if (rows.length !== 0) {
                conn.query(
                  "UPDATE users SET password='" +
                    sha1(newPassword1) +
                    "' WHERE  sha1(email)='" +
                    email +
                    "'",
                  function (err, rows, fields) {
                    conn.release();
                    if (err) {
                      logger.log("error", err.sql + ". " + err.sqlMessage);
                    } else {
                      logger.log(
                        "info",
                        `Password SUCCESED changes FOR USER via Forgot option for EMAIL: ${email}`
                      );
                      res.send({
                        code: "true",
                        message: "The password is success change!",
                      });
                    }
                  }
                );
              } else {
                conn.query(
                  "select * from users_superadmin WHERE  sha1(email)='" +
                    email +
                    "'",
                  function (err, rows, fields) {
                    if (err) {
                      res.json(err);
                    } else if (rows.length !== 0) {
                      conn.query(
                        "UPDATE users_superadmin SET password='" +
                          sha1(newPassword1) +
                          "' WHERE  sha1(email)='" +
                          email +
                          "'",
                        function (err, rows, fields) {
                          conn.release();
                          if (err) {
                            res.json({
                              code: 100,
                              status: "Error in connection database",
                            });
                          } else {
                            res.send({
                              code: "true",
                              message: "The password is success change!",
                            });
                          }
                        }
                      );
                    } else {
                      conn.query(
                        "UPDATE customers SET password='" +
                          sha1(newPassword1) +
                          "' WHERE  sha1(email)='" +
                          email +
                          "'",
                        function (err, rows, fields) {
                          conn.release();
                          if (err) {
                            res.json({
                              code: 100,
                              status: "Error in connection database",
                            });
                          } else {
                            res.send({
                              code: "true",
                              message: "The password is success change!",
                            });
                          }
                        }
                      );
                    }
                  }
                );
              }
            }
          );
        }
      }
    });
  } catch (ex) {
    logger.log("error", err.sql + ". " + err.sqlMessage);
    res.json(ex);
  }
});

router.get("/getUserWithID/:userid", function (req, res, next) {
  connection.getConnection(function (err, conn) {
    if (err) {
      logger.log("error", err.sql + ". " + err.sqlMessage);
      res.json(err);
    }
    conn.query(
      "select * from users where id = ?",
      [req.params.userid],
      function (err, rows) {
        conn.release();
        if (!err) {
          res.json(rows);
        } else {
          res.json(err);
        }
      }
    );
  });
});

router.post("/setWorkTimeForUser", function (req, res, next) {
  connection.getConnection(function (err, conn) {
    if (err) {
      logger.log("error", err.sql + ". " + err.sqlMessage);
      res.json(err);
    }

    response = {};

    var date = {
      user_id: req.body.user_id,
      dateChange: req.body.dateChange,
      monday: req.body.monday,
      tuesday: req.body.tuesday,
      wednesday: req.body.wednesday,
      thursday: req.body.thursday,
      friday: req.body.friday,
      color: req.body.color,
    };

    conn.query("insert into work SET ?", date, function (err, rows) {
      conn.release();
      if (!err) {
        if (!err) {
          response.id = rows.insertId;
          response.success = true;
        } else {
          response.success = false;
        }
        res.json(response);
      } else {
        logger.log("error", err.sql + ". " + err.sqlMessage);
        res.json(err);
      }
    });
  });
});

router.get("/getWorkTimeForUser/:id", function (req, res, next) {
  connection.getConnection(function (err, conn) {
    if (err) {
      logger.log("error", err.sql + ". " + err.sqlMessage);
      res.json(err);
    }
    var id = req.params.id;
    conn.query(
      "SELECT * from work where user_id = ?",
      [id],
      function (err, rows) {
        conn.release();
        if (!err) {
          res.json(rows);
        } else {
          res.json(err);
          logger.log("error", err.sql + ". " + err.sqlMessage);
        }
      }
    );
  });
});

router.post("/updateWorkTimeForUser", function (req, res, next) {
  connection.getConnection(function (err, conn) {
    if (err) {
      logger.log("error", err.sql + ". " + err.sqlMessage);
      res.json(err);
    }

    response = {};

    var date = {
      user_id: req.body.user_id,
      dateChange: req.body.dateChange,
      monday: req.body.monday,
      tuesday: req.body.tuesday,
      wednesday: req.body.wednesday,
      thursday: req.body.thursday,
      friday: req.body.friday,
      color: req.body.color,
    };

    conn.query(
      "update work SET ? where id = '" + req.body.id + "'",
      date,
      function (err, rows) {
        conn.release();
        if (!err) {
          if (!err) {
            response.id = rows.insertId;
            response.success = true;
          } else {
            response.success = false;
          }
          res.json(response);
        } else {
          res.json(err);
          logger.log("error", err.sql + ". " + err.sqlMessage);
        }
      }
    );
  });
});

router.get("/getWorkandTaskForUser/:id", function (req, res, next) {
  connection.getConnection(function (err, conn) {
    if (err) {
      logger.log("error", err.sql + ". " + err.sqlMessage);
      res.json(err);
    }
    var id = req.params.id;
    conn.query(
      "SELECT * from work where user_id = ?",
      [id],
      function (err, work) {
        if (!err) {
          conn.query(
            "select t.*, e.color from tasks t join event_category e on t.colorTask = e.id where creator_id = ?",
            [id],
            function (err, events) {
              conn.release();
              if (!err) {
                res.json({
                  events: events,
                  workTime: work,
                });
              } else {
                res.json(err);
                logger.log("error", err.sql + ". " + err.sqlMessage);
              }
            }
          );
        }
      }
    );
  });
});

router.post("/addComplaint", function (req, res, next) {
  connection.getConnection(function (err, conn) {
    if (err) {
      logger.log("error", err.sql + ". " + err.sqlMessage);
      res.json(err);
    }

    response = null;
    var today = new Date();
    var dd = String(today.getDate()).padStart(2, "0");
    var mm = String(today.getMonth() + 1).padStart(2, "0"); //January is 0!
    var yyyy = today.getFullYear();
    var hh = today.getHours();
    var min = today.getMinutes();
    var fullData =
      dd +
      "." +
      mm +
      "." +
      yyyy +
      " / " +
      (hh === 0 ? "00" : hh) +
      ":" +
      (min < 10 ? "0" + min : min);

    var date = {
      customer_id: req.body.customer_id,
      employee_name: req.body.employee_name,
      date: fullData,
      complaint: req.body.complaint,
      complaint_title: req.body.complaint_title,
      comment: req.body.comment,
      therapies: req.body.therapies,
      therapies_title: req.body.therapies_title,
      cs: req.body.cs,
    };

    conn.query("insert into complaint SET ?", date, function (err, rows) {
      conn.release();
      if (!err) {
        if (!err) {
          response = true;
        } else {
          response.success = false;
        }
        res.json(response);
      } else {
        logger.log("error", err.sql + ". " + err.sqlMessage);
        res.json(err);
      }
    });
  });
});

router.post("/updateComplaint", function (req, res, next) {
  connection.getConnection(function (err, conn) {
    if (err) {
      logger.log("error", err.sql + ". " + err.sqlMessage);
      res.json(err);
    }

    var response = null;
    var today = new Date();
    var dd = String(today.getDate()).padStart(2, "0");
    var mm = String(today.getMonth() + 1).padStart(2, "0"); //January is 0!
    var yyyy = today.getFullYear();
    var hh = today.getHours();
    var min = today.getMinutes();
    var fullData =
      dd +
      "." +
      mm +
      "." +
      yyyy +
      " / " +
      (hh === 0 ? "00" : hh) +
      ":" +
      (min < 10 ? "0" + min : min);
    var data = {
      id: req.body.id,
      customer_id: req.body.customer_id,
      employee_name: req.body.employee_name,
      date: fullData,
      complaint: req.body.complaint,
      complaint_title: req.body.complaint_title,
      comment: req.body.comment,
      therapies: req.body.therapies,
      therapies_title: req.body.therapies_title,
      cs: req.body.cs,
    };

    conn.query(
      "update complaint set ? where id = '" + req.body.id + "'",
      data,
      function (err, rows, fields) {
        conn.release();
        if (err) {
          res.json(err);
          logger.log("error", err.sql + ". " + err.sqlMessage);
        } else {
          response = true;
          res.json(response);
        }
      }
    );
  });
});

router.get("/deleteComplaint/:id", (req, res, next) => {
  try {
    var reqObj = req.params.id;
    connection.getConnection(function (err, conn) {
      if (err) {
        console.error("SQL Connection error: ", err);
        logger.log("error", err.sql + ". " + err.sqlMessage);
        res.json(err);
      } else {
        conn.query(
          "delete from complaint where id = '" + reqObj + "'",
          function (err, rows, fields) {
            conn.release();
            if (err) {
              res.json(err);
              logger.log("error", err.sql + ". " + err.sqlMessage);
            } else {
              res.json(true);
              res.json(ex);
            }
          }
        );
      }
    });
  } catch (ex) {
    logger.log("error", err.sql + ". " + err.sqlMessage);
    res.json(ex);
  }
});

router.get("/getComplaintForCustomer/:id", function (req, res, next) {
  connection.getConnection(function (err, conn) {
    if (err) {
      logger.log("error", err.sql + ". " + err.sqlMessage);
      res.json(err);
    }
    var id = req.params.id;
    conn.query(
      "SELECT * from complaint where customer_id = ?",
      [id],
      function (err, rows) {
        conn.release();
        if (!err) {
          res.json(rows);
        } else {
          res.json(err);
          logger.log("error", err.sql + ". " + err.sqlMessage);
        }
      }
    );
  });
});

router.post("/addTherapy", function (req, res, next) {
  connection.getConnection(function (err, conn) {
    if (err) {
      logger.log("error", err.sql + ". " + err.sqlMessage);
      res.json(err);
    }

    response = {};

    var today = new Date();
    var dd = String(today.getDate()).padStart(2, "0");
    var mm = String(today.getMonth() + 1).padStart(2, "0"); //January is 0!
    var yyyy = today.getFullYear();
    var hh = today.getHours();
    var min = today.getMinutes();
    var fullDate =
      dd +
      "." +
      mm +
      "." +
      yyyy +
      " / " +
      (hh === 0 ? "00" : hh) +
      ":" +
      (min < 10 ? "0" + min : min);
    if (req.body.date === null || req.body.date === undefined) {
      req.body.date = fullDate;
    }
    var date = {
      customer_id: req.body.customer_id,
      date: req.body.date,
      complaint: req.body.complaint,
      complaint_title: req.body.complaint_title,
      therapies: req.body.therapies,
      therapies_title: req.body.therapies_title,
      therapies_previous: req.body.therapies_previous,
      therapies_previous_title: req.body.therapies_previous_title,
      comment: req.body.comment,
      cs: req.body.cs,
      cs_title: req.body.cs_title,
      state: req.body.state,
      em: req.body.em,
      em_title: req.body.em_title,
    };

    conn.query("insert into therapy SET ?", date, function (err, rows) {
      conn.release();
      if (!err) {
        if (!err) {
          response.id = rows.insertId;
          response.success = true;
        } else {
          response.id = -1;
          response.success = false;
        }
        res.json(response);
      } else {
        logger.log("error", err.sql + ". " + err.sqlMessage);
        res.json(err);
      }
    });
  });
});

router.post("/updateTherapy", function (req, res, next) {
  connection.getConnection(function (err, conn) {
    if (err) {
      logger.log("error", err.sql + ". " + err.sqlMessage);
      res.json(err);
    }

    var response = null;

    var today = new Date();
    var dd = String(today.getDate()).padStart(2, "0");
    var mm = String(today.getMonth() + 1).padStart(2, "0"); //January is 0!
    var yyyy = today.getFullYear();
    var hh = today.getHours();
    var min = today.getMinutes();
    var fullDate =
      dd +
      "." +
      mm +
      "." +
      yyyy +
      " / " +
      (hh === 0 ? "00" : hh) +
      ":" +
      (min < 10 ? "0" + min : min);
    if (req.body.date === null || req.body.date === undefined) {
      req.body.date = fullDate;
    }
    var data = {
      id: req.body.id,
      customer_id: req.body.customer_id,
      date: req.body.date,
      complaint: req.body.complaint,
      complaint_title: req.body.complaint_title,
      therapies: req.body.therapies,
      therapies_title: req.body.therapies_title,
      therapies_previous: req.body.therapies_previous,
      therapies_previous_title: req.body.therapies_previous_title,
      comment: req.body.comment,
      cs: req.body.cs,
      cs_title: req.body.cs_title,
      state: req.body.state,
      em: req.body.em,
      em_title: req.body.em_title,
    };

    conn.query(
      "update therapy set ? where id = '" + req.body.id + "'",
      data,
      function (err, rows, fields) {
        conn.release();
        if (err) {
          res.json(err);
          logger.log("error", err.sql + ". " + err.sqlMessage);
        } else {
          response = true;
          res.json(response);
        }
      }
    );
  });
});

router.get("/deleteTherapy/:id", (req, res, next) => {
  try {
    var reqObj = req.params.id;
    connection.getConnection(function (err, conn) {
      if (err) {
        console.error("SQL Connection error: ", err);
        logger.log("error", err.sql + ". " + err.sqlMessage);
        res.json(err);
      } else {
        conn.query(
          "delete from therapy where id = '" + reqObj + "'",
          function (err, rows, fields) {
            conn.release();
            if (err) {
              res.json(err);
              logger.log("error", err.sql + ". " + err.sqlMessage);
            } else {
              res.json(true);
            }
          }
        );
      }
    });
  } catch (ex) {
    logger.log("error", err.sql + ". " + err.sqlMessage);
    res.json(ex);
  }
});

router.get("/getTherapyForCustomer/:id", function (req, res, next) {
  connection.getConnection(function (err, conn) {
    if (err) {
      logger.log("error", err.sql + ". " + err.sqlMessage);
      res.json(err);
    }
    var id = req.params.id;
    conn.query(
      "SELECT * from therapy where customer_id = ?",
      [id],
      function (err, rows) {
        conn.release();
        if (!err) {
          res.json(rows);
        } else {
          res.json(err);
          logger.log("error", err.sql + ". " + err.sqlMessage);
        }
      }
    );
  });
});

router.get("/getTherapy/:id", function (req, res, next) {
  connection.getConnection(function (err, conn) {
    if (err) {
      logger.log("error", err.sql + ". " + err.sqlMessage);
      res.json(err);
    }
    var id = req.params.id;
    conn.query(
      "SELECT * from therapy where id = ?",
      [id],
      function (err, rows) {
        conn.release();
        if (!err) {
          res.json(rows);
        } else {
          logger.log("error", err.sql + ". " + err.sqlMessage);
          res.json(err);
        }
      }
    );
  });
});

router.get("/getComplaintList/:superadmin", function (req, res, next) {
  connection.getConnection(function (err, conn) {
    if (err) {
      logger.log("error", err.sql + ". " + err.sqlMessage);
      res.json(err);
    }
    var superadmin = req.params.superadmin;

    conn.query(
      "select * from complaint_list where superadmin = '" + superadmin + "'",
      function (err, rows) {
        conn.release();
        if (!err) {
          res.json(rows);
        } else {
          res.json(err);
          logger.log("error", err.sql + ". " + err.sqlMessage);
        }
      }
    );
  });
});

router.post("/addComplaintList", function (req, res, next) {
  connection.getConnection(function (err, conn) {
    if (err) {
      logger.log("error", err.sql + ". " + err.sqlMessage);
      res.json(err);
    }

    response = null;

    var date = {
      title: req.body.title,
      sequence: req.body.sequence,
      superadmin: req.body.superadmin,
    };

    conn.query("insert into complaint_list SET ?", date, function (err, rows) {
      conn.release();
      if (!err) {
        if (!err) {
          response = true;
        } else {
          response.success = false;
        }
        res.json(response);
      } else {
        logger.log("error", err.sql + ". " + err.sqlMessage);
        res.json(err);
      }
    });
  });
});

router.get("/deleteComplaintList/:id", (req, res, next) => {
  try {
    var reqObj = req.params.id;
    connection.getConnection(function (err, conn) {
      if (err) {
        console.error("SQL Connection error: ", err);
        logger.log("error", err.sql + ". " + err.sqlMessage);
        res.json(err);
      } else {
        conn.query(
          "delete from complaint_list where id = '" + reqObj + "'",
          function (err, rows, fields) {
            conn.release();
            if (err) {
              res.json(err);
              logger.log("error", err.sql + ". " + err.sqlMessage);
            } else {
              res.json(true);
            }
          }
        );
      }
    });
  } catch (ex) {
    logger.log("error", err.sql + ". " + err.sqlMessage);
    res.json(ex);
  }
});

router.post("/updateComplaintList", function (req, res, next) {
  connection.getConnection(function (err, conn) {
    if (err) {
      logger.log("error", err.sql + ". " + err.sqlMessage);
      res.json(err);
    }

    var response = null;
    var data = {
      id: req.body.id,
      title: req.body.title,
      sequence: req.body.sequence,
      superadmin: req.body.superadmin,
    };

    conn.query(
      "update complaint_list set ? where id = '" + req.body.id + "'",
      data,
      function (err, rows, fields) {
        conn.release();
        if (err) {
          logger.log("error", err.sql + ". " + err.sqlMessage);
          res.json(err);
        } else {
          response = true;
          res.json(response);
        }
      }
    );
  });
});

// start therapy_list

router.get("/getTherapyList/:superadmin", function (req, res, next) {
  connection.getConnection(function (err, conn) {
    if (err) {
      logger.log("error", err.sql + ". " + err.sqlMessage);
      res.json(err);
    }
    var superadmin = req.params.superadmin;

    conn.query(
      "select * from therapy_list where superadmin = '" + superadmin + "'",
      function (err, rows) {
        conn.release();
        if (!err) {
          res.json(rows);
        } else {
          res.json(err);
          logger.log("error", err.sql + ". " + err.sqlMessage);
        }
      }
    );
  });
});

router.post("/addTherapyList", function (req, res, next) {
  connection.getConnection(function (err, conn) {
    if (err) {
      logger.log("error", err.sql + ". " + err.sqlMessage);
      res.json(err);
    }

    response = null;

    var date = {
      title: req.body.title,
      sequence: req.body.sequence,
      unit: req.body.unit,
      description: req.body.description,
      art_nr: req.body.art_nr,
      net_price: req.body.net_price,
      vat: req.body.vat,
      gross_price: req.body.gross_price,
      category: req.body.category,
      superadmin: req.body.superadmin,
    };

    conn.query("insert into therapy_list SET ?", date, function (err, rows) {
      conn.release();
      if (!err) {
        if (!err) {
          response = true;
        } else {
          response = false;
        }
        res.json(response);
      } else {
        logger.log("error", err.sql + ". " + err.sqlMessage);
        res.json(err);
      }
    });
  });
});

router.get("/deleteTherapyList/:id", (req, res, next) => {
  try {
    var reqObj = req.params.id;
    connection.getConnection(function (err, conn) {
      if (err) {
        console.error("SQL Connection error: ", err);
        logger.log("error", err.sql + ". " + err.sqlMessage);
        res.json(err);
      } else {
        conn.query(
          "delete from therapy_list where id = '" + reqObj + "'",
          function (err, rows, fields) {
            conn.release();
            if (err) {
              res.json(err);
              logger.log("error", err.sql + ". " + err.sqlMessage);
            } else {
              res.json(true);
            }
          }
        );
      }
    });
  } catch (ex) {
    logger.log("error", err.sql + ". " + err.sqlMessage);
    res.json(ex);
  }
});

router.post("/updateTherapyList", function (req, res, next) {
  connection.getConnection(function (err, conn) {
    if (err) {
      logger.log("error", err.sql + ". " + err.sqlMessage);
      res.json(err);
    }

    var response = null;

    var data = {
      id: req.body.id,
      title: req.body.title,
      sequence: req.body.sequence,
      unit: req.body.unit,
      description: req.body.description,
      art_nr: req.body.art_nr,
      net_price: req.body.net_price,
      vat: req.body.vat,
      gross_price: req.body.gross_price,
      category: req.body.category,
      superadmin: req.body.superadmin,
    };

    conn.query(
      "update therapy_list set ? where id = '" + req.body.id + "'",
      data,
      function (err, rows, fields) {
        conn.release();
        if (err) {
          res.json(err);
          logger.log("error", err.sql + ". " + err.sqlMessage);
        } else {
          response = true;
          res.json(response);
        }
      }
    );
  });
});

// end therapy_list

// start recommendation_list

router.get("/getRecommendationList/:superadmin", function (req, res, next) {
  connection.getConnection(function (err, conn) {
    if (err) {
      logger.log("error", err.sql + ". " + err.sqlMessage);
      res.json(err);
    }
    var superadmin = req.params.superadmin;
    conn.query(
      "select * from recommendation_list where superadmin = '" +
        superadmin +
        "'",
      function (err, rows) {
        conn.release();
        if (!err) {
          res.json(rows);
        } else {
          res.json(err);
          logger.log("error", err.sql + ". " + err.sqlMessage);
        }
      }
    );
  });
});

router.post("/addRecommendationList", function (req, res, next) {
  connection.getConnection(function (err, conn) {
    if (err) {
      logger.log("error", err.sql + ". " + err.sqlMessage);
      res.json(err);
    }

    response = null;

    var date = {
      title: req.body.title,
      sequence: req.body.sequence,
      superadmin: req.body.superadmin,
    };

    conn.query(
      "insert into recommendation_list SET ?",
      date,
      function (err, rows) {
        conn.release();
        if (!err) {
          if (!err) {
            response = true;
          } else {
            response.success = false;
          }
          res.json(response);
        } else {
          res.json(err);
          logger.log("error", err.sql + ". " + err.sqlMessage);
        }
      }
    );
  });
});

router.get("/deleteRecommendationList/:id", (req, res, next) => {
  try {
    var reqObj = req.params.id;
    connection.getConnection(function (err, conn) {
      if (err) {
        console.error("SQL Connection error: ", err);
        logger.log("error", err.sql + ". " + err.sqlMessage);
        res.json(err);
      } else {
        conn.query(
          "delete from recommendation_list where id = '" + reqObj + "'",
          function (err, rows, fields) {
            conn.release();
            if (err) {
              res.json(err);
              logger.log("error", err.sql + ". " + err.sqlMessage);
            } else {
              res.json(true);
            }
          }
        );
      }
    });
  } catch (ex) {
    logger.log("error", err.sql + ". " + err.sqlMessage);
    res.json(ex);
  }
});

router.post("/updateRecommendationList", function (req, res, next) {
  connection.getConnection(function (err, conn) {
    if (err) {
      logger.log("error", err.sql + ". " + err.sqlMessage);
      res.json(err);
    }

    var response = null;
    var data = {
      id: req.body.id,
      title: req.body.title,
      sequence: req.body.sequence,
      superadmin: req.body.superadmin,
    };

    conn.query(
      "update recommendation_list set ? where id = '" + req.body.id + "'",
      data,
      function (err, rows, fields) {
        conn.release();
        if (err) {
          res.json(err);
          logger.log("error", err.sql + ". " + err.sqlMessage);
        } else {
          response = true;
          res.json(response);
        }
      }
    );
  });
});

// end recommendation_list

// start relationship_list

router.get("/getRelationshipList/:superadmin", function (req, res, next) {
  connection.getConnection(function (err, conn) {
    if (err) {
      logger.log("error", err.sql + ". " + err.sqlMessage);
      res.json(err);
    }
    var superadmin = req.params.superadmin;
    conn.query(
      "select * from relationship_list where superadmin = '" + superadmin + "'",
      function (err, rows) {
        conn.release();
        if (!err) {
          res.json(rows);
        } else {
          res.json(err);
          logger.log("error", err.sql + ". " + err.sqlMessage);
        }
      }
    );
  });
});

router.post("/addRelationshipList", function (req, res, next) {
  connection.getConnection(function (err, conn) {
    if (err) {
      logger.log("error", err.sql + ". " + err.sqlMessage);
      res.json(err);
    }

    response = null;

    var date = {
      title: req.body.title,
      sequence: req.body.sequence,
      superadmin: req.body.superadmin,
    };

    conn.query(
      "insert into relationship_list SET ?",
      date,
      function (err, rows) {
        conn.release();
        if (!err) {
          if (!err) {
            response = true;
          } else {
            response.success = false;
          }
          res.json(response);
        } else {
          res.json(err);
          logger.log("error", err.sql + ". " + err.sqlMessage);
        }
      }
    );
  });
});

router.get("/deleteRelationshipList/:id", (req, res, next) => {
  try {
    var reqObj = req.params.id;
    connection.getConnection(function (err, conn) {
      if (err) {
        console.error("SQL Connection error: ", err);
        logger.log("error", err.sql + ". " + err.sqlMessage);
        res.json(err);
      } else {
        conn.query(
          "delete from relationship_list where id = '" + reqObj + "'",
          function (err, rows, fields) {
            conn.release();
            if (err) {
              res.json(err);
              logger.log("error", err.sql + ". " + err.sqlMessage);
            } else {
              res.json(true);
            }
          }
        );
      }
    });
  } catch (ex) {
    logger.log("error", err.sql + ". " + err.sqlMessage);
    res.json(ex);
  }
});

router.post("/updateRelationshipList", function (req, res, next) {
  connection.getConnection(function (err, conn) {
    if (err) {
      logger.log("error", err.sql + ". " + err.sqlMessage);
      res.json(err);
    }

    var response = null;
    var data = {
      id: req.body.id,
      title: req.body.title,
      sequence: req.body.sequence,
      superadmin: req.body.superadmin,
    };

    conn.query(
      "update relationship_list set ? where id = '" + req.body.id + "'",
      data,
      function (err, rows, fields) {
        conn.release();
        if (err) {
          res.json(err);
          logger.log("error", err.sql + ". " + err.sqlMessage);
        } else {
          response = true;
          res.json(response);
        }
      }
    );
  });
});

// end relationship_list

// start social_list

router.get("/getSocialList/:superadmin", function (req, res, next) {
  connection.getConnection(function (err, conn) {
    if (err) {
      logger.log("error", err.sql + ". " + err.sqlMessage);
      res.json(err);
    }
    var superadmin = req.params.superadmin;
    conn.query(
      "select * from social_list where superadmin = '" + superadmin + "'",
      function (err, rows) {
        conn.release();
        if (!err) {
          res.json(rows);
        } else {
          res.json(err);
          logger.log("error", err.sql + ". " + err.sqlMessage);
        }
      }
    );
  });
});

router.post("/addSocialList", function (req, res, next) {
  connection.getConnection(function (err, conn) {
    if (err) {
      logger.log("error", err.sql + ". " + err.sqlMessage);
      res.json(err);
    }

    response = null;

    var date = {
      title: req.body.title,
      sequence: req.body.sequence,
      superadmin: req.body.superadmin,
    };

    conn.query("insert into social_list SET ?", date, function (err, rows) {
      conn.release();
      if (!err) {
        if (!err) {
          response = true;
        } else {
          response.success = false;
        }
        res.json(response);
      } else {
        logger.log("error", err.sql + ". " + err.sqlMessage);
        res.json(err);
      }
    });
  });
});

router.get("/deleteSocialList/:id", (req, res, next) => {
  try {
    var reqObj = req.params.id;
    connection.getConnection(function (err, conn) {
      if (err) {
        console.error("SQL Connection error: ", err);
        logger.log("error", err.sql + ". " + err.sqlMessage);
        res.json(err);
      } else {
        conn.query(
          "delete from social_list where id = '" + reqObj + "'",
          function (err, rows, fields) {
            conn.release();
            if (err) {
              res.json(err);
              logger.log("error", err.sql + ". " + err.sqlMessage);
            } else {
              res.json(true);
            }
          }
        );
      }
    });
  } catch (ex) {
    logger.log("error", err.sql + ". " + err.sqlMessage);
    res.json(ex);
  }
});

router.post("/updateSocialList", function (req, res, next) {
  connection.getConnection(function (err, conn) {
    if (err) {
      logger.log("error", err.sql + ". " + err.sqlMessage);
      res.json(err);
    }

    var response = null;
    var data = {
      id: req.body.id,
      title: req.body.title,
      sequence: req.body.sequence,
      superadmin: req.body.superadmin,
    };

    conn.query(
      "update social_list set ? where id = '" + req.body.id + "'",
      data,
      function (err, rows, fields) {
        conn.release();
        if (err) {
          res.json(err);
          logger.log("error", err.sql + ". " + err.sqlMessage);
        } else {
          response = true;
          res.json(response);
        }
      }
    );
  });
});

// end social_list

// start doctor_list

router.get("/getDoctorList/:superadmin", function (req, res, next) {
  connection.getConnection(function (err, conn) {
    if (err) {
      logger.log("error", err.sql + ". " + err.sqlMessage);
      res.json(err);
    }
    var superadmin = req.params.superadmin;
    conn.query(
      "select * from doctor_list where superadmin = '" + superadmin + "'",
      function (err, rows) {
        conn.release();
        if (!err) {
          res.json(rows);
        } else {
          res.json(err);
          logger.log("error", err.sql + ". " + err.sqlMessage);
        }
      }
    );
  });
});

router.post("/addDoctorList", function (req, res, next) {
  connection.getConnection(function (err, conn) {
    if (err) {
      logger.log("error", err.sql + ". " + err.sqlMessage);
      res.json(err);
    }

    response = null;

    var date = {
      title: req.body.title,
      sequence: req.body.sequence,
      superadmin: req.body.superadmin,
    };

    conn.query("insert into doctor_list SET ?", date, function (err, rows) {
      conn.release();
      if (!err) {
        if (!err) {
          response = true;
        } else {
          response.success = false;
        }
        res.json(response);
      } else {
        logger.log("error", err.sql + ". " + err.sqlMessage);
        res.json(err);
      }
    });
  });
});

router.get("/deleteDoctorList/:id", (req, res, next) => {
  try {
    var reqObj = req.params.id;
    connection.getConnection(function (err, conn) {
      if (err) {
        console.error("SQL Connection error: ", err);
        logger.log("error", err.sql + ". " + err.sqlMessage);
        res.json(err);
      } else {
        conn.query(
          "delete from doctor_list where id = '" + reqObj + "'",
          function (err, rows, fields) {
            conn.release();
            if (err) {
              res.json(err);
              logger.log("error", err.sql + ". " + err.sqlMessage);
            } else {
              res.json(true);
            }
          }
        );
      }
    });
  } catch (ex) {
    logger.log("error", err.sql + ". " + err.sqlMessage);
    res.json(ex);
  }
});

router.post("/updateDoctorList", function (req, res, next) {
  connection.getConnection(function (err, conn) {
    if (err) {
      logger.log("error", err.sql + ". " + err.sqlMessage);
      res.json(err);
    }

    var response = null;
    var data = {
      id: req.body.id,
      title: req.body.title,
      sequence: req.body.sequence,
      superadmin: req.body.superadmin,
    };

    conn.query(
      "update doctor_list set ? where id = '" + req.body.id + "'",
      data,
      function (err, rows, fields) {
        conn.release();
        if (err) {
          res.json(err);
          logger.log("error", err.sql + ". " + err.sqlMessage);
        } else {
          response = true;
          res.json(response);
        }
      }
    );
  });
});

// end doctor_list

// start doctors_list

router.get("/getDoctorsList/:superadmin", function (req, res, next) {
  connection.getConnection(function (err, conn) {
    if (err) {
      logger.log("error", err.sql + ". " + err.sqlMessage);
      res.json(err);
    }
    var superadmin = req.params.superadmin;
    conn.query(
      "select * from doctors_list where superadmin = '" + superadmin + "'",
      function (err, rows) {
        conn.release();
        if (!err) {
          res.json(rows);
        } else {
          res.json(err);
          logger.log("error", err.sql + ". " + err.sqlMessage);
        }
      }
    );
  });
});

router.post("/addDoctorsList", function (req, res, next) {
  connection.getConnection(function (err, conn) {
    if (err) {
      logger.log("error", err.sql + ". " + err.sqlMessage);
      res.json(err);
    }

    response = null;

    var date = {
      firstname: req.body.firstname,
      lastname: req.body.lastname,
      gender: req.body.gender,
      street: req.body.street,
      street_number: req.body.street_number,
      zip_code: req.body.zip_code,
      city: req.body.city,
      telephone: req.body.telephone,
      email: req.body.email,
      doctor_type: req.body.doctor_type,
      superadmin: req.body.superadmin,
    };

    conn.query("insert into doctors_list SET ?", date, function (err, rows) {
      conn.release();
      if (!err) {
        if (!err) {
          response = true;
        } else {
          response.success = false;
        }
        res.json(response);
      } else {
        logger.log("error", err.sql + ". " + err.sqlMessage);
        res.json(err);
      }
    });
  });
});

router.get("/deleteDoctorsList/:id", (req, res, next) => {
  try {
    var reqObj = req.params.id;
    connection.getConnection(function (err, conn) {
      if (err) {
        console.error("SQL Connection error: ", err);
        logger.log("error", err.sql + ". " + err.sqlMessage);
        res.json(err);
      } else {
        conn.query(
          "delete from doctors_list where id = '" + reqObj + "'",
          function (err, rows, fields) {
            conn.release();
            if (err) {
              res.json(err);
              logger.log("error", err.sql + ". " + err.sqlMessage);
            } else {
              res.json(true);
            }
          }
        );
      }
    });
  } catch (ex) {
    logger.log("error", err.sql + ". " + err.sqlMessage);
    res.json(ex);
  }
});

router.post("/updateDoctorsList", function (req, res, next) {
  connection.getConnection(function (err, conn) {
    if (err) {
      logger.log("error", err.sql + ". " + err.sqlMessage);
      res.json(err);
    }

    var response = null;
    var data = {
      id: req.body.id,
      firstname: req.body.firstname,
      lastname: req.body.lastname,
      gender: req.body.gender,
      street: req.body.street,
      street_number: req.body.street_number,
      zip_code: req.body.zip_code,
      city: req.body.city,
      telephone: req.body.telephone,
      email: req.body.email,
      doctor_type: req.body.doctor_type,
      superadmin: req.body.superadmin,
    };

    conn.query(
      "update doctors_list set ? where id = '" + req.body.id + "'",
      data,
      function (err, rows, fields) {
        conn.release();
        if (err) {
          logger.log("error", err.sql + ". " + err.sqlMessage);
          res.json(err);
        } else {
          response = true;
          res.json(response);
        }
      }
    );
  });
});

// end doctors_list

// start therapies_list

router.get("/getTreatmentList/:superadmin", function (req, res, next) {
  connection.getConnection(function (err, conn) {
    if (err) {
      logger.log("error", err.sql + ". " + err.sqlMessage);
      res.json(err);
    }
    var superadmin = req.params.superadmin;
    conn.query(
      "select * from treatment_list where superadmin = '" + superadmin + "'",
      function (err, rows) {
        conn.release();
        if (!err) {
          res.json(rows);
        } else {
          res.json(err);
          logger.log("error", err.sql + ". " + err.sqlMessage);
        }
      }
    );
  });
});

router.post("/addTreatmentList", function (req, res, next) {
  connection.getConnection(function (err, conn) {
    if (err) {
      logger.log("error", err.sql + ". " + err.sqlMessage);
      res.json(err);
    }

    response = null;

    var date = {
      title: req.body.title,
      sequence: req.body.sequence,
      superadmin: req.body.superadmin,
    };

    conn.query("insert into treatment_list SET ?", date, function (err, rows) {
      conn.release();
      if (!err) {
        if (!err) {
          response = true;
        } else {
          response.success = false;
        }
        res.json(response);
      } else {
        logger.log("error", err.sql + ". " + err.sqlMessage);
        res.json(err);
      }
    });
  });
});

router.get("/deleteTreatmentList/:id", (req, res, next) => {
  try {
    var reqObj = req.params.id;
    connection.getConnection(function (err, conn) {
      if (err) {
        console.error("SQL Connection error: ", err);
        logger.log("error", err.sql + ". " + err.sqlMessage);
        res.json(err);
      } else {
        conn.query(
          "delete from treatment_list where id = '" + reqObj + "'",
          function (err, rows, fields) {
            conn.release();
            if (err) {
              res.json(err);
              logger.log("error", err.sql + ". " + err.sqlMessage);
            } else {
              res.json(true);
            }
          }
        );
      }
    });
  } catch (ex) {
    logger.log("error", err.sql + ". " + err.sqlMessage);
    res.json(ex);
  }
});

router.post("/updateTreatmentList", function (req, res, next) {
  connection.getConnection(function (err, conn) {
    if (err) {
      logger.log("error", err.sql + ". " + err.sqlMessage);
      res.json(err);
    }

    var response = null;
    var data = {
      id: req.body.id,
      title: req.body.title,
      sequence: req.body.sequence,
      superadmin: req.body.superadmin,
    };

    conn.query(
      "update treatment_list set ? where id = '" + req.body.id + "'",
      data,
      function (err, rows, fields) {
        conn.release();
        if (err) {
          res.json(err);
          logger.log("error", err.sql + ". " + err.sqlMessage);
        } else {
          response = true;
          res.json(response);
        }
      }
    );
  });
});

// end treatment_list

// start vattax_list

router.get("/getVATTaxList/:superadmin", function (req, res, next) {
  connection.getConnection(function (err, conn) {
    if (err) {
      logger.log("error", err.sql + ". " + err.sqlMessage);
      res.json(err);
    }
    var superadmin = req.params.superadmin;
    conn.query(
      "select * from vattax_list where superadmin = '" + superadmin + "'",
      function (err, rows) {
        conn.release();
        if (!err) {
          res.json(rows);
        } else {
          res.json(err);
          logger.log("error", err.sql + ". " + err.sqlMessage);
        }
      }
    );
  });
});

router.post("/addVATTaxList", function (req, res, next) {
  connection.getConnection(function (err, conn) {
    if (err) {
      logger.log("error", err.sql + ". " + err.sqlMessage);
      res.json(err);
    }

    response = null;

    var date = {
      title: req.body.title,
      sequence: req.body.sequence,
      superadmin: req.body.superadmin,
    };

    conn.query("insert into vattax_list SET ?", date, function (err, rows) {
      conn.release();
      if (!err) {
        if (!err) {
          response = true;
        } else {
          response.success = false;
        }
        res.json(response);
      } else {
        logger.log("error", err.sql + ". " + err.sqlMessage);
        res.json(err);
      }
    });
  });
});

router.get("/deleteVATTaxList/:id", (req, res, next) => {
  try {
    var reqObj = req.params.id;
    connection.getConnection(function (err, conn) {
      if (err) {
        console.error("SQL Connection error: ", err);
        logger.log("error", err.sql + ". " + err.sqlMessage);
        res.json(err);
      } else {
        conn.query(
          "delete from vattax_list where id = '" + reqObj + "'",
          function (err, rows, fields) {
            conn.release();
            if (err) {
              res.json(err);
              logger.log("error", err.sql + ". " + err.sqlMessage);
            } else {
              res.json(true);
            }
          }
        );
      }
    });
  } catch (ex) {
    logger.log("error", err.sql + ". " + err.sqlMessage);
    res.json(ex);
  }
});

router.post("/updateVATTaxList", function (req, res, next) {
  connection.getConnection(function (err, conn) {
    if (err) {
      logger.log("error", err.sql + ". " + err.sqlMessage);
      res.json(err);
    }

    var response = null;
    var data = {
      id: req.body.id,
      title: req.body.title,
      sequence: req.body.sequence,
      superadmin: req.body.superadmin,
    };

    conn.query(
      "update vattax_list set ? where id = '" + req.body.id + "'",
      data,
      function (err, rows, fields) {
        conn.release();
        if (err) {
          res.json(err);
          logger.log("error", err.sql + ". " + err.sqlMessage);
        } else {
          response = true;
          res.json(response);
        }
      }
    );
  });
});

// end vattax_list

// start cs_list

router.get("/getCSList/:superadmin", function (req, res, next) {
  connection.getConnection(function (err, conn) {
    if (err) {
      logger.log("error", err.sql + ". " + err.sqlMessage);
      res.json(err);
    }
    var superadmin = req.params.superadmin;
    conn.query(
      "select * from cs_list where superadmin = '" + superadmin + "'",
      function (err, rows) {
        conn.release();
        if (!err) {
          res.json(rows);
        } else {
          res.json(err);
          logger.log("error", err.sql + ". " + err.sqlMessage);
        }
      }
    );
  });
});

router.post("/addCSList", function (req, res, next) {
  connection.getConnection(function (err, conn) {
    if (err) {
      logger.log("error", err.sql + ". " + err.sqlMessage);
      res.json(err);
    }

    response = null;

    var date = {
      title: req.body.title,
      sequence: req.body.sequence,
      superadmin: req.body.superadmin,
    };

    conn.query("insert into cs_list SET ?", date, function (err, rows) {
      conn.release();
      if (!err) {
        if (!err) {
          response = true;
        } else {
          response.success = false;
        }
        res.json(response);
      } else {
        logger.log("error", err.sql + ". " + err.sqlMessage);
        res.json(err);
      }
    });
  });
});

router.get("/deleteCSList/:id", (req, res, next) => {
  try {
    var reqObj = req.params.id;
    connection.getConnection(function (err, conn) {
      if (err) {
        console.error("SQL Connection error: ", err);
        logger.log("error", err.sql + ". " + err.sqlMessage);
        res.json(err);
      } else {
        conn.query(
          "delete from cs_list where id = '" + reqObj + "'",
          function (err, rows, fields) {
            conn.release();
            if (err) {
              res.json(err);
              logger.log("error", err.sql + ". " + err.sqlMessage);
            } else {
              res.json(true);
            }
          }
        );
      }
    });
  } catch (ex) {
    logger.log("error", err.sql + ". " + err.sqlMessage);
    res.json(ex);
  }
});

router.post("/updateCSList", function (req, res, next) {
  connection.getConnection(function (err, conn) {
    if (err) {
      logger.log("error", err.sql + ". " + err.sqlMessage);
      res.json(err);
    }

    var response = null;
    var data = {
      id: req.body.id,
      title: req.body.title,
      sequence: req.body.sequence,
      superadmin: req.body.superadmin,
    };

    conn.query(
      "update cs_list set ? where id = '" + req.body.id + "'",
      data,
      function (err, rows, fields) {
        conn.release();
        if (err) {
          logger.log("error", err.sql + ". " + err.sqlMessage);
          res.json(err);
        } else {
          response = true;
          res.json(response);
        }
      }
    );
  });
});

// end cs_list

// start state_list

router.get("/getStateList/:superadmin", function (req, res, next) {
  connection.getConnection(function (err, conn) {
    if (err) {
      logger.log("error", err.sql + ". " + err.sqlMessage);
      res.json(err);
    }
    var superadmin = req.params.superadmin;
    conn.query(
      "select * from state_list where superadmin = '" + superadmin + "'",
      function (err, rows) {
        conn.release();
        if (!err) {
          res.json(rows);
        } else {
          res.json(err);
          logger.log("error", err.sql + ". " + err.sqlMessage);
        }
      }
    );
  });
});

router.post("/addStateList", function (req, res, next) {
  connection.getConnection(function (err, conn) {
    if (err) {
      logger.log("error", err.sql + ". " + err.sqlMessage);
      res.json(err);
    }

    response = null;

    var date = {
      title: req.body.title,
      sequence: req.body.sequence,
      superadmin: req.body.superadmin,
    };

    conn.query("insert into state_list SET ?", date, function (err, rows) {
      conn.release();
      if (!err) {
        if (!err) {
          response = true;
        } else {
          response.success = false;
        }
        res.json(response);
      } else {
        logger.log("error", err.sql + ". " + err.sqlMessage);
        res.json(err);
      }
    });
  });
});

router.get("/deleteStateList/:id", (req, res, next) => {
  try {
    var reqObj = req.params.id;
    connection.getConnection(function (err, conn) {
      if (err) {
        console.error("SQL Connection error: ", err);
        logger.log("error", err.sql + ". " + err.sqlMessage);
        res.json(err);
      } else {
        conn.query(
          "delete from state_list where id = '" + reqObj + "'",
          function (err, rows, fields) {
            conn.release();
            if (err) {
              res.json(err);
              logger.log("error", err.sql + ". " + err.sqlMessage);
            } else {
              res.json(true);
            }
          }
        );
      }
    });
  } catch (ex) {
    logger.log("error", err.sql + ". " + err.sqlMessage);
    res.json(ex);
  }
});

router.post("/updateStateList", function (req, res, next) {
  connection.getConnection(function (err, conn) {
    if (err) {
      logger.log("error", err.sql + ". " + err.sqlMessage);
      res.json(err);
    }

    var response = null;
    var data = {
      id: req.body.id,
      title: req.body.title,
      sequence: req.body.sequence,
      superadmin: req.body.superadmin,
    };

    conn.query(
      "update state_list set ? where id = '" + req.body.id + "'",
      data,
      function (err, rows, fields) {
        conn.release();
        if (err) {
          res.json(err);
          logger.log("error", err.sql + ". " + err.sqlMessage);
        } else {
          response = true;
          res.json(response);
        }
      }
    );
  });
});

// end state_list

// BASE DATA I

router.get("/getBaseDataOne/:id", function (req, res, next) {
  var id = req.params.id;
  connection.getConnection(function (err, conn) {
    if (err) {
      logger.log("error", err.sql + ". " + err.sqlMessage);
      res.json(err);
    }
    conn.query(
      "select * from base_one where customer_id = '" + id + "'",
      function (err, rows) {
        conn.release();
        if (!err) {
          res.json(rows);
        } else {
          res.json(err);
          logger.log("error", err.sql + ". " + err.sqlMessage);
        }
      }
    );
  });
});

router.post("/addBaseDataOne", function (req, res, next) {
  connection.getConnection(function (err, conn) {
    if (err) {
      logger.log("error", err.sql + ". " + err.sqlMessage);
      res.json(err);
    }

    response = null;

    var date = {
      customer_id: req.body.customer_id,
      recommendation: req.body.recommendation,
      relationship: req.body.relationship,
      social: req.body.social,
      doctor: req.body.doctor,
      //'doctors': req.nody.doctors,
      first_date: req.body.first_date,
    };

    conn.query("insert into base_one SET ?", date, function (err, rows) {
      conn.release();
      if (!err) {
        if (!err) {
          response = true;
        } else {
          response.success = false;
        }
        res.json(response);
      } else {
        logger.log("error", err.sql + ". " + err.sqlMessage);
        res.json(err);
      }
    });
  });
});

router.post("/updateBaseDataOne", function (req, res, next) {
  connection.getConnection(function (err, conn) {
    if (err) {
      logger.log("error", err.sql + ". " + err.sqlMessage);
      res.json(err);
    }

    var response = null;
    var data = {
      customer_id: req.body.customer_id,
      recommendation: req.body.recommendation,
      relationship: req.body.relationship,
      social: req.body.social,
      doctor: req.body.doctor,
      //'doctors': req.body.doctors,
      first_date: req.body.first_date,
    };

    conn.query(
      "update base_one set ? where id = '" + req.body.id + "'",
      data,
      function (err, rows, fields) {
        conn.release();
        if (err) {
          res.json(err);
          logger.log("error", err.sql + ". " + err.sqlMessage);
        } else {
          response = true;
          res.json(response);
        }
      }
    );
  });
});

// END BASE DATA I

// BASE DATA II

router.get("/getBaseDataTwo/:id", function (req, res, next) {
  var id = req.params.id;
  connection.getConnection(function (err, conn) {
    if (err) {
      logger.log("error", err.sql + ". " + err.sqlMessage);
      res.json(err);
    }
    conn.query(
      "select * from base_two where customer_id = '" + id + "'",
      function (err, rows) {
        conn.release();
        if (!err) {
          res.json(rows);
        } else {
          res.json(err);
          logger.log("error", err.sql + ". " + err.sqlMessage);
        }
      }
    );
  });
});

router.post("/addBaseDataTwo", function (req, res, next) {
  connection.getConnection(function (err, conn) {
    if (err) {
      logger.log("error", err.sql + ". " + err.sqlMessage);
      res.json(err);
    }

    response = null;

    var date = {
      customer_id: req.body.customer_id,
      size: req.body.size,
      weight: req.body.weight,
      phone: req.body.phone,
      mobile_phone: req.body.mobile_phone,
      birthday: req.body.birthday,
      childs: req.body.childs,
      notes: req.body.notes,
      profession: req.body.profession,
      useful: req.body.useful,
    };

    conn.query("insert into base_two SET ?", date, function (err, rows) {
      conn.release();
      if (!err) {
        if (!err) {
          response = true;
        } else {
          response.success = false;
        }
        res.json(response);
      } else {
        logger.log("error", err.sql + ". " + err.sqlMessage);
        res.json(err);
      }
    });
  });
});

router.post("/updateBaseDataTwo", function (req, res, next) {
  connection.getConnection(function (err, conn) {
    if (err) {
      logger.log("error", err.sql + ". " + err.sqlMessage);
      res.json(err);
    }

    var response = null;
    var data = {
      customer_id: req.body.customer_id,
      size: req.body.size,
      weight: req.body.weight,
      phone: req.body.phone,
      mobile_phone: req.body.mobile_phone,
      birthday: req.body.birthday,
      childs: req.body.childs,
      notes: req.body.notes,
      profession: req.body.profession,
      useful: req.body.useful,
    };

    conn.query(
      "update base_two set ? where id = '" + req.body.id + "'",
      data,
      function (err, rows, fields) {
        conn.release();
        if (err) {
          res.json(err);
          logger.log("error", err.sql + ". " + err.sqlMessage);
        } else {
          response = true;
          res.json(response);
        }
      }
    );
  });
});

// END BASE DATA II

// PHYSICAL_ILLNESS

router.get("/getPhysicalIllness/:id", function (req, res, next) {
  var id = req.params.id;
  connection.getConnection(function (err, conn) {
    if (err) {
      logger.log("error", err.sql + ". " + err.sqlMessage);
      res.json(err);
    }
    conn.query(
      "select * from physical_illness where customer_id = '" + id + "'",
      function (err, rows) {
        conn.release();
        if (!err) {
          res.json(rows);
        } else {
          res.json(err);
          logger.log("error", err.sql + ". " + err.sqlMessage);
        }
      }
    );
  });
});

router.post("/addPhysicalIllness", function (req, res, next) {
  connection.getConnection(function (err, conn) {
    if (err) {
      logger.log("error", err.sql + ". " + err.sqlMessage);
      res.json(err);
    }

    response = null;

    var date = {
      customer_id: req.body.customer_id,
      internal_organs: req.body.internal_organs,
      operations: req.body.operations,
      previous_findings: req.body.previous_findings,
      medicament: req.body.medicament,
      allergies: req.body.allergies,
      skin_sensitivity: req.body.skin_sensitivity,
      pregnancy: req.body.pregnancy,
    };

    conn.query(
      "insert into physical_illness SET ?",
      date,
      function (err, rows) {
        conn.release();
        if (!err) {
          if (!err) {
            response = true;
          } else {
            response.success = false;
          }
          res.json(response);
        } else {
          res.json(err);
          logger.log("error", err.sql + ". " + err.sqlMessage);
        }
      }
    );
  });
});

router.post("/updatePhysicalIllness", function (req, res, next) {
  connection.getConnection(function (err, conn) {
    if (err) {
      logger.log("error", err.sql + ". " + err.sqlMessage);
      res.json(err);
    }

    var response = null;
    var data = {
      customer_id: req.body.customer_id,
      internal_organs: req.body.internal_organs,
      operations: req.body.operations,
      previous_findings: req.body.previous_findings,
      medicament: req.body.medicament,
      allergies: req.body.allergies,
      skin_sensitivity: req.body.skin_sensitivity,
      pregnancy: req.body.pregnancy,
    };

    conn.query(
      "update physical_illness set ? where id = '" + req.body.id + "'",
      data,
      function (err, rows, fields) {
        conn.release();
        if (err) {
          res.json(err);
          logger.log("error", err.sql + ". " + err.sqlMessage);
        } else {
          response = true;
          res.json(response);
        }
      }
    );
  });
});

// END PHYSICAL_ILLNESS

router.post("/insertFromExcel", function (req, res, next) {
  connection.getConnection(function (err, conn) {
    if (err) {
      logger.log("error", err.sql + ". " + err.sqlMessage);
      res.json(err);
    }

    var response = {};
    var values = "";
    var columns = "";
    var table = req.body.table;

    for (let i = 0; i < req.body.columns.length; i++) {
      columns += req.body.columns[i] + ",";
    }
    columns = columns.substr(0, columns.length - 1);
    for (let i = 0; i < req.body.data.length; i++) {
      values += "('";
      for (let j = 0; j < req.body.columns.length; j++) {
        if (req.body.columns[j] === "password") {
          values += sha1(req.body.data[i][req.body.columns[j]]) + "','";
        } else {
          values += req.body.data[i][req.body.columns[j]] + "','";
        }
      }
      values = values.substr(0, values.length - 2);
      values += "),";
    }

    values = values.substr(0, values.length - 1);
    conn.query(
      "insert into " + table + "(" + columns + ") values " + values + ";",
      function (err, rows, fields) {
        conn.release();
        if (err) {
          res.json(err);
          logger.log("error", err.sql + ". " + err.sqlMessage);
        } else {
          response = true;
          res.send(response);
        }
      }
    );
  });
});

router.post("/createVaucher", function (req, res, next) {
  connection.getConnection(function (err, conn) {
    if (err) {
      logger.log("error", err.sql + ". " + err.sqlMessage);
      res.json(err);
    }

    response = {};

    var data = {
      date: req.body.date,
      amount: req.body.amount,
      date_redeemed: req.body.date_redeemed,
      comment: req.body.comment,
      customer: req.body.customer,
      customer_name: req.body.customer_name,
      customer_consumer: req.body.customer_consumer,
      customer_consumer_name: req.body.customer_consumer_name,
      superadmin: req.body.superadmin,
      user: req.body.user,
      user_name: req.body.user_name,
    };

    conn.query("insert into vaucher SET ?", data, function (err, rows) {
      conn.release();
      if (!err) {
        if (!err) {
          response.id = rows.insertId;
          response.success = true;
        } else {
          response.success = false;
        }
        res.json(response);
      } else {
        logger.log("error", err.sql + ". " + err.sqlMessage);
        res.json(err);
      }
    });
  });
});

router.get("/deleteVaucher/:id", (req, res, next) => {
  try {
    var reqObj = req.params.id;
    connection.getConnection(function (err, conn) {
      if (err) {
        console.error("SQL Connection error: ", err);
        logger.log("error", err.sql + ". " + err.sqlMessage);
        res.json(err);
      } else {
        conn.query(
          "delete from vaucher where id = '" + reqObj + "'",
          function (err, rows, fields) {
            conn.release();
            if (err) {
              res.json(err);
              logger.log("error", err.sql + ". " + err.sqlMessage);
            } else {
              res.json(true);
            }
          }
        );
      }
    });
  } catch (ex) {
    logger.log("error", err.sql + ". " + err.sqlMessage);
    res.json(ex);
  }
});

router.get("/getVauchers/:id", function (req, res, next) {
  connection.getConnection(function (err, conn) {
    if (err) {
      logger.log("error", err.sql + ". " + err.sqlMessage);
      res.json(err);
    }
    var id = req.params.id;
    conn.query(
      "SELECT * from vaucher where superadmin = ?",
      [id],
      function (err, rows) {
        conn.release();
        if (!err) {
          res.json(rows);
        } else {
          res.json(err);
          logger.log("error", err.sql + ". " + err.sqlMessage);
        }
      }
    );
  });
});

router.get("/getNextVaucherId", function (req, res, next) {
  connection.getConnection(function (err, conn) {
    if (err) {
      logger.log("error", err.sql + ". " + err.sqlMessage);
      res.json(err);
    }
    var id = req.params.id;
    conn.query(
      "SELECT * from vaucher order by id desc limit 1",
      function (err, rows) {
        conn.release();
        if (!err) {
          res.json(rows[0].id + 1);
        } else {
          res.json(err);
          logger.log("error", err.sql + ". " + err.sqlMessage);
        }
      }
    );
  });
});

router.post("/updateVaucher", function (req, res, next) {
  connection.getConnection(function (err, conn) {
    if (err) {
      logger.log("error", err.sql + ". " + err.sqlMessage);
      res.json(err);
    }

    var response = null;
    var data = {
      id: req.body.id,
      date: req.body.date,
      amount: req.body.amount,
      date_redeemed: req.body.date_redeemed,
      comment: req.body.comment,
      customer: req.body.customer,
      customer_name: req.body.customer_name,
      customer_consumer: req.body.customer_consumer,
      customer_consumer_name: req.body.customer_consumer_name,
      superadmin: req.body.superadmin,
      user: req.body.user,
      user_name: req.body.user_name,
    };

    conn.query(
      "update vaucher set ? where id = '" + req.body.id + "'",
      data,
      function (err, rows, fields) {
        conn.release();
        if (err) {
          res.json(err);
          logger.log("error", err.sql + ". " + err.sqlMessage);
        } else {
          response = true;
          res.json(response);
        }
      }
    );
  });
});

// start event_category

router.get("/getEventCategory/:id", function (req, res, next) {
  connection.getConnection(function (err, conn) {
    if (err) {
      logger.log("error", err.sql + ". " + err.sqlMessage);
      res.json(err);
    }
    var id = req.params.id;
    conn.query(
      "select * from event_category where superadmin = ?",
      [id],
      function (err, rows) {
        conn.release();
        if (!err) {
          res.json(rows);
        } else {
          res.json(err);
          logger.log("error", err.sql + ". " + err.sqlMessage);
        }
      }
    );
  });
});

router.post("/createEventCategory", function (req, res, next) {
  connection.getConnection(function (err, conn) {
    if (err) {
      logger.log("error", err.sql + ". " + err.sqlMessage);
      res.json(err);
    }

    response = null;
    var data = {
      category: req.body.category,
      sequence: req.body.sequence,
      color: req.body.color,
      comment: req.body.comment,
      superadmin: req.body.superadmin,
    };

    conn.query("insert into event_category SET ?", data, function (err, rows) {
      conn.release();
      if (!err) {
        if (!err) {
          response = true;
        } else {
          response.success = false;
        }
        res.json(response);
      } else {
        logger.log("error", err.sql + ". " + err.sqlMessage);
        res.json(err);
      }
    });
  });
});

router.get("/deleteEventCategory/:id", (req, res, next) => {
  try {
    var reqObj = req.params.id;
    connection.getConnection(function (err, conn) {
      if (err) {
        console.error("SQL Connection error: ", err);
        logger.log("error", err.sql + ". " + err.sqlMessage);
        res.json(err);
      } else {
        conn.query(
          "delete from event_category where id = '" + reqObj + "'",
          function (err, rows, fields) {
            conn.release();
            if (err) {
              res.json(err);
              logger.log("error", err.sql + ". " + err.sqlMessage);
            } else {
              res.json(true);
            }
          }
        );
      }
    });
  } catch (ex) {
    logger.log("error", err.sql + ". " + err.sqlMessage);
    res.json(ex);
  }
});

router.post("/updateEventCategory", function (req, res, next) {
  connection.getConnection(function (err, conn) {
    if (err) {
      logger.log("error", err.sql + ". " + err.sqlMessage);
      res.json(err);
    }

    var response = null;
    var data = {
      id: req.body.id,
      category: req.body.category,
      sequence: req.body.sequence,
      color: req.body.color,
      comment: req.body.comment,
      superadmin: req.body.superadmin,
    };

    conn.query(
      "update event_category set ? where id = '" + req.body.id + "'",
      data,
      function (err, rows, fields) {
        conn.release();
        if (err) {
          res.json(err);
          logger.log("error", err.sql + ". " + err.sqlMessage);
        } else {
          response = true;
          res.json(response);
        }
      }
    );
  });
});

// end event_category

// start work_time_colors

router.get("/getWorkTimeColors/:id", function (req, res, next) {
  connection.getConnection(function (err, conn) {
    if (err) {
      logger.log("error", err.sql + ". " + err.sqlMessage);
      res.json(err);
    }
    var id = req.params.id;
    conn.query(
      "select * from work_time_colors where superadmin = ?",
      [id],
      function (err, rows) {
        conn.release();
        if (!err) {
          res.json(rows);
        } else {
          res.json(err);
          logger.log("error", err.sql + ". " + err.sqlMessage);
        }
      }
    );
  });
});

router.post("/createWorkTimeColors", function (req, res, next) {
  connection.getConnection(function (err, conn) {
    if (err) {
      logger.log("error", err.sql + ". " + err.sqlMessage);
      res.json(err);
    }

    response = null;
    var data = {
      color: req.body.color,
      sequence: req.body.sequence,
      superadmin: req.body.superadmin,
    };

    conn.query(
      "insert into work_time_colors SET ?",
      data,
      function (err, rows) {
        conn.release();
        if (!err) {
          if (!err) {
            response = true;
          } else {
            response.success = false;
          }
          res.json(response);
        } else {
          res.json(err);
          logger.log("error", err.sql + ". " + err.sqlMessage);
        }
      }
    );
  });
});

router.get("/deleteWorkTimeColors/:id", (req, res, next) => {
  try {
    var reqObj = req.params.id;
    connection.getConnection(function (err, conn) {
      if (err) {
        console.error("SQL Connection error: ", err);
        logger.log("error", err.sql + ". " + err.sqlMessage);
        res.json(err);
      } else {
        conn.query(
          "delete from work_time_colors where id = '" + reqObj + "'",
          function (err, rows, fields) {
            conn.release();
            if (err) {
              res.json(err);
              logger.log("error", err.sql + ". " + err.sqlMessage);
            } else {
              res.json(true);
            }
          }
        );
      }
    });
  } catch (ex) {
    logger.log("error", err.sql + ". " + err.sqlMessage);
    res.json(ex);
  }
});

router.post("/updateWorkTimeColors", function (req, res, next) {
  connection.getConnection(function (err, conn) {
    if (err) {
      logger.log("error", err.sql + ". " + err.sqlMessage);
      res.json(err);
    }

    var response = null;
    var data = {
      color: req.body.color,
      sequence: req.body.sequence,
      superadmin: req.body.superadmin,
    };

    conn.query(
      "update work_time_colors set ? where id = '" + req.body.id + "'",
      data,
      function (err, rows, fields) {
        conn.release();
        if (err) {
          res.json(err);
          logger.log("error", err.sql + ". " + err.sqlMessage);
        } else {
          response = true;
          res.json(response);
        }
      }
    );
  });
});

// end work_time_colors

router.get("/task/confirmationArrival/:id", (req, res, next) => {
  try {
    var reqObj = req.params.id;

    connection.getConnection(function (err, conn) {
      if (err) {
        console.error("SQL Connection error: ", err);
        logger.log("error", err.sql + ". " + err.sqlMessage);
        res.json(err);
      } else {
        conn.query(
          "UPDATE tasks SET confirm=1 WHERE id='" + reqObj + "'",
          function (err, rows, fields) {
            conn.release();
            if (err) {
              res.json(err);
              logger.log("error", err.sql + ". " + err.sqlMessage);
            } else {
              res.writeHead(302, {
                Location: "../../../template/confirm-arrival",
              });
            }
          }
        );
      }
    });
  } catch (ex) {
    logger.log("error", err.sql + ". " + err.sqlMessage);
    res.json(ex);
  }
});

router.get("/getCountAllTasksForUser/:id", function (req, res, next) {
  var reqObj = req.params.id;
  connection.getConnection(function (err, conn) {
    if (err) {
      logger.log("error", err.sql + ". " + err.sqlMessage);
      res.json(err);
    }
    conn.query(
      "SELECT COUNT(*) as total from tasks where creator_id = '" + reqObj + "'",
      function (err, rows) {
        conn.release();

        if (!err) {
          res.json(rows);
        } else {
          res.json(err);
          logger.log("error", err.sql + ". " + err.sqlMessage);
        }
      }
    );
  });
});

router.get("/getCountAllTasksForUserPerMonth/:id", function (req, res, next) {
  var reqObj = req.params.id;
  connection.getConnection(function (err, conn) {
    if (err) {
      logger.log("error", err.sql + ". " + err.sqlMessage);
      res.json(err);
    }
    conn.query(
      "SELECT COUNT(*) as month from tasks where creator_id = '" +
        reqObj +
        "' GROUP BY MONTH(start)",
      function (err, rows) {
        conn.release();

        if (!err) {
          res.json(rows);
        } else {
          res.json(err);
          logger.log("error", err.sql + ". " + err.sqlMessage);
        }
      }
    );
  });
});

router.get("/getCountAllTasksForUserPerWeek/:id", function (req, res, next) {
  var reqObj = req.params.id;
  connection.getConnection(function (err, conn) {
    if (err) {
      logger.log("error", err.sql + ". " + err.sqlMessage);
      res.json(err);
    }
    conn.query(
      "SELECT COUNT(*) as week from tasks where creator_id = '" +
        reqObj +
        "' GROUP BY WEEK(start)",
      function (err, rows) {
        conn.release();

        if (!err) {
          res.json(rows);
        } else {
          res.json(err);
          logger.log("error", err.sql + ". " + err.sqlMessage);
        }
      }
    );
  });
});

/* TODO */

router.post("/createToDo", function (req, res, next) {
  connection.getConnection(function (err, conn) {
    if (err) {
      logger.log("error", err.sql + ". " + err.sqlMessage);
      res.json(err);
    }

    response = {};

    conn.query("insert into todo SET ?", req.body, function (err, rows) {
      conn.release();
      if (!err) {
        if (!err) {
          response.id = rows.insertId;
          response.success = true;
        } else {
          response.success = false;
        }
        res.json(response);
      } else {
        logger.log("error", err.sql + ". " + err.sqlMessage);
        res.json(err);
      }
    });
  });
});

router.get("/getToDo", function (req, res, next) {
  var reqObj = req.params.id;
  connection.getConnection(function (err, conn) {
    if (err) {
      logger.log("error", err.sql + ". " + err.sqlMessage);
      res.json(err);
    }
    conn.query("SELECT * from todo", function (err, rows) {
      conn.release();
      if (!err) {
        res.json(rows);
      } else {
        logger.log("error", err.sql + ". " + err.sqlMessage);
        res.json(err);
      }
    });
  });
});

router.post("/updateToDo", function (req, res, next) {
  connection.getConnection(function (err, conn) {
    if (err) {
      logger.log("error", err.sql + ". " + err.sqlMessage);
      res.json(err);
    }

    response = {};

    conn.query(
      "update todo SET ? where id = '" + req.body.id + "'",
      [req.body],
      function (err, rows) {
        conn.release();
        if (!err) {
          if (!err) {
            response.id = rows.insertId;
            response.success = true;
          } else {
            response.success = false;
          }
          res.json(response);
        } else {
          res.json(err);
          logger.log("error", err.sql + ". " + err.sqlMessage);
        }
      }
    );
  });
});

router.get("/deleteToDo/:id", (req, res, next) => {
  try {
    connection.getConnection(function (err, conn) {
      if (err) {
        console.error("SQL Connection error: ", err);
        res.json({
          code: 100,
          status: err,
        });
      } else {
        conn.query(
          "delete from todo where id = '" + req.params.id + "'",
          function (err, rows, fields) {
            conn.release();
            if (err) {
              res.json(err);
              logger.log("error", err.sql + ". " + err.sqlMessage);
            } else {
              res.json(true);
            }
          }
        );
      }
    });
  } catch (ex) {
    logger.log("error", err.sql + ". " + err.sqlMessage);
    res.json(ex);
  }
});

/* END TODO */

/* RESERVATIONS */

router.get("/getReservations/:id", function (req, res, next) {
  var id = req.params.id;
  connection.getConnection(function (err, conn) {
    if (err) {
      logger.log("error", err.sql + ". " + err.sqlMessage);
      res.json(err);
    }
    conn.query(
      "select t.*, e.color, c.firstname, c.lastname, c.mobile, c.email, c.birthday, u.shortname from tasks t join event_category e on t.colorTask = e.id join customers c on t.customer_id = c.id join users u on t.creator_id = u.id where t.online = 1 and t.superadmin = ?",
      [id],
      function (err, rows) {
        conn.release();
        if (!err) {
          res.json(rows);
        } else {
          res.json(err);
        }
      }
    );
  });
});

router.post("/approveReservation", function (req, res, next) {
  connection.getConnection(function (err, conn) {
    if (err) {
      res.json(err);
    }
    conn.query(
      "update tasks set online = 2 where id = '" + req.body.id + "'",
      function (err, rows, fields) {
        conn.release();
        if (err) {
          res.json(err);
        } else {
          res.json(true);
        }
      }
    );
  });
});

router.post("/denyReservation", function (req, res, next) {
  connection.getConnection(function (err, conn) {
    if (err) {
      res.json(err);
    }
    conn.query(
      "delete from tasks where id = '" + req.body.id + "'",
      function (err, rows, fields) {
        conn.release();
        if (err) {
          res.json(err);
        } else {
          res.json(true);
        }
      }
    );
  });
});

/* END RESERVATIONS */

/* SMS Sender */
const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const messagebird = require("messagebird")("sbx8Desv4cXJdPMZf7GtBLs9P", null, [
  "ENABLE_CONVERSATIONSAPI_WHATSAPP_SANDBOX",
]);

/*router.post("/sendSMS", function (req, res) {
  // Check if phone number is valid
  request(
    link + "/getTranslationByCountryCode/RS",
    function (error, response, body) {
      if (req.body.telephone || req.body.mobile) {
        var phoneNumber = null;
        if (req.body.telephone) {
          phoneNumber = req.body.telephone;
        } else if (req.body.mobile) {
          phoneNumber = req.body.mobile;
        }
        var convertToDateStart = new Date(req.body.start);
        var convertToDateEnd = new Date(req.body.end);
        var startHours = convertToDateStart.getHours();
        var startMinutes = convertToDateStart.getMinutes();
        var endHours = convertToDateEnd.getHours();
        var endMinutes = convertToDateEnd.getMinutes();
        var date =
          convertToDateStart.getDate() +
          "." +
          (convertToDateStart.getMonth() + 1) +
          "." +
          convertToDateStart.getFullYear();
        var day = convertToDateStart.getDate();
        var month = monthNames[convertToDateStart.getMonth()];
        var start =
          (startHours < 10 ? "0" + startHours : startHours) +
          ":" +
          (startMinutes < 10 ? "0" + startMinutes : startMinutes);
        var end =
          (endHours < 10 ? "0" + endHours : endHours) +
          ":" +
          (endMinutes < 10 ? "0" + endMinutes : endMinutes);
        messagebird.lookup.read(
          phoneNumber,
          process.env.COUNTRY_CODE,
          function (err, response) {
            if (err && err.errors[0].code == 21) {
              // This error code indicates that the phone number has an unknown format
              response.send("You need to enter a valid phone number!");
            } else if (err) {
              // Some other error occurred
              response.send(
                "Something went wrong while checking your phone number!"
              );
            } else if (response.type != "mobile") {
              // The number lookup was successful but it is not a mobile number
              response.send(
                "You have entered a valid phone number, but it's not a mobile number! Provide a mobile number so we can contact you via SMS."
              );
            } else {
              var language = JSON.parse(body)["config"];
              // Send scheduled message with MessageBird API
              messagebird.messages.create(
                {
                  originator: "ClinicNode",
                  recipients: [response.phoneNumber], // normalized phone number from lookup request
                  body:
                    language?.initialGreetingSMSReminder +
                    " " +
                    req.body.shortname +
                    ", \n" +
                    "\n" +
                    language?.introductoryMessageForSMSReminderReservation +
                    " \n" +
                    "\n" +
                    language?.dateMessage +
                    ": " +
                    date +
                    " \n" +
                    language?.timeMessage +
                    ": " +
                    start +
                    "-" +
                    end +
                    " \n" +
                    language?.storeLocation +
                    ": " +
                    req.body.storename,
                },
                function (err, response) {
                  if (err) {
                    // Request has failed
                    res.send(err);
                  } else {
                    res.send(true);
                  }
                }
              );
            }
          }
        );
      }
    }
  );
});*/

/* END SMS Sender */

// generate SMS reminider
router.post("/sendSMS", function (req, res) {
  if (
    (req.body.telephone &&
      (req.body.telephone.startsWith("+43") ||
        req.body.telephone.startsWith("43"))) ||
    (req.body.mobile &&
      (req.body.mobile.startsWith("+43") || req.body.mobile.startsWith("43")))
  ) {
    request(
      link + "/getTranslationByCountryCode/AT",
      function (error, response, body) {
        var phoneNumber = null;
        if (req.body.telephone) {
          phoneNumber = req.body.telephone;
        } else if (req.body.mobile) {
          phoneNumber = req.body.mobile;
        }
        var convertToDateStart = new Date(req.body.start);
        var convertToDateEnd = new Date(req.body.end);
        var startHours = convertToDateStart.getHours();
        var startMinutes = convertToDateStart.getMinutes();
        var endHours = convertToDateEnd.getHours();
        var endMinutes = convertToDateEnd.getMinutes();
        var date =
          convertToDateStart.getDate() +
          "." +
          (convertToDateStart.getMonth() + 1) +
          "." +
          convertToDateStart.getFullYear();
        var day = convertToDateStart.getDate();
        var month = monthNames[convertToDateStart.getMonth()];
        var start =
          (startHours < 10 ? "0" + startHours : startHours) +
          ":" +
          (startMinutes < 10 ? "0" + startMinutes : startMinutes);
        var end =
          (endHours < 10 ? "0" + endHours : endHours) +
          ":" +
          (endMinutes < 10 ? "0" + endMinutes : endMinutes);

        var language = JSON.parse(body)["config"];
        var message =
          language?.initialGreetingSMSReminder +
          " " +
          req.body.shortname +
          ", \n" +
          "\n" +
          language?.introductoryMessageForSMSReminderReservation +
          " \n" +
          "\n" +
          language?.dateMessage +
          ": " +
          date +
          " \n" +
          language?.timeMessage +
          ": " +
          start +
          "-" +
          end +
          " \n" +
          language?.storeLocation +
          ": " +
          req.body.storename;

        var content = "To: " + phoneNumber + "\r\n\r\n" + message;
        var fileName = "server/sms/" + phoneNumber + ".txt";
        console.log(content);
        fs.writeFile(fileName, content, function (err) {
          if (err) return logger.log("error", err);
          logger.log(
            "info",
            "Sent AUTOMATE REMINDER to NUMBER: " + phoneNumber
          );
          ftpUploadSMS(fileName, phoneNumber + ".txt");
          res.send(true);
        });
      }
    );
  } else {
    res.send(false);
    logger.log(
      "warn",
      `Number ${req.body.number} is not start with available area code!`
    );
  }
});

router.post("/sendCustomSMS", function (req, res) {
  if (
    req.body.number &&
    (req.body.number.startsWith("+43") || req.body.number.startsWith("43"))
  ) {
    var phoneNumber = req.body.number;
    var message = req.body.message;

    var content = "To: " + phoneNumber + "\r\n\r\n" + message;
    var fileName = "server/sms/" + phoneNumber + ".txt";
    fs.writeFile(fileName, content, function (err) {
      if (err) return logger.log("error", err);
      logger.log("info", "Sent CUSTOM SMS MESSAGE to NUMBER: " + phoneNumber);
      ftpUploadSMS(fileName, phoneNumber + ".txt");
      res.send(true);
    });
  } else {
    res.send(false);
    logger.log(
      "warn",
      `Number ${req.body.number} is not start with available area code!`
    );
  }
});

//custom SMS reminder

/* Settings reminder */

router.get("/getReminderSettings/:superadmin", (req, res, next) => {
  try {
    var reqObj = req.params.superadmin;

    connection.getConnection(function (err, conn) {
      if (err) {
        res.json(err);
      } else {
        conn.query(
          "select * from reminder where superadmin = '" + reqObj + "'",
          function (err, rows, fields) {
            conn.release();
            if (err) {
              res.json(err);
            } else {
              res.json(rows);
            }
          }
        );
      }
    });
  } catch (ex) {
    logger.log("error", err.sql + ". " + err.sqlMessage);
    res.json(ex);
  }
});

router.post("/setReminderSettings", function (req, res, next) {
  connection.getConnection(function (err, conn) {
    if (err) {
      res.json(err);
    }

    conn.query(
      "select * from reminder where superadmin = '" + req.body.superadmin + "'",
      function (err, rows, fields) {
        if (rows.length > 0) {
          conn.query(
            "update reminder set ? where superadmin = ?",
            [req.body, req.body.superadmin],
            function (err, rows, fields) {
              conn.release();
              if (err) {
                res.json(err);
              } else {
                res.json(true);
              }
            }
          );
        } else {
          conn.query(
            "insert into reminder set ?",
            [req.body],
            function (err, rows, fields) {
              conn.release();
              if (err) {
                res.json(err);
              } else {
                res.json(true);
              }
            }
          );
        }
      }
    );
  });
});

/* END Settings reminder */

router.post("/updateCustomerSendReminderOption", function (req, res, next) {
  connection.getConnection(function (err, conn) {
    if (err) {
      res.send(err);
    }
    conn.query(
      "update customers SET ? where id = ?",
      [req.body, req.body.id],
      function (err, rows) {
        conn.release();
        if (!err) {
          if (!err) {
            res.send(true);
          } else {
            res.send(false);
          }
        } else {
          res.send(err);
        }
      }
    );
  });
});

module.exports = router;

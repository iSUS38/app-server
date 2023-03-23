const express = require('express');
const mysql = require('mysql');
const app = express();
const port = 5000;

const block1Max = 34;
const block2max = 8;
const block3Max = 8;
const block4Max = 15;

app.listen(port, () => console.log(`Listening on port ${port}`));
app.use(function(req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Access-Control-Allow-Credentials', true);
    next();
});

var connection = mysql.createConnection({
    host: "sql7.freemysqlhosting.net",
    user: "sql7608016",
    password: "WhjWXgpnPw",
    database: "sql7608016"
});

connection.connect(function(err) {
    if (err) throw err;

    console.log("mysql success")
});

app.get("/api/startExam", async function (req, res, next) {
    var userKey = req.query.key.toLowerCase();
    console.log(userKey)

    if (userKey === "demo") {
        var demoQuestions = await new Promise(function (resolve) {
            connection.query("SELECT * FROM demoquestions", function (err, result) {
                let block1Questions = result.filter((item) => {
                    if (item.block === "block1") {
                        return item
                    }
                });

                let block2Questions = result.filter((item) => {
                    if (item.block === "block2") {
                        return item
                    }
                });

                let block3Questions = result.filter((item) => {
                    if (item.block === "block3") {
                        return item
                    }
                });

                let block4Questions = result.filter((item) => {
                    if (item.block === "block4") {
                        return item
                    }
                });

                block1Questions = block1Questions.sort(() => Math.random() - 0.5);
                block2Questions = block2Questions.sort(() => Math.random() - 0.5);

                resolve([...block1Questions, ...block2Questions, ...block3Questions, ...block4Questions]);
            });
        });

        console.log(demoQuestions);
        res.json({questions: demoQuestions, error: false});
        res.end();
        return next();
    }

    let data = await new Promise(function (resolv) {
        connection.query(`SELECT * FROM accesskeys WHERE accesskey = '${userKey}'`, async function (err, result, fields) {

            if (!result || !result.length) {
                res.status(403);
                res.json({error: true});

                return next();
            }

            let block1Questions = await new Promise(function (resolve, reject) {
                connection.query("SELECT * FROM block1", function (err, result, fields) {
                    let questions = [];
                    let iterationsChecker = 0;
                    let alreadyAddedItems = [];

                    for (let i = 0; i < block1Max; i++) {
                        let randomIndex = getRandomIndex(alreadyAddedItems, result.length, iterationsChecker);
                        
                        questions.push(result[randomIndex]);
                    }

                    resolve(questions);
                })
            });

            let block2Questions = await new Promise(function (resolve, reject) {
                connection.query("SELECT * FROM block2",  async function (err, result, fields) {
                    let questions = [];
                    let iterationsChecker = 0;
                    let alreadyAddedItems = [];

                    for (let i = 0; i < block2max; i++) {
                        let randomIndex = getRandomIndex(alreadyAddedItems, result.length, iterationsChecker);

                        questions.push(result[randomIndex]);
                    }

                    resolve(questions);
                });
            });

            let block3Questions = await new Promise(function (resolve, reject) {
                connection.query("SELECT * FROM block3", function (err, result, fields) {
                    let questions = [];
                    let iterationsChecker = 0;
                    let alreadyAddedItems = [];

                    for (let i = 0; i < block3Max; i++) {
                        let randomIndex = getRandomIndex(alreadyAddedItems, result.length, iterationsChecker);

                        questions.push(result[randomIndex]);
                    }

                    resolve(questions);
                });
            });

            let block4Questions = await new Promise(function (resolve, reject) {
                connection.query("SELECT * FROM block4", function (err, result, fields) {
                    let questions = [];
                    let iterationsChecker = 0;
                    let alreadyAddedItems = [];

                    for (let i = 0; i < block4Max; i++) {
                        let randomIndex = getRandomIndex(alreadyAddedItems, result.length, iterationsChecker);
                        
                        questions.push(result[randomIndex]);
                    }

                    resolve(questions);
                });
            })

            resolv([...block1Questions, ...block2Questions, ...block3Questions, ...block4Questions]);
        });
    });

    res.json({questions: data, error: false});
    res.end();
});

app.post("/api/adduseraccesskey", function (req, res, next) {
    var data = req.body;

    var customerEmail = data.email;
    var productPrice = +data.variables.product_price;

    console.log(productPrice, customerEmail);
    if (!productPrice || !customerEmail) return next();

    var date = data.execution_date.date.split(" ")[0];
    console.log(data);

    switch(productPrice) {
        case 20:
            var endDate;

            connection.query(`INSERT INTO accesskeys (accesskey, root, startdate, enddate) VALUES ('${customerEmail}', '0', ${date}, ${endDate})`);

            break;
        case 30:
            connection.query(`INSERT INTO accesskeys (accesskey, root, startdate, enddate) VALUES ('${customerEmail}', '1', ${date}, 2038-01-10)`);

            break;
        default:
            break;
    }

    res.end();
});

function getRandomIndex(alreadyAddedIndexes, arrayLen, iterationsChecker) {
    if (iterationsChecker >= 10) return 0;

    let randomIndex = Math.floor(Math.random() * arrayLen);

    if (alreadyAddedIndexes.indexOf(randomIndex + "") === -1) {
        alreadyAddedIndexes.push(randomIndex + "")
        iterationsChecker++;

        return randomIndex;
    } else {
        iterationsChecker++;
        return getRandomIndex(alreadyAddedIndexes, arrayLen, iterationsChecker);
    }
}
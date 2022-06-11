const mysql = require("mysql2");

const connection = mysql.createConnection({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    multipleStatements: true
});

connection.connect(function (err) {
    if (err) {
        console.error("Error when connecting database:", err.stack);
        return;
    }

    console.log("Connected to database:", connection.threadId);
});

module.exports = connection.promise();
const mysql = require("mysql2/promise");

const pool = mysql.createPool({
    // aws ip
    host: "3.36.132.130",
    // mysql username
    user: "ssafy",
    // mysql user password
    password: "ssafy_1234",
    // db name
    database: "order_system",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
});

module.exports = { pool };
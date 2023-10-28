require('dotenv').config()
let mysql = require('mysql');

let con = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE
})

con.connect((err) => {
    if (err) throw err
    console.log('Database Connected');
})

module.exports = con;
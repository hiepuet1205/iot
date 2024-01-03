const mysql = require('mysql2');

const connection = mysql.createConnection({
    host: 3306,
    user: 'root',
    password: 'hiep',
    database: 'user_data'
  });
connection.connect((err) => {
    if (err) throw err;
    console.log('Connected to MySQL Server!');
});

connection.connect(function (err) {
  if (err) throw err;
  console.log("mysql connected");
  var sql = "CREATE TABLE IF NOT EXISTS Register (Account VARCHAR(255), Password VARCHAR(255))";
  connection.query(sql, function (err) {
      if (err)
          throw err;
      console.log("Table created");
  });
})

connection.connect(function (err) {
  if (err) throw err;
  console.log("mysql connected");
  var sql = "CREATE TABLE IF NOT EXISTS data (ID int(10) not null primary key auto_increment, Time VARCHAR(255) not null, Temperature float(3,1) not null, Humidity int(3) not null, Soil int(5) not null )"
  connection.query(sql, function (err) {
      if (err)
          throw err;
      console.log("Table created");
  });
})



module.exports = {connection}

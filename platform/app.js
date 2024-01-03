const express = require("express");
const path = require("path");

const hbs = require("express-handlebars");
const bodyParser = require("body-parser");
const { connection } = require("./config/db");
const app = express();
const port = 3000;
const user = require("./routes/user");
const excel = require('excel4node');
var server = require("http").Server(app);

var mqtt = require('mqtt');
const clientId = "client" + Math.random().toString(36).substring(7) + "1";

const host = "ws://13.231.154.153:9001/mqtt";

const options = {
  keepalive: 60,
  clientId: clientId,
  protocolId: "MQTT",
  protocolVersion: 4,
  clean: true,
  reconnectPeriod: 1000,
  connectTimeout: 30 * 1000,
};

var client = mqtt.connect(host, options);

client.on('connect', function () {
  client.subscribe('temp');
  client.subscribe('hum');
  client.subscribe('lux');
  client.subscribe('soilMoisture');
  client.subscribe('sql1');
});

app.use(express.json());
app.engine("handlebars", hbs.engine());
app.set("view engine", "handlebars");
app.set("views", "./views");

app.use(express.static(path.join(__dirname, "public")));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

let temp1, hum1, soil1;

client.on('message', function (topic, message) {
  var data = message.toString();

  if (topic === 'temp') {
    handleTempData(data);
  } else if (topic === 'hum') {
    handleHumData(data);
  } else if (topic === 'lux') {
    handleLuxData(data);
  } else if (topic === 'soilMoisture') {
    handleSoilMoistureData(data);
  } else if (topic === 'sql1') {
    handleSaveData();
  }
});

const handleTempData = (data) => {
  temp1 = data;
}

const handleHumData = (data) => {
  hum1 = data;
}

const handleLuxData = (data) => {
}

const handleSoilMoistureData = (data) => {
  soil1 = data;
}

const handleSaveData = () => {
  connection.connect(function (err) {
    if (err) throw err;
    var n = new Date();
    var month = n.getMonth() + 1;
    var Date_and_Time =
      n.getFullYear() +
      "-" +
      month +
      "-" +
      n.getDate() +
      " " +
      n.getHours() +
      ":" +
      n.getMinutes() +
      ":" +
      n.getSeconds();
    if (temp1 > 0 && temp1 < 100 && hum1 > 0 && hum1 < 100 && soil1 > 0 && soil1 < 1024) {
      var sql =
        "INSERT INTO data (Time, Temperature, Humidity, Soil) VALUES ('" +
        Date_and_Time.toString() +
        "', '" +
        temp1 +
        "', '" +
        hum1 +
        "', '" +
        soil1 +
        "')";
      connection.query(sql, function (err, result) {
        if (err) console.error(err);
        console.log("Table inserted");
        console.log(Date_and_Time + " " + temp1 + " " + hum1 + " " + soil1);
      });
    }
  })
}

app.get("/", (req, res) => {
  res.render("home");
});

app.get("/about", (req, res) => {
  res.render("about");
});

app.get("/control", (req, res) => {
  res.render("user/control");
});

app.post("/user", async (req, res) => {
  var username = req.body.username;
  var password = req.body.password;
  if (username && password) {
    connection.query(
      "SELECT * FROM Register WHERE Account = ? AND Password = ?",
      [username, password],
      function (error, results, fields) {
        if (results.length > 0) {
          res.redirect("/control");
        } else {
          console.log("Incorrect Username and/or Password!");
          res.redirect("/user");
        }
        res.end();
      }
    );
  } else {
    res.send("Please enter Username and Password!");
    res.end();
  }
});

function fetchDataFromDatabase(callback) {
  connection.query(
    "SELECT * FROM data order by id desc",
    function (err, result, fields) {
      if (err) throw err;
      var data = [];
      for (var i = 0; i < result.length; i++) {
        var currentTime = new Date();
        var timeValue = new Date(result[i].Time);
        var timeDifference = (currentTime - timeValue) / (1000 * 60);

        if (timeDifference <= 30) {
          data.push({
            id: result[i].ID,
            time: result[i].Time,
            temp: result[i].Temperature,
            hum: result[i].Humidity,
            soil: result[i].Soil,
          })
        }
      }
      callback(data);
    }
  );
}

app.get("/history", (req, res) => {
  fetchDataFromDatabase(function (data) {
    res.render("user/history", { dataArray: data });
  });
});

app.get("/exportData", (req, res) => {
  fetchDataFromDatabase(function (data) {
    try {
      const wb = new excel.Workbook();

      const ws = wb.addWorksheet('Data Sheet');

      const headerStyle = wb.createStyle({
        font: {
          bold: true,
        },
      });

      ws.cell(1, 1).string('ID').style(headerStyle);
      ws.cell(1, 2).string('Thời gian').style(headerStyle);
      ws.cell(1, 3).string('Nhiệt độ').style(headerStyle);
      ws.cell(1, 4).string('Độ ẩm').style(headerStyle);
      ws.cell(1, 5).string('Độ ẩm đất').style(headerStyle);

      for (let i = 0; i < data.length; i++) {
        const rowData = data[i];
        ws.cell(i + 2, 1).number(rowData.id);
        ws.cell(i + 2, 2).string(rowData.time);
        ws.cell(i + 2, 3).number(rowData.temp);
        ws.cell(i + 2, 4).number(rowData.hum);
        ws.cell(i + 2, 5).number(rowData.soil);
      }

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename=data.xlsx');


      wb.writeToBuffer().then((buffer) => {
        res.send(buffer);
      });
    } catch (error) {
      console.error('Lỗi khi xử lý export: ', error);
      res.status(500).send('Đã xảy ra lỗi khi xử lý export');
    }
  });
});

app.use("/user", user);
server.listen(port, function () {
  console.log("Server listening on port " + port);
});

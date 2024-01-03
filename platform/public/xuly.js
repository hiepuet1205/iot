var temps = [];
let max_temp = 0;
let min_temp = 99999999999999999999999;
var hums = [];
let max_hum = 0;
let min_hum = 99999999999999999999999;
var soils = [];
let max_soil = 0;
let min_soil = 99999999999999999999999;
var dat = [];
var k = 0;
let isLight1Open = false;
let isLight2Open = false;
let isAirOpen = false;
let isPumpOpen = false;

const clientId = "client" + Math.random().toString(36).substring(7);

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
  client.subscribe('soilMoisture');
  client.subscribe('sql1');
  client.subscribe('light1-st');
  client.subscribe('light2-st');
  client.subscribe('air-st');
  client.subscribe('pump-st');
});

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
  } else if (topic === 'light1-st') {
    handleLight1Status(data);
  } else if (topic === 'light2-st') {
    handleLight2Status(data);
  } else if (topic === 'air-st') {
    handleAirStatus(data);
  } else if (topic === 'pump-st') {
    handlePumpStatus(data);
  } else if (topic === 'sql1') {
    handlePredictData();
  }
});

async function handlePredictData() {
  const temp = temps[temps.length - 1];
  const hum = hums[hums.length - 1];
  const soil = soils[soils.length - 1];

  let features = [Number(temp), Number(hum), Number(soil)];
  let data = {
    'features': features
  };

  await fetch('http://localhost:5000/predict', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  })
    .then(response => response.json())
    .then(data => {
      document.getElementById('predict').innerHTML = `<p>Dự đoán kết quả đo tiếp theo <br> Nhiệt độ: ${Math.round(data.temp[0] * 100) / 100} (°C) <br> Độ ẩm: ${Math.round(data.hum[0] * 100) / 100} (%) <br> Độ ẩm đất: ${Math.round(data.soil[0] * 100) / 100} (%)</p>`;
      console.log('Kết quả dự đoán:', data);
    })
    .catch(error => {
      console.error('Đã xảy ra lỗi:', error);
    });
}

function handleTempData(data) {
  if (data > max_temp) {
    max_temp = data;
    $("#max_temp").text(data);
  }
  if (data < min_temp) {
    min_temp = data;
    $("#min_temp").text(data);
  }

  if (temps.length < 10) {
    temps.push(data);
  } else {
    temps.shift();
    temps.push(data);
  }
  document.getElementById('temp').textContent = data;
}

function handleHumData(data) {
  if (data > max_hum) {
    max_hum = data;
    $("#max_hum").text(data);
  }
  if (data < min_hum) {
    min_hum = data;
    $("#min_hum").text(data);
  }

  if (hums.length < 10) {
    hums.push(data);
  } else {
    hums.shift();
    hums.push(data);
  }
  document.getElementById('hum').textContent = data;
}

function handleSoilMoistureData(data) {
  if (data > max_soil) {
    max_soil = data;
    $("#max_soil").text(data);
  }
  if (data < min_soil) {
    min_soil = data;
    $("#min_soil").text(data);
  }
  if (soils.length < 10) {
    soils.push(data);
  } else {
    soils.shift();
    soils.push(data);
  }
  document.getElementById('soil').textContent = data;
  chart_data();
}

function handleLight1Status(data) {
  console.log(data);
  if (data.toString() == '0') {
    isLight1Open = false;
    document.getElementById("light1").innerHTML = '<img id="light1img" src="/img/lightOff.png" alt="" class="machine" />Đèn 1</p>'
  } else if (data.toString() == '1') {
    isLight1Open = true;
    document.getElementById("light1").innerHTML = '<img id="light1img" src="/img/light.png" alt="" class="machine" />Đèn 1</p>'
  }
}

function handleLight2Status(data) {
  console.log(data)
  if (data.toString() == '0') {
    isLight2Open = false;
    document.getElementById("light2").innerHTML = '<img id="light2img" src="/img/lightOff.png" alt="" class="machine" />Đèn 2</p>'
  } else if (data.toString() == '1') {
    isLight2Open = true;
    document.getElementById("light2").innerHTML = '<img id="light2img" src="/img/light.png" alt="" class="machine" />Đèn 2</p>'
  }
}

function handleAirStatus(data) {
  if (data.toString() == '0') {
    isAirOpen = false;
    document.getElementById('air').innerHTML = '<img src="/img/fan1.png" alt="" class="machine" />Điều hòa (OFF)';
    document.getElementById('auto').innerHTML = "";
  } else if (data.toString() == '1') {
    isAirOpen = true;
    document.getElementById('air').innerHTML = '<img src="/img/fan1.png" alt="" class="machine" />Điều hòa (ON)';
    document.getElementById('auto').innerHTML = "<p>Nhiệt độ cao. Điều hòa đang được bật</p>";
  }
}

function handlePumpStatus(data) {
  if (data.toString() == '0') {
    isPumpOpen = false;
    document.getElementById('pump1').innerHTML = '<img src="/img/pumps.png" alt="" class="machine" />Máy bơm (OFF)';
    document.getElementById('auto_pump').innerHTML = "";
  } else if (data.toString() == '1') {
    isPumpOpen = true;
    document.getElementById('pump1').innerHTML = '<img src="/img/pumps.png" alt="" class="machine" />Máy bơm (ON)';
    document.getElementById('auto_pump').innerHTML = "<p>Đất khô. Máy Bơm đang được bật</p>";
  }
}

document.addEventListener('DOMContentLoaded', function () {
  document.getElementById('light1').addEventListener('click', function () {
    try {
      if (isLight1Open) {
        client.publish('light1', '0');
      } else {
        client.publish('light1', '1');
      }
    } catch (error) {
      console.log(error);
    }
  });

  document.getElementById('light2').addEventListener('click', function () {
    try {
      if (isLight2Open) {
        client.publish('light2', '0');
      } else {
        client.publish('light2', '1');
      }
    } catch (error) {
      console.log(error);
    }
  });

  document.getElementById('pump1').addEventListener('click', function () {
    if (isPumpOpen) {
      client.publish('pump', '0');
    } else {
      client.publish('pump', '1');
    }
  });

  document.getElementById('air').addEventListener('click', function () {
    if (isAirOpen) {
      client.publish('air', '0');
    } else {
      client.publish('air', '1');
    }
  });

  document.getElementById('export-data').addEventListener('click', function () {
    fetch('/exportData')
      .then(response => {
        return response.blob();
      })
      .then(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'data.xlsx';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      })
      .catch(error => {
        console.error('Lỗi khi tải file: ', error);
      });
  });
});

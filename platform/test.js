var mqtt = require('mqtt');
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
    client.subscribe('lux');
    client.subscribe('soilMoisture');
    client.subscribe('light1');
    client.subscribe('light2');
    client.subscribe('air');
    client.subscribe('pump');
    client.subscribe('light1-st');
    client.subscribe('light2-st');
    client.subscribe('air-st');
    client.subscribe('pump-st');
});

client.on('message', function (topic, message) {
    var data = message.toString();

    if (topic === 'light1') {
        handleLight1Control(data);
    } else if (topic === 'light2') {
        handleLight2Control(data);
    } else if (topic === 'air') {
        handleAirControl(data);
    } else if (topic === 'pump') {
        handlePumpControl(data);
    }
});

function handleLight1Control(data) {
    client.publish('light1-st', data)
}

function handleLight2Control(data) {
    client.publish('light2-st', data)
}

function handleAirControl(data) {
    client.publish('air-st', data)
}

function handlePumpControl(data) {
    client.publish('pump-st', data)
}

let nhietdo = 0;
let doam = 0;
let anhsang = 0;
let doamdat = 0;

setInterval(() => {
    client.publish('temp', nhietdo.toString());
    nhietdo++;
    client.publish('hum', doam.toString());
    doam += 5;
    client.publish('lux', anhsang.toString());
    anhsang += 7;
    client.publish('soilMoisture', doamdat.toString());
    doamdat += 3;
    client.publish('sql1', Math.random().toString());
}, 6000);



const cron = require('node-cron');

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

const turnOffLight = cron.schedule('0 8 * * *', () => {
  client.publish('light1', '0');
  client.publish('light2', '0');
}, {
  timezone: 'Asia/Ho_Chi_Minh',
});

const turnOnLight = cron.schedule('0 17 * * *', () => {
  client.publish('light1', '1');
  client.publish('light2', '1');
}, {
  timezone: 'Asia/Ho_Chi_Minh',
});

turnOffLight.start();
turnOnLight.start();
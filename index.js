const fs = require('fs');
const pm2 = require('pm2');
const ZabbixSender = require('zabbix-sender');
const sender = new ZabbixSender();

function getDataKey(data) {
    return `pm2.processes["${data.process.name}-${data.process.pm_id}",errors]`;
}

pm2.launchBus((err, bus) => {
    bus.on('log:err', (data) => {
        fs.writeFile('/tmp/errors.txt', JSON.stringify(data), 'utf8', () => {});
        const zd = {};
        zd[getDataKey(data)] = data.data;
        sender.send(zd);
    });

    bus.on('log:out', (data) => {
        fs.writeFile('/tmp/info.txt', JSON.stringify(data), 'utf8', () => {});
        const zd = {};
        zd[getDataKey(data)] = data.data;
        sender.send(zd);
    });
});

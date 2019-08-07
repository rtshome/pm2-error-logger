const fs = require('fs');
const pm2 = require('pm2');
const ZabbixSender = require('zabbix-sender');
const sender = new ZabbixSender();

function getDataKey(data) {
    let pName = `${data.process.name}-${data.process.pm_id}`;
    if (data.process.name.match(/[\\"]/)) {
        pName = pName.replace(/([\\"])/, '\\$1');
    }

    if (pName.match(/[[\], "\\]/)) {
        pName = `"${pName}"`;
    }
    return `pm2.processes[${pName},errors]`;
}

pm2.launchBus((err, bus) => {
    bus.on('log:err', (data) => {
        // fs.writeFile('/tmp/errors.txt', JSON.stringify(data), 'utf8', () => {});
        const zd = {};
        zd[getDataKey(data)] = JSON.stringify(data.data);
        sender.send(zd);
    });

    bus.on('log:out', (data) => {
        // fs.writeFile('/tmp/info.txt', JSON.stringify(data), 'utf8', () => {});
        if (data.data.match(/"level":[56789][0-9]/)) {
            const zd = {};
            zd[getDataKey(data)] = JSON.stringify(data.data);
            sender.send(zd);
        }
    });
});

const si = require('systeminformation');
async function getSystemStatus() {
    const cpu = await si.currentLoad();
    const memory = await si.mem();
    const disk = await si.fsSize();
    const uptime = await si.time();
    const hostname = await si.osInfo();
    return {
        cpuUsage: cpu.currentLoad,
        memory: {
            total: memory.total,
            used: memory.active,
            free: memory.free
        },
        disk: disk[0],
        uptime: uptime.uptime,
        hostname: hostname.hostname
    };
}
async function getSystemInfo(req, res) {
    try {
        const status = await getSystemStatus();
        res.json(status);
    } catch (error) {
        console.log('Error retrieving system status:', error);
        res.status(500).send('Error retrieving system status');
    }
}
const status = {
    getSystemInfo
};
module.exports = status;
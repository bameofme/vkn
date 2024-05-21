const shell = require('node-powershell');
const mongoose = require('mongoose');
const configSchema = new mongoose.Schema({
    name: String,
    powerPlan: String,
    timezone: String
}, { _id: 'config' });
const Config = mongoose.model('Config', configSchema);
// Simulated config storage

async function setConfig(req, res) {
    const { powerPlan, timezone } = req.body;
    const ps = new shell({
        executionPolicy: 'Bypass',
        noProfile: true
      });

    if (powerPlan) {
        try {
            await ps.addCommand(`powercfg /s ${powerPlan}`);
            await ps.invoke();
        } catch (error) {
            return res.status(500).send('Error changing power plan');
        }
    }

    if (timezone) {
        try {
            console.log(timezone);
            await ps.addCommand(`tzutil /s "${timezone}"`);
            await ps.invoke();
        } catch (error) {
            return res.status(500).send('Error changing timezone');
        }
    }

    const configData = {name: "config", powerPlan, timezone };

    try {
        await Config.findOneAndUpdate({ name : "config" }, configData, { upsert: true, new: true });
        res.json({ message: 'Configuration updated', config: configData });
    } catch (error) {
        res.status(500).send('Error updating configuration in database');

    }
}
async function getPowerPlan() {
    let configData = await Config.findOne({ name: 'config' }).exec();
    return configData.powerPlan;
}

async function gettimezone() {
    let configData = await Config.findOne({ name: 'config' }).exec();;
    return configData.timezone;
}
const config = {
    setConfig,
    getPowerPlan,
    gettimezone
};
module.exports = config;
const electron = require('electron')
const {shell} = require('electron')
const path = require('path')
const fs = require('fs')
const os = require('os')

class Store {
    constructor(options) {
        const userDataPath = (electron.app || electron.remote.app).getPath('userData')

        this.path = path.join(userDataPath, options.configName + '.json')
        this.data = parseDataFile(this.path, options.defaults)
    }

    get(key) {

        return this.data[key]
    }

    set (key, val) {

        this.data[key] = val
        // console.log(this.path)
        // C:\Users\PiaseckiAr01\AppData\Roaming\SysTop\user-settings.json
        // let storeDest = path.join(os.homedir(), 'AppData/Roaming/SysTop/user-settings.json')
        // shell.openPath(storeDest)
        fs.writeFileSync(this.path, JSON.stringify(this.data))
    }
}

function parseDataFile(filePath, defaults) {
    try {
        return JSON.parse(fs.readFileSync(filePath))
    } catch (error) {
        return defaults
    }
}

module.exports = Store
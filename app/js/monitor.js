const path = require('path');
const osu = require('node-os-utils');
const {ipcRenderer} = require('electron')


const cpu = osu.cpu
const mem = osu.mem
const os = osu.os

//console.log(cpu)

let cpuOverload;  // = 80 If cpu will hic up to 80% it will run needed function
let alertFrequency; //  = 5 How often will be alerted per min if cpuOverload will hit needed range

// Get settings & values 
ipcRenderer.on('settings:get', (e, settings) => {
    cpuOverload = +settings.cpuOverload
    alertFrequency = +settings.alertFrequency
})


//run every 2 secodns
setInterval(() => {
    //CPU usage
    cpu.usage().then(info => {
        document.getElementById("cpu-usage").innerText = info.toFixed(2) + "%";

        document.getElementById("cpu-progress").style.width = info + "%";

        //Make progress bar red if overloading
        if (info >= cpuOverload) {
            document.getElementById("cpu-progress").style.backgroundColor = "red";
        } else {
            document.getElementById("cpu-progress").style.backgroundColor = "#30c88b";
        }

         //Check overload
        if (info >= cpuOverload && runNotify(alertFrequency)) {
            
            notifyUser({
                title: 'CPU Overload',
                body: `CPU is over ${cpuOverload}%`,
                icon: path.join(__dirname, 'img', 'icon.png')
            })
            // define localStorage


            localStorage.setItem("lastNotify", +new Date())
        }
    })

   

    //CPU free
    cpu.free().then(info => {
        document.getElementById("cpu-free").innerText = info.toFixed(2) + "%";
    })

    // console.log(os.uptime())
   
    //Uptime
    document.getElementById("sys-uptime").innerText = secondsToDhms(os.uptime());

}, 2000)


//Set model
document.getElementById('cpu-model').innerText = cpu.model()

//Computer name
document.getElementById('comp-name').innerText = os.hostname()

//OS 
document.getElementById('os').innerText = `${os.type()} ${os.arch()}`
//console.log(os.platform())


//Total Mem
mem.info().then(info => {
    document.getElementById('mem-total').innerText = `${info.totalMemMb} MB ≈ ${Math.ceil(info.totalMemMb / 1024)} GB`
})


 //SHow days, hours, mins, seconds
 function secondsToDhms(seconds) {
    seconds = +seconds
    const d = Math.floor(seconds / (3600 * 24))
    const h = Math.floor((seconds % (3600 * 24)) / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = Math.floor(seconds % 60)

    return `${d} days, ${h} hours, ${m} min, ${s} sec`
}

//Send notification
function notifyUser(options) {
    new Notification(options.title, options)
}

//check how much time has passed since modification
function runNotify(frequency) {
    if (localStorage.getItem("lastNotify") === null) {
        //store timestamp
        localStorage.setItem("lastNotify", +new Date())
        return true
    }
    const notifyTime = new Date(parseInt(localStorage.getItem('lastNotify')))
    const now = new Date()
    const diffTime = Math.abs(now - notifyTime)
    const minutesPassed = Math.ceil(diffTime / (1000 * 60))

    if (minutesPassed > frequency) {
        return true
    } else {
        return false
    }
}
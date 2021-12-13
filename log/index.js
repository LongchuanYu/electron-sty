const { FitAddon } = require('xterm-addon-fit')
const {ipcRenderer} = require('electron')

var term = new Terminal();
const fitAddon = new FitAddon();
term.loadAddon(fitAddon);
term.open(document.getElementById('terminal'));
term.onData(data => {
    console.log(data);
})
fitAddon.fit();
ipcRenderer.on('send-backend-log', (e, arg) => {
    term.writeln(arg);
})

window.addEventListener('resize', function() {
    fitAddon.fit();
})
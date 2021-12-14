const { FitAddon } = require('xterm-addon-fit')
const {ipcRenderer} = require('electron');
const console = require('console');

var term = new Terminal();
const fitAddon = new FitAddon();
term.loadAddon(fitAddon);
term.open(document.getElementById('terminal'));

term.onData(data => {
    ipcRenderer.send('xterm-to-pty', data);
})
fitAddon.fit();
ipcRenderer.on("pty-to-xterm", (event, data) => {
    console.log(data);
    term.write(data);
});
window.addEventListener('resize', function() {
    fitAddon.fit();
})
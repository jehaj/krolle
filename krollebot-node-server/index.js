const httpServer = require("http").createServer();
const io = require("socket.io")(httpServer, {
    cors: {
        origin: '*',
    }
});

console.log("Programmet kører...");

const SerialPort = require('serialport');
const Readline = require('@serialport/parser-readline')

const port = new SerialPort('COM3', {
    baudRate: 9600
});

const parser = port.pipe(new Readline())

// modtager data fra Arduino Uno
parser.on('data', (data) => {
    if (data.substring(0, 5) == "Debug") {
        console.log("Debug tilstand: "+ data);
    } else {
        console.log("Sender data til hjemmeside: " + data);
        // videresender data til hjemmeside
        io.emit("krollebot_message", data);
    }
});

io.on("connection", (socket) => {
    console.log("En person er forbundet :-)");

    socket.on("krollebot_message", (message) => {
        port.write(message+'\n');
        console.log("Skriver til Arduino Uno: " + message);
    });
});

httpServer.listen(8080);

import * as http from "http";

let listeners = new Set();

let server = http.createServer((req, res) => {
    listeners.add(socket);
    console.log(`Connectoion from ${socket.address().address}`);
    socket.on("close", () => {
        console.log("Connection closed");
        listeners.delete(socket);
    });
    socket.on("error", () => {
        console.log("Connection error");
        listeners.delete(socket);
    });
    socket.on("end", () => {
        console.log("Connection end");
        listeners.delete(socket);
    });
    socket.on("timeout", () => {
        console.log("Connection timeout");
        listeners.delete(socket);
    });
});

process.stdin.on("data", (data) => {
    listeners.forEach((l) => {
        if (l.writable) {
            l.write(data);
        } else {
            listeners.delete(l);
            console.log("Found non active connection");
        }
    });
});

server.listen(8080);

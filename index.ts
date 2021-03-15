import * as http from "http";
import * as net from "net";

let listeners = new Set<http.ServerResponse>();

let server = http.createServer((req, res) => {
    res.setHeader("content-type", "text/html");
    res.flushHeaders();
    listeners.add(res);
    console.log(
        `Connection from ${(req.socket.address() as net.AddressInfo).address}`
    );
    res.on("close", () => {
        listeners.delete(res);
    });
    res.on("error", () => {
        listeners.delete(res);
    });
    res.on("finish", () => {
        listeners.delete(res);
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

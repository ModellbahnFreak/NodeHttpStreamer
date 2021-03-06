import * as net from "net";
import * as fs from "fs";

const BOUNDARY = "seroiuslywhatsthat";
const JPEG_END = new Uint8Array([0xff, 0xd9, 0xff, 0xd8]);

let listeners = new Map<net.Socket, boolean>();

let server = net.createServer((socket) => {
    let header = "";
    socket.on("data", (data) => {
        header += data.toString("utf8");
        if (header.includes("\r\n\r\n")) {
            const trimmed = header.trim();
            if (header.startsWith("GET / HTTP/1.1")) {
                socket.write(
                    `HTTP/1.1 200 OK\r\ncontent-type: multipart/x-mixed-replace;boundary=${BOUNDARY}\r\nDate: ${new Date().toString()}\r\n`
                );
                /*socket.write(
                    `HTTP/1.1 200 OK\r\ncontent-type: text/html\r\nDate: ${new Date().toString()}\r\nConnection: keep-alive\r\n\r\n<htm><body>`
                );*/
                listeners.set(socket, true);
                console.log(`Connection from ${socket.remoteAddress}`);
                socket.on("close", (err) => {
                    console.log("Connection closed:", err);
                    listeners.delete(socket);
                });
                socket.on("end", () => {
                    console.log("Connection ended");
                    listeners.delete(socket);
                });
                socket.on("error", (err) => {
                    console.log("Conneciton errored: " + err);
                    listeners.delete(socket);
                });
            } else {
                console.log("Illegal http head");
                socket.write(
                    `HTTP/1.1 400 Bad Request\r\nDate: ${new Date().toString()}\r\n`
                );
                socket.end();
            }
        }
    });
});

let buffer = Buffer.from([]);
let counter = 0;

process.stdin.on("data", (data) => {
    buffer = Buffer.concat([buffer, data]);
    let prevBoundary = 0;
    let boundaryPos = buffer.indexOf(JPEG_END, prevBoundary) + 2;
    let sendData = Buffer.from([]);
    while (boundaryPos >= 2) {
        sendData = Buffer.concat([
            sendData,
            Buffer.from(
                `\r\n--${BOUNDARY}\r\nContent-Type: image/jpeg\r\nContent-length: ${
                    boundaryPos - prevBoundary
                }\r\n\r\n`,
                "utf8"
            ),
            buffer.subarray(prevBoundary, boundaryPos),
        ]);
        /*console.log(sendData.subarray(70, 90));
        console.log(sendData.subarray(sendData.length - 10));
        console.log("----------------------");*/
        prevBoundary = boundaryPos;
        boundaryPos = buffer.indexOf(JPEG_END, prevBoundary) + 2;
    }
    if (prevBoundary > 2) {
        buffer = buffer.subarray(prevBoundary);
    }
    //console.log(`Buffer size: ${buffer.length}`);
    if (sendData.length >= 1) {
        listeners.forEach((ready, l) => {
            if (ready) {
                if (l.writable) {
                    listeners.set(l, false);
                    l.write(sendData, (err) => {
                        if (err) {
                            console.log("Connection error:", err);
                            l.end();
                            listeners.delete(l);
                        } else {
                            listeners.set(l, true);
                        }
                    });
                } else {
                    listeners.delete(l);
                    console.log("Found non active connection");
                }
            }
        });
    }
    /*listeners.forEach((l) => {
        l.write(data);
        console.log(`Sent to ${l.remoteAddress}`);
    });*/
});

server.listen(8080);

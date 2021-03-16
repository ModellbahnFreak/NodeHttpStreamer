import * as net from "net";
import * as fs from "fs";

const BOUNDARY = "seroiuslywhatsthat";
const JPEG_END = new Uint8Array([0xff, 0xd9, 0xff, 0xd8]);

let listeners = new Set<net.Socket>();

let server = net.createServer((socket) => {
    let header = "";
    socket.on("data", (data) => {
        header += data.toString("utf8");
        if (header.includes("\r\n\r\n")) {
            const trimmed = header.trim();
            if (header.startsWith("GET / HTTP/1.1")) {
                socket.write(
                    `HTTP/1.1 200 OK\r\ncontent-type: multipart/x-mixed-replace;boundary=${BOUNDARY}\r\nDate: ${new Date().toString()}\r\nConnection: keep-alive\r\nTransfer-Encoding: chunked\r\n`
                );
                listeners.add(socket);
                console.log(
                    `Connection from ${
                        (socket.address() as net.AddressInfo).address
                    }`
                );
                socket.on("close", () => {
                    listeners.delete(socket);
                });
                socket.on("end", () => {
                    listeners.delete(socket);
                });
                socket.on("error", () => {
                    listeners.delete(socket);
                });
            } else {
                console.log("Illegal http head");
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
        console.log(sendData.subarray(70, 90));
        console.log(sendData.subarray(sendData.length - 10));
        console.log("----------------------");
        prevBoundary = boundaryPos;
        boundaryPos = buffer.indexOf(JPEG_END, prevBoundary) + 2;
    }
    if (prevBoundary > 2) {
        buffer = buffer.subarray(prevBoundary);
    }
    console.log(`Buffer size: ${buffer.length}`);
    if (sendData.length >= 1) {
        listeners.forEach((l) => {
            if (l.writable) {
                l.write(sendData);
            } else {
                listeners.delete(l);
                console.log("Found non active connection");
            }
        });
    }
});

server.listen(8080);

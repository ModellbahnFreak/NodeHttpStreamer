import * as http from "http";
import * as net from "net";
import * as fs from "fs";

const BOUNDARY = "seroiuslywhatsthat";
const JPEG_END = new Uint8Array([0xff, 0xd9, 0xff, 0xd8]);

let listeners = new Set<http.ServerResponse>();

let server = http.createServer((req, res) => {
    if (req.method == "GET" && req.url == "/") {
        res.setHeader(
            "content-type",
            `multipart/x-mixed-replace;boundary=${BOUNDARY}`
        );
        res.writeHead(200);
        listeners.add(res);
        console.log(
            `Connection from ${
                (req.socket.address() as net.AddressInfo).address
            }`
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
        res.write("\r\n");
    } else {
        res.writeHead(400, "Not supported");
    }
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
        fs.writeFile(
            `./img${(counter++).toString().padStart(4, "0")}.jpg`,
            buffer.subarray(prevBoundary, boundaryPos),
            (err) => {
                if (err) console.error(err);
            }
        );
        console.log(sendData.subarray(70, 90));
        console.log(sendData.subarray(sendData.length - 10));
        console.log("----------------------");
        prevBoundary = boundaryPos;
        boundaryPos = buffer.indexOf(JPEG_END, prevBoundary) + 2;
    }
    if (prevBoundary > 2) {
        buffer = buffer.subarray(prevBoundary);
    }
    //console.log(`Buffer size: ${buffer.length}`);
    if (sendData.length >= 1) {
        listeners.forEach((l) => {
            if (l.writable && l.socket?.writable) {
                l.write(sendData);
            } else {
                listeners.delete(l);
                console.log("Found non active connection");
            }
        });
    }
});

server.listen(8080);

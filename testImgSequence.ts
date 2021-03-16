import * as fs from "fs";

let counter = 1;

let timer = setInterval(() => {
    fs.readFile(
        `./img/img${counter.toString(10).padStart(2, "0")}.jpg`,
        (err, data) => {
            if (!err && data) {
                console.error(`Image ${counter - 1}`);
                process.stdout.write(data);
            } else {
                console.error(err);
            }
        }
    );
    counter = (counter % 25) + 1;
}, 40);

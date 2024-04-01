const fs = require("fs");
const readline = require("readline");

const axios = require("axios");

async function processLineByLine() {
  const fileStream = fs.createReadStream("./data/conditions.txt");

  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });
  // Note: we use the crlfDelay option to recognize all instances of CR LF
  // ('\r\n') in input.txt as a single line break.

  for await (const line of rl) {
    // Each line in input.txt will be successively available here as `line`.
    const options = {
      method: "POST",
      url: "http://127.0.0.1:9000/tags",
      headers: {"Content-Type": "application/json"},
      data: {name: `${line}`, category: "conditions"},
    };

    axios
      .request(options)
      .then(function (response) {
        console.log(response.data);
      })
      .catch(function (error) {
        console.error(error);
      });
  }
}

processLineByLine();

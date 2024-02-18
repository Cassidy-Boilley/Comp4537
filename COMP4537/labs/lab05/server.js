const http = require('http');
const url = require('url');
const GET = 'GET';
const POST = 'POST';
const endPointRoot = "/api/definitions";
let dictionary = [];
let totalResponses = 0;

class Word {
  constructor(word, definition) {
    this.word = word;
    this.definition = definition;
  }
}

// Function to find a word in the dictionary
function findWord(wordToFind, wordsArray) {
  for (let i = 0; i < wordsArray.length; i++) {
    if (wordsArray[i].word === wordToFind) {
      return wordsArray[i];
    }
  }
  return null;
}

// Create HTTP server
const server = http.createServer(function (req, res) {
  if (req.method === GET) {
    const word = url.parse(req.url, true);
    const key = word.query["word"];
    const target = findWord(key, dictionary);
    if (target !== null) {
      res.writeHead(200, {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "*"
      });
      res.end(JSON.stringify({ definition: target.definition, totalResponses: ++totalResponses }));
    } else {
      res.writeHead(400, {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "*"
      });
      totalResponses++;
      res.end("Definition not found");
    }
  }

  if (req.method === POST) {
    let data = '';
    req.on('data', chunk => {
      data += chunk;
    });

    req.on('end', () => {
      try {
        console.log("Received POST data:", data); // Log the received data
        const jsonData = JSON.parse(data);
        const word = jsonData.word.trim();
        const definition = jsonData.definition.trim();

        if (!isNaN(word) || word === '') {
          let failedResponse = "Word must be a non-empty string and can't be a number";
          console.log("Failed because of bad request");
          res.writeHead(400, {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "*"
          });
          res.end(JSON.stringify({ failedResponse: failedResponse, totalResponses: ++totalResponses }));
          return;
        }

        if (word && definition) {
          dictionary.push(new Word(word, definition));
          res.writeHead(200, {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "*"
          });
          res.end(JSON.stringify({ word: word, definition: definition, totalResponses: ++totalResponses }));
        } else {
          res.writeHead(400, {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "*"
          });
          console.log("Failed because of bad request");
          res.end(JSON.stringify({ failedResponse: "Word or definition is empty", totalResponses: ++totalResponses }));
        }
      } catch (error) {
        console.error("Error parsing JSON data:", error); // Log any parsing errors
        res.writeHead(500, {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "*"
        });
        res.end("Error parsing JSON data");
      }
    });
  }
});

// Listen on port 8888
server.listen(8888, () => {
  console.log('Server running at http://localhost:8888/');
});

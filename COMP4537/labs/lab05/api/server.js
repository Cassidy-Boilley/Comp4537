const http = require('http');
const url = require('url');
const querystring = require('querystring'); // Add querystring module
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
        const parsedData = querystring.parse(data); // Parse the data using querystring
        const word = parsedData.word ? parsedData.word.trim() : '';
        const definition = parsedData.definition ? parsedData.definition.trim() : '';

        if (!word || !definition) {
          let failedResponse = "Word and definition must be provided";
          console.log("Failed because of bad request");
          res.writeHead(400, {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "*"
          });
          res.end(JSON.stringify({ failedResponse: failedResponse, totalResponses: ++totalResponses }));
          return;
        }

        dictionary.push(new Word(word, definition));
        res.writeHead(200, {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "*"
        });
        res.end(JSON.stringify({ word: word, definition: definition, totalResponses: ++totalResponses }));
      } catch (error) {
        console.error("Error parsing POST data:", error); // Log any parsing errors
        res.writeHead(500, {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "*"
        });
        res.end("Error parsing POST data");
      }
    });
  }
});

// Listen on port 8888
server.listen(8081, () => {
  console.log('Server running at http://localhost:8081/');
});

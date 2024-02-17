const http = require('http');
const url = require('url');
const GET = 'GET';
const POST = 'POST';
const endPointRoot = "/api/definitions"
let dictionary = [];
let totalResponses = 0;

class Word {
  constructor(word, definition) {
    this.word = word;
    this.definition = definition;
  }
}

// ChatGPT generated
function findWord(wordToFind, wordsArray) {
  console.log("Got this far")
  for (let i = 0; i < wordsArray.length; i++) {
    console.log("Word: " + wordsArray[i].word + "\n")
    if (wordsArray[i].word === wordToFind) {
      return wordsArray[i]; // Return the Word object if found
    }
  }
  return null; // Return null if the word is not found
}


http.createServer(function (req, res) {
  if (req.method === GET) {
    // If the definition exists, send it
    // Otherwise, give an error
    const word = url.parse(req.url, true);
    const key = word.query["word"];
    console.log("Key: " + key);
    const target = findWord(key, dictionary);
    if (target !== null) {
      res.writeHead(200, {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "*"
      });
      res.end(JSON.stringify({definition: target.definition, totalResponses: ++totalResponses}));
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

  // ChatGPT was used to help with getting the POST method together
  if (req.method === POST) {
    let data = '';
    req.on('data', chunk => {
      data += chunk;
    });

    req.on('end', () => {
      try {
        const jsonData = JSON.parse(data);
        const word = jsonData.word.trim();
        const definition = jsonData.definition.trim();

        if (!isNaN(word) || word === '') {
          let failedResponse = "Word must be a non-empty string and can't be a number"
          console.log("Failed because of bad request");
          res.writeHead(400, {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "*"
          });
          res.end(JSON.stringify({failedResponse: failedResponse, totalResponses: ++totalResponses}));
          return;
        }

        if (word && definition) {
          res.writeHead(200, {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "*"
          });
          dictionary.push(new Word(word, definition));
          res.end(JSON.stringify({word: word, definition: definition, totalResponses: ++totalResponses}))
        } else {
            res.writeHead(400, {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*",
              "Access-Control-Allow-Methods": "*"
            });
            console.log("Failed because of bad request");
            res.end(JSON.stringify({failedResponse: "Word or definition is empty", totalResponses: ++totalResponses}))
        }
      } catch (error) {
        res.writeHead(500, {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "*"
        });
        res.end("Error parsing JSON data");
      }
    });
  }
}).listen(8888);
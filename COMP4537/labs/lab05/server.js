const http = require('http');
const url = require('url');
const GET = 'GET';
const POST = 'POST';
const endPointRoot = "/api/definitions"
let dictionary = [];
let totalResponses = 0;

http.createServer(function (req, res) {
  res.writeHead(200, {
    "Content-Type": "text/html",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "*"
  });
  console.log(req.headers);

  if (req.method === GET) {
    // If the definition exists, send it
    // Otherwise, give an error
    const query = url.parse(req.url, true);
    const key = query.word;
    const definition = dictionary[key];
    if (definition) {
      res.end(JSON.stringify({definition: definition, totalResponses: ++totalResponses}));
    } else {
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
          res.end(JSON.stringify({failedResponse: failedResponse, totalResponses: ++totalResponses}));
          return;
        }

        if (word && definition) {
            dictionary[word] = definition;
            res.end(JSON.stringify({word: word, definition: definition, totalResponses: ++totalResponses}))
        } else {
            res.end(JSON.stringify({failedResponse: "Word or definition is empty", totalResponses: ++totalResponses}))
        }
      } catch (error) {
        res.end("Error parsing JSON data");
      }
    });
  }
}).listen(8888);
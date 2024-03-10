// Server2 - Node.js code

const http = require('http');
const url = require('url');
const querystring = require('querystring');
const mysql = require('mysql');

// MySQL Connection Configuration
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'lab05'
};

// Create MySQL Connection Pool
const pool = mysql.createPool(dbConfig);

// Create HTTP Server
const server = http.createServer((req, res) => {
  const reqUrl = url.parse(req.url);
  const reqMethod = req.method;

  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handling POST requests
  if (reqMethod === 'POST') {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk.toString();
    });

    req.on('end', () => {
      const postData = querystring.parse(body);

      // Handle INSERT or SELECT queries
      if (postData.queryType === 'INSERT') {
        const insertQuery = `INSERT INTO patient (name, dob) VALUES (?, ?)`;
        const values = [postData.name, postData.dob];
        
        pool.query(insertQuery, values, (err, result) => {
          if (err) {
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.end('Error: ' + err.message);
          } else {
            res.writeHead(200, { 'Content-Type': 'text/plain' });
            res.end('Inserted successfully');
          }
        });
      } else if (postData.queryType === 'SELECT') {
        const selectQuery = `SELECT * FROM patient`;

        pool.query(selectQuery, (err, result) => {
          if (err) {
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.end('Error: ' + err.message);
          } else {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(result));
          }
        });
      } else {
        res.writeHead(400, { 'Content-Type': 'text/plain' });
        res.end('Invalid query type');
      }
    });
  } else if (reqMethod === 'GET') { // Add this block for handling GET requests
      const queryParams = querystring.parse(reqUrl.query);

      if (queryParams.queryType === 'SELECT') {
      const selectQuery = `SELECT * FROM patient`;

        pool.query(selectQuery, (err, result) => {
          if (err) {
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.end('Error: ' + err.message);
          } else {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(result));
          }
        });
      } else {
        res.writeHead(400, { 'Content-Type': 'text/plain' });
        res.end('Invalid query type');
      }
    } 
});

// Start the server
server.listen(3000, () => {
  console.log('Server running at http://localhost:3000/');
});

const mysql = require("mysql2");
const http = require("http");
const strings = require('./lang/messages/en/user');
const url = require("url");
const GET = "GET";
const POST = "POST";

const connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "lab05",
});

connection.connect((err) => {
    if (err) {
        console.log("Connection error message: " + err.message);
        return;
    }

    // If connection is successful, execute the SQL statement to create the table
    const createTableQuery = `
        CREATE TABLE IF NOT EXISTS PATIENTS (
          patientID INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(255),
          dob DATE
        ) ENGINE=InnoDB;
    `;

    connection.query(createTableQuery, (err, result) => {
        if (err) {
            console.log("Error creating table: " + err.message);
            return;
        }

        // If table creation is successful, log a success message
        console.log("Table created successfully!");
    });
});

// Create the HTTP server
const server = http.createServer((req, res) => {
    if (req.method === GET && req.url.startsWith("/lab5/api/v1/sql")) {
        // Handle GET requests for SQL queries
        const parsedUrl = url.parse(req.url, true);
        const query = parsedUrl.query["query"];
        if (!query) {
            res.writeHead(400, {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "*",
            });
            res.end(JSON.stringify({ error: `${strings.messages.noQueryProvided}` }));
            return;
        }

        // Execute the SQL query against the database
        connection.query(query, (err, results) => {
            if (err) {
                res.writeHead(500, {
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Methods": "*",
                });
                res.end(JSON.stringify({ error: `${strings.messages.badQuery}: ${err.message}` }));
            } else {
                res.writeHead(200, {
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Methods": "*",
                });
                res.end(JSON.stringify(results));
            }
        });
    } else if (req.method === POST && req.url.startsWith("/lab5/api/v1/sql")) {
        // Handle POST requests for SQL queries
        let data = '';
        req.on('data', chunk => {
            data += chunk;
        });

        req.on('end', () => {
            try {
                const jsonData = JSON.parse(data);
                const query = jsonData.query.trim();
                const splitQuery = query.split(" ");
                console.log(query);

                if (splitQuery[0].toUpperCase() === "INSERT") {
                    connection.query(query, (err, result) => {
                        if (err) {
                            res.writeHead(400, {
                                "Content-Type": "application/json",
                                "Access-Control-Allow-Origin": "*",
                                "Access-Control-Allow-Methods": "*",
                            });
                            res.end(JSON.stringify({ error: `${strings.messages.badQuery}: ${err.message}` }));
                        } else {
                            res.writeHead(200, {
                                "Content-Type": "application/json",
                                "Access-Control-Allow-Origin": "*",
                                "Access-Control-Allow-Methods": "*",
                            });
                            res.end(JSON.stringify({ message: "Patient inserted successfully: "}));
                        }
                    });
                } else {
                    // Handle other types of queries
                }
            } catch (error) {
                res.writeHead(500, {
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Methods": "*"
                });
                res.end(JSON.stringify({error: `${strings.messages.JSONerror}: ${error.message}` }));
            }
        });
    } else if (req.method === 'OPTIONS') {
        // Handle OPTIONS requests for CORS preflight
        res.writeHead(200, {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST',
            'Access-Control-Allow-Headers': 'Content-Type'
        });
        res.end();
        return;
    } else {
        // Handle other routes
        res.writeHead(404, {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "*",
        });
        res.end(JSON.stringify({ error: strings.messages.pageNotFound }));
    }
});

// Start the server
server.listen(8888, () => {
    console.log('Server is running on port 8888');
});

// Close the database connection when the server is stopped
process.on("SIGINT", () => {
    connection.end();
    console.log("Server stopped. Database connection closed.");
    process.exit();
});

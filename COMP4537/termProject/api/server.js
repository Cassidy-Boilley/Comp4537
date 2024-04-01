import { sql } from '@vercel/postgres';
import express from 'express';
import bcrypt from 'bcrypt';
import cors from 'cors';
import { createPool } from '@vercel/postgres';

const app = express();
const port = 3000;

const pool = createPool({
  connectionString: process.env.POSTGRES_URL,
});

app.use(cors());
app.use(express.json());

async function createTables() {
    // SQL queries to create tables
    const createRolesTableQuery = `
        CREATE TABLE IF NOT EXISTS roles (
            id SERIAL PRIMARY KEY,
            title VARCHAR(255),
            description TEXT
        )
    `;
    const createUsersTableQuery = `
        CREATE TABLE IF NOT EXISTS users (
            username VARCHAR(255) PRIMARY KEY,
            password VARCHAR(255),
            role_id INT,
            FOREIGN KEY (role_id) REFERENCES roles(id)
        )
    `;
    const createApiCallsTableQuery = `
        CREATE TABLE IF NOT EXISTS api_calls (
            user_name VARCHAR(255),
            call_count INT,
            FOREIGN KEY (user_name) REFERENCES users(username)
        )
    `;

    // Execute the SQL queries to create tables
    await pool.query(createRolesTableQuery);
    await pool.query(createUsersTableQuery);
    await pool.query(createApiCallsTableQuery);

    console.log("Tables created successfully");
}

app.post('/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Check if username, email, and password are provided
        if (!username || !email || !password) {
            return res.status(400).json({ error: 'Username, email, and password are required' });
        }

        // Hash the password with salt rounds
        const saltRounds = 10; // You can adjust this number as needed
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Save the user to the database
        await pool.query('INSERT INTO users (username, email, password, role_id) VALUES ($1, $2, $3, $4)', [username, email, hashedPassword, 1]);
        await pool.query('INSERT INTO api_calls (user_name, call_count) VALUES ($1, $2)', [username, 0]);

        console.log("User registered successfully");
        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        console.error("Error registering user: " + error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        // Fetch the user from the database
        const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
        const user = result.rows[0];

        if (!user) {
            return res.status(401).json({ error: 'Invalid username or password' });
        }

        // Compare passwords
        const match = await bcrypt.compare(password, user.password);
        if (match) {
            console.log("Login successful");
            // Check the user's role ID
            const roleID = user.role_id;
            // Redirect based on role
            if (roleID === 1) {
                res.status(200).json({ message: 'Login successful', role: 'user' });
            } else if (roleID === 2) {
                res.status(200).json({ message: 'Login successful', role: 'admin' });
            } else {
                res.status(403).json({ error: 'Invalid role' });
            }
        } else {
            res.status(401).json({ error: 'Invalid username or password' });
        }
    } catch (error) {
        console.error("Error logging in: " + error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.get('/roles', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM roles');
        res.json(result.rows);
    } catch (error) {
        console.error("Error fetching roles: " + error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.get('/checkuser', async (req, res) => {
    const { username, email } = req.query;
    try {
        const result = await pool.query('SELECT COUNT(*) AS usernameCount, COUNT(*) AS emailCount FROM users WHERE username = $1 OR email = $2', [username, email]);
        const { usernameCount, emailCount } = result.rows[0];
        res.status(200).json({ usernameUnique: usernameCount === 0, emailUnique: emailCount === 0 });
    } catch (error) {
        console.error("Error checking username and email: " + error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.post('/api_call', async (req, res) => {
    const { username } = req.body;
    try {
        await pool.query('UPDATE api_calls SET call_count = call_count + 1 WHERE user_name = $1', [username]);
        res.status(200).json({ message: 'API call count updated successfully' });
    } catch (error) {
        console.error("Error updating API call count: " + error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.get('/users', async (req, res) => {
    const roleID = req.query.role_id;
    if (roleID !== '2') {
        return res.status(403).json({ error: 'Forbidden' });
    }

    try {
        const result = await pool.query(`
            SELECT u.username, u.email, u.role_id, COALESCE(a.api_call_count, 0) AS api_call_count
            FROM users u
            LEFT JOIN (
                SELECT user_name, COUNT(*) AS api_call_count
                FROM api_calls
                GROUP BY user_name
            ) a ON u.username = a.user_name
        `);
        res.json(result.rows);
    } catch (error) {
        console.error("Error fetching users:", error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});

process.on("SIGINT", () => {
    pool.end();
    console.log("Server stopped. Database connection closed.");
    process.exit();
});

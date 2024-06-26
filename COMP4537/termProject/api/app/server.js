const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const cors = require('cors');
require('dotenv').config();
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const fetch = require('node-fetch');
const Joi = require('joi');
const messages = require('../../lang/en/messages');

const app = express();
const port = 3000;

mongoose.connect(process.env.MONGODB_CONNECTIONSTRING, {
    dbName: process.env.MONGODB_DBNAME
});

const rolesSchema = new mongoose.Schema({
    title: String,
    role_id: Number
});

const usersSchema = new mongoose.Schema({
    username: { type: String, unique: true },
    email: { type: String, unique: true },
    password: String,
    role_id: Number
});

const apiCallsSchema = new mongoose.Schema({
    user_name: String,
    call_count: Number
});

const Role = mongoose.model('Role', rolesSchema);
const User = mongoose.model('User', usersSchema);
const ApiCall = mongoose.model('ApiCall', apiCallsSchema);

const corsOptions = {
  origin: 'http://127.0.0.1:5500',
  //origin: 'https://cassidyboilley-labs.netlify.app',
    credentials: true
};
app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

app.post('/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;

        const schema = Joi.object({
            username: Joi.string().max(20).required(),
            email: Joi.string().max(30).required(),
            password: Joi.string().max(20).required()
        });

        const validationResult = schema.validate({ username, email, password });

        if (validationResult.error) {
            return res.status(400).json({ error: messages.invalidInput });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = new User({ username, email, password: hashedPassword, role_id: 1 });
        const apiUser = new ApiCall({ user_name: username, call_count: 0 });

        await user.save();
        await apiUser.save();
        res.status(201).json({ message: messages.registrationSuccess });
    } catch (error) {
        console.error("Error registering user: " + error.message);
        res.status(500).json({ error: messages.serverError });
    }
});

app.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        const user = await User.findOne({ username });

        if (!user) {
            return res.status(401).json({ error: messages.invalidCredentials });
        }

        const match = await bcrypt.compare(password, user.password);
        if (match) {
            const userRole = user.role_id === 1 ? 'user' : 'admin';

            const token = jwt.sign({ username, role: userRole }, process.env.JWT_SECRET, { expiresIn: '1h' });

            res.cookie('token', token, { httpOnly: true, maxAge: 3600000 , sameSite: "none" });
            res.status(200).json({ message: messages.loginSuccess, role: userRole, token });
        } else {
            res.status(401).json({ error: messages.invalidCredentials });
        }
    } catch (error) {
        console.error("Error logging in: " + error.message);
        res.status(500).json({ error: messages.serverError });
    }
});

app.get('/checkuser', async (req, res) => {
    const { username, email } = req.query;
    try {
        const existingUser = await User.findOne({ $or: [{ username }, { email }] });
        res.status(200).json({ usernameUnique: !existingUser, emailUnique: !existingUser });
    } catch (error) {
        console.error("Error checking username and email: " + error.message);
        res.status(500).json({ error: messages.serverError });
    }
});

app.get('/users', async (req, res) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader.split(' ')[1];

        if (jwt.verify(token, process.env.JWT_SECRET).role == 'admin') {
            const users = await User.find({}, { password: 0 });

            const usersWithApiCalls = await Promise.all(users.map(async user => {
                const apiCall = await ApiCall.findOne({ user_name: user.username });
                const apiCallCount = apiCall ? apiCall.call_count : 0;
                const userData = user.toObject();
                userData.api_call_count = apiCallCount;
                return userData;
            }));

            res.status(200).json({ users: usersWithApiCalls });
        }
    } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).json({ error: messages.serverError });
    }
});

app.get('/api-count', async (req, res) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader.split(' ')[1];
        const userType = jwt.verify(token, process.env.JWT_SECRET).role;

        if (['user', 'admin'].includes(userType)) {
            const username = jwt.verify(token, process.env.JWT_SECRET).username;
            const apiCount = await ApiCall.findOne({ user_name: username });

            if (apiCount) {
                res.status(200).json({ apiCount: apiCount.call_count });
            } else {
                res.status(500).json({ error: messages.apiFailed });
            }
        } else {
            res.status(401).json({ error: messages.unauthorized });
        }
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: messages.serverError });
    }
});

app.post('/api-call', async (req, res) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader.split(' ')[1];
        const userType = jwt.verify(token, process.env.JWT_SECRET).role;

        if (['user', 'admin'].includes(userType)) {
            const username = jwt.verify(token, process.env.JWT_SECRET).username;
            await ApiCall.findOneAndUpdate(
                { user_name: username },
                { $inc: { call_count: 1 } },
                { new: true }
            );

            const apiCount = await ApiCall.findOne({ user_name: username });
            const { text } = req.body;
            const response = await fetch('https://comp4537labs.com/project/answer', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text })
            });

            if (response.ok) {
                const responseData = await response.json();
                responseData.apiCount = apiCount ? apiCount.call_count : 0;
                console.log(responseData);
                res.status(200).json(responseData);
            } else {
                res.status(500).json({ error: messages.apiFailed });
            }
        } else {
            res.status(401).json({ error: messages.unauthorized });
        }
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: messages.serverError });
    }
});

app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});

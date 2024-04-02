const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const cors = require('cors');

const app = express();
const port = 3000;

// Connect to MongoDB using the provided connection string
mongoose.connect('mongodb+srv://cboilley:1mK0a1ZQShgmQEns@moodboosterdb.tsll7p5.mongodb.net/', {
    dbName: 'moodboosterdata'
  
});

// Define MongoDB schemas and models using Mongoose
const rolesSchema = new mongoose.Schema({
  title: String,
  role_id: Number
});

const usersSchema = new mongoose.Schema({
  username: { type: String, unique: true },
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

app.use(cors());
app.use(express.json());

// Middleware to hash passwords before saving users to MongoDB
usersSchema.pre('save', async function(next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

// Route for user registration
app.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Check if username, email, and password are provided
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Username, email, and password are required' });
    }

      // Save the user to the database
      console.log(username, email, password)
      const user = new User({ username, email, password, role_id: 1 });
      const apiUser = new ApiCall({ user_name: username, call_count: 0 });
      
      console.log(user)
      await user.save();
      await apiUser.save();

    console.log("User registered successfully");
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error("Error registering user: " + error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Route for user login
app.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Fetch the user from the database
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    // Compare passwords
    const match = await bcrypt.compare(password, user.password);
    if (match) {
      console.log("Login successful");
      res.status(200).json({ message: 'Login successful', role: 'user' });
    } else {
      res.status(401).json({ error: 'Invalid username or password' });
    }
  } catch (error) {
    console.error("Error logging in: " + error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Route to check if a username or email already exists
app.get('/checkuser', async (req, res) => {
  const { username, email } = req.query;
  
  try {
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    res.status(200).json({ usernameUnique: !existingUser, emailUnique: !existingUser });
  } catch (error) {
    console.error("Error checking username and email: " + error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});

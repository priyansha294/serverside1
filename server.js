// server.js

// Import necessary modules
const express = require('express'); // Express.js for creating the server
const bodyParser = require('body-parser'); // Body-parser to handle request bodies
const fs = require('fs'); // File system module to read and write files
const path = require('path'); // Path module for working with file and directory paths

// Initialize the express app
const app = express();
const port = 3000; // You can choose any port number

// Middleware to parse URL-encoded bodies (for form data)
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json()); // to parse JSON-formatted body

// Serve static files from the 'public' folder
// This assumes your HTML, CSS, JS files are in a folder named 'public' in the same directory as server.js
app.use(express.static(path.join(__dirname, 'public')));

// --- Signup Endpoint ---
app.post('/signup', (req, res) => {
    // 1. Read user data from the request body
    const { email, password } = req.body;

    // 2. Check if email and password are provided
    if (!email || !password) {
        return res.status(400).send('Email and password are required.');
    }

    // 3. Read existing users from users.json file
    const usersFilePath = path.join(__dirname, 'users.json');
    let users = [];
    try {
        // Try to read the users.json file
        const usersData = fs.readFileSync(usersFilePath, 'utf8');
        users = JSON.parse(usersData); // Parse the JSON string into a JavaScript array
    } catch (error) {
        // If the file doesn't exist or there's an error in reading/parsing, initialize users as an empty array.
        // This is okay for the first user signup or if the file is corrupted.
        if (error.code !== 'ENOENT') { // ENOENT: Error No Entry - which is file not found. We expect this on first run.
            console.error("Error reading users.json:", error);
            return res.status(500).send('Server error during signup.');
        }
        // If file not found, users array remains empty, which is intended.
    }

    // 4. Check if the email is already registered
    const existingUser = users.find(user => user.email === email);
    if (existingUser) {
        return res.status(409).send('Email already registered.'); // 409 Conflict - indicates that the request could not be processed because of conflict in the request
    }

    // 5. Create a new user object
    const newUser = {
        email: email,
        password: password, // In a real application, you should hash the password!
        timestamp: new Date().toISOString() // Add a timestamp for when the user signed up
    };

    // 6. Add the new user to the users array
    users.push(newUser);

    // 7. Write the updated users array back to users.json
    try {
        fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2)); // Save users array back to users.json, with pretty formatting (2 spaces indentation)
        res.status(201).send('Signup successful!'); // 201 Created - indicates that the request has succeeded and has led to the creation of a resource.
    } catch (error) {
        console.error("Error writing to users.json:", error);
        return res.status(500).send('Server error during signup.'); // 500 Internal Server Error
    }
});

// --- Login Endpoint ---
app.post('/login', (req, res) => {
    // 1. Read login credentials from the request body
    const { email, password } = req.body;

    // 2. Check if email and password are provided
    if (!email || !password) {
        return res.status(400).send('Email and password are required.'); // 400 Bad Request
    }

    // 3. Read users from users.json file
    const usersFilePath = path.join(__dirname, 'users.json');
    let users = [];
    try {
        const usersData = fs.readFileSync(usersFilePath, 'utf8');
        users = JSON.parse(usersData);
    } catch (error) {
        if (error.code === 'ENOENT') {
            // users.json doesn't exist, so no users are registered yet
            return res.status(401).send('Invalid credentials.'); // 401 Unauthorized - though in this context it means 'Not Registered'
        } else {
            console.error("Error reading users.json:", error);
            return res.status(500).send('Server error during login.'); // 500 Internal Server Error
        }
    }

    // 4. Find user by email
    const user = users.find(user => user.email === email);

    // 5. Check if user exists and password is correct
    if (user && user.password === password) { // Again, in real app, compare hashed passwords!
        res.status(200).send('Login successful!'); // 200 OK - Standard response for successful HTTP requests.
    } else {
        res.status(401).send('Invalid credentials.'); // 401 Unauthorized
    }
});

// --- Start the server ---
app.listen(port, () => {
    console.log(`Server listening on port http://localhost:${port}`); // Log message when server starts
});

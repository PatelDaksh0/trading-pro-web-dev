const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const USERS_FILE = './users.json';

// Helper to read/write users
function readUsers() {
    if (!fs.existsSync(USERS_FILE)) return [];
    return JSON.parse(fs.readFileSync(USERS_FILE));
}
function writeUsers(users) {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

// Signup endpoint
app.post('/api/signup', (req, res) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.json({ success: false, message: 'All fields required.' });
    const users = readUsers();
    if (users.find(u => u.email === email)) {
        return res.json({ success: false, message: 'Email already registered.' });
    }
    users.push({ name, email, password }); // For demo only! Hash passwords in production.
    writeUsers(users);
    res.json({ success: true });
});

// Login endpoint
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    const users = readUsers();
    const user = users.find(u => u.email === email && u.password === password);
    if (user) {
        res.json({ success: true, name: user.name });
    } else {
        res.json({ success: false, message: 'Invalid credentials.' });
    }
});

// Serve static files
app.use(express.static('.'));

app.listen(3000, () => console.log('Server running on http://localhost:3000'));
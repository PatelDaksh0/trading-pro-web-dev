node -vconst express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const USERS_FILE = './users.json';

// Helper to read/write users (for demo only, use a real DB in production)
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
    users.push({ name, email, password }); // Passwords should be hashed!
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

// Serve static files (for testing)
app.use(express.static('.'));

app.listen(3000, () => console.log('Server running on http://localhost:3000'));

// Client-side login form handling
document.getElementById('loginForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    const form = e.target;
    const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            email: form.email.value,
            password: form.password.value
        })
    });
    const data = await res.json();
    if (data.success) {
        // Redirect to dashboard after successful login
        window.location.href = 'dashboard.html';
    } else {
        alert(data.message || 'Login failed');
    }
});

// Client-side signup form handling
document.getElementById('signupForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    const form = e.target;
    const res = await fetch('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            name: form.name.value,
            email: form.email.value,
            password: form.password.value
        })
    });
    const data = await res.json();
    if (data.success) {
        // Redirect to dashboard after successful signup
        window.location.href = 'dashboard.html';
    } else {
        alert(data.message || 'Sign up failed');
    }
});
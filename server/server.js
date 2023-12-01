 const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

// Connexion à la base de données SQLite
const db = new sqlite3.Database(':memory:');

// Création de la table messages dans la base de données
db.serialize(() => {
    db.run('CREATE TABLE IF NOT EXISTS messages (id INTEGER PRIMARY KEY, sender TEXT, receiver TEXT, message TEXT, timestamp TEXT)');
});

// Placeholder array for users (simulating user management)
let users = [];

// Routes
app.post('/sendMsg', (req, res) => {
    const { sender, receiver, message } = req.body;
    const timestamp = new Date().toISOString();

    // Insérer le message dans la base de données
    db.run('INSERT INTO messages (sender, receiver, message, timestamp) VALUES (?, ?, ?, ?)',
        [sender, receiver, message, timestamp], (err) => {
            if (err) {
                console.error(err);
                res.status(500).json({ error: 'Internal Server Error' });
            } else {
                res.json({ sender, receiver, message, timestamp });
            }
        });
});

app.post('/addUser', (req, res) => {
    const { username } = req.body;
    const newUser = { id: users.length + 1, username };
    users.push(newUser);
    res.json(newUser);
});

app.get('/messages', (req, res) => {
    // Récupérer les 10 derniers messages de la base de données
    db.all('SELECT * FROM messages ORDER BY timestamp DESC LIMIT 10', (err, messages) => {
        if (err) {
            console.error(err);
            res.status(500).json({ error: 'Internal Server Error' });
        } else {
            res.json(messages);
        }
    });
});

app.get('/messages/:id', (req, res) => {
    const userId = parseInt(req.params.id);
    const userMessages = messages.filter(msg => msg.sender === userId || msg.receiver === userId);
    res.json(userMessages);
});

app.get('/users', (req, res) => {
    res.json(users);
});

app.get('/users/:id', (req, res) => {
    const userId = parseInt(req.params.id);
    const user = users.find(u => u.id === userId);
    res.json(user);
});

app.put('/users/:id', (req, res) => {
    const userId = parseInt(req.params.id);
    const { username } = req.body;
    const user = users.find(u => u.id === userId);
    if (user) {
        user.username = username;
        res.json(user);
    } else {
        res.status(404).json({ message: 'User not found' });
    }
});

app.delete('/users/:id', (req, res) => {
    const userId = parseInt(req.params.id);
    users = users.filter(u => u.id !== userId);
    res.json({ message: 'User deleted successfully' });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

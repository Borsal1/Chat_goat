const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const port = 3306;

app.use(express.static(path.join(__dirname)));
app.use(bodyParser.json());

const server = http.createServer(app);
const io = socketIo(server);

io.on('connection', (socket) => {
  console.log('Un client est connecté');

  socket.on('disconnect', () => {
    console.log('Un client est déconnecté');
  });

  // Écoute des nouveaux messages du client
  socket.on('newMessage', (message) => {
    // Sauvegarder le message en base de données (MySQL)
    const insertMessageQuery = 'INSERT INTO messages (message, timestamp) VALUES (?, NOW())';

    db.query(insertMessageQuery, [message.message], (err, result) => {
      if (err) {
        console.error('Erreur lors de l\'insertion du message en base de données : ' + err.message);
      } else {
        console.log('Nouveau message inséré en base de données avec succès');
      }
    });

    // Diffuser le message à tous les clients connectés
    io.emit('message', message);
  });
});

const db = mysql.createConnection({
  host: '185.224.137.180',
  user: 'u549231978_hetic_g_05',
  password: 'Hetic2023$',
  database: 'u549231978_hetic_g_05',
  port: 3306,
});

db.connect((err) => {
  if (err) {
    console.error('Erreur de connexion à la base de données : ' + err.stack);
  } else {
    console.log('Connecté à la base de données MySQL');
  }
});

// Middleware pour gérer les erreurs
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Erreur serveur' });
});

// Récupération des 10 derniers messages
app.get('/messages', (req, res) => {
  const query = 'SELECT * FROM messages ORDER BY timestamp DESC LIMIT 10';

  db.query(query, (err, results) => {
    if (err) {
      console.error('Erreur lors de la récupération des messages : ' + err.message);
      res.status(500).json({ error: 'Erreur serveur' });
    } else {
      res.json(results);
    }
  });
});

server.listen(port, () => {
  console.log(`Serveur en écoute sur le port ${port}`);
});




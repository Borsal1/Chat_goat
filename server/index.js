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

app.post('/sendMsg', (req, res) => {
  const data = req.body;
  const content = data.content;
  const sender = parseInt(data.sender);
  const receiver = parseInt(data.receiver);
  const timestamp = new Date().toISOString();

  // Insérer le message dans la base de données
  const query = "INSERT INTO message (content, date, senderId, receiverId) VALUES ("+content+", "+timestamp+", "+sender+", "+receiver+")";

  db.query(query, (err, results) => {
    if (err) {
      console.error('Erreur lors de l\'envoi du message : ' + err.message);
        res.status(500).json({ error: 'Erreur serveur' });
    } else {
      res.json(results);
    }
  });
});

app.post('/addUser', (req, res) => {
  const data = req.body;
  const name = data.name;
  const firstName = data.firstName;
  const email = data.email;
  const password = data.password;
  const query = "INSERT INTO userChat (name, first_name, email, password) VALUES ("+name+", "+firstName+", "+email+", "+password+")";

  db.query(query, (err, results) => {
    if (err) {
      console.error('Erreur lors de la création de l\'utilisateur : ' + err.message);
        res.status(500).json({ error: 'Erreur serveur' });
    } else {
      res.json(results);
    }
  });
});

// Récupération des 10 derniers messages
app.get('/messages', (req, res) => {
  const query = 'SELECT * FROM message ORDER BY date DESC LIMIT 10';

  db.query(query, (err, results) => {
    if (err) {
      console.error('Erreur lors de la récupération des messages : ' + err.message);
      res.status(500).json({ error: 'Erreur serveur' });
    } else {
      res.json(results);
    }
  });
});

app.get('/messages/:id', (req, res) => {
  const userId = parseInt(req.params.id);
  const receiverId = parseInt(req.body.receiver);
  const query = 'SELECT * FROM message WHERE senderId = '+userId+' AND receiverId = '+receiverId+' ORDER BY date DESC LIMIT 10';

  db.query(query, (err, results) => {
    if (err) {
      console.error('Erreur lors de la récupération des messages : ' + err.message);
      res.status(500).json({ error: 'Erreur serveur' });
    } else {
      res.json(results);
    }
  });
});

app.get('/users', (req, res) => {
  const query = 'SELECT * FROM userChat ORDER BY id';

  db.query(query, (err, results) => {
    if (err) {
      console.error('Erreur lors de la récupération des utilisateurs : ' + err.message);
      res.status(500).json({ error: 'Erreur serveur' });
    } else {
      res.json(results);
    }
  });
});

app.get('/users/:id', (req, res) => {
    const userId = parseInt(req.params.id);
    const query = 'SELECT * FROM userChat WHERE id = '+userId;

    db.query(query, (err, results) => {
      if (err) {
        console.error('Erreur lors de la récupération de l\'utilisateur : ' + err.message);
        res.status(500).json({ error: 'Erreur serveur' });
      } else {
        res.json(results);
      }
    });
});

app.put('/users/:id', (req, res) => {
    const userId = parseInt(req.params.id);
    const data = req.body;
    const name = data.name;
    const firstName = data.firstName;
    const email = data.email;
    const query = "UPDATE userChat SET name = "+name+", first_name = "+firstName+", email = "+email+" WHERE id = "+userId;

    db.query(query, (err, results) => {
      if (err) {
        console.error('Erreur lors de la modification de l\'utilisateur : ' + err.message);
        res.status(500).json({ error: 'Erreur serveur' });
      } else {
        res.json(results);
      }
    });
});

app.delete('/users/:id', (req, res) => {
  const userId = parseInt(req.params.id);
  const query = "DELETE FROM userChat WHERE id = "+userId;

  db.query(query, (err, results) => {
    if (err) {
      console.error('Erreur lors de la suppression de l\'utilisateur : ' + err.message);
      res.status(500).json({ error: 'Erreur serveur' });
    } else {
      res.json(results);
    }
  });
});

server.listen(port, () => {
  console.log(`Serveur en écoute sur le port ${port}`);
});




const express = require('express');
const bodyParser = require('body-parser');
const neo4j = require('neo4j-driver');
const cors = require('cors');
// API routes import
const apiRoutes = require('./routes/api');

const app = express();

app.use(bodyParser.json());

// Configuring the connection to Neo4j
const driver = neo4j.driver('bolt://localhost:7687', neo4j.auth.basic('neo4j', 'Miki22santa'), {encrypted:'ENCRYPTION_OFF'});
const corsOptions = {
    origin: 'http://localhost:4200',
    optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
  };

// Middleware 
app.use(cors(corsOptions));
app.use(bodyParser.json());

// Using API routes
app.use('/api', apiRoutes); 

// Main route
app.get('/', (req, res) => {
  res.send('API de Node.js funcionando correctamente');
});

// Endpoint to get the nodes
app.get('/nodos', (req, res) => {
  const query = 'MATCH (n) RETURN n LIMIT 100';

  const session = driver.session();
  session.run(query)
    .then(result => {
      const nodos = result.records.map(record => record.get('n'));
      res.json(nodos);
    })
    .catch(error => {
      console.error('Error al obtener los nodos:', error);
      res.status(500).json({ error: 'Error al obtener los nodos' });
    })/*
    .finally(() => {
      session.close();
    });*/
});

// Iniciar el servidor
app.listen(3000, () => {
    console.log('Servidor iniciado en el puerto 3000');
});
const express = require('express');
const bodyParser = require('body-parser');
const neo4j = require('neo4j-driver');
const cors = require('cors');
// Importacion de rutas de la API
const apiRoutes = require('./routes/api');

const app = express();

app.use(bodyParser.json());

// Configuración de la conexión a Neo4j
const driver = neo4j.driver('bolt://localhost:7687', neo4j.auth.basic('neo4j', 'Miki22santa'), {encrypted:'ENCRYPTION_OFF'});
const corsOptions = {
    origin: 'http://localhost:4200',
    optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
  };

// Middleware 
app.use(cors(corsOptions));
app.use(bodyParser.json());

// Utilización de las rutas de la API
app.use('/api', apiRoutes); 

// Ruta principal
app.get('/', (req, res) => {
  res.send('API de Node.js funcionando correctamente');
});

//Endpoint para obtener los nodos
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

app.get('/estadisticas', (req, res) => {
  // Realizar la lógica para obtener las estadísticas
  // ...

  // Enviar las estadísticas como respuesta
  res.json(estadisticas);
});

app.get('/config', (req, res) => {
  // Realizar la lógica para obtener las estadísticas
  // ...

  // Enviar las estadísticas como respuesta
  res.json(config);
});

// Endpoint para filtrar resultados
app.get('/filtrar-conferences', apiRoutes);
app.get('/filtrar-journals', apiRoutes);
app.post('/estadisticas', apiRoutes);

// Configurar otros endpoints y lógica adicional aquí
// ...

// Iniciar el servidor
app.listen(3000, () => {
    console.log('Servidor iniciado en el puerto 3000');
});
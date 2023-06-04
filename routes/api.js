const express = require('express');
const router = express.Router();
const neo4j = require('neo4j-driver');
const estadisticasController = require('../controllers/estadisticasController'); 

const driver = neo4j.driver('bolt://localhost:7687', neo4j.auth.basic('neo4j', '4452762354'), {encrypted:'ENCRYPTION_OFF'});

router.get('/publications', async(req, res) => {
  const session = driver.session({database:'neo4j'});
  const query = `MATCH (p:Publication) RETURN p`;
  
  try {
      const result = await session.run(query);
      const publications = result.records.map(record => record.get('p').properties);
      res.json(publications);
  } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al obtener las publicaciones', details: error.message });
  } finally {
      session.close();
  }
})

router.get('/etiquetas', async (req, res) => {
  const session = driver.session({database:'neo4j'});

  try {
    const query = 'MATCH (n) UNWIND LABELS(n) AS etiqueta RETURN COLLECT(DISTINCT etiqueta) AS etiquetas';
    const result = await session.readTransaction(tx => tx.run(query));
    const etiquetas = result.records[0].get('etiquetas');
    res.json({ etiquetas });
  } catch (error) {
    console.error('Error al obtener las etiquetas:', error);
    res.status(500).json({ error: 'Error al obtener las etiquetas', details: error.message });
  } finally {
    session.close();
  }
});

router.get('/filtrar-resultados', async (req, res) => {
  const session = driver.session({database:'neo4j'});

  if (!req.query.filtros) {
      res.status(400).json({ error: 'Filtros no especificados' });
      return;
  }

  const filtros = req.query.filtros.split(',');

  // Lógica para filtrar los resultados utilizando los filtros y devolverlos
  try {
    const query = `MATCH (n) WHERE ANY(label IN LABELS(n) WHERE label IN $filtros) RETURN n`;
    const result = await session.run(query, { filtros });
    const nodos = result.records.map(record => record.get('n').properties);
    res.json(nodos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener los nodos filtrados', details: error.message });
  } finally{
    session.close();
  }
}); 

// Ruta para generar estadísticas
router.get('/estadisticas', estadisticasController.generarEstadisticas);

module.exports = router;

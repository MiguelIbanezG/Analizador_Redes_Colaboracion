const express = require('express');
const router = express.Router();
const neo4j = require('neo4j-driver');
const estadisticasController = require('../controllers/estadisticasController'); 

const driver = neo4j.driver('bolt://localhost:7687', neo4j.auth.basic('neo4j', '4452762354'), {encrypted:'ENCRYPTION_OFF'});

// router.get('/publications', async(req, res) => {
//   const session = driver.session({database:'neo4j'});
//   const query = `MATCH (p:Publication) RETURN p`;
  
//   try {
//       const result = await session.run(query);
//       const publications = result.records.map(record => record.get('p').properties);
//       res.json(publications);
//   } catch (error) {
//       console.error(error);
//       res.status(500).json({ error: 'Error al obtener las publicaciones', details: error.message });
//   } finally {
//       session.close();
//   }
// })

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

router.get('/filtrar-resultados/:filterName', async (req, res) => {
  const session = driver.session({ database: 'neo4j' });
  const filterName = req.params.filterName;

  try {
    const query = `
      MATCH (v:Venue)-[:CELEBRATED_IN]->(a:Year)
      WHERE v.name = $filterName
      RETURN a
    `;
    const result = await session.run(query, { filterName });
    const years = result.records.map(record => {
      const yearNode = record.get('a');
      return yearNode;
    });
    
    res.json(years);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener los años', details: error.message });
  } finally {
    session.close();
  }
});

router.post('/estadisticas', async (req, res) => {
  const titulosSeleccionados = req.body.titulosSeleccionados;

  try {
    // Lógica para generar las estadísticas utilizando los titulosSeleccionados
    // ...
    
    // Devuelve los resultados de las estadísticas en formato JSON
    const estadisticas = {
      // ...
    };
    res.json(estadisticas);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al generar las estadísticas', details: error.message });
  }
});

// Ruta para generar estadísticas
router.get('/estadisticas', estadisticasController.generarEstadisticas);

// router.post('/researchers', async (req, res) => {
//   const titulosSeleccionados = req.body.titulosSeleccionados;
//   const yearIds = titulosSeleccionados.map(titulo => titulo.identity.low); // Obtener los identificadores de los nodos year
//   const session = driver.session({ database: 'neo4j' });

//   try {
//     const query = `
//       MATCH (n:Year)-[:HAS_PROCEEDING]->(proceeding:Proceeding)-[:EDITED_BY]->(researcher:Researcher)
//       WHERE ID(n) IN $yearIds
//       RETURN DISTINCT researcher.name AS name, collect(n.name) AS years   
//     `;
//     const result = await session.run(query, { yearIds });
//     const researchers = result.records.map(record => {
//       return {
//         name: record.get('name'),
//         years: record.get('years')
//       };
//     });

//     res.json(researchers);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: 'Error al obtener los Researchers', details: error.message });
//   } finally {
//     session.close();
//   }
// });

router.post('/researchers', async (req, res) => {
  const titulosSeleccionados = req.body.titulosSeleccionados;
  const yearIds = titulosSeleccionados.map(titulo => titulo.identity.low); // Obtener los identificadores de los nodos year
  const session = driver.session({ database: 'neo4j' });

  try {
    const query = `
    MATCH (y:Year)-[:HAS_PROCEEDING]->(:Proceeding)-[:EDITED_BY]-(r1:Researcher)
    WHERE id(y) IN $yearIds
    WITH COLLECT(DISTINCT { researcher: r1, year: y.name }) AS researchers1
    MATCH (w:Year)-[:HAS_PROCEEDING]->(:Proceeding)-[:HAS_IN_PROCEEDING]->(:Inproceeding)-[:AUTHORED_BY]-(r2:Researcher)
    WHERE id(w) IN $yearIds
    WITH researchers1, COLLECT(DISTINCT { researcher: r2, year: w.name }) AS researchers2
    WITH researchers1 + researchers2 AS allResearchers
    UNWIND allResearchers AS researcherData
    RETURN researcherData.researcher AS researcher, COLLECT(DISTINCT researcherData.year) AS years    
    `;
    const result = await session.run(query, { yearIds });
    const researchers = result.records.map(record => {
      return {
        researcher: record.get('researcher'),
        years: record.get('years')
      };
    });
    res.json(researchers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener los Researchers', details: error.message });
  } finally {
    session.close();
  }
});



module.exports = router;

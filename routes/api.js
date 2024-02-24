const express = require('express');
const router = express.Router();
const neo4j = require('neo4j-driver');
const estadisticasController = require('../controllers/estadisticasController');
const config = require('../controllers/config');

const driver = neo4j.driver('bolt://localhost:7687', neo4j.auth.basic('neo4j', 'Miki22santa'), { encrypted: 'ENCRYPTION_OFF' });


// Query to autocomplete in search engine
router.get('/autocompleteConference/:term', async (req, res) => {
  const searchTerm = req.params.term; 
  const session = driver.session({ database: 'neo4j' });

  try {
    const query = `
      MATCH (v:Venue)
      WHERE v.name STARTS WITH $searchTerm
      RETURN DISTINCT v.name as venueName
      LIMIT 3
      
      UNION
      
      MATCH (j:Journal)
      WHERE j.name STARTS WITH $searchTerm
      RETURN DISTINCT j.name as venueName
      LIMIT 3
    `;
    const result = await session.run(query, { searchTerm });
    const venues = result.records.map(record => record.get('venueName'));

    res.json(venues);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error in autocompleteConference', details: error.message });
  } finally {
    session.close();
  }
});

// Query to find the conferences
router.post('/filterConferences', async (req, res) => {
  const session = driver.session({ database: 'neo4j' });
  const filterNames = req.body.filterNames; 

  try {
    const query = `
      MATCH (v:Venue)-[:CELEBRATED_IN]->(a:Year)
      WHERE v.name IN $filterNames
      RETURN DISTINCT a
    `;
    const result = await session.run(query, { filterNames });
    const years = result.records.map(record => {
      const yearNode = record.get('a');
      return yearNode;
    });

    res.json(years);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error in filterConferences', details: error.message });
  } finally {
    session.close();
  }
});

// Query to find the conferences
router.post('/filterJournals', async (req, res) => {
  const session = driver.session({ database: 'neo4j' });
  const filterNames = req.body.filterNames; 

  try {
    const query = `
      MATCH (v:Journal)-[:PUBLISHED_IN]->(a:Year)
      WHERE v.name IN $filterNames
      RETURN DISTINCT a
    `;
    const result = await session.run(query, { filterNames });
    const years = result.records.map(record => {
      const yearNode = record.get('a');
      return yearNode;
    });

    res.json(years);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error in filterJournals', details: error.message });
  } finally {
    session.close();
  }
});

// Query to search the authors of the conferences by year
router.post('/researchersConference', async (req, res) => {
  const titulosSeleccionados = req.body.titulosSeleccionados;
  const yearIds = titulosSeleccionados.map(titulo => titulo.identity.low); 
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

// Query to find the papers by year
router.post('/papers', async (req, res) => {
  const titulosSeleccionados = req.body.titulosSeleccionados;
  const option = req.body.option;
  const venueName = req.body.venue;
  const yearIds = titulosSeleccionados.map(titulo => titulo.identity.low); 
  const session = driver.session({ database: 'neo4j' });

  try {
    query = `
      MATCH (y:Year)-[:HAS_PROCEEDING]->(:Proceeding)-[:HAS_IN_PROCEEDING]->(p:Inproceeding)
      WHERE id(y) IN $yearIds ${option === 'main' ? `AND p.bookTitle = $venueName` : ''}
      RETURN toFloat(count(p)) AS numPapers, y.name AS yearName
      `;
    const result = await session.run(query, { yearIds, venueName });
    const papers = result.records.map(record => {
      return {
        numPapers: record.get('numPapers'),
        year: record.get('yearName')
      };
    });
    res.json(papers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener las Publicaciones', details: error.message });
  } finally {
    session.close();
  }
});

// Query to find collaborations by year
router.post('/collaborations', async (req, res) => {
  const titulosSeleccionados = req.body.titulosSeleccionados;
  const option = req.body.option;
  const venueName = req.body.venue;
  const yearIds = titulosSeleccionados.map(titulo => titulo.identity.low);
  const session = driver.session({ database: 'neo4j' });

  try {
    let query = `
    MATCH (y:Year)-[:HAS_PROCEEDING]->(p:Proceeding)-[:HAS_IN_PROCEEDING]->(ip:Inproceeding)
    WHERE id(y) IN $yearIds
    ${option === 'main' ? `AND p.bookTitle = $venueName` : ''}
    AND size((p)-[:EDITED_BY]->()) > 1
    AND size((ip)-[:AUTHORED_BY]->()) > 1
    WITH y, collect(p) AS numpColaboraciones, collect(ip) AS numiColaboraciones
    RETURN y.name AS year, toFloat(size(apoc.coll.flatten(collect(distinct(numpColaboraciones + numiColaboraciones))))) AS totalColaboraciones
    `;
    const result = await session.run(query, { yearIds, venueName });
    const colaboraciones = result.records.map(record => {
      return {
        numColabs: record.get('totalColaboraciones'),
        year: record.get('year')
      };
    });
    res.json(colaboraciones);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error in Researchers', details: error.message });
  } finally {
    session.close();
  }
});

// Query to find the author of the papers by year
router.post('/AuthorsPapers', async (req, res) => {
  const titulosSeleccionados = req.body.titulosSeleccionados;
  const option = req.body.option;
  const venueName = req.body.venue;
  const yearIds = titulosSeleccionados.map(titulo => titulo.identity.low); 
  const session = driver.session({ database: 'neo4j' });

  try {
    let query = ` 
    MATCH (v:Venue)
    WHERE v.name IN $venueName
    MATCH (v)-[:CELEBRATED_IN]->(y:Year)-[:HAS_PROCEEDING]->(p:Proceeding)-[:HAS_IN_PROCEEDING]->(ip:Inproceeding)-[:AUTHORED_BY]->(r1:Researcher)
    WHERE id(y) IN $yearIds
    ${option === 'main' ? `AND p.bookTitle = $venueName` : ''}
    WITH r1, y, collect(ip.title) AS ipNames, count(distinct ip) AS numPublications
    RETURN r1.name AS researcher, numPublications AS numPublications, y.name AS year, ipNames AS ipNames
    `;

    const result = await session.run(query, { yearIds, venueName });
    const autxpub = result.records.map(record => {
      return {
        researcher: record.get('researcher'),
        numPublications: record.get('numPublications').low,
        year: record.get('year'),
        ipNames: record.get('ipNames')
      };
    });

    res.json(autxpub);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error in AuthorsPapers', details: error.message });
  } finally {
    session.close();
  }
});

// Query to find the authors' degree by year
router.post('/AuthorsDegree', async (req, res) => {
  const titulosSeleccionados = req.body.titulosSeleccionados;
  const yearIds = titulosSeleccionados.map(titulo => titulo.identity.low);
  const session = driver.session({ database: 'neo4j' });

  try {
    const query = `
        MATCH (y:Year)-[:HAS_PROCEEDING]->(p:Proceeding)-[:HAS_IN_PROCEEDING]->(ip:Inproceeding)-[:AUTHORED_BY]->(r:Researcher)
        WHERE id(y) IN $yearIds
        RETURN r.name AS researcher, degree(r) AS degree
      `;

    const result = await session.run(query, { yearIds });
    const autxgrade = result.records.map(record => {
      return {
        researcher: record.get('researcher'),
        degree: record.get('degree').low,
      };
    });

    res.json(autxgrade);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener la centralidad de grado de los autores', details: error.message });
  } finally {
    session.close();
  }
});

// Query to find the name and country of the institutions by author
router.post('/schools', async (req, res) => {
  const session = driver.session({ database: 'neo4j' });

  try {
    const query = `
    MATCH (p:Publication)-[:PRESENTED_AT]->(s:School)
    MATCH (p)-[:AUTHORED_BY]->(r:Researcher)
    RETURN 
      CASE 
        WHEN s.name ENDS WITH 'USA' THEN 'USA'
        WHEN s.name ENDS WITH 'Germany' THEN 'Germany'
        WHEN s.name ENDS WITH 'UK' THEN 'UK'
        WHEN s.name ENDS WITH 'Switzerland' THEN 'Switzerland'
        WHEN s.name ENDS WITH 'India' THEN 'India'
        WHEN s.name ENDS WITH 'Singapore' THEN 'Singapore'
        WHEN s.name ENDS WITH 'Spain' THEN 'Spain'
        WHEN s.name ENDS WITH 'Italy' THEN 'Italy'
        WHEN s.name ENDS WITH 'Australia' THEN 'Australia'
        WHEN s.name ENDS WITH 'Belgium' THEN 'Belgium'
        WHEN s.name ENDS WITH 'Brazil' THEN 'Brazil'
        WHEN s.name ENDS WITH 'Netherlands' THEN 'Netherlands'
        WHEN s.name ENDS WITH 'France' THEN 'France'
        WHEN s.name ENDS WITH 'China' THEN 'China'
        WHEN s.name ENDS WITH 'Austria' THEN 'Austria'
        WHEN s.name ENDS WITH 'Canada' THEN 'Canada'
        WHEN s.name ENDS WITH 'Finland' THEN 'Finland'
        WHEN s.name ENDS WITH 'Denmark' THEN 'Denmark'
        WHEN s.name ENDS WITH 'South Africa' THEN 'South Africa'
        WHEN s.name ENDS WITH 'Iran' THEN 'Iran'
        ELSE 'Unknown' END AS Country,
      CASE 
        WHEN s.name ENDS WITH 'USA' THEN REPLACE(s.name, ', USA', '')
        WHEN s.name ENDS WITH 'Germany' THEN REPLACE(s.name, ', Germany', '')
        WHEN s.name ENDS WITH 'UK' THEN REPLACE(s.name, ', UK', '')
        WHEN s.name ENDS WITH 'Switzerland' THEN REPLACE(s.name, ', Switzerland', '')
        WHEN s.name ENDS WITH 'India' THEN REPLACE(s.name, ', India', '')
        WHEN s.name ENDS WITH 'Singapore' THEN REPLACE(s.name, ', Singapore', '')
        WHEN s.name ENDS WITH 'Spain' THEN REPLACE(s.name, ', Spain', '')
        WHEN s.name ENDS WITH 'Italy' THEN REPLACE(s.name, ', Italy', '')
        WHEN s.name ENDS WITH 'Australia' THEN REPLACE(s.name, ', Australia', '')
        WHEN s.name ENDS WITH 'Belgium' THEN REPLACE(s.name, ', Belgium', '')
        WHEN s.name ENDS WITH 'Brazil' THEN REPLACE(s.name, ', Brazil', '')
        WHEN s.name ENDS WITH 'Netherlands' THEN REPLACE(s.name, ', Netherlands', '')
        WHEN s.name ENDS WITH 'France' THEN REPLACE(s.name, ', France', '')
        WHEN s.name ENDS WITH 'China' THEN REPLACE(s.name, ', China', '')
        WHEN s.name ENDS WITH 'Austria' THEN REPLACE(s.name, ', Austria', '')
        WHEN s.name ENDS WITH 'Canada' THEN REPLACE(s.name, ', Canada', '')
        WHEN s.name ENDS WITH 'Finland' THEN REPLACE(s.name, ', Finland', '')
        WHEN s.name ENDS WITH 'Denmark' THEN REPLACE(s.name, ', Denmark', '')
        WHEN s.name ENDS WITH 'South Africa' THEN REPLACE(s.name, ', South Africa', '')
        WHEN s.name ENDS WITH 'Iran' THEN REPLACE(s.name, ', Iran', '')
        ELSE s.name END AS School,
      count(DISTINCT r) AS NumberOfAuthors
    ORDER BY NumberOfAuthors DESC
    LIMIT 20
    
    `;

    const result = await session.run(query);
    const records = result.records.map(record => {
      return {
        Country: record.get('Country'),
        School: record.get('School'),
        NumberOfAuthors: record.get('NumberOfAuthors').toNumber()
      };
    });

    res.json(records);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener los datos', details: error.message });
  } finally {
    session.close();
  }
});


router.post('/searchPublications', async (req, res) => {
  const session = driver.session({ database: 'neo4j' });

  try {
    const query = `
    MATCH (y:Year)
    OPTIONAL MATCH (y)-[:HAS_PROCEEDING]->(:Proceeding)-[:HAS_IN_PROCEEDING]->(p:Publication)
    OPTIONAL MATCH (y)-[:HAS_ARTICLE]->(:Proceeding)-[:HAS_IN_PROCEEDING]->(pb:Publication)
    OPTIONAL MATCH (y)-[:PUBLISHED_THESIS]->(pt:Publication)
    RETURN y.name AS yearName, COUNT(DISTINCT p) AS ConferencesAndPapers, COUNT(DISTINCT pb) AS JournalArticles, COUNT(DISTINCT pt) AS Thesis
    ORDER BY y.name
    `;

    const result = await session.run(query);
    const records = result.records.map(record => {
      return {
        yearName: record.get('yearName'),
        ConferencesAndPapers: record.get('ConferencesAndPapers').toNumber(),
        JournalArticles: record.get('JournalArticles').toNumber(),
        Thesis: record.get('Thesis').toNumber()
      };
    });

    res.json(records);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener las publicaciones por año', details: error.message });
  } finally {
    session.close();
  }
});

router.post('/allPublications', async (req, res) => {
  const session = driver.session({ database: 'neo4j' });

  try {
    const query = `
    MATCH (p:Publication) RETURN COUNT(p) AS all_publications
    `;

    const result = await session.run(query);
    const records = result.records.map(record => {
      return {
        all_publications: record.get('all_publications').toNumber(),
      };
    });

    res.json(records);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener las publicaciones por año', details: error.message });
  } finally {
    session.close();
  }
});

router.post('/searchAuthors', async (req, res) => {
  const session = driver.session({ database: 'neo4j' });

  try {
    const query = `
    MATCH (y:Year)-[:HAS_PROCEEDING]->(p:Proceeding)-[:HAS_IN_PROCEEDING]->(ip:Inproceeding)-[:AUTHORED_BY]->(r1:Researcher) 
    RETURN y.name AS yearName, COUNT(r1) AS total_authors
    `;

    const result = await session.run(query);
    const records = result.records.map(record => {
      return {
        yearName: record.get('yearName'),
        allAuthors: record.get('total_authors').toNumber(),
      };
    });

    res.json(records);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener las publicaciones por año', details: error.message });
  } finally {
    session.close();
  }
});

router.post('/allAuthors', async (req, res) => {
  const session = driver.session({ database: 'neo4j' });

  try {
    const query = `
    MATCH (r:Researcher) RETURN COUNT(r) AS all_authors
    `;

    const result = await session.run(query);
    const records = result.records.map(record => {
      return {
        all_authors: record.get('all_authors').toNumber(),
      };
    });

    res.json(records);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener las publicaciones por año', details: error.message });
  } finally {
    session.close();
  }
});

router.post('/searchConference', async (req, res) => {
  const session = driver.session({ database: 'neo4j' });

  try {
    const query = `
    MATCH (v:Venue)-[:CELEBRATED_IN]->(y:Year) 
    RETURN y.name AS yearName, COUNT(v) AS total_conferences
    `;

    const result = await session.run(query);
    const records = result.records.map(record => {
      return {
        yearName: record.get('yearName'),
        allConferences: record.get('total_conferences').toNumber(),
      };
    });

    res.json(records);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener las publicaciones por año', details: error.message });
  } finally {
    session.close();
  }
});

router.post('/allConferences', async (req, res) => {
  const session = driver.session({ database: 'neo4j' });

  try {
    const query = `
    MATCH (v:Venue) RETURN COUNT(v) AS all_conferences
    `;

    const result = await session.run(query);
    const records = result.records.map(record => {
      return {
        all_conferences: record.get('all_conferences').toNumber(),
      };
    });

    res.json(records);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener las publicaciones por año', details: error.message });
  } finally {
    session.close();
  }
});


router.post('/connectedComponents', async (req, res) => {
  const venueNames = req.body.venue;
  const titulosSeleccionados = req.body.titulosSeleccionados;
  const yearIds = titulosSeleccionados.map(titulo => parseInt(titulo.properties.name, 10)); 
  const session = driver.session({ database: 'neo4j' });

  try {
    const query = `
      MATCH (v:Venue)-[:CELEBRATED_IN]->(y:Year)
      WHERE v.name IN $venueNames AND toInteger(y.name) IN $yearIds
      WITH y
      MATCH p = (y)-[:HAS_PROCEEDING]->(proceeding)-[:HAS_IN_PROCEEDING]->(inproceeding)-[:AUTHORED_BY]->(r:Researcher)
      RETURN y.name AS year, count(DISTINCT ID(r)) AS connectedComponents
    `;
    
    const result = await session.run(query, { yearIds, venueNames });
    const connectedComponents = result.records.map(record => {
      return {
        year: record.get('year'),
        connectedComponents: record.get('connectedComponents').low,
      };
    });
  
  
    res.json(connectedComponents);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error in connectedComponents', details: error.message });
  } finally {
    session.close();
  }
});


router.post('/connectedComponentsBYvenue', async (req, res) => {
  const venueNames = req.body.venue;
  const titulosSeleccionados = req.body.titulosSeleccionados;
  const yearIds = titulosSeleccionados.map(titulo => parseInt(titulo.properties.name, 10)); 
  const session = driver.session({ database: 'neo4j' });

  try {
    const query = `
      MATCH (v:Venue)-[:CELEBRATED_IN]->(y:Year)
      WHERE v.name IN $venueNames AND toInteger(y.name) IN $yearIds
      WITH y, v.name AS venueName
      MATCH p = (y)-[:HAS_PROCEEDING]->(proceeding)-[:HAS_IN_PROCEEDING]->(inproceeding)-[:AUTHORED_BY]->(r:Researcher)
      RETURN y.name AS year, venueName, count(DISTINCT ID(r)) AS connectedComponents
    `;
    const result = await session.run(query, { yearIds, venueNames });
    const connectedComponents = result.records.map(record => {
      return {
        year: record.get('year'),
        venueName: record.get('venueName'),
        connectedComponents: record.get('connectedComponents').low,
      };
    });
  

  
    res.json(connectedComponents);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error in connectedComponents', details: error.message });
  } finally {
    session.close();
  }
});

// Query to find the authors' degree by year
router.post('/ConferencebyProceeding', async (req, res) => {
  const venueNames = req.body.venue;
  const titulosSeleccionados = req.body.titulosSeleccionados;
  const yearIds = titulosSeleccionados.map(titulo => parseInt(titulo.properties.name, 10)); 
  const session = driver.session({ database: 'neo4j' });

  try {
    const query = `
    MATCH (r:Researcher)-[:AUTHORED_BY]-(inProc:Inproceeding)-[:HAS_IN_PROCEEDING]-(p:Proceeding)-[:HAS_PROCEEDING]-(y:Year)
    WITH p, y, COUNT(DISTINCT inProc) as numberOfInProceedings
    WHERE (p.bookTitle is null or p.bookTitle IN $venueNames) 
    AND ANY(venueName IN $venueNames WHERE p.key =~ ("conf/" + tolower(venueName) + "/.*"))
    AND toInteger(y.name) IN $yearIds
    RETURN REPLACE(REPLACE(REPLACE(p.title, ", Proceedings", ""), y.name, ""), " - ", "") AS title, y.name AS year, numberOfInProceedings
    ORDER BY year
      `;
    const result = await session.run(query, { yearIds, venueNames });
    const proceedings = result.records.map(record => {
      return {
        title: record.get('title'),
        year: record.get('year'),
        numberOfInProceedings: record.get('numberOfInProceedings').low
      };
    });

    res.json(proceedings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error in ConferencebyProceeding', details: error.message });
  } finally {
    session.close();
  }
});

module.exports = router;
  


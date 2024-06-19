const express = require("express");
const router = express.Router();
const neo4j = require("neo4j-driver");

const driver = neo4j.driver(
  "bolt://localhost:7687",
  neo4j.auth.basic("neo4j", "B6jh8J7OL0"),
  { encrypted: "ENCRYPTION_OFF" }
);

router.get("/autocompleteConferenceAndJournals/:term", async (req, res) => {
  const searchTerm = req.params.term;
  const session = driver.session({ database: "neo4j" });

  try {
    const query = `
      MATCH (v:Venue)
      WHERE toLower(v.name) STARTS WITH toLower($searchTerm)
      RETURN v.name as venueAndJournalNames
      ORDER BY size(v.name)
      LIMIT 3
      
      UNION
      
      MATCH (j:Journal)
      WHERE toLower(j.name) STARTS WITH toLower($searchTerm)
      RETURN j.name as venueAndJournalNames
      ORDER BY size(j.name)
      LIMIT 3
    `;
    const result = await session.run(query, { searchTerm });
    const venues = result.records.map((record) =>
      record.get("venueAndJournalNames")
    );

    res.json(venues);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({
        error: "Error in autocompleteConference",
        details: error.message,
      });
  } finally {
    session.close();
  }
});

router.get("/autocompleteAuthor/:term", async (req, res) => {
  const searchTerm = req.params.term;
  const session = driver.session({ database: "neo4j" });

  try {
    const query = `
    MATCH (r:Researcher) 
    WHERE r.name STARTS WITH $searchTerm 
    RETURN r.name as authorName 
    LIMIT 6
    `;
    const result = await session.run(query, { searchTerm });
    const author = result.records.map((record) => record.get("authorName"));

    res.json(author);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({
        error: "Error in autocompleteConference",
        details: error.message,
      });
  } finally {
    session.close();
  }
});

router.post("/filterConferences", async (req, res) => {
  const session = driver.session({ database: "neo4j" });
  const filterNames = req.body.filterNames;

  try {
    const query = `
      MATCH (v:Venue)-[:CELEBRATED_IN]->(a:Year)
      WHERE v.name IN $filterNames
      RETURN DISTINCT a.name as year
    `;
    const result = await session.run(query, { filterNames });
    const years = result.records.map((record) => {
      const yearNode = record.get("year");
      return yearNode;
    });

    res.json(years);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "Error in filterConferences", details: error.message });
  } finally {
    session.close();
  }
});

router.post("/filterJournals", async (req, res) => {
  const session = driver.session({ database: "neo4j" });
  const filterNames = req.body.filterNames;

  try {
    const query = `
      MATCH (v:Journal)-[:PUBLISHED_IN]->(a:Year)
      WHERE v.name IN $filterNames
      RETURN DISTINCT a.name as year
    `;
    const result = await session.run(query, { filterNames });
    const years = result.records.map((record) => {
      const yearNode = record.get("year");
      return yearNode;
    });

    res.json(years);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "Error in filterJournals", details: error.message });
  } finally {
    session.close();
  }
});

router.post("/researchers", async (req, res) => {
  const venueAndJournalNames = req.body.venueOrJournal;
  const listOfyears = req.body.titulosSeleccionados;
  const session = driver.session({ database: "neo4j" });

  try {
    const query = `
    MATCH (v:Venue)-[:CELEBRATED_IN]->(w:Year)-[:HAS_PROCEEDING]->(:Proceeding)-[:HAS_IN_PROCEEDING]->(:Inproceeding)-[:AUTHORED_BY]-(r2:Researcher)
    WHERE w.name IN $listOfyears AND v.name IN $venueAndJournalNames
    RETURN r2 AS researcher, COLLECT(DISTINCT w.name) AS years, v.name AS name

    UNION

    MATCH (j:Journal)-[:PUBLISHED_IN]->(y:Year)-[:HAS_VOLUME]->(v:Volume)-[:HAS_NUMBER]->(n:Number)-[:HAS_ARTICLE]->(p:Publication)-[:AUTHORED_BY]->(r:Researcher)
    WHERE y.name IN $listOfyears AND j.name IN $venueAndJournalNames
    RETURN r AS researcher, COLLECT(DISTINCT y.name) AS years, j.name AS name

    UNION

    MATCH (j:Journal)-[:PUBLISHED_IN]->(y:Year)-[:HAS_VOLUME]->(v:Volume)-[:HAS_ARTICLE]->(p:Publication)-[:AUTHORED_BY]->(r:Researcher)
    WHERE y.name IN $listOfyears AND j.name IN $venueAndJournalNames
    RETURN r AS researcher, COLLECT(DISTINCT y.name) AS years, j.name AS name

    `;
    const result = await session.run(query, {
      listOfyears,
      venueAndJournalNames,
    });
    const researchers = result.records.map((record) => {
      return {
        researcher: record.get("researcher"),
        years: record.get("years"),
        name: record.get("name"),
      };
    });
    res.json(researchers);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({
        error: "Error al obtener los Researchers",
        details: error.message,
      });
  } finally {
    session.close();
  }
});

router.post("/PapersAndArticles", async (req, res) => {
  const listOfyears = req.body.titulosSeleccionados;
  const venueAndJournalNames = req.body.venueOrJournal;
  const session = driver.session({ database: "neo4j" });

  try {
    query = `
      MATCH (y:Year)-[:HAS_PROCEEDING]->(:Proceeding)-[:HAS_IN_PROCEEDING]->(p:Inproceeding)
      WHERE y.name IN $listOfyears AND p.bookTitle IN $venueAndJournalNames
      RETURN toInteger(count(p)) AS numPapersAndArticles, y.name AS yearName, p.bookTitle AS name, "Paper" AS type

      UNION 

      MATCH (j:Journal)-[:PUBLISHED_IN]->(y:Year)-[:HAS_VOLUME]->(v:Volume)-[:HAS_NUMBER]->(n:Number)-[:HAS_ARTICLE]->(p:Publication)
      WHERE y.name IN $listOfyears AND j.name IN $venueAndJournalNames
      RETURN toInteger(count(p)) AS numPapersAndArticles, y.name AS yearName, j.name AS name, "Article" AS type
       
      UNION 

      MATCH (j:Journal)-[:PUBLISHED_IN]->(y:Year)-[:HAS_VOLUME]->(v:Volume)-[:HAS_ARTICLE]->(p:Publication)
      WHERE y.name IN $listOfyears AND j.name IN $venueAndJournalNames
      RETURN toInteger(count(p)) AS numPapersAndArticles, y.name AS yearName, j.name AS name, "Article" AS type
      `;
    const result = await session.run(query, {
      listOfyears,
      venueAndJournalNames,
    });
    const papersAndarticles = result.records.map((record) => {
      return {
        numPapersAndArticles: record.get("numPapersAndArticles"),
        year: record.get("yearName"),
        name: record.get("name"),
        type: record.get("type"),
      };
    });

    res.json(papersAndarticles);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({
        error: "Error al obtener las Publicaciones",
        details: error.message,
      });
  } finally {
    session.close();
  }
});

router.post("/collaborations", async (req, res) => {
  const listOfyears = req.body.titulosSeleccionados;
  const venueAndJournalNames = req.body.venueOrJournal;
  const session = driver.session({ database: "neo4j" });

  try {
    let query = `
    MATCH (y:Year)-[:HAS_PROCEEDING]->(p:Proceeding)-[:HAS_IN_PROCEEDING]->(ip:Inproceeding)
    WHERE y.name IN $listOfyears AND p.bookTitle IN $venueAndJournalNames
    AND size((p)-[:EDITED_BY]->()) > 1
    AND size((ip)-[:AUTHORED_BY]->()) > 1
    WITH y, collect(p) AS numpColaboraciones, collect(ip) AS numiColaboraciones
    RETURN y.name AS year, toFloat(size(apoc.coll.flatten(collect(distinct(numpColaboraciones + numiColaboraciones))))) AS totalColaboraciones

    UNION

    MATCH (j:Journal)-[:PUBLISHED_IN]->(y:Year)-[:HAS_VOLUME]->(v:Volume)-[:HAS_NUMBER]->(n:Number)-[:HAS_ARTICLE]->(p:Publication)
    WHERE y.name IN $listOfyears AND j.name IN $venueAndJournalNames
    AND size((p)-[:AUTHORED_BY]->()) > 1
    WITH y, collect(p) AS numpColaboraciones
    RETURN y.name AS year, toFloat(size(apoc.coll.flatten(collect(distinct(numpColaboraciones))))) AS totalColaboraciones
    
    UNION

    MATCH (j:Journal)-[:PUBLISHED_IN]->(y:Year)-[:HAS_VOLUME]->(v:Volume)-[:HAS_ARTICLE]->(p:Publication)
    WHERE y.name IN $listOfyears AND j.name IN $venueAndJournalNames
    AND size((p)-[:AUTHORED_BY]->()) > 1
    WITH y, collect(p) AS numpColaboraciones
    RETURN y.name AS year, toFloat(size(apoc.coll.flatten(collect(distinct(numpColaboraciones))))) AS totalColaboraciones
    `;
    const result = await session.run(query, {
      listOfyears,
      venueAndJournalNames,
    });
    const colaboraciones = result.records.map((record) => {
      return {
        numColabs: record.get("totalColaboraciones"),
        year: record.get("year"),
      };
    });

    res.json(colaboraciones);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "Error in Researchers", details: error.message });
  } finally {
    session.close();
  }
});

router.post("/AuthorsPapersAndArticles", async (req, res) => {
  const listOfyears = req.body.titulosSeleccionados;
  const venueAndJournalNames = req.body.venueOrJournal;
  const session = driver.session({ database: "neo4j" });

  try {
    let query = ` 
    MATCH (v:Venue)
    WHERE v.name IN $venueAndJournalNames
    MATCH (v)-[:CELEBRATED_IN]->(y:Year)-[:HAS_PROCEEDING]->(p:Proceeding)-[:HAS_IN_PROCEEDING]->(ip:Inproceeding)-[:AUTHORED_BY]->(r1:Researcher)
    WHERE y.name IN $listOfyears AND p.bookTitle IN $venueAndJournalNames
    WITH r1, y, v.name AS VenueOrJournal, collect(ip.title) AS ipNames, count(distinct ip) AS numPublications
    RETURN r1.name AS researcher, numPublications AS numPublications, y.name AS year, VenueOrJournal AS VenueOrJournal, ipNames AS ipNames
    
    UNION
    
    MATCH (j:Journal)-[:PUBLISHED_IN]->(y:Year)-[:HAS_VOLUME]->(v:Volume)-[:HAS_NUMBER]->(n:Number)-[:HAS_ARTICLE]->(p:Publication)-[:AUTHORED_BY]->(r1:Researcher)
    WHERE y.name IN $listOfyears AND j.name IN $venueAndJournalNames
    WITH r1, y, j.name AS VenueOrJournal, collect(p.title) AS ipNames, count(distinct p) AS numPublications
    RETURN r1.name AS researcher, numPublications AS numPublications, y.name AS year, VenueOrJournal AS VenueOrJournal, ipNames AS ipNames
    
    UNION
    
    MATCH (j:Journal)-[:PUBLISHED_IN]->(y:Year)-[:HAS_VOLUME]->(v:Volume)-[:HAS_ARTICLE]->(p:Publication)-[:AUTHORED_BY]->(r1:Researcher)
    WHERE y.name IN $listOfyears AND j.name IN $venueAndJournalNames
    WITH r1, y, j.name AS VenueOrJournal, collect(p.title) AS ipNames, count(distinct p) AS numPublications
    RETURN r1.name AS researcher, numPublications AS numPublications, y.name AS year, VenueOrJournal AS VenueOrJournal, ipNames AS ipNames
    `;

    const result = await session.run(query, {
      listOfyears,
      venueAndJournalNames,
    });
    const autxpub = result.records.map((record) => {
      return {
        researcher: record.get("researcher"),
        numPublications: record.get("numPublications").low,
        year: record.get("year"),
        ipNames: record.get("ipNames"),
        VenueOrJournal: record.get("VenueOrJournal"),
      };
    });

    res.json(autxpub);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({
        error: "Error in AuthorsPapersAndArticles",
        details: error.message,
      });
  } finally {
    session.close();
  }
});

router.post("/schools", async (req, res) => {
  const session = driver.session({ database: "neo4j" });

  try {
    const query = `
    MATCH (p:Publication)-[:PRESENTED_AT]->(s:School)
    MATCH (p)-[:AUTHORED_BY]->(r:Researcher)
    RETURN s.name as School, count(DISTINCT r) AS NumberOfAuthors
    ORDER BY NumberOfAuthors DESC
    LIMIT 60
    `;

    const result = await session.run(query);
    const records = result.records.map((record) => {
      return {
        School: record.get("School"),
        NumberOfAuthors: record.get("NumberOfAuthors").toNumber(),
      };
    });

    res.json(records);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "Error al obtener los datos", details: error.message });
  } finally {
    session.close();
  }
});

router.post("/searchPublications", async (req, res) => {
  const session = driver.session({ database: "neo4j" });

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
    const records = result.records.map((record) => {
      return {
        yearName: record.get("yearName"),
        ConferencesAndPapers: record.get("ConferencesAndPapers").toNumber(),
        JournalArticles: record.get("JournalArticles").toNumber(),
        Thesis: record.get("Thesis").toNumber(),
      };
    });

    res.json(records);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({
        error: "Error al obtener las publicaciones por año",
        details: error.message,
      });
  } finally {
    session.close();
  }
});

router.post("/allPublications", async (req, res) => {
  const session = driver.session({ database: "neo4j" });

  try {
    const query = `
    MATCH (p:Publication) RETURN COUNT(p) AS all_publications
    `;

    const result = await session.run(query);
    const records = result.records.map((record) => {
      return {
        all_publications: record.get("all_publications").toNumber(),
      };
    });

    res.json(records);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({
        error: "Error al obtener las publicaciones por año",
        details: error.message,
      });
  } finally {
    session.close();
  }
});

router.post("/searchAuthors", async (req, res) => {
  const session = driver.session({ database: "neo4j" });

  try {
    const query = `
    MATCH (y:Year)-[:HAS_PROCEEDING]->(p:Proceeding)-[:HAS_IN_PROCEEDING]->(ip:Inproceeding)-[:AUTHORED_BY]->(r1:Researcher) 
    RETURN y.name AS yearName, COUNT(r1) AS total_authors
    `;

    const result = await session.run(query);
    const records = result.records.map((record) => {
      return {
        yearName: record.get("yearName"),
        allAuthors: record.get("total_authors").toNumber(),
      };
    });

    res.json(records);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({
        error: "Error al obtener las publicaciones por año",
        details: error.message,
      });
  } finally {
    session.close();
  }
});

router.post("/allAuthors", async (req, res) => {
  const session = driver.session({ database: "neo4j" });

  try {
    const query = `
    MATCH (r:Researcher) RETURN COUNT(r) AS all_authors
    `;

    const result = await session.run(query);
    const records = result.records.map((record) => {
      return {
        all_authors: record.get("all_authors").toNumber(),
      };
    });

    res.json(records);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({
        error: "Error al obtener las publicaciones por año",
        details: error.message,
      });
  } finally {
    session.close();
  }
});

router.post("/searchConference", async (req, res) => {
  const session = driver.session({ database: "neo4j" });

  try {
    const query = `
    MATCH (v:Venue)-[:CELEBRATED_IN]->(y:Year) 
    RETURN y.name AS yearName, COUNT(v) AS total_conferences
    `;

    const result = await session.run(query);
    const records = result.records.map((record) => {
      return {
        yearName: record.get("yearName"),
        allConferences: record.get("total_conferences").toNumber(),
      };
    });

    res.json(records);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({
        error: "Error al obtener las conferencias por",
        details: error.message,
      });
  } finally {
    session.close();
  }
});

router.post("/allConferences", async (req, res) => {
  const session = driver.session({ database: "neo4j" });

  try {
    const query = `
    MATCH (v:Venue) RETURN COUNT(v) AS all_conferences
    `;

    const result = await session.run(query);
    const records = result.records.map((record) => {
      return {
        all_conferences: record.get("all_conferences").toNumber(),
      };
    });

    res.json(records);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({
        error: "Error al obtener el total de conferencias",
        details: error.message,
      });
  } finally {
    session.close();
  }
});

router.post("/searchJournal", async (req, res) => {
  const session = driver.session({ database: "neo4j" });

  try {
    const query = `
    MATCH (j:Journal)-[:PUBLISHED_IN]->(y:Year) 
    RETURN y.name AS yearName, COUNT(j) AS total_journals
    `;

    const result = await session.run(query);
    const records = result.records.map((record) => {
      return {
        yearName: record.get("yearName"),
        allJournals: record.get("total_journals").toNumber(),
      };
    });

    res.json(records);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({
        error: "Error al obtener los journals por año",
        details: error.message,
      });
  } finally {
    session.close();
  }
});

router.post("/allJournals", async (req, res) => {
  const session = driver.session({ database: "neo4j" });

  try {
    const query = `
    MATCH (j:Journal) RETURN COUNT(j) AS all_journals
    `;

    const result = await session.run(query);
    const records = result.records.map((record) => {
      return {
        all_journals: record.get("all_journals").toNumber(),
      };
    });

    res.json(records);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({
        error: "Error al obtener el total de journals",
        details: error.message,
      });
  } finally {
    session.close();
  }
});

router.post("/ConferencebyProceeding", async (req, res) => {
  const venueAndJournalNames = req.body.venueOrJournal;
  const listOfyears = req.body.titulosSeleccionados;
  const session = driver.session({ database: "neo4j" });

  try {
    const query = `
    MATCH (r:Researcher)-[:AUTHORED_BY]-(inProc:Inproceeding)-[:HAS_IN_PROCEEDING]-(p:Proceeding)-[:HAS_PROCEEDING]-(y:Year)
    WITH p, y, COUNT(DISTINCT inProc) as numberOfInProceedings
    WHERE (p.bookTitle is null or p.bookTitle IN $venueAndJournalNames) 
    AND ANY(venueAndJournalNames IN $venueAndJournalNames WHERE p.key =~ ("conf/" + tolower(venueAndJournalNames) + "/.*"))
    AND y.name IN $listOfyears
    RETURN REPLACE(REPLACE(REPLACE(p.title, ", Proceedings", ""), y.name, ""), " - ", "") AS title, y.name AS year, numberOfInProceedings
    ORDER BY year
      `;
    const result = await session.run(query, {
      listOfyears,
      venueAndJournalNames,
    });
    const proceedings = result.records.map((record) => {
      return {
        title: record.get("title"),
        year: record.get("year"),
        numberOfInProceedings: record.get("numberOfInProceedings").low,
      };
    });

    res.json(proceedings);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({
        error: "Error in ConferencebyProceeding",
        details: error.message,
      });
  } finally {
    session.close();
  }
});

router.post("/filterAuthors", async (req, res) => {
  const session = driver.session({ database: "neo4j" });
  const filterNames = req.body.filterNames;

  try {
    const query = `
    MATCH (p:Publication)-[:AUTHORED_BY]->(r:Researcher) 
    WHERE r.name IN $filterNames
    MATCH (p)-[:AUTHORED_BY]->(r1)
    RETURN 
      p.title as title, 
      p.mdate as DayOfPublication, 
      COLLECT(r1.name) as AuthorName,
      CASE 
        WHEN p.key STARTS WITH "conf/" THEN "Workshop Paper"
        WHEN p.key STARTS WITH "journals/" THEN "Journal Article"
        ELSE "Part in Books or Collection"
      END AS PublicationType
    ORDER BY DayOfPublication;
    `;
    const result = await session.run(query, { filterNames });
    const titles = result.records.map((record) => {
      return {
        title: record.get("title"),
        DayOfPublication: record.get("DayOfPublication"),
        AuthorName: record.get("AuthorName"),
        PublicationType: record.get("PublicationType"),
      };
    });

    res.json(titles);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "Error in filterConferences", details: error.message });
  } finally {
    session.close();
  }
});

router.post("/networkAuthors", async (req, res) => {
  const session = driver.session({ database: "neo4j" });
  const filterNames = req.body.filterNames;

  try {
    const query = `
    MATCH (p:Publication)-[:AUTHORED_BY]->(r:Researcher)
    WHERE r.name IN $filterNames
    MATCH (p)-[:AUTHORED_BY]->(r1:Researcher)
    RETURN r1.name AS researcher, COLLECT(p.title) AS publications
    `;
    const result = await session.run(query, { filterNames });
    const titles = result.records.map((record) => {
      return {
        researcher: record.get("researcher"),
        publications: record.get("publications"),
      };
    });

    res.json(titles);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "Error in filterConferences", details: error.message });
  } finally {
    session.close();
  }
});

router.post("/connectedComponetsYear", async (req, res) => {
  const session = driver.session({ database: "neo4j" });
  const venueAndJournalNames = req.body.venueOrJournal;
  const listOfyears = req.body.titulosSeleccionados;

  try {
    const query = `
    MATCH (v:Venue)-[:CELEBRATED_IN]->(y:Year)-[:HAS_PROCEEDING]->(:Proceeding)-[:HAS_IN_PROCEEDING]->(p:Publication)-[:AUTHORED_BY]->(r:Researcher)
    WHERE v.name IN $venueAndJournalNames AND y.name IN $listOfyears
    MATCH (p)-[:AUTHORED_BY]->(coAuthor:Researcher)
    WHERE coAuthor <> r
    WITH y.name AS year, v.name AS venueORjournal, r, COUNT(DISTINCT coAuthor) AS relations
    RETURN year, venueORjournal, SUM(relations) AS totalRelations
    ORDER BY year, venueORjournal

    UNION

    MATCH (j:Journal)-[:PUBLISHED_IN]->(y:Year)-[:HAS_VOLUME]->(v:Volume)-[:HAS_NUMBER]->(n:Number)-[:HAS_ARTICLE]->(p:Publication)-[:AUTHORED_BY]->(r:Researcher)
    WHERE j.name IN $venueAndJournalNames AND y.name IN $listOfyears
    MATCH (p)-[:AUTHORED_BY]->(coAuthor:Researcher)
    WHERE coAuthor <> r
    WITH y.name AS year, j.name AS venueORjournal, r, COUNT(DISTINCT coAuthor) AS relations
    RETURN year, venueORjournal, SUM(relations) AS totalRelations
    ORDER BY year, venueORjournal

      UNION

    MATCH (j:Journal)-[:PUBLISHED_IN]->(y:Year)-[:HAS_VOLUME]->(v:Volume)-[:HAS_ARTICLE]->(p:Publication)-[:AUTHORED_BY]->(r:Researcher)
    WHERE j.name IN $venueAndJournalNames AND y.name IN $listOfyears
    MATCH (p)-[:AUTHORED_BY]->(coAuthor:Researcher)
    WHERE coAuthor <> r
    WITH y.name AS year, j.name AS venueORjournal, r, COUNT(DISTINCT coAuthor) AS relations
    RETURN year, venueORjournal, SUM(relations) AS totalRelations
    ORDER BY year, venueORjournal
    `;
    const result = await session.run(query, {
      listOfyears,
      venueAndJournalNames,
    });
    const titles = result.records.map((record) => {
      return {
        year: record.get("year"),
        totalRelations: record.get("totalRelations"),
        venueORjournal: record.get("venueORjournal"),
      };
    });

    res.json(titles);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({
        error: "Error in connectedComponetsYear",
        details: error.message,
      });
  } finally {
    session.close();
  }
});

router.post("/newComers", async (req, res) => {
  const session = driver.session({ database: "neo4j" });
  const venueAndJournalNames = req.body.venueOrJournal;
  const listOfyears = req.body.titulosSeleccionados;

  try {
    const query = `
    MATCH (v:Venue)-[:CELEBRATED_IN]->(y:Year)-[:HAS_PROCEEDING]->(:Proceeding)-[:HAS_IN_PROCEEDING]->(p:Publication)-[:AUTHORED_BY]->(r:Researcher)
    WHERE v.name IN $venueAndJournalNames AND y.name IN $listOfyears
    RETURN y.name AS year, COLLECT(DISTINCT r.name) as researchers, v.name as VenueOrJournal
    ORDER BY y.name
    
    UNION
    
    MATCH (j:Journal)-[:PUBLISHED_IN]->(y:Year)-[:HAS_VOLUME]->(v:Volume)-[:HAS_NUMBER]->(n:Number)-[:HAS_ARTICLE]->(p:Publication)-[:AUTHORED_BY]->(r:Researcher)
    WHERE j.name IN $venueAndJournalNames AND y.name IN $listOfyears
    RETURN y.name AS year, COLLECT(DISTINCT r.name) as researchers, j.name as VenueOrJournal
    ORDER BY y.name
    `;
    const result = await session.run(query, {
      listOfyears,
      venueAndJournalNames,
    });
    const titles = result.records.map((record) => {
      return {
        year: record.get("year"),
        researchers: record.get("researchers"),
        VenueOrJournal: record.get("VenueOrJournal"),
      };
    });

    res.json(titles);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({
        error: "Error in connectedComponetsYear",
        details: error.message,
      });
  } finally {
    session.close();
  }
});

module.exports = router;

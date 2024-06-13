const express = require("express");
const bodyParser = require("body-parser");
const neo4j = require("neo4j-driver");
const cors = require("cors");
const apiRoutes = require("./routes/api");

const app = express();

app.use(bodyParser.json());

const neo4jUri = process.env.NEO4J_URI || "bolt://localhost:7687";
const neo4jUser = process.env.NEO4J_USER || "neo4j";
const neo4jPassword = process.env.NEO4J_PASSWORD || "B6jh8J7OL0";

const driver = neo4j.driver(
  neo4jUri,
  neo4j.auth.basic(neo4jUser, neo4jPassword),
  { encrypted: "ENCRYPTION_OFF" }
);

const corsOptions = {
  origin: "http://localhost:4200",
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.use(bodyParser.json());

app.use("/api", apiRoutes);

app.get("/", (req, res) => {
  res.send("API de Node.js funcionando correctamente");
});

app.get("/nodos", (req, res) => {
  const query = "MATCH (n) RETURN n LIMIT 100";

  const session = driver.session();
  session
    .run(query)
    .then((result) => {
      const nodos = result.records.map((record) => record.get("n"));
      res.json(nodos);
    })
    .catch((error) => {
      console.error("Error al obtener los nodos:", error);
      res.status(500).json({ error: "Error al obtener los nodos" });
    });
});

app.listen(3000, () => {
  console.log("Servidor iniciado en el puerto 3000");
});

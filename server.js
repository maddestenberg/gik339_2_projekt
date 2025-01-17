const express = require("express");
const server = express();
const sqlite3 = require("sqlite3").verbose();
const url = "http://localhost:8000/cars";
const db = new sqlite3.Database("./gik339-[Grupp 2]-projekt.db"); // Lägg till denna rad

server
  .use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    next();
  })
  .use(express.json())
  .use(express.urlencoded({ extended: false }));




// Skapa tabell om den inte finns
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS cars (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      carName TEXT NOT NULL,
      carBrand TEXT,
      color TEXT
    )
  `);
});

// API-routes

// Hämta alla användare (GET /users)
server.get("/cars", (req, res) => {
  const sql = "SELECT * FROM cars";
  db.all(sql, (err, rows) => {
    if (err) {
      return res.status(500).send("Fel vid hämtning av bil");
    }
    res.status(200).send(rows);
  });
});

// Lägg till användare (POST /users)
server.post("/cars", (req, res) => {
  const { carName, carBrand, color } = req.body;
  console.log("Data received on server:", { carName, carBrand, color }); // Debug log

  // Check if required fields are provided
  if (!carName || !carBrand) {
    return res.status(400).json({ error: "Saknar namn och modell" });
  }

  const db = new sqlite3.Database("./gik339-[Grupp 2]-projekt.db");
  const sql = "INSERT INTO cars (carName, carBrand, color) VALUES (?, ?, ?)";
  db.run(sql, [carName, carBrand, color], function (err) {
    if (err) {
      console.error("Database Error:", err.message); // Log detailed error
      return res.status(500).json({ error: "Fel vid inmatning i databasen", details: err.message });
    }
    res.status(201).json({ id: this.lastID, carName, carBrand, color });
  });
});


// Uppdatera användare (PUT /users/:id)
server.put("/cars/:id", (req, res) => {
    const { id } = req.params;
    const { carName, carBrand, color } = req.body;
  
    if (!carName || !carBrand) {
      return res.status(400).send("Saknar namn och modell");
    }
  
    const db = new sqlite3.Database("./gik339-[Grupp 2]-projekt.db");
    const sql = "UPDATE cars SET carName = ?, carBrand = ?, color = ? WHERE id = ?";
  
    db.run(sql, [carName, carBrand, color, id], function (err) {
      if (err) {
        return res.status(500).send("Fel vid uppdatering av cars: " + err.message);
      }
  
      if (this.changes === 0) {
        return res.status(404).send("Bilar hittas inte");
      }
  
      res.status(200).send({carName, carBrand, color, id});
    });
  
    db.close();
  });
  

// Ta bort användare (DELETE /users/:id)
server.delete("/cars/:id", (req, res) => {
  const { id } = req.params;
  const sql = "DELETE FROM cars WHERE id = ?";
  db.run(sql, [id], function (err) {
    if (err) {
      return res.status(500).json({ error: "Fel vid borttagning av bil" });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: "Bilen hittas inte" });
    }
    res.status(200).json({ message: "Bilen har raderats" });
  });
});

// Starta servern
server.listen(8000, () => {
  console.log("Servern körs på http://localhost:8000");
});


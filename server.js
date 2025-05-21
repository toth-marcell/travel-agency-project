// Szerver
const express = require("express");
const dbHandler = require("./dbHandler");
require("dotenv").config();

const server = express();
server.use(express.json());

// Táblák szinkronizálása
dbHandler.table.sync({ alter: true });
dbHandler.table2.sync({ alter: true });

server.use(express.static("public"));

const PORT = process.env.PORT;
const SECRETKEY = process.env.SECRETKEY;

const JWT = require("jsonwebtoken");

// Autentikáció
function Auth() {
  return (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({ message: "Hibás/nem létező token" });
    } else {
      const encryptedToken = authHeader.split(" ")[1];
      try {
        const token = JWT.verify(encryptedToken, process.env.SECRETKEY);
        req.user = token;
        next();
      } catch (error) {
        res.status(401).json({ message: error });
      }
    }
  };
}

// Saját profil megtekintése
server.get("/users/me", Auth(), async (req, res) => {
  try {
    const username = req.user.username;
    const user = await dbHandler.table.findOne({ where: { username } });

    if (!user) {
      return res.status(404).json({ message: "Felhasználó nem található" });
    }

    res.status(200).json({
      username: user.username,
      password: user.password,
    });
  } catch (err) {
    res.status(500).json({ message: "Szerver hiba", error: err.message });
  }
});

// Regisztráció
// request:
// - registerUsername
// - registerPassword
server.post("/users/register", async (req, res) => {
  try {
    const oneUser = await dbHandler.table.findOne({
      where: {
        username: req.body.registerUsername,
      },
    });

    if (oneUser) {
      return res.status(400).json({ message: "Már létezik ilyen felhasználó" });
    }

    await dbHandler.table.create({
      username: req.body.registerUsername,
      password: req.body.registerPassword,
    });

    res.status(201).json({ message: "Sikeres regisztráció" });
  } catch (e) {
    console.error("Register error:", e);
    res
      .status(500)
      .json({ message: "Szerver hiba: " + e.message, errors: e.errors });
  }
});

// Bejelentkezés
// request:
// - loginUsername
// - loginPassword
server.post("/auth/login", async (req, res) => {
  const oneUser = await dbHandler.table.findOne({
    where: {
      username: req.body.loginUsername,
      password: req.body.loginPassword,
    },
  });
  if (oneUser) {
    const token = JWT.sign(
      { username: oneUser.username },
      process.env.SECRETKEY,
      { expiresIn: "1h" },
    );
    res.status(201).json({ token: token, message: "sikeres bejelentkezés" });
  } else {
    res.status(500).json({ message: "sikertelen bejelentkezés" });
  }
  res.end();
});

//Új utazás létrehozása
// request:
// - username
server.post("/trips", Auth(), async (req, res) => {
  try {
    const trip = await dbHandler.table2.create({
      ...req.body,
      creator: req.user.username,
    });

    res.status(201).json({ message: "Utazás létrehozva", trip });
  } catch (e) {
    res
      .status(500)
      .json({ message: "Hiba az utazás mentésekor", error: e.message });
  }
});

// Utazások listázása
server.get("/trips", Auth(), async (req, res) => {
  try {
    const trips = await dbHandler.table2.findAll({
      where: { creator: req.user.username },
    });
    res.status(200).json(trips);
  } catch (e) {
    res
      .status(500)
      .json({
        message: "Nem sikerült lekérni az utazásokat",
        error: e.message,
      });
  }
});

//Egy utazás részletei
// request:
// - id
// username
server.get("/trips/:id", Auth(), async (req, res) => {
  try {
    const trip = await dbHandler.table2.findOne({
      where: {
        id: req.params.id,
        creator: req.user.username,
      },
    });
    if (!trip) return res.status(404).json({ message: "Utazás nem található" });

    res.status(200).json(trip);
  } catch (e) {
    res.status(500).json({ message: "Hiba történt", error: e.message });
  }
});

// Utazás szerkesztése
// request:
// - id
// - tripName
// - tripDestination
// - tripAccommodation
// - tripTransport
server.put("/trips/:id", async (req, res) => {
  const trip = await dbHandler.table2.findOne({
    where: {
      id: req.params.id,
    },
  });
  if (trip) {
    await dbHandler.table2.update(
      {
        name: req.body.tripName,
        destination: req.body.tripDestination,
        accommodation: req.body.tripAccommodation,
        transport: req.body.tripTransport,
        description: req.body.tripDescription,
        date: req.body.tripDate,
      },
      {
        where: {
          id: req.params.id,
        },
      },
    );
    res.json({ message: "sikeres módosítás" });
  } else {
    res.status(500).json({ message: "nincs ilyen utazás" });
  }
  res.end();
});

// Utazás törlése
// request:
// - id
server.delete("/trips/:id", async (req, res) => {
  const trip = await dbHandler.table2.findOne({
    where: {
      id: req.params.id,
    },
  });
  if (trip) {
    await dbHandler.table2.destroy({
      where: {
        id: req.params.id,
      },
    });
    res.json({ message: "sikeres törlés" });
  } else {
    res.status(500).json({ message: "nincs ilyen utazás" });
  }
  res.end();
});

// Utazás keresése név alapján
// request:
// - name
server.get("/trips/name/:name", async (req, res) => {
  const trips = await dbHandler.table2.findAll({
    where: {
      name: req.params.name,
    },
  });

  if (trips.length > 0) {
    res.json(trips);
  } else {
    res.status(404).json({ message: "nincs ilyen utazás" });
  }
});

// A szerver elindítása a 'PORT' porton
server.listen(PORT, () => {
  console.log("A szerver fut a " + PORT + "-es porton");
});

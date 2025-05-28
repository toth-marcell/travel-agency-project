import express from "express";
import { Login, ObtainToken, Register, ValidateToken } from "./auth.js";
import { Accommodation, Destination, Transport, Trip } from "./models.js";
import { newTrip, editTrip, searchTrips } from "./trips.js";

const app = express();
export default app;
app.use(express.json());

app.use(async (req, res, next) => {
  try {
    if (req.query.token) {
      res.locals.user = await ValidateToken(req.query.token);
    } else if (req.body.token) {
      res.locals.user = await ValidateToken(req.body.token);
    } else throw new Error();
  } catch {
    res.locals.user = null;
  }
  next();
});

function APIError(res, msg) {
  res.status(400).json({ msg: msg });
}

function LoggedInOnly(req, res, next) {
  if (res.locals.user) next();
  else APIError(res, "Ezt csak bejelentkezve lehet.");
}

function LoggedOutOnly(req, res, next) {
  if (res.locals.user) APIError(res, "Már be vagy jelentkezve.");
  else next();
}

app.post("/login", LoggedOutOnly, async (req, res) => {
  const result = await Login(req.body.name, req.body.password);
  if (typeof result == "string") {
    APIError(res, result);
  } else {
    res.json({
      token: ObtainToken(result),
    });
  }
});

app.post("/register", LoggedOutOnly, async (req, res) => {
  const result = await Register(req.body.name, req.body.password);
  if (typeof result == "string") {
    APIError(res, result);
  } else {
    res.json({
      token: ObtainToken(result),
    });
  }
});

app.get("/me", LoggedInOnly, async (req, res) => {
  const { id, name, createdAt, updatedAt } = res.locals.user;
  const createdTrips = await Trip.findAll({
    where: { creatorId: id },
    include: [Destination, Accommodation, Transport],
  });
  res.json({ id, name, createdAt, updatedAt, createdTrips });
});

app.get("/trips", async (req, res) => {
  res.json(await searchTrips());
});

app.get("/trips/name/:name", async (req, res) => {
  res.json(await searchTrips(req.params.name));
});

app.get("/trips/:id", async (req, res) => {
  const trip = await Trip.findByPk(req.params.id, {
    include: [Destination, Accommodation, Transport],
  });
  res.json(trip);
});

app.post("/trips", LoggedInOnly, async (req, res) => {
  const { name, description, date, destination, accommodation, transport } =
    req.body;
  const result = await newTrip(
    name,
    description,
    date,
    destination,
    accommodation,
    transport,
    res.locals.user.id,
  );
  if (typeof result == "string") {
    APIError(res, result);
  } else {
    res.json(result);
  }
});

app.put("/trips/:id", LoggedInOnly, async (req, res) => {
  const { name, description, date, destination, accommodation, transport } =
    req.body;
  const result = await editTrip(
    req.params.id,
    name,
    description,
    date,
    destination,
    accommodation,
    transport,
  );
  if (typeof result == "string") {
    APIError(res, result);
  } else {
    res.json(result);
  }
});

app.delete("/trips/:id", LoggedInOnly, async (req, res) => {
  const trip = await Trip.findByPk(req.params.id);
  if (trip) await trip.destroy();
  res.json({ msg: "Siker!" });
});

app.get("/transport", LoggedInOnly, async (req, res) => {
  res.json(await Transport.findAll());
});

app.post("/transport", LoggedInOnly, async (req, res) => {
  const name = req.body.name;
  if (name) res.json(await Transport.create({ name }));
  else APIError(res, "Meg kell adni egy nevet a `name` névvel.");
});

app.delete("/transport/:id", LoggedInOnly, async (req, res) => {
  const transport = await Transport.findByPk(req.params.id, { include: Trip });
  if (transport) {
    try {
      await transport.destroy();
      res.json({ msg: "Siker!" });
    } catch (error) {
      if (error.name == "SequelizeForeignKeyConstraintError") {
        res.json({
          msg: `Nem lehet törölni "${transport.name}"-t, mert a következő utakban szerepel: ${transport.Trips.map((x) => '"' + x.name + '"').join(", ")}`,
        });
      } else throw error;
    }
  } else APIError(res, "Ilyen id-vel nincs közlekedési lehetőség.");
});

app.get("/destinations", LoggedInOnly, async (req, res) => {
  res.json(await Destination.findAll());
});

app.post("/destinations", LoggedInOnly, async (req, res) => {
  const name = req.body.name;
  if (name) res.json(await Destination.create({ name }));
  else APIError(res, "Meg kell adni egy nevet a `name` névvel.");
});

app.put("/destinations/:id", LoggedInOnly, async (req, res) => {
  const id = req.params.id;
  const destination = await Destination.findByPk(id);
  const newName = req.body.name;
  if (destination) {
    if (newName) {
      res.json(await destination.update({ name: newName }));
    } else APIError(res, "Meg kell adni egy nevet a `name` névvel.");
  } else APIError(res, "Ilyen id-vel nincs úticél");
});

app.get("/accommodations", LoggedInOnly, async (req, res) => {
  res.json(await Accommodation.findAll({ include: Destination }));
});

app.post("/accommodations", LoggedInOnly, async (req, res) => {
  const { name, destination } = req.body;
  if (name && destination) {
    const existingDest = await Destination.findByPk(destination);
    if (existingDest) {
      res.json(
        await Accommodation.create({ name, DestinationId: destination }),
      );
    } else APIError(res, "Ilyen úticél nem létezik!");
  } else APIError("Kötelező `name`-t és `destination`-t megadni.");
});

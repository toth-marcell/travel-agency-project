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

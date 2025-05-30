import cookieParser from "cookie-parser";
import express from "express";
import { Login, ObtainToken, Register, ValidateToken } from "./auth.js";
import { Accommodation, Destination, Transport, Trip } from "./models.js";
import { newTrip, editTrip, searchTrips } from "./trips.js";

const app = express();
export default app;

app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.set("view engine", "ejs");
app.set("view options", {
  rmWhitespace: true,
});
app.locals.siteName = "Travel IDK Agency";

app.use(async (req, res, next) => {
  try {
    if (req.cookies.user) {
      res.locals.user = await ValidateToken(req.cookies.user);
    } else throw new Error("");
  } catch {
    res.clearCookie("user");
    res.locals.user = null;
  }
  next();
});

function LoggedInOnly(req, res, next) {
  if (res.locals.user) next();
  else res.redirect("/");
}

function LoggedOutOnly(req, res, next) {
  if (res.locals.user) res.redirect("/");
  else next();
}

app.get("/", async (req, res) => {
  const search = req.query.search;
  res.render("index", {
    trips: await searchTrips(search),
    search,
  });
});

app.get("/trip/:id", async (req, res) => {
  const trip = await Trip.findByPk(req.params.id, {
    include: [Destination, Accommodation, Transport],
  });
  res.render("trip", {
    trip,
    pageName: trip.name,
  });
});

app.get("/login", LoggedOutOnly, async (req, res) => {
  res.render("login", { pageName: "Bejelentkezés / Regisztráció" });
});

app.post("/login", LoggedOutOnly, async (req, res) => {
  const result = await Login(req.body.name, req.body.password);
  if (typeof result == "string") {
    res.render("login", { msg: result });
  } else {
    res.cookie("user", ObtainToken(result), {
      maxAge: 31557600000,
    });
    res.redirect("/");
  }
});

app.post("/register", LoggedOutOnly, async (req, res) => {
  const result = await Register(req.body.name, req.body.password);
  if (typeof result == "string") {
    res.render("login", { msg: result });
  } else {
    res.cookie("user", ObtainToken(result), {
      maxAge: 31557600000,
    });
    res.redirect("/");
  }
});

app.get("/logout", async (req, res) => {
  res.clearCookie("user");
  res.redirect("/");
});

app.get("/newtrip", LoggedInOnly, async (req, res) => {
  res.render("newtrip", {
    name: "",
    description: "",
    date: new Date(),
    destination: null,
    accommodation: null,
    transport: null,
    destinations: await Destination.findAll(),
    transports: await Transport.findAll(),
    accommodations: await Accommodation.findAll(),
    pageName: "Új utazás",
  });
});

app.post("/newtrip", LoggedInOnly, async (req, res) => {
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
    res.render("newtrip", {
      name,
      description,
      date,
      destination,
      accommodation,
      transport,
      destinations: await Destination.findAll(),
      transports: await Transport.findAll(),
      accommodations: await Accommodation.findAll(),
      msg: result,
      pageName: "Új utazás",
    });
  } else {
    res.redirect("/");
  }
});

app.get("/edittrip/:id", LoggedInOnly, async (req, res) => {
  const trip = await Trip.findByPk(req.params.id, {
    include: [Destination, Accommodation, Transport],
  });
  const {
    id,
    name,
    description,
    date,
    DestinationId,
    AccommodationId,
    TransportId,
  } = trip;
  res.render("edittrip", {
    id,
    name,
    description,
    date,
    destination: DestinationId,
    accommodation: AccommodationId,
    transport: TransportId,
    destinations: await Destination.findAll(),
    transports: await Transport.findAll(),
    accommodations: await Accommodation.findAll(),
    pageName: "Utazás szerkesztése",
  });
});

app.post("/edittrip/:id", LoggedInOnly, async (req, res) => {
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
    res.render("edittrip", {
      id: req.params.id,
      name,
      description,
      date,
      destination,
      accommodation,
      transport: transport,
      destinations: await Destination.findAll(),
      transports: await Transport.findAll(),
      accommodations: await Accommodation.findAll(),
      msg: result,
      pageName: "Utazás szerkesztése",
    });
  } else {
    res.redirect("/trip/" + req.params.id);
  }
});

app.get("/deletetrip/:id", LoggedInOnly, async (req, res) => {
  const trip = await Trip.findByPk(req.params.id);
  if (trip) await trip.destroy();
  res.redirect("/");
});

app.get("/me", LoggedInOnly, async (req, res) => {
  res.render("me", {
    trips: await Trip.findAll({ where: { creatorId: res.locals.user.id } }),
  });
});

app.get("/transport", LoggedInOnly, async (req, res) => {
  res.render("transport", {
    transports: await Transport.findAll(),
  });
});

app.post("/transport", LoggedInOnly, async (req, res) => {
  const name = req.body.name;
  if (name) await Transport.create({ name });
  res.redirect("/transport");
});

app.get("/deletetransport/:id", LoggedInOnly, async (req, res) => {
  const transport = await Transport.findByPk(req.params.id, { include: Trip });
  if (transport) {
    try {
      await transport.destroy();
      res.redirect("/transport");
    } catch (error) {
      if (error.name == "SequelizeForeignKeyConstraintError") {
        res.render("transport", {
          transports: await Transport.findAll(),
          msg: `Nem lehet törölni "${transport.name}"-t, mert a következő utakban szerepel: ${transport.Trips.map((x) => '"' + x.name + '"').join(", ")}`,
        });
      } else throw error;
    }
  } else res.redirect("/transport");
});

app.get("/destinations", LoggedInOnly, async (req, res) => {
  res.render("destinations", {
    destinations: await Destination.findAll(),
  });
});

app.post("/destinations", LoggedInOnly, async (req, res) => {
  const name = req.body.name;
  if (name) await Destination.create({ name });
  res.redirect("/destinations");
});

app.get("/editdestination/:id", LoggedInOnly, async (req, res) => {
  const id = req.params.id;
  const destination = await Destination.findByPk(id);
  if (destination) {
    res.render("editdestination", {
      id,
      originalName: destination.name,
    });
  } else res.redirect("/");
});

app.post("/editdestination/:id", LoggedInOnly, async (req, res) => {
  const id = req.params.id;
  const destination = await Destination.findByPk(id);
  const newName = req.body.name;
  if (destination) {
    if (newName) {
      await destination.update({ name: newName });
      res.redirect("/destinations");
    } else
      res.render("editdestination", {
        id,
        originalName: destination.name,
        msg: "Nem lehet üres az úticél neve!",
      });
  } else res.redirect("/");
});

app.get("/accommodations", LoggedInOnly, async (req, res) => {
  res.render("accommodations", {
    accommodations: await Accommodation.findAll({ include: Destination }),
    destinations: await Destination.findAll(),
  });
});

app.post("/accommodations", LoggedInOnly, async (req, res) => {
  const { name, destination } = req.body;
  if (name && destination) {
    const existingDest = await Destination.findByPk(destination);
    if (existingDest) {
      await Accommodation.create({ name, DestinationId: destination });
      res.redirect("/accommodations");
    } else
      res.render("accommodations", {
        accommodations: await Accommodation.findAll({ include: Destination }),
        destinations: await Destination.findAll(),
        msg: "Ilyen úticél nem létezik!",
      });
  } else res.redirect("/accommodations");
});

app.get("/editaccommodation/:id", LoggedInOnly, async (req, res) => {
  const id = req.params.id;
  const accommodation = await Accommodation.findByPk(id, {
    include: Destination,
  });
  if (accommodation) {
    res.render("editaccommodation", {
      id,
      name: accommodation.name,
      originalName: accommodation.name,
      destination: accommodation.DestinationId,
      originalDest: accommodation.Destination.name,
      destinations: await Destination.findAll(),
    });
  } else res.redirect("/accommodations");
});

app.post("/editaccommodation/:id", LoggedInOnly, async (req, res) => {
  const id = req.params.id;
  const accommodation = await Accommodation.findByPk(id, {
    include: Destination,
  });
  const newName = req.body.name;
  const newDest = req.body.destination;
  if (accommodation) {
    if (newName && newDest) {
      const existingDest = await Destination.findByPk(newDest);
      if (existingDest) {
        await accommodation.update({ name: newName, DestinationId: newDest });
        res.redirect("/accommodations");
      } else res.redirect("/accommodations");
    } else {
      res.render("editaccommodation", {
        id,
        name: newName,
        originalName: accommodation.name,
        destination: newDest,
        originalDest: accommodation.Destination.name,
        destinations: await Destination.findAll(),
        msg: "Meg kell adni nevet és helyszínt!",
      });
    }
  } else res.redirect("/accommodations");
});

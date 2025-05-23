import { Trip, Accommodation, Transport, Destination } from "./models.js";
import { Op } from "sequelize";

export const newTrip = async (
  name,
  description,
  date,
  destination,
  accommodation,
  transport,
  userId,
) => {
  if (
    !(name && description && date && destination && accommodation && transport)
  )
    return "Minden mezőt kötelező kitölteni!";
  const dest = await Destination.findByPk(destination);
  if (!dest) return "Az az úticél nem létezik!";
  const acc = await Accommodation.findByPk(accommodation);
  if (!acc) return "Az a szállás nem létezik!";
  if (acc.DestinationId != destination)
    return "Az a szállás nem az úticélban található!";
  const tr = await Transport.findByPk(transport);
  if (!tr) return "Az a közlekedési mód nem létezik!";
  const trip = await Trip.create({
    name,
    description,
    date,
    DestinationId: destination,
    AccommodationId: accommodation,
    TransportId: transport,
    UserId: userId,
  });
  return trip;
};

export const editTrip = async (
  id,
  name,
  description,
  date,
  destination,
  accommodation,
  transport,
) => {
  if (
    !(name && description && date && destination && accommodation && transport)
  )
    return "Minden mezőt kötelező kitölteni!";
  const dest = await Destination.findByPk(destination);
  if (!dest) return "Az az úticél nem létezik!";
  const acc = await Accommodation.findByPk(accommodation);
  if (!acc) return "Az a szállás nem létezik!";
  if (acc.DestinationId != destination)
    return "Az a szállás nem az úticélban található!";
  const tr = await Transport.findByPk(transport);
  if (!tr) return "Az a közlekedési mód nem létezik!";
  const trip = await Trip.findByPk(id);
  if (trip) {
    await trip.update({
      name,
      description,
      date,
      DestinationId: destination,
      AccommodationId: accommodation,
      TransportId: transport,
    });
    return trip;
  } else return "Nem létezik utazás ezzel az azonoítóval.";
};

export const searchTrips = (search) => {
  if (typeof search == "undefined") search = "";
  return Trip.findAll({
    order: [["date", "DESC"]],
    where: { name: { [Op.like]: "%" + search + "%" } },
    include: [Destination, Accommodation, Transport],
  });
};

import { faker } from "@faker-js/faker";
import { Transport, Destination, Accommodation } from "./models.js";
import { newTrip } from "./trips.js";

let transports = [];
for (let i = 0; i < 10; i++) {
  try {
    transports.push(
      await Transport.create({ name: faker.airline.airline().name }),
    );
  } catch {
    continue;
  }
}

let destinations = [];
let accommodations = [];
for (let i = 0; i < 10; i++) {
  const dest = await Destination.create({ name: faker.location.city() });
  destinations.push(dest);
  for (let i = 0; i < 2; i++) {
    accommodations.push(
      await Accommodation.create({
        name: faker.person.firstName() + " Hotel",
        DestinationId: dest.id,
      }),
    );
  }
}

for (let i = 0; i < 5; i++) {
  const date = faker.date.future();
  const destination = faker.helpers.arrayElement(destinations);
  const accommodation = faker.helpers.arrayElement(
    accommodations.filter((x) => x.DestinationId == destination.id),
  );
  const transport = faker.helpers.arrayElement(transports);
  newTrip(
    destination.name + " Utazás " + i,
    `Egy vakáció ${accommodation.name}, ${destination.name}-ben. ` +
      faker.lorem.paragraphs(1),
    date,
    destination.id,
    accommodation.id,
    transport.id,
  );
}

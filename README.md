# Travel agency

This implements a travel agency website and API. Users can register, create trips, and associate them with destinations and accommodations.

## API and web

First, set up a `.env` file (there is an example).
You might want to fill the database with random data, use `node maketestdata.js`.
Then run using `node server.js`. This will make the server listen on the port specified in the `.env` file.

## Development documentation

Documentation is in the `docs` directory, you can compile the following using typst:

- `api.typ` shows API routes
- `db.typ` explains the database tables and associations between them

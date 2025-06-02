#set text(14pt, font: "Noto Sans")
#show table.cell.where(y: 0): set text(weight: "bold")
#set page(flipped: true, margin: 1cm)
= Travel agency API
For routes that require login the auth token must be sent either in the request body, or in the query string, as the attribute "token".
Note that these paths are under /api (e.g. /login is actually /api/login).
#let data = csv("api.tsv", delimiter: "\t")
#let header = data.at(0).flatten().map(x => x.trim())
#let routes = data.slice(1).flatten().map(x => x.trim())
#table(
  columns: 6,
  table.header(..header),
  ..routes
)

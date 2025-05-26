#import "@preview/pinit:0.2.2": *
#set text(14pt, font: "Noto Sans")
#set page(flipped: true)
#show table.cell.where(y: 0): set text(weight: "bold")
= Travel agency database layout
#grid(
  columns: 5,
  column-gutter: 1cm,
  table[Trip][id][name][description][date][createdAt][updatedAt][creatorId#pin(0)#pinit-arrow(0, "UserId")][DestinationId#pin(1)#pinit-arrow(1, "DestinationId")][AccommodationId#pin(2)#pinit-arrow(2, "AccommodationId")][TransportId#pin(3)#pinit-arrow(3, "TransportId")],
  table[User][#pin("UserId")id][name][password][createdAt][updatedAt],
  table[Transport][id#pin("TransportId")][name][createdAt][updatedAt],
  table[Destination][id#pin("DestinationId")][name][createdAt][updatedAt],
  table[Accommodation][id#pin("AccommodationId")][name][createdAt][updatedAt][DestinationId#pin(4)#pinit-arrow(4, "DestinationId")],
)

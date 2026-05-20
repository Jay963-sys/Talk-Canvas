// All shipping/pickup config lives here.
// Update these values once the client confirms — currently using placeholders.

export const SHIPPING_CONFIG = {
  pickup: {
    // TODO: confirm with client
    address: "12 Akin Adesola Street, Victoria Island, Lagos",
    days: "Tuesdays – Saturdays",
    hours: "11am – 6pm",
  },
  delivery: {
    // TODO: confirm with client — currently a flat fee placeholder.
    // May eventually need a zone-based system (Lagos / other Nigerian states / international).
    fee: 5000,
    description:
      "Door-to-door delivery within Lagos. Outside Lagos / international rates calculated separately.",
  },
};

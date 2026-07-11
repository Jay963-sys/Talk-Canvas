// All shipping/pickup config lives here.
// Update these values once the client confirms — currently using placeholders.

export const SHIPPING_CONFIG = {
  pickup: {
    // TODO: confirm with client
    address:
      "5, Abeke Animashaun Street, Lekki phase 1, opp Ichie Kris Onyekwuje Street, Lekki, Lagos, Nigeria 105102  ",
    days: "Mondays – Saturdays",
    hours: "10am – 5pm",
  },
  delivery: {
    // TODO: confirm with client — currently a flat fee placeholder.
    // May eventually need a zone-based system (Lagos / other Nigerian states / international).
    fee: 15000,
    description:
      "Door-to-door delivery within Lagos. Outside Lagos / international rates calculated separately.",
  },
};

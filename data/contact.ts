/**
 * Public-facing contact info shown on the website.
 * Distinct from GALLERY_EMAIL env var (which is for receiving notifications,
 * may or may not be the same address).
 */

export const CONTACT = {
  // TODO: swap with real email
  email: "hello@talkcanvasgallery.com",

  // TODO: swap with real phone number
  phone: "+234 915 532 8133",

  whatsapp: {
    // For wa.me URL — country code + number, NO + or spaces (e.g. "2348012345678")
    // TODO: swap with real WhatsApp number
    number: "2349155328133",
    // Human-readable display
    // TODO: swap with real number formatted nicely
    display: "+234 915 532 8133",
  },

  instagram: {
    // TODO: swap with real handle
    handle: "@talk_canvas",
    url: "https://instagram.com/talk_canvas",
  },
};

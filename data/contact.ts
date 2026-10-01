/**
 * Public-facing contact info shown on the website.
 * Distinct from GALLERY_EMAIL env var (which is for receiving notifications,
 * may or may not be the same address).
 */

/**
 * Showroom switch. While false, the showroom address, opening hours and map
 * are hidden everywhere on the site (Contact, About, Footer). The content is
 * all still in the code — flip this to true when the showroom reopens.
 */
export const SHOWROOM_OPEN = false;

export const CONTACT = {
  // TODO: swap with real email
  email: "info@talkcanvas.com",

  // TODO: swap with real phone number
  phone: "+234 704 096 9082",

  whatsapp: {
    // For wa.me URL — country code + number, NO + or spaces (e.g. "2348012345678")
    // TODO: swap with real WhatsApp number
    number: "2347040969082",
    // Human-readable display
    // TODO: swap with real number formatted nicely
    display: "+234 704 096 9082",
  },

  instagram: {
    // TODO: swap with real handle
    handle: "@talk_canvas",
    url: "https://instagram.com/talk_canvas",
  },
};

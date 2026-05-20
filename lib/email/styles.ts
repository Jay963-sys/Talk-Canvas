export const colors = {
  cream: "#F4EFE7",
  paper: "#FAF6EF",
  ink: "#1A1814",
  inkSoft: "#4A4540",
  muted: "#8B847B",
  accent: "#9B4A2C",
  line: "#D9D1C2",
};

export const styles = {
  main: {
    backgroundColor: colors.cream,
    fontFamily: "Georgia, serif",
    margin: 0,
    padding: "40px 0",
    color: colors.ink,
  },
  container: {
    maxWidth: "560px",
    margin: "0 auto",
    backgroundColor: colors.paper,
    padding: "40px 32px",
  },
  brand: {
    fontSize: "12px",
    textTransform: "uppercase" as const,
    letterSpacing: "0.15em",
    color: colors.muted,
    margin: 0,
    marginBottom: "20px",
  },
  heading: {
    fontFamily: "Georgia, serif",
    fontSize: "32px",
    lineHeight: 1.1,
    fontWeight: 400,
    margin: "8px 0",
  },
  italic: { fontStyle: "italic" as const },
  paragraph: {
    fontSize: "15px",
    lineHeight: 1.6,
    color: colors.inkSoft,
    margin: "12px 0",
  },
  sectionLabel: {
    fontSize: "11px",
    textTransform: "uppercase" as const,
    letterSpacing: "0.15em",
    color: colors.muted,
    marginTop: "32px",
    marginBottom: "12px",
    fontWeight: 600,
  },
  infoText: {
    fontSize: "14px",
    lineHeight: 1.5,
    color: colors.ink,
    margin: "4px 0",
  },
  metaText: {
    fontSize: "12px",
    color: colors.muted,
    margin: "4px 0",
  },
  divider: {
    borderTop: `1px solid ${colors.line}`,
    margin: "24px 0",
  },
  itemImage: {
    width: "60px",
    height: "80px",
    objectFit: "cover" as const,
    display: "block",
    borderRadius: "2px",
  },
  footer: {
    fontSize: "11px",
    color: colors.muted,
    textAlign: "center" as const,
    marginTop: "40px",
    lineHeight: 1.6,
  },
  orderNumber: {
    fontFamily: "monospace",
    fontSize: "12px",
    color: colors.muted,
    letterSpacing: "0.1em",
    marginTop: "20px",
  },
};

export const formatNaira = (n: number) => `₦${n.toLocaleString("en-NG")}`;

// Shrink Cloudinary images for email thumbnails
export const thumb = (url: string): string =>
  url.replace("/upload/", "/upload/w_120,c_fit,q_auto/");

import { getActivePromo } from "@/lib/db/queries/affiliates";
import PromoPopup from "./PromoPopup";

/**
 * Server wrapper: only mounts the pop-up if the gallery has a live promo code.
 * No promo configured → nothing ships to the client at all.
 */
export default async function PromoPopupGate() {
  const promo = await getActivePromo();
  if (!promo) return null;

  return (
    <PromoPopup code={promo.code} discountPercent={promo.discountPercent} />
  );
}

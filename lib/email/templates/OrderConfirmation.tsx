import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Row,
  Column,
  Heading,
  Text,
  Hr,
  Img,
  Preview,
} from "@react-email/components";
import { styles, formatNaira, thumb, colors } from "../styles";

interface Item {
  type?: "print" | "original";
  imageUrl: string;
  frameName: string;
  glass: boolean;
  sizeLabel: string;
  price: number;
  quantity?: number;
  oneOfOne?: boolean;
  title?: string | null;
  artist?: string | null;
  year?: number | null;
  /** Set membership. Panels of one set arrive as consecutive rows. */
  setId?: number | null;
  setPosition?: number | null;
}

/**
 * An order stores one row per panel, because that's what the gallery prints.
 * The customer bought one thing, though, so panels are folded back into a
 * single line here — three identical rows reading "Custom print" would look
 * like a billing error.
 */
type Group =
  | { kind: "single"; item: Item }
  | { kind: "set"; setId: number; items: Item[] };

function groupItems(items: Item[]): Group[] {
  const groups: Group[] = [];
  for (const item of items) {
    if (item.setId == null) {
      groups.push({ kind: "single", item });
      continue;
    }
    const last = groups[groups.length - 1];
    if (last && last.kind === "set" && last.setId === item.setId) {
      last.items.push(item);
    } else {
      groups.push({ kind: "set", setId: item.setId, items: [item] });
    }
  }
  return groups;
}

const lineTotal = (i: Item) => i.price * (i.quantity ?? 1);

interface Props {
  orderNumber: string;
  customerName: string;
  items: Item[];
  subtotal: number;
  shipping: number;
  total: number;
  deliveryMethod: "pickup" | "delivery";
  notes?: string | null;
  pickupAddress?: string;
  pickupDays?: string;
  pickupHours?: string;
  productionNote?: string;
  discountAmount?: number;
  affiliateCode?: string | null;
  discountPercent?: number | null;
  // Delivery is priced per Lagos LGA. Outside Lagos isn't in the price list, so
  // nothing is charged up front and the gallery quotes the customer by hand.
  // Sets are quoted the same way, wherever they're going.
  deliveryZoneLabel?: string | null;
  deliveryQuotePending?: boolean;
  shippingAddress?: {
    line1: string;
    line2?: string | null;
    city: string;
    state: string;
    country: string;
  };
}

export default function OrderConfirmation({
  orderNumber,
  customerName,
  items,
  subtotal,
  shipping,
  total,
  deliveryMethod,
  pickupAddress,
  pickupDays,
  pickupHours,
  shippingAddress,
  notes,
  productionNote,
  discountAmount,
  affiliateCode,
  discountPercent,
  deliveryZoneLabel,
  deliveryQuotePending,
}: Props) {
  const firstName = customerName.split(" ")[0];
  const groups = groupItems(items);
  const hasSet = groups.some((g) => g.kind === "set");

  return (
    <Html>
      <Head />
      <Preview>Your Talk Canvas Gallery order #{orderNumber}</Preview>
      <Body style={styles.main}>
        <Container style={styles.container}>
          <Text style={styles.brand}>
            Talk Canvas <span style={styles.italic}>Gallery</span>
          </Text>

          <Heading style={styles.heading}>
            Thank you, <span style={styles.italic}>{firstName}.</span>
          </Heading>

          <Text style={styles.paragraph}>
            We&apos;ve received your order.
            {productionNote ? ` ${productionNote}` : ""} We&apos;ll be in touch
            with {deliveryMethod === "pickup" ? "pickup" : "delivery"} details
            once your order is ready.
          </Text>

          {/* Two reasons a fee is still open, and the customer should be told
              which one applies to them. */}
          {deliveryQuotePending && (
            <Text style={styles.paragraph}>
              {hasSet
                ? "Your order includes a set, which we deliver by arrangement, so we haven't charged for delivery yet. We'll be in touch shortly with the cost."
                : "Your delivery is outside Lagos, so we haven't charged for it yet. We'll be in touch shortly with the delivery cost for your area."}
            </Text>
          )}

          <Text style={styles.orderNumber}>ORDER #{orderNumber}</Text>

          <Hr style={styles.divider} />

          <Text style={styles.sectionLabel}>Your order</Text>
          {groups.map((group, i) => {
            if (group.kind === "set") {
              const lead = group.items[0];
              const panels = group.items.length;
              const setTotal = group.items.reduce(
                (sum, it) => sum + lineTotal(it),
                0,
              );
              const sets = lead.quantity ?? 1;

              return (
                <Section key={i} style={{ marginBottom: "16px" }}>
                  <Row>
                    <Column style={{ width: "70px", verticalAlign: "top" }}>
                      <Img
                        src={thumb(lead.imageUrl)}
                        style={styles.itemImage}
                        alt=""
                      />
                    </Column>
                    <Column
                      style={{ verticalAlign: "top", paddingLeft: "16px" }}
                    >
                      <Text
                        style={{
                          ...styles.infoText,
                          fontStyle: "italic",
                          fontSize: "15px",
                        }}
                      >
                        Set of {panels}
                      </Text>
                      <Text style={styles.metaText}>
                        {lead.frameName}
                        {lead.glass ? " · with glass" : ""} · {lead.sizeLabel}{" "}
                        each piece
                      </Text>
                      <Text style={styles.metaText}>
                        {panels} framed pieces, sold together
                      </Text>
                    </Column>
                    <Column
                      style={{
                        verticalAlign: "top",
                        textAlign: "right",
                        whiteSpace: "nowrap",
                      }}
                    >
                      <Text style={{ ...styles.infoText, fontWeight: 500 }}>
                        {formatNaira(setTotal)}
                      </Text>
                      {sets > 1 && (
                        <Text style={styles.metaText}>
                          {sets} × {formatNaira(setTotal / sets)}
                        </Text>
                      )}
                    </Column>
                  </Row>
                </Section>
              );
            }

            const item = group.item;
            return (
              <Section key={i} style={{ marginBottom: "16px" }}>
                <Row>
                  <Column style={{ width: "70px", verticalAlign: "top" }}>
                    <Img
                      src={thumb(item.imageUrl)}
                      style={styles.itemImage}
                      alt=""
                    />
                  </Column>
                  <Column style={{ verticalAlign: "top", paddingLeft: "16px" }}>
                    {item.type === "original" ? (
                      <>
                        <Text
                          style={{
                            ...styles.infoText,
                            fontStyle: "italic",
                            fontSize: "15px",
                          }}
                        >
                          {item.title}
                        </Text>
                        <Text style={styles.metaText}>
                          {item.artist}
                          {item.year ? ` · ${item.year}` : ""}
                        </Text>
                        <Text style={styles.metaText}>
                          {item.frameName} · {item.sizeLabel}
                        </Text>
                      </>
                    ) : (
                      <>
                        <Text
                          style={{
                            ...styles.infoText,
                            fontStyle: "italic",
                            fontSize: "15px",
                          }}
                        >
                          Custom print
                        </Text>
                        <Text style={styles.metaText}>
                          {item.frameName}
                          {item.glass ? " · with glass" : ""} · {item.sizeLabel}
                        </Text>
                      </>
                    )}
                  </Column>
                  <Column
                    style={{
                      verticalAlign: "top",
                      textAlign: "right",
                      whiteSpace: "nowrap",
                    }}
                  >
                    <Text style={{ ...styles.infoText, fontWeight: 500 }}>
                      {formatNaira(lineTotal(item))}
                    </Text>
                    {(item.quantity ?? 1) > 1 && (
                      <Text style={styles.metaText}>
                        {item.quantity} × {formatNaira(item.price)}
                      </Text>
                    )}
                  </Column>
                </Row>
              </Section>
            );
          })}

          <Hr style={styles.divider} />

          <Row>
            <Column>
              <Text style={styles.metaText}>Subtotal</Text>
            </Column>
            <Column style={{ textAlign: "right" }}>
              <Text style={styles.metaText}>{formatNaira(subtotal)}</Text>
            </Column>
          </Row>

          {(discountAmount ?? 0) > 0 && (
            <Row>
              <Column>
                <Text style={styles.metaText}>
                  {affiliateCode}
                  {discountPercent ? ` (${discountPercent}% off)` : ""}
                </Text>
              </Column>
              <Column style={{ textAlign: "right" }}>
                <Text style={styles.metaText}>
                  − {formatNaira(discountAmount!)}
                </Text>
              </Column>
            </Row>
          )}

          <Row>
            <Column>
              <Text style={styles.metaText}>
                {deliveryMethod === "pickup" ? "Pickup" : "Delivery"}
              </Text>
            </Column>
            <Column style={{ textAlign: "right" }}>
              <Text style={styles.metaText}>
                {deliveryQuotePending
                  ? "To be quoted"
                  : shipping === 0
                    ? "Free"
                    : formatNaira(shipping)}
              </Text>
            </Column>
          </Row>

          <Row
            style={{
              borderTop: `1px solid ${colors.line}`,
              paddingTop: "12px",
              marginTop: "8px",
            }}
          >
            <Column>
              <Text style={{ ...styles.infoText, fontWeight: 500 }}>Total</Text>
            </Column>
            <Column style={{ textAlign: "right" }}>
              <Text
                style={{
                  fontFamily: "Georgia, serif",
                  fontSize: "20px",
                  fontWeight: 500,
                  color: colors.ink,
                  margin: 0,
                }}
              >
                {formatNaira(total)}
              </Text>
            </Column>
          </Row>

          {deliveryQuotePending && (
            <Text style={{ ...styles.metaText, marginTop: "8px" }}>
              Delivery cost is not included in this total — we&apos;ll confirm
              it with you.
            </Text>
          )}

          {/* Lagos deliveries carry a computed fee — reassure the customer that
              any later change to it comes with a heads-up, per gallery policy. */}
          {deliveryMethod === "delivery" &&
            !deliveryQuotePending &&
            shipping > 0 && (
              <Text style={{ ...styles.metaText, marginTop: "8px" }}>
                Your delivery fee is based on your area and the size and number
                of pieces in your order. If anything changes it, we&apos;ll
                contact you before dispatch.
              </Text>
            )}

          {deliveryMethod === "pickup" && pickupAddress && (
            <>
              <Text style={styles.sectionLabel}>Pickup details</Text>
              <Text style={styles.infoText}>{pickupAddress}</Text>
              <Text style={styles.metaText}>
                {pickupDays} · {pickupHours}
              </Text>
            </>
          )}

          {deliveryMethod === "delivery" && shippingAddress && (
            <>
              <Text style={styles.sectionLabel}>Delivering to</Text>
              <Text style={styles.infoText}>{shippingAddress.line1}</Text>
              {shippingAddress.line2 && (
                <Text style={styles.infoText}>{shippingAddress.line2}</Text>
              )}
              <Text style={styles.infoText}>
                {shippingAddress.city}, {shippingAddress.state}
              </Text>
              <Text style={styles.infoText}>{shippingAddress.country}</Text>
              {deliveryZoneLabel && (
                <Text style={{ ...styles.metaText, marginTop: "4px" }}>
                  Area: {deliveryZoneLabel}
                </Text>
              )}
            </>
          )}

          {notes && (
            <>
              <Text style={styles.sectionLabel}>Your notes</Text>
              <Text style={{ ...styles.infoText, whiteSpace: "pre-wrap" }}>
                {notes}
              </Text>
            </>
          )}

          <Text style={styles.footer}>
            Talk Canvas Gallery · Lagos
            <br />
            Questions? Just reply to this email.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

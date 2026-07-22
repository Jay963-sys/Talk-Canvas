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
}

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

          {deliveryQuotePending && (
            <Text style={styles.paragraph}>
              Your delivery is outside Lagos, so we haven&apos;t charged for it
              yet. We&apos;ll be in touch shortly with the delivery cost for
              your area.
            </Text>
          )}

          <Text style={styles.orderNumber}>ORDER #{orderNumber}</Text>

          <Hr style={styles.divider} />

          <Text style={styles.sectionLabel}>Your order</Text>
          {items.map((item, i) => (
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
                    {formatNaira(item.price * (item.quantity ?? 1))}
                  </Text>
                  {(item.quantity ?? 1) > 1 && (
                    <Text style={styles.metaText}>
                      {item.quantity} × {formatNaira(item.price)}
                    </Text>
                  )}
                </Column>
              </Row>
            </Section>
          ))}

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

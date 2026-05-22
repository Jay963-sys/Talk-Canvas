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
  title?: string | null;
  artist?: string | null;
  year?: number | null;
}

interface Props {
  orderNumber: string;
  customer: { name: string; email: string; phone: string };
  items: Item[];
  subtotal: number;
  shipping: number;
  total: number;
  deliveryMethod: "pickup" | "delivery";
  notes?: string | null;
  shippingAddress?: {
    line1: string;
    line2?: string | null;
    city: string;
    state: string;
    country: string;
  };
}

export default function OrderNotification({
  orderNumber,
  customer,
  items,
  subtotal,
  shipping,
  total,
  deliveryMethod,
  shippingAddress,
  notes,
}: Props) {
  return (
    <Html>
      <Head />
      <Preview>
        New order #{orderNumber} from {customer.name} · {formatNaira(total)}
      </Preview>
      <Body style={styles.main}>
        <Container style={styles.container}>
          <Text style={styles.brand}>New order</Text>
          <Heading style={styles.heading}>Order #{orderNumber}</Heading>
          <Text style={styles.paragraph}>
            {customer.name} just placed an order for{" "}
            <strong>{formatNaira(total)}</strong>.
          </Text>

          <Hr style={styles.divider} />

          <Text style={styles.sectionLabel}>Customer</Text>
          <Text style={styles.infoText}>{customer.name}</Text>
          <Text style={styles.infoText}>{customer.email}</Text>
          <Text style={styles.infoText}>{customer.phone}</Text>

          {notes && (
            <>
              <Text style={styles.sectionLabel}>Notes from customer</Text>
              <Text style={{ ...styles.infoText, whiteSpace: "pre-wrap" }}>
                {notes}
              </Text>
            </>
          )}

          <Text style={styles.sectionLabel}>Items</Text>
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
                      <Text style={{ ...styles.infoText, fontStyle: "italic" }}>
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
                      <Text style={{ ...styles.infoText, fontStyle: "italic" }}>
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
                    {formatNaira(item.price)}
                  </Text>
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
          <Row>
            <Column>
              <Text style={styles.metaText}>
                {deliveryMethod === "pickup" ? "Pickup" : "Delivery"}
              </Text>
            </Column>
            <Column style={{ textAlign: "right" }}>
              <Text style={styles.metaText}>
                {shipping === 0 ? "Free" : formatNaira(shipping)}
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
                  margin: 0,
                }}
              >
                {formatNaira(total)}
              </Text>
            </Column>
          </Row>

          <Text style={styles.sectionLabel}>
            {deliveryMethod === "pickup" ? "Pickup" : "Ship to"}
          </Text>
          {deliveryMethod === "pickup" ? (
            <Text style={styles.infoText}>
              Customer will collect from the showroom.
            </Text>
          ) : (
            shippingAddress && (
              <>
                <Text style={styles.infoText}>{shippingAddress.line1}</Text>
                {shippingAddress.line2 && (
                  <Text style={styles.infoText}>{shippingAddress.line2}</Text>
                )}
                <Text style={styles.infoText}>
                  {shippingAddress.city}, {shippingAddress.state}
                </Text>
                <Text style={styles.infoText}>{shippingAddress.country}</Text>
              </>
            )
          )}

          <Text style={styles.footer}>
            Reply to this email to contact {customer.name.split(" ")[0]}{" "}
            directly.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

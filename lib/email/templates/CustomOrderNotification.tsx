import {
  Html,
  Head,
  Body,
  Container,
  Heading,
  Text,
  Hr,
  Img,
  Preview,
  Link,
} from "@react-email/components";
import { styles, thumb } from "../styles";

interface Props {
  name: string;
  email: string;
  phone: string;
  width: string | null;
  height: string | null;
  unit: string;
  framePreference: string | null;
  message: string;
  imageUrl: string | null;
}

export default function CustomOrderNotification({
  name,
  email,
  phone,
  width,
  height,
  unit,
  framePreference,
  message,
  imageUrl,
}: Props) {
  const hasDimensions = width && height;

  return (
    <Html>
      <Head />
      <Preview>Custom order request from {name}</Preview>
      <Body style={styles.main}>
        <Container style={styles.container}>
          <Text style={styles.brand}>Custom order</Text>
          <Heading style={styles.heading}>
            Request from <span style={styles.italic}>{name}</span>
          </Heading>

          <Hr style={styles.divider} />

          <Text style={styles.sectionLabel}>From</Text>
          <Text style={styles.infoText}>{name}</Text>
          <Text style={styles.infoText}>{email}</Text>
          <Text style={styles.infoText}>{phone}</Text>

          {hasDimensions && (
            <>
              <Text style={styles.sectionLabel}>Dimensions</Text>
              <Text style={styles.infoText}>
                {width} × {height} {unit}
              </Text>
            </>
          )}

          {framePreference && (
            <>
              <Text style={styles.sectionLabel}>Frame style</Text>
              <Text style={styles.infoText}>{framePreference}</Text>
            </>
          )}

          <Text style={styles.sectionLabel}>Message</Text>
          <Text style={{ ...styles.infoText, whiteSpace: "pre-wrap" }}>
            {message}
          </Text>

          {imageUrl && (
            <>
              <Text style={styles.sectionLabel}>Design</Text>
              <Img
                src={thumb(imageUrl)}
                style={{
                  width: "200px",
                  height: "auto",
                  display: "block",
                  borderRadius: "2px",
                }}
                alt="Customer design"
              />
              <Text style={{ ...styles.metaText, marginTop: "8px" }}>
                <Link href={imageUrl} style={{ color: "#9B4A2C" }}>
                  Open full-resolution image →
                </Link>
              </Text>
            </>
          )}

          <Text style={styles.footer}>
            Reply to this email to respond directly to {name.split(" ")[0]}.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

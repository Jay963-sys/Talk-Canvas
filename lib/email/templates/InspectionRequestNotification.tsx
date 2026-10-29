import {
  Html,
  Head,
  Body,
  Container,
  Heading,
  Text,
  Hr,
  Preview,
} from "@react-email/components";
import { styles } from "../styles";

interface Props {
  name: string;
  phone: string;
  email: string | null;
  address: string;
  area: string | null;
  preferredDate: string | null;
  message: string | null;
}

export default function InspectionRequestNotification({
  name,
  phone,
  email,
  address,
  area,
  preferredDate,
  message,
}: Props) {
  return (
    <Html>
      <Head />
      <Preview>Inspection request from {name}</Preview>
      <Body style={styles.main}>
        <Container style={styles.container}>
          <Text style={styles.brand}>Inspection request</Text>
          <Heading style={styles.heading}>
            <span style={styles.italic}>{name}</span> wants a space inspection
          </Heading>

          <Hr style={styles.divider} />

          <Text style={styles.sectionLabel}>Contact</Text>
          <Text style={styles.infoText}>{name}</Text>
          <Text style={styles.infoText}>{phone}</Text>
          {email && <Text style={styles.infoText}>{email}</Text>}

          <Text style={styles.sectionLabel}>Address</Text>
          <Text style={{ ...styles.infoText, whiteSpace: "pre-wrap" }}>
            {address}
            {area ? `\n${area}` : ""}
          </Text>

          {preferredDate && (
            <>
              <Text style={styles.sectionLabel}>Preferred date</Text>
              <Text style={styles.infoText}>{preferredDate}</Text>
            </>
          )}

          {message && (
            <>
              <Text style={styles.sectionLabel}>Notes</Text>
              <Text style={{ ...styles.infoText, whiteSpace: "pre-wrap" }}>
                {message}
              </Text>
            </>
          )}

          <Text style={styles.footer}>
            Also listed under Admin → Inspections. Call {name.split(" ")[0]} to
            agree a date and the fee.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

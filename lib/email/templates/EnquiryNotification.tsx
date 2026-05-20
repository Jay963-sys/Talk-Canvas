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
  workTitle: string;
  workArtist: string;
  workPrice: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  message?: string;
}

export default function EnquiryNotification({
  workTitle,
  workArtist,
  workPrice,
  customerName,
  customerEmail,
  customerPhone,
  message,
}: Props) {
  return (
    <Html>
      <Head />
      <Preview>
        New enquiry: {workTitle} from {customerName}
      </Preview>
      <Body style={styles.main}>
        <Container style={styles.container}>
          <Text style={styles.brand}>New enquiry</Text>
          <Heading style={{ ...styles.heading, ...styles.italic }}>
            {workTitle}
          </Heading>
          <Text style={styles.metaText}>
            {workArtist} · {workPrice}
          </Text>

          <Hr style={styles.divider} />

          <Text style={styles.sectionLabel}>From</Text>
          <Text style={styles.infoText}>{customerName}</Text>
          <Text style={styles.infoText}>{customerEmail}</Text>
          {customerPhone && (
            <Text style={styles.infoText}>{customerPhone}</Text>
          )}

          {message && (
            <>
              <Text style={styles.sectionLabel}>Message</Text>
              <Text style={{ ...styles.infoText, whiteSpace: "pre-wrap" }}>
                {message}
              </Text>
            </>
          )}

          <Text style={styles.footer}>
            Reply to this email to respond directly to{" "}
            {customerName.split(" ")[0]}.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

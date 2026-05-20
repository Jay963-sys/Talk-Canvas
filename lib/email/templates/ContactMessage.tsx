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
  email: string;
  phone: string | null;
  message: string;
}

export default function ContactMessage({ name, email, phone, message }: Props) {
  return (
    <Html>
      <Head />
      <Preview>Contact message from {name}</Preview>
      <Body style={styles.main}>
        <Container style={styles.container}>
          <Text style={styles.brand}>Contact form</Text>
          <Heading style={styles.heading}>
            Message from <span style={styles.italic}>{name}</span>
          </Heading>

          <Hr style={styles.divider} />

          <Text style={styles.sectionLabel}>From</Text>
          <Text style={styles.infoText}>{name}</Text>
          <Text style={styles.infoText}>{email}</Text>
          {phone && <Text style={styles.infoText}>{phone}</Text>}

          <Text style={styles.sectionLabel}>Message</Text>
          <Text style={{ ...styles.infoText, whiteSpace: "pre-wrap" }}>
            {message}
          </Text>

          <Text style={styles.footer}>
            Reply to this email to respond directly to {name.split(" ")[0]}.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

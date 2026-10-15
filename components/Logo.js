import Link from "next/link";
import Pelota from "./Pelota";
import styles from "./Logo.module.css";

// Wordmark «green.»: en minúscula, con el punto como pelota de tenis.
// Toma el color del texto que lo rodea; la pelota siempre es lima.
export default function Logo({ className = "" }) {
  return (
    <Link href="/" className={`${styles.logo} ${className}`} aria-label="green.">
      <span aria-hidden="true">green</span>
      <Pelota className={styles.punto} />
    </Link>
  );
}

// components/Aside.jsx
import React from "react";
import { Link } from "react-router-dom";
import styles from "./aside.module.css";
import { FaMapMarkedAlt } from "react-icons/fa";
import { FaUser } from "react-icons/fa";

export default function Aside() {
  return (
    <aside className={styles.aside}>
      <div className={styles.content}>
        <h2 className={styles.title}>
          Bienvenido al Panel de <span className={styles.brand}>Habita</span>
        </h2>
        <FaUser className={styles.icon} />

        <nav className={styles.nav}>
          <Link to="/agregar" className={styles.link}>
            <FaUser style={{ marginRight: "10px", fontSize: "30px" }} />
            Agregar
          </Link>

          <Link to="/" className={styles.link}>
            <FaMapMarkedAlt style={{ marginRight: "10px", fontSize: "30px" }} />
            Ver Mapa
          </Link>
        </nav>
      </div>
      <div className={styles.footer}>&copy; 2025 y0urs</div>
    </aside>
  );
}

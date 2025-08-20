// src/components/MapButtons.jsx
import React from "react";
import styles from "./Mapa.module.css";

export default function MapButtons({ onShowRoute }) {
  return (
    <div className={styles.buttons}>
      <button onClick={() => onShowRoute("WALKING")}>
        Ver ruta caminando
      </button>
      <button onClick={() => onShowRoute("DRIVING")}>
        Ver ruta en moto
      </button>
    </div>
  );
}

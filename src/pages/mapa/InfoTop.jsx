// src/components/InfoTop.jsx
import React, { useState } from "react";
import styles from "./Mapa.module.css";

export default function InfoTop({ walkingInfo, drivingInfo }) {
  const [visible, setVisible] = useState(true);

  const toggleVisibility = () => {
    setVisible(!visible);
  };

  return (
    <div className={styles.infoTop}>
      <button 
        className={styles.toggleBtn} 
        onClick={toggleVisibility}
      >
        {visible ? "Ocultar" : "Mostrar"}
      </button>

      {visible && (
        <>
          <h2 style={{ color: "black" }}>DISTANCIA</h2>

          <p>
            🚶 <strong className={styles.label}>Caminando:</strong>{" "}
            {walkingInfo ? (
              <span className={styles.value}>
                {`${walkingInfo.distance} • ${walkingInfo.duration}`}
              </span>
            ) : (
              "Cargando..."
            )}
          </p>

          <p>
            🛵 <strong className={styles.label}>Vehículo:</strong>{" "}
            {drivingInfo ? (
              <span className={styles.value}>
                {`${drivingInfo.distance} • ${drivingInfo.duration}`}
              </span>
            ) : (
              "Cargando..."
            )}
          </p>
        </>
      )}
    </div>
  );
}

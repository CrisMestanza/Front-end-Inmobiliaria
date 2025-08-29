import React from "react";
import styles from "./ModalCuota.module.css";

const ModalCuota = ({ isOpen, onClose, lote }) => {
  if (!isOpen) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <button className={styles.closeBtn} onClick={onClose}>
          ✖
        </button>
        <div className={styles.header}>
          <h2>💳 Solicitud de Crédito</h2>
          <p>Completa el formulario y cotiza fácilmente</p>
        </div>
        <form className={styles.form}>
          <label>
            Nombre completo<span className={styles.required}>*</span>
            <input type="text" required placeholder="Ej: Juan Pérez" />
          </label>
          <label>
            DNI (opcional)
            <input type="text" placeholder="Ej: 76453211" />
          </label>
          <label>
            Número<span className={styles.required}>*</span>
            <input type="tel" required placeholder="+51 987654321" />
          </label>
          <label>
            Correo (opcional)
            <input type="email" placeholder="tuemail@ejemplo.com" />
          </label>
          <label>
            Lote que le gusta
            <input type="text" value={lote?.nombre || ""} readOnly />
          </label>
          <label>
            Motivo por el cual le gusta
            <textarea
              rows="3"
              placeholder="Cuéntanos qué te atrajo del lote..."
            />
          </label>
          <button type="submit" className={styles.submitBtn}>
            🚀 Enviar Solicitud
          </button>
        </form>
      </div>
    </div>
  );
};

export default ModalCuota;

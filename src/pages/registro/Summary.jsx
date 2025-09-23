// src/components/Registro/Summary.jsx
import React from "react";

const Summary = ({ onBack, formData }) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    // Aquí iría la lógica para enviar el formulario a la API o base de datos
    alert("Formulario enviado con éxito!");
  };

  return (
    <div className="form-step summary-step">
      <h3>Resumen de Datos</h3>
      <div className="summary-section">
        <h4>Datos de Cuenta de Usuario</h4>
        <p>
          <strong>Nombre:</strong> {formData.nombre}
        </p>
        <p>
          <strong>Correo Electrónico:</strong> {formData.correo}
        </p>
      </div>
      <div className="summary-section">
        <h4>Información de Contacto</h4>
        <p>
          <strong>Razón Social:</strong> {formData.companyName}
        </p>
        <p>
          <strong>Teléfono:</strong> {formData.phoneNumber}
        </p>
        <p>
          <strong>Correo Electrónico:</strong> {formData.email}
        </p>
      </div>
      <div className="summary-section">
        <h4>Información Adicional</h4>
        <p>
          <strong>Descripción:</strong> {formData.descripcion}
        </p>
        <p>
          <strong>Enlace a Sitio Web:</strong>{" "}
          {formData.portfolioLink || "No proporcionado"}
        </p>
      </div>
      <div className="summary-section">
        <h4>Redes Sociales</h4>
        <p>
          <strong>Facebook:</strong>{" "}
          {formData.facebookLink || "No proporcionado"}
        </p>
        <p>
          <strong>Whatsapp:</strong>{" "}
          {formData.whatsappNumber || "No proporcionado"}
        </p>
        <p>
          <strong>Tiktok:</strong>{" "}
          {formData.tiktokUsername || "No proporcionado"}
        </p>
      </div>
      <div className="form-actions">
        <button type="button" className="back-btn" onClick={onBack}>
          Editar
        </button>
        <button type="submit" className="submit-btn" onClick={handleSubmit}>
          Registrarme
        </button>
      </div>
    </div>
  );
};

export default Summary;

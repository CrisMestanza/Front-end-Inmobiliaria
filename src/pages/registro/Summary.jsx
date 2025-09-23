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
        <h4>Datos de la Inmobiliaria</h4>
        <p>
          <strong>Tipo de Persona:</strong>{" "}
          {formData.personType === "natural"
            ? "Persona Natural"
            : "Persona Jurídica"}
        </p>
        <p>
          <strong>Razón Social:</strong> {formData.companyName}
        </p>
        <p>
          <strong>RUC:</strong> {formData.ruc}
        </p>
        <p>
          <strong>Teléfono:</strong> {formData.phoneNumber}
        </p>
        <p>
          <strong>Correo Electrónico:</strong> {formData.email}
        </p>
      </div>
      <div className="summary-section">
        <h4>Información Legal</h4>
        <p>
          <strong>Partida Registral (SUNARP):</strong>{" "}
          {formData.sunarpRegistration}
        </p>
        <p>
          <strong>N° de Agente Inmobiliario (MVCS):</strong>{" "}
          {formData.mvcsAgentNumber}
        </p>
      </div>
      <div className="summary-section">
        <h4>Descripción y Ubicación</h4>
        <p>
          <strong>Descripción:</strong> {formData.companyDescription}
        </p>
        <p>
          <strong>Enlace al Portafolio:</strong>{" "}
          {formData.portfolioLink || "No proporcionado"}
        </p>
        <p>
          <strong>Dirección Fiscal:</strong> {formData.fiscalAddress}
        </p>
        <p>
          <strong>Dirección de Oficina:</strong> {formData.officeAddress}
        </p>
      </div>
      <div className="form-actions">
        <button type="button" className="back-btn" onClick={onBack}>
          Editar
        </button>
        <button type="submit" className="submit-btn" onClick={handleSubmit}>
          Confirmar y Enviar
        </button>
      </div>
    </div>
  );
};

export default Summary;

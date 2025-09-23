// src/components/Registro/LegalDetails.jsx
import React, { useState } from "react";

const LegalDetails = ({ onNext, onBack, formData }) => {
  const [data, setData] = useState(formData);
  const isFormValid = data.sunarpRegistration && data.mvcsAgentNumber;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setData({ ...data, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isFormValid) {
      onNext(data);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="form-step">
      <h3>Información de Registro Legal</h3>
      <div className="form-row">
        <label htmlFor="sunarpRegistration">Partida Registral (SUNARP)</label>
        <input
          type="text"
          name="sunarpRegistration"
          value={data.sunarpRegistration}
          onChange={handleChange}
          required
        />
      </div>
      <div className="form-row">
        <label htmlFor="mvcsAgentNumber">
          N° de Agente Inmobiliario (MVCS)
        </label>
        <input
          type="text"
          name="mvcsAgentNumber"
          value={data.mvcsAgentNumber}
          onChange={handleChange}
          required
        />
      </div>
      <div className="form-actions">
        <button type="button" className="back-btn" onClick={onBack}>
          Atrás
        </button>
        <button type="submit" className="next-btn" disabled={!isFormValid}>
          Siguiente
        </button>
      </div>
    </form>
  );
};

export default LegalDetails;

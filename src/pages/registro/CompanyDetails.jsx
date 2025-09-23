// src/components/Registro/CompanyDetails.jsx
import React, { useState } from "react";

const CompanyDetails = ({ onNext, onBack, formData }) => {
  const [data, setData] = useState(formData);
  const isFormValid =
    data.companyDescription && data.fiscalAddress && data.officeAddress;

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
      <h3>Descripción y Ubicación</h3>
      <div className="form-row">
        <label htmlFor="companyDescription">
          Descripción de la Inmobiliaria
        </label>
        <textarea
          name="companyDescription"
          value={data.companyDescription}
          onChange={handleChange}
          rows="5"
          required
        />
      </div>
      <div className="form-row">
        <label htmlFor="portfolioLink">Enlace al Portafolio (opcional)</label>
        <input
          type="url"
          name="portfolioLink"
          value={data.portfolioLink}
          onChange={handleChange}
        />
      </div>
      <div className="form-row">
        <label htmlFor="fiscalAddress">Dirección Fiscal</label>
        <input
          type="text"
          name="fiscalAddress"
          value={data.fiscalAddress}
          onChange={handleChange}
          required
        />
      </div>
      <div className="form-row">
        <label htmlFor="officeAddress">Dirección de Oficina</label>
        <input
          type="text"
          name="officeAddress"
          value={data.officeAddress}
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

export default CompanyDetails;

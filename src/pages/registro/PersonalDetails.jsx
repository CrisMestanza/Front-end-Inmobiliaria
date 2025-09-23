// src/components/Registro/PersonalDetails.jsx
import React, { useState } from "react";

const PersonalDetails = ({ onNext, formData }) => {
  const [data, setData] = useState(formData);
  const isFormValid =
    data.personType &&
    data.companyName &&
    data.ruc &&
    data.phoneNumber &&
    data.email;

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
      <h3>Datos de la Inmobiliaria</h3>
      <div className="form-row">
        <label htmlFor="personType">Tipo de Persona</label>
        <select
          name="personType"
          value={data.personType}
          onChange={handleChange}
          required
        >
          <option value="">Seleccione...</option>
          <option value="natural">Persona Natural</option>
          <option value="juridica">Persona Jurídica</option>
        </select>
      </div>
      <div className="form-row">
        <label htmlFor="companyName">Razón Social o Nombre Comercial</label>
        <input
          type="text"
          name="companyName"
          value={data.companyName}
          onChange={handleChange}
          required
        />
      </div>
      <div className="form-row">
        <label htmlFor="ruc">RUC</label>
        <input
          type="text"
          name="ruc"
          value={data.ruc}
          onChange={handleChange}
          required
        />
      </div>
      <div className="form-row">
        <label htmlFor="phoneNumber">Teléfono</label>
        <input
          type="tel"
          name="phoneNumber"
          value={data.phoneNumber}
          onChange={handleChange}
          required
        />
      </div>
      <div className="form-row">
        <label htmlFor="email">Correo Electrónico</label>
        <input
          type="email"
          name="email"
          value={data.email}
          onChange={handleChange}
          required
        />
      </div>
      <div className="form-actions">
        <button type="submit" className="next-btn" disabled={!isFormValid}>
          Siguiente
        </button>
      </div>
    </form>
  );
};

export default PersonalDetails;

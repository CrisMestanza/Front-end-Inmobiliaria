// src/components/Registro/UserDetails.jsx
import React, { useState } from "react";

const UserDetails = ({ onNext, onBack, formData }) => {
  const [data, setData] = useState({
    nombre: "",
    correo: "",
    contrasena: "",
    confirmarContrasena: "",
    ...formData,
  });
  const [errors, setErrors] = useState({});

  const isFormValid =
    data.nombre &&
    data.correo &&
    data.contrasena &&
    data.confirmarContrasena &&
    data.contrasena === data.confirmarContrasena;

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!data.nombre) {
      newErrors.nombre = "El nombre es requerido";
    }

    if (!data.correo) {
      newErrors.correo = "El correo es requerido";
    } else if (!validateEmail(data.correo)) {
      newErrors.correo = "El formato del correo no es válido";
    }

    if (!data.contrasena) {
      newErrors.contrasena = "La contraseña es requerida";
    } else if (data.contrasena.length < 6) {
      newErrors.contrasena = "La contraseña debe tener al menos 6 caracteres";
    }

    if (!data.confirmarContrasena) {
      newErrors.confirmarContrasena = "Debe confirmar la contraseña";
    } else if (data.contrasena !== data.confirmarContrasena) {
      newErrors.confirmarContrasena = "Las contraseñas no coinciden";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setData({ ...data, [name]: value });

    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (validateForm() && isFormValid) {
      // Preparar datos para enviar al backend (estado = 1 automáticamente)
      const userData = {
        nombre: data.nombre,
        correo: data.correo,
        contrasena: data.contrasena,
        estado: 1, // Se envía automáticamente como 1
      };

      onNext(userData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="form-step">
      <h3>Información del Usuario</h3>

      <div className="form-row">
        <label htmlFor="nombre">Nombre Completo</label>
        <input
          type="text"
          name="nombre"
          value={data.nombre}
          onChange={handleChange}
          required
          className={errors.nombre ? "error" : ""}
        />
        {errors.nombre && (
          <span className="error-message">{errors.nombre}</span>
        )}
      </div>

      <div className="form-row">
        <label htmlFor="correo">Correo Electrónico</label>
        <input
          type="email"
          name="correo"
          value={data.correo}
          onChange={handleChange}
          required
          className={errors.correo ? "error" : ""}
        />
        {errors.correo && (
          <span className="error-message">{errors.correo}</span>
        )}
      </div>

      <div className="form-row">
        <label htmlFor="contrasena">Contraseña</label>
        <input
          type="password"
          name="contrasena"
          value={data.contrasena}
          onChange={handleChange}
          required
          className={errors.contrasena ? "error" : ""}
        />
        {errors.contrasena && (
          <span className="error-message">{errors.contrasena}</span>
        )}
      </div>

      <div className="form-row">
        <label htmlFor="confirmarContrasena">Confirmar Contraseña</label>
        <input
          type="password"
          name="confirmarContrasena"
          value={data.confirmarContrasena}
          onChange={handleChange}
          required
          className={errors.confirmarContrasena ? "error" : ""}
        />
        {errors.confirmarContrasena && (
          <span className="error-message">{errors.confirmarContrasena}</span>
        )}
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

export default UserDetails;

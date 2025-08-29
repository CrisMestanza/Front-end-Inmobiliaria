import React, { useState, useRef } from "react";
import {
  GoogleMap,
  useJsApiLoader,
  DrawingManager,
  Polygon,
} from "@react-google-maps/api";
import style from "../agregarInmo.module.css";

const defaultCenter = { lat: -6.4882, lng: -76.365629 };

export default function ProyectoModal({ onClose, idinmobilaria }) {
  const { isLoaded, loadError } = useJsApiLoader({
    id: "google-map-script",
    // googleMapsApiKey: "AIzaSyA0dsaDHTO3rx48cyq61wbhItaZ_sWcV94",
    googleMapsApiKey: "",
    libraries: ["drawing", "places"],
  });

  const [form, setForm] = useState({
    idinmobilaria: idinmobilaria,
    nombreproyecto: "",
    descripcion: "",
    latitud: "",
    longitud: "",
    puntos: [],
  });

  const mapRef = useRef(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handlePolygonComplete = (polygon) => {
    const path = polygon.getPath();
    const puntos = [];

    for (let i = 0; i < path.getLength(); i++) {
      const point = path.getAt(i);
      puntos.push({
        latitud: point.lat(),
        longitud: point.lng(),
        orden: i + 1,
      });
    }

    setForm((prev) => ({
      ...prev,
      puntos,
      latitud: puntos[0]?.latitud || "",
      longitud: puntos[0]?.longitud || "",
    }));

    // 👉 dejar el polígono en el mapa para edición
    polygon.setEditable(true);

    // 👉 escuchar cambios al mover/editar vértices
    const updatePath = () => {
      const updatedPuntos = [];
      for (let i = 0; i < path.getLength(); i++) {
        const point = path.getAt(i);
        updatedPuntos.push({
          latitud: point.lat(),
          longitud: point.lng(),
          orden: i + 1,
        });
      }
      setForm((prev) => ({ ...prev, puntos: updatedPuntos }));
    };

    // Escuchar eventos de edición
    window.google.maps.event.addListener(path, "insert_at", updatePath);
    window.google.maps.event.addListener(path, "remove_at", updatePath);
    window.google.maps.event.addListener(path, "set_at", updatePath);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Formulario antes de enviar:", form);
    const payload = {
      idinmobilaria: idinmobilaria,
      nombreproyecto: form.nombreproyecto,
      descripcion: form.descripcion,
      latitud: form.latitud,
      longitud: form.longitud,
      puntos: form.puntos,
    };

    console.log("Payload que envío:", payload);

    try {
      const res = await fetch(
        "https://apiinmo.y0urs.com/api/registerProyecto/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      if (res.ok) {
        alert("✅ Proyecto registrado con éxito");
        onClose();
      } else {
        const data = await res.json();
        console.error(data);
        alert("❌ Error al registrar proyecto");
      }
    } catch (err) {
      console.error(err);
      alert("🚫 Error de red");
    }
  };

  if (loadError) return <h2>Error cargando el mapa</h2>;
  if (!isLoaded) return <h2>Cargando mapa...</h2>;

  return (
    <div className={style.modalOverlay}>
      <div className={style.modalContent}>
        <button className={style.closeBtn} onClick={onClose}>
          ✖
        </button>

        <form className={style.formContainer} onSubmit={handleSubmit}>
          <h2 style={{ color: "black" }}>Registrar Proyecto</h2>

          <label>Nombre Proyecto:</label>
          <input
            name="nombreproyecto"
            value={form.nombreproyecto}
            onChange={handleChange}
            className={style.input}
            required
          />

          <label>Descripción:</label>
          <textarea
            name="descripcion"
            value={form.descripcion}
            onChange={handleChange}
            className={style.input}
            required
          />

          <h3 style={{ color: "black" }}>Ubicación y Área</h3>
          <p style={{ fontSize: "14px", color: "gray" }}>
            Dibuja en el mapa el polígono que representa tu proyecto.
          </p>

          <div style={{ height: "400px", marginBottom: "20px" }}>
            <GoogleMap
              mapContainerStyle={{ width: "100%", height: "100%" }}
              center={defaultCenter}
              zoom={13}
              onLoad={(map) => (mapRef.current = map)}
            >
              <DrawingManager
                options={{
                  drawingControl: true,
                  drawingControlOptions: {
                    position: window.google.maps.ControlPosition.TOP_CENTER,
                    drawingModes: ["polygon"],
                  },
                }}
                onPolygonComplete={handlePolygonComplete}
              />
              {form.puntos.length > 0 && (
                <Polygon
                  paths={form.puntos.map((p) => ({
                    lat: p.latitud,
                    lng: p.longitud,
                  }))}
                  options={{
                    fillColor: "#2196f3",
                    strokeColor: "#1976d2",
                    editable: true,
                  }}
                />
              )}
            </GoogleMap>
          </div>

          <button type="submit" className={style.submitBtn}>
            Guardar Proyecto
          </button>
        </form>
      </div>
    </div>
  );
}

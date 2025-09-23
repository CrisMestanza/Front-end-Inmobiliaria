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
    imagenes: [],
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

  const handleImagenesChange = (e) => {
    const newFiles = Array.from(e.target.files).map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));
    setForm({ ...form, imagenes: [...form.imagenes, ...newFiles] });
  };

  const removeImagen = (index) => {
    const imagenes = [...form.imagenes];
    URL.revokeObjectURL(imagenes[index].preview);
    imagenes.splice(index, 1);
    setForm({ ...form, imagenes });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Formulario antes de enviar:", form);

    try {
      // 👉 Usar FormData en lugar de JSON
      const formData = new FormData();
      formData.append("idinmobilaria", idinmobilaria);
      formData.append("nombreproyecto", form.nombreproyecto);
      formData.append("descripcion", form.descripcion);
      formData.append("latitud", form.latitud);
      formData.append("longitud", form.longitud);

      // Enviar puntos como JSON (convertido a string)
      formData.append("puntos", JSON.stringify(form.puntos));

      // Adjuntar imágenes
      form.imagenes.forEach((img) => {
        formData.append("imagenes", img.file);
      });

      const res = await fetch("http://127.0.0.1:8000/api/registerProyecto/", {
        method: "POST",
        body: formData, // 🚨 Importante: no poner headers "Content-Type"
      });

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

          <h3 style={{ color: "black" }}>Nombre del Proyecto</h3>
          <input
            name="nombreproyecto"
            value={form.nombreproyecto}
            onChange={handleChange}
            className={style.input}
            required
          />

          <h3 style={{ color: "black" }}>Descripción</h3>
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
          <h3 style={{ color: "black" }}>
            Imágenes Referenciales del Proyecto
          </h3>
          <input
            type="file"
            multiple
            onChange={handleImagenesChange}
            className={style.input}
          />
          <div className={style.previewContainer}>
            {form.imagenes.map((img, i) => (
              <div key={i} className={style.previewItem}>
                <img src={img.preview} alt={`preview-${i}`} />
                <button
                  type="button"
                  className={style.removeBtn}
                  onClick={() => removeImagen(i)}
                >
                  ❌
                </button>
              </div>
            ))}
          </div>

          <button type="submit" className={style.submitBtn}>
            Guardar Proyecto
          </button>
        </form>
      </div>
    </div>
  );
}

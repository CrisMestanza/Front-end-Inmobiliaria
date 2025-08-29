// components/LoteModal.jsx
import { useState, useEffect, useRef, useCallback } from "react";
import style from "../agregarInmo.module.css";

export default function LoteModal({ onClose, idproyecto }) {
  const [form, setForm] = useState({
    idtipoinmobiliaria: 0,
    nombre: "",
    precio: 0,
    latitud: "",
    longitud: "",
    descripcion: "",
    puntos: [],
    imagenes: [],
    vendido: 0,
  });

  const mapRef = useRef(null);
  const drawingRef = useRef(null);
  const [tipos, setTipos] = useState([]);

  // 👉 función para inicializar el mapa
  const initMap = useCallback(async () => {
    try {
      // 🔹 Obtener puntos del proyecto
      const resProyecto = await fetch(
        `https://apiinmo.y0urs.com/api/listPuntosProyecto/${idproyecto}`
      );
      const puntosProyecto = await resProyecto.json();

      if (!puntosProyecto.length) return;

      // 🔹 Crear mapa
      const map = new window.google.maps.Map(mapRef.current, {
        zoom: 16,
        center: {
          lat: parseFloat(puntosProyecto[0].latitud),
          lng: parseFloat(puntosProyecto[0].longitud),
        },
      });

      // 🔹 Dibujar polígono del proyecto
      const proyectoCoords = puntosProyecto.map((p) => ({
        lat: parseFloat(p.latitud),
        lng: parseFloat(p.longitud),
      }));

      new window.google.maps.Polygon({
        paths: proyectoCoords,
        map,
        strokeColor: "#0000FF",
        strokeWeight: 2,
        fillColor: "#0000FF",
        fillOpacity: 0.15,
      });

      // 🔹 Mostrar lotes existentes
      const resLotes = await fetch(
        `https://apiinmo.y0urs.com/api/getLoteProyecto/${idproyecto}`
      );
      const lotes = await resLotes.json();

      for (const lote of lotes) {
        const resPuntos = await fetch(
          `https://apiinmo.y0urs.com/api/listPuntos/${lote.idlote}`
        );
        const puntos = await resPuntos.json();
        if (!puntos.length) continue;

        // 🔹 Asegurar orden de puntos
        const loteCoords = puntos
          .sort((a, b) => a.orden - b.orden)
          .map((p) => ({
            lat: parseFloat(p.latitud),
            lng: parseFloat(p.longitud),
          }));

        // 🔹 Cerrar polígono
        if (loteCoords.length > 2) {
          loteCoords.push(loteCoords[0]);
        }

        // 🔹 Color según estado
        const getColorLote = (vendido) => {
          switch (vendido) {
            case 0:
              return "#00ff00"; // libre → verde
            case 1:
              return "#ff0000"; // vendido → rojo
            case 2:
              return "#ffff00"; // reservado → amarillo
            default:
              return "#808080"; // gris si no tiene estado
          }
        };

        new window.google.maps.Polygon({
          paths: loteCoords,
          map,
          strokeColor: "#333333",
          strokeWeight: 1,
          fillColor: getColorLote(lote.vendido),
          fillOpacity: 0.45,
        });
      }

      // 🔹 Drawing Manager para crear nuevos lotes
      const drawingManager = new window.google.maps.drawing.DrawingManager({
        drawingMode: window.google.maps.drawing.OverlayType.POLYGON,
        drawingControl: true,
        drawingControlOptions: {
          drawingModes: ["polygon"],
        },
        polygonOptions: {
          editable: true,
          draggable: true,
        },
      });
      drawingManager.setMap(map);
      drawingRef.current = drawingManager;

      // 🔹 Cuando terminan de dibujar lote
      window.google.maps.event.addListener(
        drawingManager,
        "overlaycomplete",
        (event) => {
          const path = event.overlay.getPath();
          const loteCoords = path.getArray().map((c, i) => ({
            latitud: c.lat(),
            longitud: c.lng(),
            orden: i + 1,
          }));

          // Validar si los puntos caen dentro del proyecto
          const proyectoPolygon = new window.google.maps.Polygon({
            paths: proyectoCoords,
          });

          const isInside = loteCoords.every((coord) =>
            window.google.maps.geometry.poly.containsLocation(
              new window.google.maps.LatLng(coord.latitud, coord.longitud),
              proyectoPolygon
            )
          );

          if (!isInside) {
            alert("El lote debe estar dentro del proyecto ❌");
            event.overlay.setMap(null);
            return;
          }

          // Guardar puntos y lat/lng de referencia
          setForm((prev) => ({
            ...prev,
            puntos: loteCoords,
            latitud: loteCoords[0]?.latitud || "",
            longitud: loteCoords[0]?.longitud || "",
            vendido: 0,
          }));

          // Hacer editable el polígono
          event.overlay.setEditable(true);

          // 🔹 Listener para actualizar si mueven vértices
          const updatePath = () => {
            const updated = path.getArray().map((c, i) => ({
              latitud: c.lat(),
              longitud: c.lng(),
              orden: i + 1,
            }));
            setForm((prev) => ({
              ...prev,
              puntos: updated,
              latitud: updated[0]?.latitud || "",
              longitud: updated[0]?.longitud || "",
            }));
          };

          window.google.maps.event.addListener(path, "insert_at", updatePath);
          window.google.maps.event.addListener(path, "remove_at", updatePath);
          window.google.maps.event.addListener(path, "set_at", updatePath);
        }
      );
    } catch (err) {
      console.error("Error cargando mapa:", err);
    }
  }, [idproyecto]);

  // 👉 cargar script de Google Maps una sola vez
  useEffect(() => {
    const existingScript = document.getElementById("google-maps-script");

    if (!existingScript) {
      const script = document.createElement("script");
      script.id = "google-maps-script";
      script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyA0dsaDHTO3rx48cyq61wbhItaZ_sWcV94&libraries=drawing,geometry`;
      script.async = true;
      script.defer = true;
      script.onload = initMap;
      document.body.appendChild(script);
    } else {
      if (window.google) initMap();
    }
  }, [initMap]);

  // 🔹 Traer tipos de inmobiliaria
  useEffect(() => {
    const fetchTipos = async () => {
      try {
        const res = await fetch(
          "https://apiinmo.y0urs.com/api/listTipoInmobiliaria/"
        );
        const data = await res.json();
        setTipos(data);
        if (data.length > 0) {
          setForm((prev) => ({
            ...prev,
            idtipoinmobiliaria: parseInt(data[0].idtipoinmobiliaria, 10),
          }));
        }
      } catch (err) {
        console.error("Error al cargar tipos:", err);
      }
    };
    fetchTipos();
  }, []);

  // Handlers simples
  const handleTipoChange = (e) =>
    setForm({ ...form, idtipoinmobiliaria: parseInt(e.target.value, 10) });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({
      ...form,
      [name]:
        name === "precio"
          ? parseFloat(value) >= 0
            ? parseFloat(value)
            : 0
          : value,
    });
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

  // 🔹 Liberar URLs temporales al desmontar
  useEffect(() => {
    return () => {
      form.imagenes.forEach((img) => URL.revokeObjectURL(img.preview));
    };
  }, [form.imagenes]);

  // 🔹 Enviar datos al back
  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("idproyecto", idproyecto);
    formData.append("idtipoinmobiliaria", form.idtipoinmobiliaria.toString());
    formData.append("nombre", form.nombre);
    formData.append("precio", form.precio.toString());
    formData.append("latitud", form.latitud);
    formData.append("longitud", form.longitud);
    formData.append("descripcion", form.descripcion);
    formData.append("puntos", JSON.stringify(form.puntos));
    formData.append("vendido", form.vendido.toString());
    form.imagenes.forEach((img) => {
      formData.append("imagenes", img.file);
    });

    try {
      const res = await fetch("https://apiinmo.y0urs.com/api/registerLote/", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        alert("Lote registrado ✅");
        onClose();
      } else {
        const data = await res.json();
        console.error(data);
        alert("Error al registrar ❌");
      }
    } catch (err) {
      console.error(err);
      alert("Error de red 🚫");
    }
  };

  return (
    <div className={style.modalOverlay}>
      <div className={style.modalContent}>
        <button className={style.closeBtn} onClick={onClose}>
          ✖
        </button>
        <form className={style.formContainer} onSubmit={handleSubmit}>
          <h2 style={{ color: "black" }}>Registrar Lote</h2>

          <div
            ref={mapRef}
            style={{ width: "100%", height: "300px", marginBottom: "1rem" }}
          />

          <label>Tipo:</label>
          <select
            name="idtipoinmobiliaria"
            value={form.idtipoinmobiliaria}
            onChange={handleTipoChange}
            className={style.input}
          >
            {tipos.map((t) => (
              <option key={t.idtipoinmobiliaria} value={t.idtipoinmobiliaria}>
                {t.nombre}
              </option>
            ))}
          </select>

          <label>Nombre:</label>
          <input
            name="nombre"
            value={form.nombre}
            onChange={handleChange}
            className={style.input}
          />

          <label>Precio:</label>
          <input
            name="precio"
            type="number"
            min="0"
            value={form.precio}
            onChange={handleChange}
            className={style.input}
          />

          <label>Latitud:</label>
          <input
            name="latitud"
            value={form.latitud}
            readOnly
            className={style.input}
          />

          <label>Longitud:</label>
          <input
            name="longitud"
            value={form.longitud}
            readOnly
            className={style.input}
          />

          <label>Descripción:</label>
          <textarea
            name="descripcion"
            value={form.descripcion}
            onChange={handleChange}
            className={style.input}
          ></textarea>

          <h3>Imágenes</h3>
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
            Enviar
          </button>
        </form>
      </div>
    </div>
  );
}

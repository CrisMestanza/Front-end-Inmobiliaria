// components/IconoModal.jsx
import { useState, useEffect, useRef, useCallback } from "react";
import style from "../../agregarInmo.module.css";

let googleMapsLoader = null;

export default function IconoModal({ onClose, idproyecto }) {
  const mapRef = useRef(null);
  const proyectoPolygonRef = useRef(null);
  const [map, setMap] = useState(null);
  const [iconosDisponibles, setIconosDisponibles] = useState([]);
  const [iconosMapa, setIconosMapa] = useState([]);
  const [draggedIcono, setDraggedIcono] = useState(null);

  const loadGoogleMapsScript = useCallback(() => {
    if (googleMapsLoader) return googleMapsLoader;
    googleMapsLoader = new Promise((resolve, reject) => {
      if (window.google?.maps) return resolve(window.google.maps);
      const script = document.createElement("script");
      script.src =
        "https://maps.googleapis.com/maps/api/js?key=AIzaSyA0dsaDHTO3rx48cyq61wbhItaZ_sWcV94&libraries=drawing,geometry&loading=async";
      script.async = true;
      script.defer = true;
      script.onload = () =>
        window.google?.maps
          ? resolve(window.google.maps)
          : reject(new Error("Google Maps API not available."));
      script.onerror = reject;
      document.body.appendChild(script);
    });
    return googleMapsLoader;
  }, []);

  const initMap = useCallback(async () => {
    try {
      await loadGoogleMapsScript();
      if (!mapRef.current) return;
      const resProyecto = await fetch(
        `http://127.0.0.1:8000/api/listPuntosProyecto/${idproyecto}`
      );
      const puntosProyecto = await resProyecto.json();
      if (!puntosProyecto.length) return;

      const mapInstance = new window.google.maps.Map(mapRef.current, {
        zoom: 16,
        center: {
          lat: parseFloat(puntosProyecto[0].latitud),
          lng: parseFloat(puntosProyecto[0].longitud),
        },
      });

      const overlay = new window.google.maps.OverlayView();
      overlay.onAdd = function () {};
      overlay.draw = function () {};
      overlay.onRemove = function () {};
      overlay.setMap(mapInstance);

      setMap({ mapInstance, overlay });
    } catch (error) {
      console.error("Error initializing the map:", error);
    }
  }, [idproyecto, loadGoogleMapsScript]);

  useEffect(() => {
    if (!map) return;
    const loadProjectGeometries = async () => {
      try {
        const resProyecto = await fetch(
          `http://127.0.0.1:8000/api/listPuntosProyecto/${idproyecto}`
        );
        const puntosProyecto = await resProyecto.json();
        const proyectoCoords = puntosProyecto.map((p) => ({
          lat: parseFloat(p.latitud),
          lng: parseFloat(p.longitud),
        }));

        const proyectoPolygon = new window.google.maps.Polygon({
          paths: proyectoCoords,
          map: map.mapInstance,
          strokeColor: "#0000FF",
          strokeWeight: 2,
          fillColor: "#0000FF",
          fillOpacity: 0.15,
        });
        proyectoPolygonRef.current = proyectoPolygon;

        const resLotes = await fetch(
          `http://127.0.0.1:8000/api/getLoteProyecto/${idproyecto}`
        );
        const lotes = await resLotes.json();

        for (const lote of lotes) {
          const resPuntos = await fetch(
            `http://127.0.0.1:8000/api/listPuntos/${lote.idlote}`
          );
          const puntos = await resPuntos.json();
          if (!puntos.length) continue;

          const loteCoords = puntos
            .sort((a, b) => a.orden - b.orden)
            .map((p) => ({
              lat: parseFloat(p.latitud),
              lng: parseFloat(p.longitud),
            }));

          if (loteCoords.length > 2) loteCoords.push(loteCoords[0]);

          const getColorLote = (vendido) => {
            switch (vendido) {
              case 0:
                return "#00ff00";
              case 1:
                return "#ff0000";
              case 2:
                return "#ffff00";
              default:
                return "#808080";
            }
          };

          new window.google.maps.Polygon({
            paths: loteCoords,
            map: map.mapInstance,
            strokeColor: "#333",
            strokeWeight: 1,
            fillColor: getColorLote(lote.vendido),
            fillOpacity: 0.45,
          });
        }

        // 👉 Ahora cargamos los íconos ya registrados
        const resIconosProyecto = await fetch(
          `http://127.0.0.1:8000/api/list_iconos_proyecto/${idproyecto}`
        );
        const iconosRegistrados = await resIconosProyecto.json();
        const nuevosIconos = iconosRegistrados.map((ico) => {
          const marker = new window.google.maps.Marker({
            position: {
              lat: parseFloat(ico.latitud),
              lng: parseFloat(ico.longitud),
            },
            map: map.mapInstance,
            icon: {
              url: `http://127.0.0.1:8000${ico.icono_detalle.imagen}`,
              scaledSize: new window.google.maps.Size(40, 40),
            },
            draggable: true,
            title: ico.icono_detalle.nombre,
          });

          return {
            idicono: ico.idicono,
            latitud: ico.latitud,
            longitud: ico.longitud,
            marker,
            icono_detalle: ico.icono_detalle,
            saved: true,
          };
        });

        setIconosMapa((prev) => {
          prev.forEach((ic) => ic.marker?.setMap(null));
          return nuevosIconos;
        });
      } catch (error) {
        console.error("Error loading project geometry:", error);
      }
    };
    loadProjectGeometries();
  }, [map, idproyecto]);

  useEffect(() => {
    initMap();
  }, [initMap]);

  const handleDrop = (e) => {
    e.preventDefault();
    if (!draggedIcono || !map || !proyectoPolygonRef.current) return;

    const projection = map.overlay.getProjection();
    const pixelPoint = new window.google.maps.Point(
      e.nativeEvent.offsetX,
      e.nativeEvent.offsetY
    );
    const latLng = projection.fromContainerPixelToLatLng(pixelPoint);

    // Validar si está dentro del polígono
    if (
      !window.google.maps.geometry.poly.containsLocation(
        latLng,
        proyectoPolygonRef.current
      )
    ) {
      alert("⚠️ Solo puedes colocar íconos dentro del proyecto.");
      return;
    }

    // Crear marker
    const marker = new window.google.maps.Marker({
      position: latLng,
      map: map.mapInstance,
      icon: {
        url: `http://127.0.0.1:8000${draggedIcono.imagen}`,
        scaledSize: new window.google.maps.Size(40, 40),
      },
      draggable: true,
    });

    setIconosMapa((prev) => {
      const existe = prev.some((ic) => ic.idicono === payloadIcono.idicono);
      if (existe) return prev; // evita duplicados
      return [...prev, payloadIcono];
    });

    // Objeto listo para enviar al backend ✅
    const payloadIcono = {
      idicono:
        draggedIcono.idicono ??
        draggedIcono.idiconos ??
        draggedIcono?.idicono?.idicono,
      latitud: latLng.lat(),
      longitud: latLng.lng(),
      marker,
      icono_detalle: {
        idicono: draggedIcono.idicono ?? draggedIcono.idiconos,
        nombre: draggedIcono.nombre,
        imagen: draggedIcono.imagen,
      },
      saved: false,
    };

    setIconosMapa((prev) => {
      const existe = prev.some(
        (ic) =>
          ic.idicono === payloadIcono.idicono &&
          ic.latitud === payloadIcono.latitud &&
          ic.longitud === payloadIcono.longitud
      );
      if (existe) return prev;
      return [...prev, payloadIcono];
    });

    // Actualizar coordenadas si se mueve
    window.google.maps.event.addListener(marker, "dragend", (ev) => {
      const newLatLng = ev.latLng;
      if (
        !window.google.maps.geometry.poly.containsLocation(
          newLatLng,
          proyectoPolygonRef.current
        )
      ) {
        alert("⚠️ No puedes mover el ícono fuera del proyecto.");
        marker.setPosition(latLng);
      } else {
        setIconosMapa((prev) =>
          prev.map((ic) =>
            ic === payloadIcono
              ? {
                  ...ic,
                  latitud: newLatLng.lat(),
                  longitud: newLatLng.lng(),
                }
              : ic
          )
        );
        payloadIcono.latitud = newLatLng.lat();
        payloadIcono.longitud = newLatLng.lng();
      }
    });
  };

  useEffect(() => {
    const fetchIconos = async () => {
      const res = await fetch("http://127.0.0.1:8000/api/listIconos/");
      const data = await res.json();
      setIconosDisponibles(data);
    };
    fetchIconos();
  }, []);

  const handleGuardar = async () => {
    const payload = iconosMapa
      .filter((icono) => !icono.saved)
      .map((icono) => ({
        idproyecto,
        idicono: icono.idicono,
        latitud: parseFloat(icono.latitud),
        longitud: parseFloat(icono.longitud),
        estado: 1,
      }))
      .filter(
        (icono, idx, arr) =>
          idx ===
          arr.findIndex(
            (i) =>
              i.idicono === icono.idicono &&
              i.latitud === icono.latitud &&
              i.longitud === icono.longitud
          )
      );

    await fetch("http://127.0.0.1:8000/api/add_iconos_proyecto/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    alert("Íconos guardados ✅");
    onClose();
  };
  return (
    <div className={style.modalOverlay}>
      <div className={style.modalContent}>
        <button className={style.closeBtn} onClick={onClose}>
          ✖
        </button>
        <h2 style={{ color: "black" }}>Arrastra los Íconos a tu Proyecto</h2>
        <div
          style={{
            display: "flex",
            gap: "10px",
            marginBottom: "10px",
            flexWrap: "wrap",
          }}
        >
          {iconosDisponibles.map((ico) => (
            <img
              key={ico.idicono}
              src={`http://127.0.0.1:8000${ico.imagen}`}
              alt={ico.nombre}
              title={ico.nombre}
              draggable
              onDragStart={() => setDraggedIcono(ico)}
              style={{ width: 40, height: 40, cursor: "grab" }}
            />
          ))}
        </div>
        {/* Lista de íconos ya registrados */}
        <div style={{ margin: "10px 0" }}>
          <h3 style={{ color: "black" }}>
            Íconos registrados en este proyecto:
          </h3>
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            {iconosMapa.map((ico, idx) => {
              // const imagen =
              //   ico.icono_detalle?.imagen ||
              //   iconosDisponibles.find((i) => i.idicono === ico.idicono)
              //     ?.imagen;

              // const nombre =
              //   ico.icono_detalle?.nombre ||
              //   iconosDisponibles.find((i) => i.idicono === ico.idicono)
              //     ?.nombre;

              return (
                //   <img
                //     key={idx}
                //     src={`http://127.0.0.1:8000${imagen}`}
                //     alt={nombre}
                //     title={nombre}
                //     style={{ width: 30, height: 30 }}
                //   />
                // );
                <img
                  key={idx}
                  src={`http://127.0.0.1:8000${ico.icono_detalle.imagen}`}
                  alt={ico.icono_detalle.nombre}
                  title={ico.icono_detalle.nombre}
                  style={{ width: 30, height: 30 }}
                />
              );
            })}
            {!iconosMapa.length && (
              <p style={{ color: "gray" }}>No hay íconos aún</p>
            )}
          </div>
        </div>

        <div
          ref={mapRef}
          style={{ width: "100%", height: "400px", marginBottom: "1rem" }}
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
        />
        <button className={style.submitBtn} onClick={handleGuardar}>
          Guardar Íconos
        </button>
      </div>
    </div>
  );
}

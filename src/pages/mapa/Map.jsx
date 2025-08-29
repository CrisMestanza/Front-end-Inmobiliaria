import React, { useState, useEffect, useRef } from "react";
import {
  GoogleMap,
  useJsApiLoader,
  Marker,
  DirectionsRenderer,
} from "@react-google-maps/api";

import ProyectoSidebar from "./MapSidebarProyecto";
import MapSidebar from "./MapSidebar";
import MapMarker from "./MapMarker";
import MapButtons from "./MapButtons";
import PolygonOverlay from "./PolygonOverlay";
import styles from "./Mapa.module.css";

const defaultCenter = { lat: -6.4882, lng: -76.365629 };

const RANGOS_PRECIO = [
  { label: "S/. 5,000 - 15,000", value: "5000-15000" },
  { label: "S/. 15,001 - 35,000", value: "15001-35000" },
  { label: "S/. 35,001 - 80,000", value: "35001-80000" },
  { label: "S/. 80,001 - 150,000", value: "80001-150000" },
  { label: "S/. 150,001 - 250,000", value: "150001-250000" },
  { label: "S/. 250,001 - más", value: "250001-mas" },
];

function MyMap() {
  const { isLoaded, loadError } = useJsApiLoader({
    id: "google-map-script",
    // googleMapsApiKey: "",
    googleMapsApiKey: "AIzaSyA0dsaDHTO3rx48cyq61wbhItaZ_sWcV94",
    libraries: ["places"],
  });

  const [currentPosition, setCurrentPosition] = useState(defaultCenter);
  const [tiposInmo, setTiposInmo] = useState([]);
  const [selectedTipo, setSelectedTipo] = useState("");
  const [selectedRango, setSelectedRango] = useState("");
  const [proyecto, setProyecto] = useState([]);
  const [selectedProyecto, setselectedProyecto] = useState(null);
  const [lotesProyecto, setLotesProyecto] = useState([]);
  // const [lotes, setLotes] = useState([]);
  const [selectedLote, setSelectedLote] = useState(null);
  const [routeMode, setRouteMode] = useState(null);
  const [directions, setDirections] = useState(null);
  const [imagenes, setImagenes] = useState([]);
  const [puntos, setPuntos] = useState([]);
  const [showFilters, setShowFilters] = useState(true);
  const [hoveredLote, setHoveredLote] = useState(null);

  // ⚡ FIX: Add the missing state variables here ⚡
  const [walkingInfo, setWalkingInfo] = useState(null);
  const [drivingInfo, setDrivingInfo] = useState(null);

  const mapRef = useRef(null);
  const inputRef = useRef(null);

  // Geolocalización
  useEffect(() => {
    navigator.geolocation?.getCurrentPosition(
      (pos) =>
        setCurrentPosition({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        }),
      () => console.warn("Permiso de ubicación denegado.")
    );
  }, []);

  useEffect(() => {
    if (!selectedProyecto) return;

    // 1. Obtener los lotes del proyecto
    fetch(
      `http://127.0.0.1:8000/api/getLoteProyecto/${selectedProyecto.idproyecto}`
    )
      .then((res) => res.json())
      .then(async (lotes) => {
        // 2. Para cada lote, obtener sus puntos
        const lotesConPuntos = await Promise.all(
          lotes.map(async (lote) => {
            const resPuntos = await fetch(
              `http://127.0.0.1:8000/api/listPuntos/${lote.idlote}`
            );
            const puntos = await resPuntos.json();
            return { ...lote, puntos };
          })
        );

        setLotesProyecto(lotesConPuntos);
      })
      .catch(console.error);
  }, [selectedProyecto]);

  // Tipos de inmobiliaria
  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/listTipoInmobiliaria/")
      .then((res) => res.json())
      .then(setTiposInmo)
      .catch(console.error);
  }, []);

  // Filtro combinado
  useEffect(() => {
    if (selectedRango) {
      fetch(`http://127.0.0.1:8000/api/rangoPrecio/${selectedRango}`)
        .then((res) => res.json())
        .then(setProyecto)
        .catch(console.error);
    } else if (selectedTipo) {
      fetch(`http://127.0.0.1:8000/api/lote/${selectedTipo}`)
        .then((res) => res.json())
        .then(setProyecto)
        .catch(console.error);
    } else {
      fetch("http://127.0.0.1:8000/api/listProyectos/")
        .then((res) => res.json())
        .then(setProyecto)
        .catch(console.error);
    }
  }, [selectedTipo, selectedRango]);

  const handleTipoChange = (tipoId) => {
    setSelectedTipo((prev) => (prev === tipoId ? "" : tipoId));
  };

  const handleRangoChange = (rangoValue) => {
    setSelectedRango((prev) => (prev === rangoValue ? "" : rangoValue));
  };

  const calculateInfo = (mode, proyecto) => {
    const service = new window.google.maps.DirectionsService();
    service.route(
      {
        origin: currentPosition,
        destination: {
          lat: parseFloat(proyecto.latitud),
          lng: parseFloat(proyecto.longitud),
        },
        travelMode: mode,
      },
      (result, status) => {
        if (status === "OK") {
          const leg = result.routes[0].legs[0];
          const info = {
            distance: leg.distance.text,
            duration: leg.duration.text,
          };
          if (mode === "WALKING") setWalkingInfo(info);
          if (mode === "DRIVING") setDrivingInfo(info);
        }
      }
    );
  };

  const handleLoteClick = async (lote) => {
    // Obtener info del lote
    const resLote = await fetch(
      `http://127.0.0.1:8000/api/getLoteProyecto/${lote.idproyecto}`
    );
    const lotes = await resLote.json();
    const loteCompleto = lotes.find((l) => l.idlote === lote.idlote);

    // Obtener puntos del lote
    const resPuntos = await fetch(
      `http://127.0.0.1:8000/api/listPuntos/${lote.idlote}`
    );
    const puntos = await resPuntos.json();

    if (mapRef.current) {
      mapRef.current.panTo({
        lat: parseFloat(lote.latitud),
        lng: parseFloat(lote.longitud),
      });
      mapRef.current.setZoom(22); // acercar al lote
    }
    // Aquí creamos el objeto para Sidebar
    setSelectedLote({
      lote: { ...loteCompleto, puntos },
      inmo: loteCompleto.tipoinmobiliaria,
    });
  };

  const handleMarkerClick = async (proyecto) => {
    try {
      setRouteMode(null);
      setDirections(null);
      setWalkingInfo(null);
      setDrivingInfo(null);

      calculateInfo("WALKING", proyecto);
      calculateInfo("DRIVING", proyecto);

      // 🔹 Traer puntos del proyecto
      const resPuntos = await fetch(
        `http://127.0.0.1:8000/api/listPuntosProyecto/${proyecto.idproyecto}`
      );
      const dataPuntos = await resPuntos.json();
      setPuntos(dataPuntos);
      if (dataPuntos.length > 0 && mapRef.current) {
        const bounds = new window.google.maps.LatLngBounds();
        dataPuntos.forEach((p) =>
          bounds.extend({
            lat: parseFloat(p.latitud),
            lng: parseFloat(p.longitud),
          })
        );
        mapRef.current.fitBounds(bounds);
      }

      // 🔹 Traer lotes
      const resLotes = await fetch(
        `http://127.0.0.1:8000/api/getLoteProyecto/${proyecto.idproyecto}`
      );
      const dataLotes = await resLotes.json();
      setLotesProyecto(dataLotes);

      // 🔹 Traer inmobiliaria
      const resInmo = await fetch(
        `http://127.0.0.1:8000/api/getImobiliaria/${proyecto.idinmobilaria}`
      );
      const inmoData = await resInmo.json();

      // 🚀 Guardar TODO junto
      setselectedProyecto({
        ...proyecto,
        inmo: inmoData[0] ?? null,
      });
    } catch (err) {
      console.error("Error cargando inmobiliaria:", err);
    }
  };

  // const handleShowRoute = (mode) => {
  //   setRouteMode(mode);
  //   const service = new window.google.maps.DirectionsService();
  //   service.route(
  //     {
  //       origin: currentPosition,
  //       destination: {
  //         lat: parseFloat(selectedProyecto.latitud),
  //         lng: parseFloat(selectedProyecto.longitud),
  //       },
  //       travelMode: mode,
  //     },
  //     (result, status) => {
  //       if (status === "OK") setDirections(result);
  //     }
  //   );
  // };

  useEffect(() => {
    if (isLoaded && inputRef.current) {
      const autocomplete = new window.google.maps.places.Autocomplete(
        inputRef.current
      );
      autocomplete.addListener("place_changed", () => {
        const place = autocomplete.getPlace();
        if (place.geometry) {
          const location = {
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng(),
          };
          setCurrentPosition(location);
          if (mapRef.current) {
            if (place.geometry.viewport) {
              mapRef.current.fitBounds(place.geometry.viewport);
            } else {
              mapRef.current.panTo(location);
              mapRef.current.setZoom(18);
            }
          }
        }
      });
    }
  }, [isLoaded]);

  if (loadError) return <h2>Error: {JSON.stringify(loadError)}</h2>;
  if (!isLoaded) return <h2>Cargando mapa...</h2>;

  // 🔹 Función para oscurecer un color HEX
  const darkenColor = (hex, amount = 0.2) => {
    let c = hex.replace("#", "");
    if (c.length === 8) c = c.substring(0, 6); // quitar alpha si hay

    let num = parseInt(c, 16);
    let r = (num >> 16) & 0xff;
    let g = (num >> 8) & 0xff;
    let b = num & 0xff;

    r = Math.max(0, Math.floor(r * (1 - amount)));
    g = Math.max(0, Math.floor(g * (1 - amount)));
    b = Math.max(0, Math.floor(b * (1 - amount)));

    return `rgb(${r},${g},${b})`;
  };

  const getColorLote = (estado, hovered) => {
    let baseColor;
    switch (estado) {
      case 0:
        baseColor = "#00ff00";
        break; // libre → verde
      case 1:
        baseColor = "#ff0000";
        break; // vendido → rojo
      case 2:
        baseColor = "#ffff00";
        break; // reservado → amarillo
      default:
        baseColor = "#808080"; // gris
    }

    return hovered ? darkenColor(baseColor, 0.3) : baseColor;
  };

  return (
    <div className={styles.container}>
      <input
        type="text"
        placeholder="Buscar ubicación..."
        ref={inputRef}
        className={styles.searchBox}
      />

      {showFilters && (
        <div className={styles.filterPanel}>
          <button
            className={styles.closeBtn}
            onClick={() => setShowFilters(false)}
          >
            ⬅️ Ocultar filtro
          </button>

          <div className={styles.filterBoxTipo}>
            <label>QUIERO VER:</label>
            {tiposInmo.map((tipo) => (
              <label
                className={styles.checkboxLabel}
                key={tipo.idtipoinmobiliaria}
              >
                <input
                  className={styles.checkboxInput}
                  type="checkbox"
                  checked={selectedTipo === tipo.idtipoinmobiliaria}
                  onChange={() => handleTipoChange(tipo.idtipoinmobiliaria)}
                />
                {tipo.nombre}
              </label>
            ))}
          </div>

          <div className={styles.filterBoxPrecio}>
            <label>RANGO PRECIOS:</label>
            {RANGOS_PRECIO.map((rango) => (
              <label className={styles.checkboxLabel} key={rango.value}>
                <input
                  className={styles.checkboxInput}
                  type="checkbox"
                  name="rangoPrecio"
                  checked={selectedRango === rango.value}
                  onChange={() => handleRangoChange(rango.value)}
                />
                {rango.label}
              </label>
            ))}
          </div>
        </div>
      )}

      {!showFilters && (
        <button className={styles.openBtn} onClick={() => setShowFilters(true)}>
          -➤
        </button>
      )}

      <GoogleMap
        mapContainerClassName={styles.map}
        center={currentPosition}
        zoom={13}
        onLoad={(map) => (mapRef.current = map)}
        options={{
          gestureHandling: "greedy",
          zoomControl: true,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
        }}
      >
        {/* 📍 marcador central si no hay puntos */}
        {puntos.length === 0 && <Marker position={currentPosition} />}

        {/* 📍 proyectos (sin los que ya están seleccionados) */}
        {proyecto
          .filter(
            (proyecto) =>
              !(
                selectedProyecto &&
                puntos.length > 0 &&
                selectedProyecto.idproyecto === proyecto.idproyecto
              )
          )
          .map((proyecto) => (
            <MapMarker
              key={proyecto.idproyecto}
              proyecto={proyecto}
              onClick={handleMarkerClick}
            />
          ))}

        {lotesProyecto
          .filter((lote) =>
            selectedLote ? lote.idlote === selectedLote.lote.idlote : true
          )
          .map((lote) => (
            <PolygonOverlay
              key={lote.idlote}
              puntos={lote.puntos}
              color={getColorLote(lote.vendido, hoveredLote === lote.idlote)}
              onClick={() => handleLoteClick(lote)}
              onMouseOver={() => setHoveredLote(lote.idlote)}
              onMouseOut={() => setHoveredLote(null)}
              label={hoveredLote === lote.idlote ? lote.nombre : null}
            />
          ))}

        {/* 🚙 direcciones */}
        {directions && <DirectionsRenderer directions={directions} />}

        {/* 🟦 polígono en edición (proyecto actual) */}
        {puntos.length > 0 && (
          <PolygonOverlay puntos={puntos} color="#38e8ffff" showLados={false} />
        )}
      </GoogleMap>

      {selectedProyecto && (
        <ProyectoSidebar
          inmo={selectedProyecto?.inmo}
          proyecto={selectedProyecto}
          imagenes={imagenes}
          walkingInfo={walkingInfo}
          drivingInfo={drivingInfo}
          onClose={() => {
            setselectedProyecto(null);
            setDirections(null);
            setWalkingInfo(null);
            setDrivingInfo(null);
            setRouteMode(null);
            setImagenes([]);
            setPuntos([]);
            setLotesProyecto([]);
          }}
        />
      )}

      {selectedLote && (
        <MapSidebar
          lote={selectedLote.lote}
          inmo={selectedLote.inmo}
          imagenes={imagenes}
          walkingInfo={walkingInfo}
          drivingInfo={drivingInfo}
          onClose={() => {
            setSelectedLote(null);
            setLotesProyecto((prev) => [...prev]);
          }}
        />
      )}
    </div>
  );
}

export default React.memo(MyMap);

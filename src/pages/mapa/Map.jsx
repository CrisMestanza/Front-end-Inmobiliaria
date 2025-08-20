import React, { useState, useEffect, useRef } from "react";
import {
  GoogleMap,
  useJsApiLoader,
  Marker,
  DirectionsRenderer,
} from "@react-google-maps/api";

import MapSidebar from "./MapSidebar";
import InfoTop from "./InfoTop";
import MapMarker from "./MapMarker";
import MapButtons from "./MapButtons";
import PolygonOverlay from "./PolygonOverlay";
import styles from "./Mapa.module.css";

const defaultCenter = { lat: -12.0464, lng: -77.0428 };

const RANGOS_PRECIO = [
  { label: "S/. 5,000 - 15,000", value: "5000-15000" },
  { label: "S/. 15,001 - 35,000", value: "15001-35000" },
  // { label: "S/. 25,001 - 35,000", value: "25001-35000" },
  { label: "S/. 35,001 - 80,000", value: "35001-80000" },
  // { label: "S/. 50,001 - 80,000", value: "50001-80000" },
  { label: "S/. 80,001 - 150,000", value: "80001-150000" },
  { label: "S/. 150,001 - 250,000", value: "150001-250000" },
  { label: "S/. 250,001 - más", value: "250001-mas" },
];

function MyMap() {
  const { isLoaded, loadError } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: "AIzaSyA0dsaDHTO3rx48cyq61wbhItaZ_sWcV94",
    libraries: ["places"],
  });

  const [currentPosition, setCurrentPosition] = useState(defaultCenter);
  const [tiposInmo, setTiposInmo] = useState([]);
  const [selectedTipo, setSelectedTipo] = useState("");
  const [selectedRango, setSelectedRango] = useState("");
  const [lotes, setLotes] = useState([]);
  const [selectedLote, setSelectedLote] = useState(null);
  const [routeMode, setRouteMode] = useState(null);
  const [directions, setDirections] = useState(null);
  const [walkingInfo, setWalkingInfo] = useState(null);
  const [drivingInfo, setDrivingInfo] = useState(null);
  const [imagenes, setImagenes] = useState([]);
  const [puntos, setPuntos] = useState([]);
  const [showFilters, setShowFilters] = useState(true);

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

  // Tipos de inmobiliaria
  useEffect(() => {
    fetch("https://apiinmo.y0urs.com/api/listTipoInmobiliaria/")
      .then((res) => res.json())
      .then(setTiposInmo)
      .catch(console.error);
  }, []);

  // Filtro combinado
  useEffect(() => {
    if (selectedRango) {
      fetch(`https://apiinmo.y0urs.com/api/rangoPrecio/${selectedRango}`)
        .then((res) => res.json())
        .then(setLotes)
        .catch(console.error);

    } else if (selectedTipo) {
      fetch(`https://apiinmo.y0urs.com/api/lote/${selectedTipo}`)
        .then((res) => res.json())
        .then(setLotes)
        .catch(console.error);

    } else {
      fetch("https://apiinmo.y0urs.com/api/listLotes/")
        .then((res) => res.json())
        .then(setLotes)
        .catch(console.error);
    }
  }, [selectedTipo, selectedRango]);

  const handleTipoChange = (tipoId) => {
    setSelectedTipo((prev) => (prev === tipoId ? "" : tipoId));
  };


  const handleRangoChange = (rangoValue) => {
    // 👇 Lógica para deseleccionar radio
    setSelectedRango((prev) => (prev === rangoValue ? "" : rangoValue));
  };

  const calculateInfo = (mode, lote) => {
    const service = new window.google.maps.DirectionsService();
    service.route(
      {
        origin: currentPosition,
        destination: {
          lat: parseFloat(lote.latitud),
          lng: parseFloat(lote.longitud),
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

  const handleMarkerClick = (lote) => {
    setSelectedLote(lote);
    setRouteMode(null);
    setDirections(null);
    setWalkingInfo(null);
    setDrivingInfo(null);

    calculateInfo("WALKING", lote);
    calculateInfo("DRIVING", lote);

    fetch(`https://apiinmo.y0urs.com/api/list_imagen/${lote.idlote}`)
      .then((res) => res.json())
      .then(setImagenes)
      .catch(console.error);

    fetch(`https://apiinmo.y0urs.com/api/listPuntos/${lote.idlote}`)
      .then((res) => res.json())
      .then((data) => {
        setPuntos(data);
        if (data.length > 0 && mapRef.current) {
          const bounds = new window.google.maps.LatLngBounds();
          data.forEach((p) =>
            bounds.extend({
              lat: parseFloat(p.latitud),
              lng: parseFloat(p.longitud),
            })
          );
          mapRef.current.fitBounds(bounds);
        }
      })
      .catch(console.error);
  };

  const handleShowRoute = (mode) => {
    setRouteMode(mode);
    const service = new window.google.maps.DirectionsService();
    service.route(
      {
        origin: currentPosition,
        destination: {
          lat: parseFloat(selectedLote.latitud),
          lng: parseFloat(selectedLote.longitud),
        },
        travelMode: mode,
      },
      (result, status) => {
        if (status === "OK") setDirections(result);
      }
    );
  };

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
            // 🔹 Ajusta automáticamente la vista según el tamaño del lugar
            mapRef.current.fitBounds(place.geometry.viewport);
          } else {
            // 🔹 Caso puntual (ej. dirección específica)
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
        <button
          className={styles.openBtn}
          onClick={() => setShowFilters(true)}
        >
          -➤
        </button>
      )}

      {selectedLote && (
        <InfoTop walkingInfo={walkingInfo} drivingInfo={drivingInfo} />
      )}

      <GoogleMap
        mapContainerClassName={styles.map}
        center={currentPosition}
        zoom={13}
        onLoad={(map) => (mapRef.current = map)}
        options={{
          gestureHandling: "greedy", // Permite mover con un dedo en móvil
          zoomControl: true,      
          mapTypeControl: false,      
          streetViewControl: false,   
          fullscreenControl: false,
          
        }}
      >
        {puntos.length === 0 && <Marker position={currentPosition} />}
        {lotes
          .filter(
            (lote) =>
              !(
                selectedLote &&
                puntos.length > 0 &&
                selectedLote.idlote === lote.idlote
              )
          )
          .map((lote) => (
            <MapMarker
              key={lote.idlote}
              lote={lote}
              onClick={handleMarkerClick}
            />
          ))}
        {directions && <DirectionsRenderer directions={directions} />}
        {puntos.length > 0 && <PolygonOverlay puntos={puntos} />}
      </GoogleMap>

      <MapSidebar
        lote={selectedLote}
        inmo={selectedLote?.inmobiliaria}
        imagenes={imagenes}
        onClose={() => {
          setSelectedLote(null);
          setDirections(null);
          setWalkingInfo(null);
          setDrivingInfo(null);
          setRouteMode(null);
          setImagenes([]);
          setPuntos([]);
        }}
      >
        {selectedLote && <MapButtons onShowRoute={handleShowRoute} />}
      </MapSidebar>
    </div>
  );
}

export default React.memo(MyMap);

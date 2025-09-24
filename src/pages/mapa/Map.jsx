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
import PolygonOverlay from "./PolygonOverlay";
import styles from "./Mapa.module.css";

const defaultCenter = { lat: -6.4882, lng: -76.365629 };
const LIBRARIES = ["places"];


const RANGOS_PRECIO = [
  { label: "S/. 5,000 - 15,000", value: "5000-15000" },
  { label: "S/. 15,001 - 35,000", value: "15001-35000" },
  { label: "S/. 35,001 - 80,000", value: "35001-80000" },
  { label: "S/. 80,001 - 150,000", value: "80001-150000" },
  { label: "S/. 150,001 - 250,000", value: "150001-250000" },
  { label: "S/. 250,001 - más", value: "250001-999999999" },
];

const LotesOverlay = ({
  lotes,
  selectedLote,
  hoveredLote,
  onLoteClick,
  onLoteMouseOver,
  onLoteMouseOut,
}) => {
  const darkenColor = (hex, amount = 0.2) => {
    let c = hex.replace("#", "");
    if (c.length === 8) c = c.substring(0, 6);
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
        break;
      case 1:
        baseColor = "#ff0000";
        break;
      case 2:
        baseColor = "#ffff00";
        break;
      default:
        baseColor = "#808080";
    }
    if (estado === 1 || estado === 2 || !hovered) {
      return baseColor;
    }
    return darkenColor(baseColor, 0.3);
  };

  return (
    <>
      {lotes
        .filter((lote) =>
          selectedLote ? lote.idlote === selectedLote.lote.idlote : true
        )
        .map((lote) => {
          const isLibre = lote.vendido === 0;

          return (
            <PolygonOverlay
              key={lote.idlote}
              puntos={lote.puntos}
              color={getColorLote(lote.vendido, hoveredLote === lote.idlote)}
              onClick={isLibre ? () => onLoteClick(lote) : undefined}
              onMouseOver={
                isLibre ? () => onLoteMouseOver(lote.idlote) : undefined
              }
              onMouseOut={isLibre ? onLoteMouseOut : undefined}
              label={hoveredLote === lote.idlote ? lote.nombre : null}
              options={{
                zIndex: hoveredLote === lote.idlote ? 11 : 10,
                clickable: isLibre,
                draggable: false,
                editable: false,
                strokeWeight: 1,
              }}
            />
          );
        })}
    </>
  );
};

function MyMap() {
  // const [mapType, setMapType] = useState("roadmap");
  const { isLoaded, loadError } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: "AIzaSyA0dsaDHTO3rx48cyq61wbhItaZ_sWcV94",
    libraries:LIBRARIES,
  });

  const [currentPosition, setCurrentPosition] = useState(defaultCenter);
  const [tiposInmo, setTiposInmo] = useState([]);
  const [selectedTipo, setSelectedTipo] = useState("");
  const [selectedRango, setSelectedRango] = useState("");
  const [proyecto, setProyecto] = useState([]);
  const [selectedProyecto, setselectedProyecto] = useState(null);
  const [lotesProyecto, setLotesProyecto] = useState([]);
  const [lotes, setLotes] = useState([]);
  const [selectedLote, setSelectedLote] = useState(null);
  const [routeMode, setRouteMode] = useState(null);
  const [directions, setDirections] = useState(null);
  const [imagenesProyecto, setImagenesProyecto] = useState([]);
  const [imagenesLote, setImagenesLote] = useState([]);
  const [puntos, setPuntos] = useState([]);
  const [showFilters, setShowFilters] = useState(true);
  const [hoveredLote, setHoveredLote] = useState(null);
  const [iconosProyecto, setIconosProyecto] = useState([]);

  const [walkingInfo, setWalkingInfo] = useState(null);
  const [drivingInfo, setDrivingInfo] = useState(null);

  const mapRef = useRef(null);
  const inputRef = useRef(null);

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
    if (selectedLote) {
      fetch(`http://127.0.0.1:8000/api/list_imagen/${selectedLote.lote.idlote}`)
        .then((res) => res.json())
        .then((data) => setImagenesLote(data))
        .catch((err) => console.error("Error cargando imágenes:", err));
    } else {
      setImagenesLote([]);
    }
  }, [selectedLote]);

  useEffect(() => {
    if (selectedProyecto?.idproyecto) {
      fetch(
        `http://127.0.0.1:8000/api/list_imagen_proyecto/${selectedProyecto.idproyecto}`
      )
        .then((res) => res.json())
        .then((data) => setImagenesProyecto(data))
        .catch((err) => console.error("Error cargando imágenes:", err));
    } else {
      setImagenesProyecto([]);
    }
  }, [selectedProyecto]);

useEffect(() => {
  if (!selectedProyecto) return;

  const cargarLotes = async () => {
    let dataLotes;

    if (selectedRango) {
      // Usamos los lotes filtrados que ya guardamos en "lotes"
      dataLotes = lotes.filter(
        (l) => l.idproyecto === selectedProyecto.idproyecto
      );
    } else {
      // Si no hay rango → pedimos todos los lotes del proyecto
      const res = await fetch(
        `http://127.0.0.1:8000/api/getLoteProyecto/${selectedProyecto.idproyecto}`
      );
      dataLotes = await res.json();
    }

    // A cada lote le agregamos sus puntos
    const lotesConPuntos = await Promise.all(
      dataLotes.map(async (lote) => {
        const resPuntos = await fetch(
          `http://127.0.0.1:8000/api/listPuntos/${lote.idlote}`
        );
        const puntos = await resPuntos.json();
        return { ...lote, puntos };
      })
    );

    setLotesProyecto(lotesConPuntos);
  };

  cargarLotes().catch(console.error);
}, [selectedProyecto, selectedRango, lotes]);


  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/listTipoInmobiliaria/")
      .then((res) => res.json())
      .then(setTiposInmo)
      .catch(console.error);
  }, []);

const handleTipoChange = (tipoId) => {
  if (selectedTipo === tipoId) {
    setSelectedTipo(""); // desmarcar si ya estaba seleccionado
  } else {
    setSelectedTipo(tipoId);
  }
};

const handleRangoChange = (rango) => {
  if (selectedRango === rango) {
    console.log("Desmarcado:", rango);
    setSelectedRango(""); // desmarcar si ya estaba seleccionado
  } else {
    setSelectedRango(rango);
  }
};

useEffect(() => {
    if (selectedTipo) {
    // Detectar si es casa o lote
    const tipo = tiposInmo.find((t) => t.idtipoinmobiliaria === selectedTipo);

    if (tipo) {
      if (tipo.idtipoinmobiliaria === 2) {
        // CASAS
        fetch(`http://127.0.0.1:8000/api/filtroCasaProyecto/${selectedTipo}`)
          .then((res) => res.json())
          .then((data) => {
            setProyecto(data); // API ya devuelve proyectos
          })
          .catch(console.error);
      } else if (tipo.idtipoinmobiliaria === 1) {
        // LOTES
        fetch(`http://127.0.0.1:8000/api/filtroCasaProyecto/${selectedTipo}`)
          .then((res) => res.json())
          .then((data) => {
            setProyecto(data);
          })
          .catch(console.error);
      }
    }
  } else if (selectedRango) {
  // Filtro por rango de precio
fetch(`http://127.0.0.1:8000/api/rangoPrecio/${selectedRango}`)
  .then((res) => res.json())
  .then((data) => {
    // Ahora data = { lotes: [...], proyectos: [...] }
    setLotes(data.lotes || []);

    // Extraer proyectos de los lotes
    const proyectosUnicos = [];
    const ids = new Set();
    data.lotes.forEach((lote) => {
      const p = lote.proyectos;
      if (p && !ids.has(p.idproyecto)) {
        ids.add(p.idproyecto);
        proyectosUnicos.push(p);
      }
    });

    // Además agregamos los proyectos que vienen directo en data.proyectos
    if (Array.isArray(data.proyectos)) {
      data.proyectos.forEach((p) => {
        if (!ids.has(p.idproyecto)) {
          ids.add(p.idproyecto);
          proyectosUnicos.push(p);
        }
      });
    }

    setProyecto(proyectosUnicos);
    console.log(proyectosUnicos)
  })
  .catch(console.error);

}
 else {
    // Sin filtros → lista de proyectos
    fetch("http://127.0.0.1:8000/api/listProyectos/")
      .then((res) => res.json())
      .then(setProyecto)
      .catch(console.error);
  }
}, [selectedTipo, selectedRango]);

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
    const resLote = await fetch(
      `http://127.0.0.1:8000/api/getLoteProyecto/${lote.idproyecto}`
    );
    const lotes = await resLote.json();
    const loteCompleto = lotes.find((l) => l.idlote === lote.idlote);

    const resPuntos = await fetch(
      `http://127.0.0.1:8000/api/listPuntos/${lote.idlote}`
    );
    const puntos = await resPuntos.json();

    if (mapRef.current) {
      mapRef.current.panTo({
        lat: parseFloat(lote.latitud),
        lng: parseFloat(lote.longitud),
      });
      mapRef.current.setZoom(22);
    }
    setSelectedLote({
      lote: { ...loteCompleto, puntos },
      inmo: selectedProyecto?.inmo ?? null,
    });
  };

const handleMarkerClick = async (proyecto) => {
  try {
    setRouteMode(null);
    setDirections(null);
    setWalkingInfo(null);
    setDrivingInfo(null);
    setLotesProyecto([]);
    setPuntos([]);
    setIconosProyecto([]);

    calculateInfo("WALKING", proyecto);
    calculateInfo("DRIVING", proyecto);

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

    let dataLotes;
    if (selectedRango) {
      // Si hay un rango, usamos los lotes filtrados
      dataLotes = lotes.filter(
        (l) => l.idproyecto === proyecto.idproyecto
      );
    } else {
      // Si no, traemos todos los lotes del proyecto
      const resLotes = await fetch(
        `http://127.0.0.1:8000/api/getLoteProyecto/${proyecto.idproyecto}`
      );
      dataLotes = await resLotes.json();
    }
    setLotesProyecto(dataLotes);

    const resInmo = await fetch(
      `http://127.0.0.1:8000/api/getInmobiliaria/${proyecto.idinmobiliaria}`
    );
    const inmoData = await resInmo.json();

    const resIconos = await fetch(
      `http://127.0.0.1:8000/api/list_iconos_proyecto/${proyecto.idproyecto}`
    );
    const dataIconos = await resIconos.json();
    setIconosProyecto(dataIconos);

    setselectedProyecto({
      ...proyecto,
      inmo: inmoData[0] ?? null,
    });
  } catch (err) {
    console.error("Error cargando inmobiliaria:", err);
  }
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
    ✖
  </button>

  <div className={styles.filterGroup}>
    <h4>Quiero ver:</h4>
    <div className={styles.filterOptions}>
      {tiposInmo.map((tipo) => (
        <button
          key={tipo.idtipoinmobiliaria}
          className={`${styles.filterChip} ${
            selectedTipo === tipo.idtipoinmobiliaria ? styles.active : ""
          }`}
          onClick={() => handleTipoChange(tipo.idtipoinmobiliaria)}
        >
          {tipo.nombre}
        </button>
      ))}
    </div>
  </div>

  <div className={styles.filterGroup}>
    <h4>Rango de precios:</h4>
    <div className={styles.filterOptions}>
      {RANGOS_PRECIO.map((rango) => (
        <button
          key={rango.value}
          className={`${styles.filterChip} ${
            selectedRango === rango.value ? styles.active : ""
          }`}
          onClick={() => handleRangoChange(rango.value)}
        >
          {rango.label}
        </button>
      ))}
    </div>
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
          mapTypeControl: true,
          streetViewControl: false,
          fullscreenControl: false,
          // mapTypeId: mapType,
        }}
      >
        {puntos.length === 0 && <Marker position={currentPosition} />}

        {proyecto
          .filter(
            (p) =>
              !(
                selectedProyecto &&
                puntos.length > 0 &&
                selectedProyecto.idproyecto === p.idproyecto
              )
          )
          .map((p) => (
            <MapMarker
              key={p.idproyecto}
              proyecto={p}
              onClick={handleMarkerClick}
            />
          ))}

        {iconosProyecto.map((ico) => (
          <Marker
            key={ico.idiconoproyecto}
            position={{
              lat: parseFloat(ico.latitud),
              lng: parseFloat(ico.longitud),
            }}
            icon={{
              url: `http://127.0.0.1:8000${ico.icono_detalle.imagen}`,
              scaledSize: new window.google.maps.Size(40, 40),
            }}
            title={ico.icono_detalle.nombre}
          />
        ))}

        {puntos.length > 0 && (
          <PolygonOverlay
            puntos={puntos}
            color="#106e2eff"
            showLados={false}
            options={{
              clickable: false,
              fillColor: "transparent",
              strokeWeight: 2,
            }}
          />
        )}

        {lotesProyecto.length > 0 && (
          <LotesOverlay
            lotes={lotesProyecto}
            selectedLote={selectedLote}
            hoveredLote={hoveredLote}
            onLoteClick={handleLoteClick}
            onLoteMouseOver={setHoveredLote}
            onLoteMouseOut={() => setHoveredLote(null)}
          />
        )}
        {directions && <DirectionsRenderer directions={directions} />}
      </GoogleMap>

      {selectedProyecto && (
        <ProyectoSidebar
          inmo={selectedProyecto?.inmo}
          proyecto={selectedProyecto}
          imagenes={imagenesProyecto}
          walkingInfo={walkingInfo}
          drivingInfo={drivingInfo}
          onClose={() => {
            setselectedProyecto(null);
            setDirections(null);
            setWalkingInfo(null);
            setDrivingInfo(null);
            setRouteMode(null);
            setImagenesProyecto([]);
            setPuntos([]);
            setLotesProyecto([]);
            setIconosProyecto([]);
          }}
        />
      )}

      {selectedLote && (
        <MapSidebar
          lote={selectedLote.lote}
          inmo={selectedLote.inmo}
          imagenes={imagenesLote}
          walkingInfo={walkingInfo}
          drivingInfo={drivingInfo}
          onClose={() => {
            setSelectedLote(null);
            setImagenesLote([]);
            setLotesProyecto((prev) => [...prev]);
          }}
        />
      )}
      <div className={styles.authButtonContainer}>
        <button className={styles.authButton}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className={styles.authIcon}
          >
            <path d="M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10Zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4Z" />
          </svg>
        </button>
        <div className={styles.authTooltip}>
          <p>¿Quieres registrar un Proyecto o Lote?</p>
          <div className={styles.authLinks}>
            <a href="/login" className={styles.authLink}>
              Inicia Sesión
            </a>
            <p>¿No tienes una cuenta?</p>
            <a href="/register" className={styles.authLink}>
              Regístrate
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default React.memo(MyMap);

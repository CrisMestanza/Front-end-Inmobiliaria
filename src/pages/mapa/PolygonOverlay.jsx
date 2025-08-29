import React from "react";
import { Polygon } from "@react-google-maps/api";
import LabelOverlay from "./LabelOverlay";

const calcularCentroide = (path) => {
  let area = 0;
  let cx = 0;
  let cy = 0;

  for (let i = 0; i < path.length; i++) {
    const j = (i + 1) % path.length; // siguiente punto
    const xi = path[i].lng;
    const yi = path[i].lat;
    const xj = path[j].lng;
    const yj = path[j].lat;

    const factor = xi * yj - xj * yi;
    area += factor;
    cx += (xi + xj) * factor;
    cy += (yi + yj) * factor;
  }

  area *= 0.5;
  cx = cx / (6 * area);
  cy = cy / (6 * area);

  return { lat: cy, lng: cx };
};

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

const PolygonOverlay = ({
  puntos,
  color = "#0000FF",
  onClick,
  onMouseOver,
  onMouseOut,
  showLados = false,
  label,
  hovered,
}) => {
  if (!puntos || puntos.length < 2) return null;

  // 🔹 Aseguramos que estén en orden
  const puntosOrdenados = [...puntos].sort((a, b) => a.orden - b.orden);

  const path = puntosOrdenados.map((p) => ({
    lat: parseFloat(p.latitud),
    lng: parseFloat(p.longitud),
  }));

  // 🔹 Cerrar polígono
  if (path.length > 2) {
    path.push(path[0]);
  }

  const centroide = path.length > 2 ? calcularCentroide(path) : null;

  return (
    <>
      <Polygon
        path={path}
        options={{
          fillColor: hovered ? darkenColor(color, 0.3) : color,
          fillOpacity: 0.1,
          strokeColor: color,
          strokeOpacity: 1,
          strokeWeight: 2,
        }}
        onClick={onClick}
        onMouseOver={onMouseOver}
        onMouseOut={onMouseOut}
      />

      {label && centroide && <LabelOverlay position={centroide} text={label} />}

      {showLados &&
        puntosOrdenados.map((p, i) => {
          const start = path[i];
          const end = path[i + 1] || path[0];
          const midLat = (start.lat + end.lat) / 2;
          const midLng = (start.lng + end.lng) / 2;

          return (
            <LabelOverlay
              key={i}
              position={{ lat: midLat, lng: midLng }}
              text={`${p.lado_metros ?? ""} m`}
            />
          );
        })}
    </>
  );
};

export default PolygonOverlay;

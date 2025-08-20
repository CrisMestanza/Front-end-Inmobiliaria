import React from "react";
import { Polygon } from "@react-google-maps/api";
import LabelOverlay from "./LabelOverlay";

const PolygonOverlay = ({ puntos }) => {
  if (puntos.length < 2) return null;

  const puntosOrdenados = [...puntos].sort((a, b) => a.orden - b.orden);

  const path = puntosOrdenados.map((p) => ({
    lat: parseFloat(p.latitud),
    lng: parseFloat(p.longitud),
  }));

  path.push(path[0]);

  return (
    <>
      <Polygon
        path={path}
        options={{
          fillColor: "#00FF0080",
          fillOpacity: 0.3,
          strokeColor: "#00FF00",
          strokeOpacity: 1,
          strokeWeight: 2,
        }}
      />

      {puntosOrdenados.map((p, i) => {
        const start = path[i];
        const end = path[i + 1] || path[0];
        const midLat = (start.lat + end.lat) / 2;
        const midLng = (start.lng + end.lng) / 2;
        return (
          <LabelOverlay
            key={i}
            position={{ lat: midLat, lng: midLng }}
            text={`${p.lado_metros} m`}
          />
        );
      })}
    </>
  );
};

export default PolygonOverlay;

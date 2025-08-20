import React from "react";
import { Marker } from "@react-google-maps/api";

export default function MapMarker({ lote, onClick }) {
  return (
    <Marker
      key={lote.idlote}
      position={{
        lat: parseFloat(lote.latitud),
        lng: parseFloat(lote.longitud),
      }}
      onClick={() => onClick(lote)}
      icon={{
        url:
          lote.idtipoinmobiliaria === 1
            ? "https://cdn-icons-png.flaticon.com/512/12066/12066489.png"
            : "https://cdn-icons-png.freepik.com/512/11130/11130373.png",
        scaledSize: { width: 60, height: 60 },
      }}
    />
  );
}

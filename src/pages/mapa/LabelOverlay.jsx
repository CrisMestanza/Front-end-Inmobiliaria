import React from "react";
import { OverlayView } from "@react-google-maps/api";

const LabelOverlay = ({ position, text }) => (
  <OverlayView
    position={position}
    mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
  >
    <div
      style={{
        // background: "rgba(255, 255, 255, 0.8)", // ✅ Fondo blanco semi-transparente
        // border: "1px solid #333",
        // padding: "2px 6px",
        width: "60px",  /* ancho */
        height: "20px",  /* alto */
        fontSize: "15px",
        // borderRadius: "4px",
        color: "black",
        fontWeight: "bold",
      }}
    >
      {text}
    </div>
  </OverlayView>
);

export default LabelOverlay;

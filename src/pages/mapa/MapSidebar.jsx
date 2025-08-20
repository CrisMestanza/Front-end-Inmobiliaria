import React, { useState } from "react";
import {
  FaFacebook,
  FaWhatsapp,
  FaGlobe,
  FaMapMarkedAlt,
  FaHome,
} from "react-icons/fa";
import styles from "./Mapa.module.css";

const MapSidebar = ({ inmo, lote, imagenes, onClose }) => {
  const [showAll, setShowAll] = useState(false);
  const [fullscreenImg, setFullscreenImg] = useState(null);
  const [showSidebarMobile, setShowSidebarMobile] = useState(false);
  const [collapsed, setCollapsed] = useState(false); // 👈 nuevo estado

  if (!inmo || !lote) return null;

  const visibleImages = showAll ? imagenes : imagenes.slice(0, 3);

  return (
    <>
      {/* Botón móvil para mostrar más información */}
      <button
        className={styles.showInfoBtn}
        onClick={() => setShowSidebarMobile(true)}
      >
        Mostrar más información
      </button>

      <div
        className={`${styles.sidebar} ${showSidebarMobile ? styles.sidebarMobileOpen : ""
          }`}
      >
        {/* Botón para cerrar todo el sidebar */}
        <button
          onClick={() => {
            onClose();
            setShowSidebarMobile(false);
          }}
          className={styles.closeBtn}
        >
          X
        </button>

        {/* Botón para ocultar solo el contenido */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          style={{
            background: "#007acc",
            color: "#fff",
            border: "none",
            padding: "6px 12px",
            borderRadius: "6px",
            cursor: "pointer",
            marginBottom: "10px"
          }}
        >
          {collapsed ? "Mostrar" : "Ocultar"}
        </button>

        {/* Contenido colapsable */}
        {!collapsed && (
          <>
            <h2>{inmo.nombreinmobiliaria}</h2>
            <h3 style={{ color: "black" }}>{lote.nombre}</h3>

            <p className={styles.tipo}>
              {inmo.idtipoinmobiliaria === 1 && (
                <>
                  <FaMapMarkedAlt size={20} color="#2c3e50" />{" "}
                  <span>Lote / Terreno</span>
                </>
              )}
              {inmo.idtipoinmobiliaria === 2 && (
                <>
                  <FaHome size={20} color="#2c3e50" /> <span>Casa</span>
                </>
              )}
            </p>

            <div className={styles.links}>
              <a
                href={inmo.facebook}
                target="_blank"
                rel="noreferrer"
                className={`${styles.link} ${styles.facebook}`}
              >
                <FaFacebook size={20} /> Facebook
              </a>

              <a
                href={`https://wa.me/${inmo.whatsapp}?text=${encodeURIComponent(
                  `¡Hola! Me interesa ${lote.idtipoinmobiliaria === 1 ? "el *lote/terreno*" : "la *casa*"
                  } "${lote.nombre}".  
Vengo de la página *Habita* y me gustaría recibir más información.`
                )}`}
                target="_blank"
                rel="noreferrer"
                className={`${styles.link} ${styles.whatsapp}`}
              >
                <FaWhatsapp style={{ color: "green" }} size={20} /> WhatsApp
              </a>






              <a
                href={inmo.pagina}
                target="_blank"
                rel="noreferrer"
                className={`${styles.link} ${styles.web}`}
              >
                <FaGlobe size={20} /> Página Web
              </a>
            </div>

            <p className={styles.descripcion}>
              <strong>Descripción Inmobiliaria:</strong> {inmo.descripcion}
            </p>

            <p className={styles.descripcion}>
              <strong>Descripción Lote:</strong> {lote.descripcion}
            </p>
            <h2 className={styles.descripcion}>
              Precio: S/. {lote.precio}
            </h2>

            {imagenes.length > 0 && (
              <div className={styles.imagenesContainer}>
                <h3 style={{ color: "black" }}>Imágenes</h3>
                <div className={styles.imagenesGrid}>
                  {visibleImages.map((img) => (
                    <img
                      key={img.idimagenes}
                      src={`https://apiinmo.y0urs.com${img.imagen}`}
                      alt="Inmobiliaria"
                      className={styles.thumbnail}
                      onClick={() => setFullscreenImg(img)}
                    />
                  ))}
                </div>
                {imagenes.length > 3 && !showAll && (
                  <button
                    onClick={() => setShowAll(true)}
                    className={styles.verMas}
                  >
                    Ver más imágenes
                  </button>
                )}
              </div>
            )}
          </>
        )}

        {fullscreenImg && (
          <div
            className={styles.fullscreenOverlay}
            onClick={() => setFullscreenImg(null)}
          >
            <img
              src={`https://apiinmo.y0urs.com/${fullscreenImg.imagen}`}
              alt="Pantalla completa"
              className={styles.fullscreenImg}
            />
            <button
              className={styles.closeFullscreen}
              onClick={() => setFullscreenImg(null)}
            >
              ❌ Cerrar
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default MapSidebar;

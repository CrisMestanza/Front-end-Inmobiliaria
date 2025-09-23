import React, { useState, useEffect } from "react";
import {
  FaFacebook,
  FaWhatsapp,
  FaGlobe,
  FaMapMarkedAlt,
  FaHome,
} from "react-icons/fa";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import styles from "./Mapa.module.css";
import ModalCuota from "../inmobiliaria/lote/modalCuota";

const MapSidebar = ({
  inmo,
  lote,
  imagenes,
  onClose,
  walkingInfo,
  drivingInfo,
}) => {
  const [showAll, setShowAll] = useState(false);
  const [fullscreenImgIndex, setFullscreenImgIndex] = useState(null);
  const [showSidebarMobile, setShowSidebarMobile] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (fullscreenImgIndex !== null) {
      const handleKeyDown = (e) => {
        if (e.key === "ArrowLeft") {
          setFullscreenImgIndex(
            (fullscreenImgIndex - 1 + imagenes.length) % imagenes.length
          );
        } else if (e.key === "ArrowRight") {
          setFullscreenImgIndex((fullscreenImgIndex + 1) % imagenes.length);
        } else if (e.key === "Escape") {
          setFullscreenImgIndex(null);
        }
      };

      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }
  }, [fullscreenImgIndex, imagenes.length]);

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
        className={`${styles.sidebar} ${
          showSidebarMobile ? styles.sidebarMobileOpen : ">"
        } ${collapsed ? styles.sidebarCollapsed : "<"}`}
      >
        {/* Botón flecha para ocultar/mostrar */}
        <button
          className={styles.toggleArrow}
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? "<" : ">"}
        </button>

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

        {/* Contenido colapsable */}
        {!collapsed && (
          <>
            <h2>{inmo.nombreinmobiliaria}</h2>
            <p className={styles.descripcion}>{inmo.descripcion}</p>
            <div className={styles.links}>
              <a
                href={inmo.facebook}
                target="_blank"
                rel="noreferrer"
                className={`${styles.link} ${styles.facebook}`}
              >
                <FaFacebook size={40} />
              </a>
              <a
                href={`https://wa.me/${inmo.whatsapp}?text=${encodeURIComponent(
                  `¡Hola! Me interesa ${
                    lote.idtipoinmobiliaria === 1
                      ? "el *lote/terreno*"
                      : "la *casa*"
                  } "${
                    lote.nombre
                  }".\nVengo de la página *Habita* y me gustaría recibir más información.`
                )}`}
                target="_blank"
                rel="noreferrer"
                className={`${styles.link} ${styles.whatsapp}`}
              >
                <FaWhatsapp style={{ color: "green" }} size={40} />
              </a>
              <a
                href={inmo.pagina}
                target="_blank"
                rel="noreferrer"
                className={`${styles.link} ${styles.web}`}
              >
                <FaGlobe size={40} />
              </a>
            </div>

            <h3>{lote.nombre}</h3>
            <p className={styles.tipo}>
              <FaMapMarkedAlt size={20} color="#2c3e50" />{" "}
              <span>Lote / Terreno</span>
            </p>
            <p className={styles.descripcion}>{lote.descripcion}</p>
            <h3 style={{ color: "black" }}>Distancia:</h3>
            <div className={styles.distancia}>
              <p>
                🚶 <strong className={styles.label}>Caminando:</strong>{" "}
                {walkingInfo ? (
                  <span className={styles.value}>
                    {`${walkingInfo.distance} • ${walkingInfo.duration}`}
                  </span>
                ) : (
                  "Cargando..."
                )}
              </p>

              <p>
                🛵 <strong className={styles.label}>Vehículo:</strong>{" "}
                {drivingInfo ? (
                  <span className={styles.value}>
                    {`${drivingInfo.distance} • ${drivingInfo.duration}`}
                  </span>
                ) : (
                  "Cargando..."
                )}
              </p>
            </div>

            <h3>Precio al Contado:</h3>
            <h2 className={styles.descripcion}>S/.{lote.precio}</h2>
            <h3>¿Quieres cotizar un crédito?</h3>
            <button onClick={() => setIsModalOpen(true)}>Cotizar</button>

            <ModalCuota
              isOpen={isModalOpen}
              onClose={() => setIsModalOpen(false)}
              lote={lote}
            />

            {imagenes.length > 0 && (
              <div className={styles.imagenesContainer}>
                <h3 style={{ color: "black" }}>Imágenes</h3>
                <div className={styles.imagenesGrid}>
                  {visibleImages.map((img) => (
                    <img
                      key={img.idimagenes}
                      src={`http://127.0.0.1:8000${img.imagen}`}
                      alt="Inmobiliaria"
                      className={styles.thumbnail}
                      onClick={() =>
                        setFullscreenImgIndex(imagenes.indexOf(img))
                      }
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

        {fullscreenImgIndex !== null && (
          <div className={styles.fullscreenOverlay}>
            <button
              className={`${styles.navButton} ${styles.prevButton}`}
              onClick={(e) => {
                e.stopPropagation();
                const prevIndex =
                  (fullscreenImgIndex - 1 + imagenes.length) % imagenes.length;
                setFullscreenImgIndex(prevIndex);
              }}
            >
              &lt;
            </button>

            <img
              src={`http://127.0.0.1:8000${imagenes[fullscreenImgIndex].imagen}`}
              alt="Pantalla completa"
              className={styles.fullscreenImg}
            />

            {/* Botón SIGUIENTE */}
            <button
              className={`${styles.navButton} ${styles.nextButton}`}
              onClick={(e) => {
                e.stopPropagation();
                const nextIndex = (fullscreenImgIndex + 1) % imagenes.length;
                setFullscreenImgIndex(nextIndex);
              }}
            >
              &gt;
            </button>

            {/* Botón para cerrar */}
            <button
              className={styles.closeFullscreen}
              onClick={() => setFullscreenImgIndex(null)}
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

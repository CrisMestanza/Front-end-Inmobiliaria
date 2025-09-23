import React, { useState, useEffect } from "react";
import {
  FaFacebook,
  FaWhatsapp,
  FaGlobe,
  FaMapMarkedAlt,
  FaHome,
} from "react-icons/fa";
import styles from "./Mapa.module.css";

const ProyectoSidebar = ({
  inmo,
  proyecto,
  imagenes,
  onClose,
  walkingInfo,
  drivingInfo,
}) => {
  const [showAll, setShowAll] = useState(false);
  const [fullscreenImgIndex, setFullscreenImgIndex] = useState(null);
  const [showSidebarMobile, setShowSidebarMobile] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

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

  if (!proyecto) return null;

  const visibleImages = showAll ? imagenes : imagenes.slice(0, 10);

  return (
    <>
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
        <button
          className={styles.toggleArrow}
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? "<" : ">"}
        </button>

        <button
          onClick={() => {
            onClose();
            setShowSidebarMobile(false);
          }}
          className={styles.closeBtn}
        >
          X
        </button>

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
                  `¡Hola! Me interesa el *proyecto* "${proyecto.nombreproyecto}".\nVengo de la página *Habita* y me gustaría recibir más información.`
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

            <h3> {proyecto.nombreproyecto}</h3>
            <p className={styles.tipo}>
              <FaMapMarkedAlt size={20} color="#2c3e50" />{" "}
              <span>Proyecto inmobiliario</span>
            </p>
            <p className={styles.descripcion}>{proyecto.descripcion}</p>

            <h3>Distancia:</h3>
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

            {imagenes.length > 0 && (
              <div className={styles.imagenesContainer}>
                <h3>Imágenes</h3>
                <div className={styles.imagenesGrid}>
                  {visibleImages.map((img) => (
                    <img
                      key={img.idimagenesp}
                      src={`http://127.0.0.1:8000${img.imagenproyecto}`}
                      alt="Proyecto"
                      className={styles.thumbnail}
                      onClick={() =>
                        setFullscreenImgIndex(imagenes.indexOf(img))
                      }
                    />
                  ))}
                </div>
                {/* {imagenes.length > 3 && !showAll && (
                  <button
                    onClick={() => setShowAll(true)}
                    className={styles.verMas}
                  >
                    Ver más imágenes
                  </button>
                )} */}
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
              src={`http://127.0.0.1:8000${imagenes[fullscreenImgIndex].imagenproyecto}`}
              alt="Pantalla completa"
              className={styles.fullscreenImg}
            />
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
            <button
              className={styles.closeFullscreen}
              onClick={() => setFullscreenImgIndex(null)}
            >
              Cerrar
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default ProyectoSidebar;

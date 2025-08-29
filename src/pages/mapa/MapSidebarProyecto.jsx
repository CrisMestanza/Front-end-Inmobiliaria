import React, { useState } from "react";
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

  if (!proyecto) return null;

  const visibleImages = showAll ? imagenes : imagenes.slice(0, 3);

  return (
    <>
      {/* Botón móvil */}
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
        {/* Botón flecha */}
        <button
          className={styles.toggleArrow}
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? "<" : ">"}
        </button>

        {/* Botón cerrar */}
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

            <h3 style={{ color: "black", padding: "0px" }}>
              {proyecto.nombreproyecto}
            </h3>

            <p className={styles.descripcion}>{proyecto.descripcion}</p>

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

            <p className={styles.tipo}>
              <FaMapMarkedAlt size={20} color="#2c3e50" />{" "}
              <span>Proyecto inmobiliario</span>
            </p>

            {imagenes.length > 0 && (
              <div className={styles.imagenesContainer}>
                <h3 style={{ color: "black" }}>Imágenes</h3>
                <div className={styles.imagenesGrid}>
                  {visibleImages.map((img) => (
                    <img
                      key={img.idimagenes}
                      src={`http://127.0.0.1:8000${img.imagen}`}
                      alt="Proyecto"
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
            {/* ANTERIOR */}
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

            {/* SIGUIENTE */}
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

            {/* Cerrar */}
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

export default ProyectoSidebar;

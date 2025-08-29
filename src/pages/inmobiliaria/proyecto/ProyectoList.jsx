import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Aside from "../../../components/Aside";
import ProyectoModal from "./agregarProyecto";
import style from "../agregarInmo.module.css";

export default function ProyectosList() {
  const { idinmobilaria } = useParams();
  const navigate = useNavigate();
  const [proyectos, setProyectos] = useState([]);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const fetchProyectos = async () => {
      try {
        const res = await fetch(
          `https://apiinmo.y0urs.com/api/getProyectoInmo/${idinmobilaria}`
        );
        const data = await res.json();
        setProyectos(data);
      } catch (err) {
        console.error("Error al cargar proyectos:", err);
      }
    };
    fetchProyectos();
  }, [idinmobilaria]);

  return (
    <div className={style.principal}>
      <Aside />
      <div
        style={{
          flexGrow: 1,
          padding: "40px",
          overflowY: "auto",
          background: "#fff",
        }}
      >
        <h1 style={{ color: "black", textAlign: "center" }}>
          LISTA DE PROYECTOS
        </h1>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "10px",
            width: "fit-content",
          }}
        >
          <button onClick={() => navigate(-1)} className={style.addBtn}>
            ⬅ Volver
          </button>
          <button onClick={() => setShowModal(true)} className={style.addBtn}>
            Agregar registro
          </button>
        </div>

        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            marginTop: "20px",
          }}
        >
          <thead style={{ color: "black" }}>
            <tr style={{ background: "#0077b6", color: "#fff" }}>
              <th className={style.tableStyle} style={{ padding: "10px" }}>
                N°
              </th>
              <th className={style.tableStyle} style={{ padding: "10px" }}>
                Nombre Proyecto
              </th>
              <th className={style.tableStyle} style={{ padding: "10px" }}>
                Descripción
              </th>
              <th className={style.tableStyle} style={{ padding: "10px" }}>
                Precio
              </th>
              <th className={style.tableStyle} style={{ padding: "10px" }}>
                Latitud
              </th>
              <th className={style.tableStyle} style={{ padding: "10px" }}>
                Longitud
              </th>
              <th className={style.tableStyle} style={{ padding: "10px" }}>
                Ver Lotes
              </th>
              <th className={style.tableStyle} style={{ padding: "10px" }}>
                Acciones
              </th>
            </tr>
          </thead>
          <tbody>
            {proyectos.map((proyecto, index) => (
              <tr
                key={proyecto.idproyecto}
                style={{ borderBottom: "1px solid #ccc" }}
              >
                <td
                  style={{
                    padding: "10px",
                    color: "black",
                    textAlign: "center",
                  }}
                >
                  {index + 1}
                </td>
                <td
                  style={{
                    padding: "10px",
                    color: "black",
                    textAlign: "center",
                  }}
                >
                  {proyecto.nombreproyecto}
                </td>
                <td
                  style={{
                    padding: "10px",
                    color: "black",
                    textAlign: "center",
                  }}
                >
                  {proyecto.descripcion}
                </td>
                <td
                  style={{
                    padding: "10px",
                    color: "black",
                    textAlign: "center",
                  }}
                >
                  {proyecto.precio}
                </td>
                <td
                  style={{
                    padding: "10px",
                    color: "black",
                    textAlign: "center",
                  }}
                >
                  {proyecto.latitud}
                </td>
                <td
                  style={{
                    padding: "10px",
                    color: "black",
                    textAlign: "center",
                  }}
                >
                  {proyecto.longitud}
                </td>
                <td style={{ textAlign: "center", color: "black" }}>
                  <button
                    onClick={() => navigate(`/lotes/${proyecto.idproyecto}`)}
                    className={style.addBtn}
                  >
                    👁️ Ver
                  </button>
                </td>
                <td
                  style={{
                    padding: "10px",
                    color: "black",
                    textAlign: "center",
                  }}
                >
                  <button className={style.addBtn}>✏️</button>{" "}
                  <button
                    onClick={async () => {
                      if (
                        window.confirm(
                          "¿Seguro que quieres eliminar este proyecto?"
                        )
                      ) {
                        await fetch(
                          `https://apiinmo.y0urs.com/api/deleteProyecto/${proyecto.idproyecto}/`,
                          {
                            method: "PUT",
                          }
                        );
                        setProyectos(
                          proyectos.filter(
                            (p) => p.idproyecto !== proyecto.idproyecto
                          )
                        );
                      }
                    }}
                    className={style.removeBtn}
                  >
                    🗑️
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {showModal && (
          <ProyectoModal
            onClose={() => setShowModal(false)}
            idinmobilaria={idinmobilaria}
          />
        )}
      </div>
    </div>
  );
}

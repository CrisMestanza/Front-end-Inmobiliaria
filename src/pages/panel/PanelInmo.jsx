import React, { useEffect, useState } from "react";
import "./PanelInmo.css";
import { PlusCircle, Home, Map, Layers } from "lucide-react";

const PanelInmo = () => {
  const [resumen, setResumen] = useState(null);
  const [proyectos, setProyectos] = useState([]);
  const [lotes, setLotes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const resProy = await fetch(
          "http://127.0.0.1:8000/api/mis_proyectos/",
          {
            credentials: "include",
          }
        );
        const dataProy = await resProy.json();

        const resLotes = await fetch("http://127.0.0.1:8000/api/mis_lotes/", {
          credentials: "include",
        });
        const dataLotes = await resLotes.json();

        setProyectos(dataProy || []);
        setLotes(dataLotes || []);

        setResumen({
          proyectosActivos: dataProy.filter((p) => p.estado === "Activo")
            .length,
          lotesDisponibles: dataLotes.filter((l) => l.estado === "Disponible")
            .length,
          lotesReservados: dataLotes.filter((l) => l.estado === "Reservado")
            .length,
          lotesVendidos: dataLotes.filter((l) => l.estado === "Vendido").length,
        });
      } catch (err) {
        console.error("Error cargando datos:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleLogout = async () => {
    await fetch("http://127.0.0.1:8000/api/logout/", {
      method: "POST",
      credentials: "include",
    });
    localStorage.removeItem("inmobiliaria");
    window.location.href = "/";
  };

  if (loading) return <p>Cargando dashboard...</p>;

  return (
    <div className="panel-container">
      <div className="panel-header">
        <h2 className="panel-title">
          🏠 Dashboard - {localStorage.getItem("inmobiliaria")}
        </h2>
        <button className="btn btn-danger" onClick={handleLogout}>
          Cerrar sesión
        </button>
      </div>

      {/* Resumen */}
      {resumen && (
        <div className="resumen-grid">
          <div className="resumen-card">
            <Home className="icon blue" />
            <h3>Proyectos Activos</h3>
            <p>{resumen.proyectosActivos}</p>
          </div>
          <div className="resumen-card">
            <Layers className="icon green" />
            <h3>Lotes Disponibles</h3>
            <p>{resumen.lotesDisponibles}</p>
          </div>
          <div className="resumen-card">
            <Layers className="icon yellow" />
            <h3>Lotes Reservados</h3>
            <p>{resumen.lotesReservados}</p>
          </div>
          <div className="resumen-card">
            <Layers className="icon red" />
            <h3>Lotes Vendidos</h3>
            <p>{resumen.lotesVendidos}</p>
          </div>
        </div>
      )}

      {/* Proyectos */}
      <div className="section">
        <div className="section-header">
          <h3>📂 Proyectos</h3>
          <button className="btn-primary">
            <PlusCircle size={18} /> Nuevo Proyecto
          </button>
        </div>
        <div className="proyectos-grid">
          {proyectos.map((p) => (
            <div key={p.id} className="proyecto-card">
              <h4>{p.nombre}</h4>
              <p>Estado: {p.estado}</p>
              <button className="btn-outline">
                <Map size={16} /> Ver en mapa
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Lotes */}
      <div className="section">
        <h3>📋 Lotes</h3>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Descripción</th>
                <th>Precio</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {lotes.map((lote, i) => (
                <tr key={lote.id} className={i % 2 === 0 ? "even" : "odd"}>
                  <td>{lote.nombre}</td>
                  <td>{lote.descripcion}</td>
                  <td>{lote.precio}</td>
                  <td>
                    <span className={`estado ${lote.estado?.toLowerCase()}`}>
                      {lote.estado}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PanelInmo;

// components/InmobiliariaModal.jsx
import { useState, useEffect } from 'react';
import style from '../agregarInmo.module.css';

export default function loteModal({ onClose, idinmobilaria }) {
  const [form, setForm] = useState({
    idtipoinmobiliaria: 0,
    nombre: '',
    precio: 0,
    // whatsapp: '',
    // pagina: '',
    latitud: '',
    longitud: '',
    descripcion: '',
    puntos: [],
    imagenes: []
  });

  const [tipos, setTipos] = useState([]);

  useEffect(() => {
    const fetchTipos = async () => {
      try {
        const res = await fetch('https://apiinmo.y0urs.com/api/listTipoInmobiliaria/');
        const data = await res.json();
        setTipos(data);
        if (data.length > 0) {
          setForm(prev => ({
            ...prev,
            idtipoinmobiliaria: parseInt(data[0].idtipoinmobiliaria, 10)
          }));
        }
      } catch (err) {
        console.error('Error al cargar tipos:', err);
      }
    };
    fetchTipos();
  }, []);

  const handleTipoChange = (e) => {
    setForm({ ...form, idtipoinmobiliaria: parseInt(e.target.value, 10) });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({
      ...form,
      [name]: name === "precio" ? parseFloat(value) || 0 : value
    });
  };

  const addPunto = () => {
    setForm({
      ...form,
      puntos: [...form.puntos, { latitud: '', longitud: '', lado_metros: '' }]
    });
  };

  const removePunto = (index) => {
    const puntos = [...form.puntos];
    puntos.splice(index, 1);
    setForm({ ...form, puntos });
  };

  const handlePuntoChange = (index, e) => {
    const { name, value } = e.target;
    const puntos = [...form.puntos];
    puntos[index][name] = value;
    setForm({ ...form, puntos });
  };

  const handleImagenesChange = (e) => {
    const newFiles = Array.from(e.target.files).map(file => ({
      file,
      preview: URL.createObjectURL(file)
    }));
    setForm({ ...form, imagenes: [...form.imagenes, ...newFiles] });
  };

  const removeImagen = (index) => {
    const imagenes = [...form.imagenes];
    URL.revokeObjectURL(imagenes[index].preview);
    imagenes.splice(index, 1);
    setForm({ ...form, imagenes });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('idinmobilaria', idinmobilaria);
    formData.append('idtipoinmobiliaria', form.idtipoinmobiliaria);
    formData.append('nombre', form.nombre);
    formData.append('precio', form.precio);
    // formData.append('whatsapp', form.whatsapp);
    // formData.append('pagina', form.pagina);
    formData.append('latitud', form.latitud);
    formData.append('longitud', form.longitud);
    formData.append('descripcion', form.descripcion);
    formData.append('puntos', JSON.stringify(form.puntos));

    form.imagenes.forEach(img => {
      formData.append('imagenes', img.file);
    });

    try {
      formData.forEach((value, key) => {
        console.log(key, value);
      });

      const res = await fetch('https://apiinmo.y0urs.com/api/registerLote/', {
        method: 'POST',
        body: formData
      });

      if (res.ok) {
        alert('Inmobiliaria registrada ✅');
        onClose();
      } else {
        const data = await res.json();
        console.error(data);
        alert('Error al registrar ❌');
      }
    } catch (err) {
      console.error(err);
      alert('Error de red 🚫');
    }
  };

  return (
    <div className={style.modalOverlay}>
      <div className={style.modalContent}>
        <button className={style.closeBtn} onClick={onClose}>✖</button>
        <form className={style.formContainer} onSubmit={handleSubmit}>
          <h2 style={{ color: "black" }}>Registrar Inmobiliaria</h2>
          <label>Tipo:</label>
          <select name="idtipoinmobiliaria" value={form.idtipoinmobiliaria} onChange={handleTipoChange} className={style.input}>
            {tipos.map(t => (
              <option key={t.idtipoinmobiliaria} value={t.idtipoinmobiliaria}>{t.nombre}</option>
            ))}
          </select>

          <label>Nombre:</label>
          <input name="nombre" value={form.nombre} onChange={handleChange} className={style.input} />

          <label>Precio:</label>
          <input name="precio" value={form.precio} onChange={handleChange} className={style.input} />

          {/* <label>WhatsApp:</label>
          <input name="whatsapp" value={form.whatsapp} onChange={handleChange} className={style.input} />

          <label>Página:</label>
          <input name="pagina" value={form.pagina} onChange={handleChange} className={style.input} />  */}

          <label>Latitud:</label>
          <input name="latitud" value={form.latitud} onChange={handleChange} className={style.input} />

          <label>Longitud:</label>
          <input name="longitud" value={form.longitud} onChange={handleChange} className={style.input} />

          <label>Descripción:</label>
          <textarea name="descripcion" value={form.descripcion} onChange={handleChange} className={style.input}></textarea>

          <h3>Puntos</h3>
          {form.puntos.map((punto, index) => (
            <div key={index} className={style.puntosContainer}>
              <h3 style={{ color: "black" }}>Datos del punto {index + 1}</h3>
              <label>Latitud:</label>
              <input name="latitud" value={punto.latitud} onChange={(e) => handlePuntoChange(index, e)} className={style.input} />
              <label>Longitud:</label>
              <input name="longitud" value={punto.longitud} onChange={(e) => handlePuntoChange(index, e)} className={style.input} />
              <label>Lado (m):</label>
              <input name="lado_metros" value={punto.lado_metros} onChange={(e) => handlePuntoChange(index, e)} className={style.input} />
              <button type="button" className={style.removeBtn} onClick={() => removePunto(index)}>Eliminar</button>
            </div>
          ))}
          <button type="button" className={style.addBtn} onClick={addPunto}> Agregar Punto</button>

          <h3>Imágenes</h3>
          <input type="file" multiple onChange={handleImagenesChange} className={style.input} />
          <div className={style.previewContainer}>
            {form.imagenes.map((img, i) => (
              <div key={i} className={style.previewItem}>
                <img src={img.preview} alt={`preview-${i}`} />
                <button type="button" className={style.removeBtn} onClick={() => removeImagen(i)}>❌</button>
              </div>
            ))}
          </div>

          <button type="submit" className={style.submitBtn}>Enviar</button>
        </form>
      </div>
    </div>
  );
}

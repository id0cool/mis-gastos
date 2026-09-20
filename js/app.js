/* ==========================================================================
   Mis Gastos — Lógica de la aplicación
   JavaScript ES6+: const/let, arrow functions, template literals,
   desestructuración y métodos de arreglos (map, filter, reduce, sort, find).
   ========================================================================== */

'use strict';

/* ---------- 1. Configuración y estado ---------- */
const CLAVE_GASTOS = 'misGastos.gastos';
const CLAVE_PRESUPUESTO = 'misGastos.presupuesto';

const CATEGORIAS = [
  { id: 'comida', nombre: 'Comida', color: '#e07a5f' },
  { id: 'transporte', nombre: 'Transporte', color: '#3d85c6' },
  { id: 'escuela', nombre: 'Escuela', color: '#6a4c93' },
  { id: 'hogar', nombre: 'Hogar', color: '#2a9d8f' },
  { id: 'entretenimiento', nombre: 'Entretenimiento', color: '#e9a23b' },
  { id: 'salud', nombre: 'Salud', color: '#d1495b' },
  { id: 'otros', nombre: 'Otros', color: '#6c757d' },
];

// Estado de la aplicación: un arreglo de objetos gasto
// { id, descripcion, monto, fecha, categoria, creado }
let gastos = [];
let presupuesto = 0;

/* ---------- 2. Referencias al DOM ---------- */
const $ = (selector) => document.querySelector(selector);

const form = $('#form-gasto');
const campos = {
  id: $('#gasto-id'),
  descripcion: $('#descripcion'),
  monto: $('#monto'),
  fecha: $('#fecha'),
  categoria: $('#categoria'),
};
const btnGuardar = $('#btn-guardar');
const btnCancelar = $('#btn-cancelar');
const tituloForm = $('#titulo-form');
const lista = $('#lista-gastos');
const mensajeVacio = $('#mensaje-vacio');
const contador = $('#contador');
const buscar = $('#buscar');
const filtroCategoria = $('#filtro-categoria');
const ordenar = $('#ordenar');
const porCategoria = $('#por-categoria');
const toast = $('#toast');
const formPresupuesto = $('#form-presupuesto');
const inputPresupuesto = $('#presupuesto');

/* ---------- 3. Utilidades ---------- */
const formatoMoneda = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' });
const dinero = (n) => formatoMoneda.format(n);

const hoyISO = () => {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 10);
};

const formatoFecha = (iso) => {
  const [anio, mes, dia] = iso.split('-');
  return `${dia}/${mes}/${anio}`;
};

const buscarCategoria = (id) => CATEGORIAS.find((c) => c.id === id) ?? CATEGORIAS.at(-1);

const generarId = () =>
  (crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`);

// Evita que el texto del usuario se interprete como HTML
const escaparHTML = (texto) =>
  texto.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

let temporizadorToast;
const mostrarMensaje = (texto, tipo = 'exito') => {
  toast.textContent = texto;
  toast.className = `toast toast--${tipo} visible`;
  clearTimeout(temporizadorToast);
  temporizadorToast = setTimeout(() => toast.classList.remove('visible'), 3000);
};

/* ---------- 4. Persistencia con localStorage ---------- */
const guardarDatos = () => {
  localStorage.setItem(CLAVE_GASTOS, JSON.stringify(gastos));
  localStorage.setItem(CLAVE_PRESUPUESTO, String(presupuesto));
};

const cargarDatos = () => {
  try {
    const guardados = JSON.parse(localStorage.getItem(CLAVE_GASTOS)) ?? [];
    // Solo se aceptan registros con la forma esperada
    gastos = Array.isArray(guardados)
      ? guardados.filter((g) => g && typeof g.descripcion === 'string' && Number.isFinite(g.monto))
      : [];
  } catch (error) {
    console.warn('No se pudieron leer los datos guardados:', error);
    gastos = [];
  }
  presupuesto = Number(localStorage.getItem(CLAVE_PRESUPUESTO)) || 0;
};

/* ---------- 5. Validación ---------- */
const validarGasto = ({ descripcion, monto, fecha, categoria }) => {
  const errores = {};

  if (descripcion.length === 0) {
    errores.descripcion = 'Escribe una descripción.';
  } else if (descripcion.length < 3) {
    errores.descripcion = 'La descripción debe tener al menos 3 caracteres.';
  }

  if (Number.isNaN(monto)) {
    errores.monto = 'Escribe el monto del gasto.';
  } else if (monto <= 0) {
    errores.monto = 'El monto debe ser mayor a $0.';
  } else if (monto > 1_000_000) {
    errores.monto = 'El monto no puede pasar de $1,000,000.';
  }

  if (!fecha) {
    errores.fecha = 'Selecciona la fecha.';
  } else if (fecha > hoyISO()) {
    errores.fecha = 'La fecha no puede ser futura.';
  }

  if (!categoria) {
    errores.categoria = 'Elige una categoría.';
  }

  return errores;
};

const mostrarErrores = (errores) => {
  ['descripcion', 'monto', 'fecha', 'categoria'].forEach((nombre) => {
    const mensaje = errores[nombre] ?? '';
    $(`#error-${nombre}`).textContent = mensaje;
    campos[nombre].setAttribute('aria-invalid', mensaje ? 'true' : 'false');
  });
  // Lleva el foco al primer campo con error
  const primero = Object.keys(errores)[0];
  if (primero) campos[primero].focus();
};

/* ---------- 6. Operaciones CRUD ---------- */
const agregarGasto = (datos) => {
  gastos.push({ id: generarId(), ...datos, creado: Date.now() });
};

const actualizarGasto = (id, datos) => {
  gastos = gastos.map((g) => (g.id === id ? { ...g, ...datos } : g));
};

const eliminarGasto = (id) => {
  gastos = gastos.filter((g) => g.id !== id);
};

/* ---------- 7. Consultas: búsqueda, filtro y ordenamiento ---------- */
const comparadores = {
  'fecha-desc': (a, b) => b.fecha.localeCompare(a.fecha) || b.creado - a.creado,
  'fecha-asc': (a, b) => a.fecha.localeCompare(b.fecha) || a.creado - b.creado,
  'monto-desc': (a, b) => b.monto - a.monto,
  'monto-asc': (a, b) => a.monto - b.monto,
  'desc-asc': (a, b) => a.descripcion.localeCompare(b.descripcion, 'es'),
};

const obtenerVisibles = () => {
  const texto = buscar.value.trim().toLowerCase();
  const categoria = filtroCategoria.value;

  return gastos
    .filter((g) => categoria === 'todas' || g.categoria === categoria)
    .filter((g) => g.descripcion.toLowerCase().includes(texto))
    .sort(comparadores[ordenar.value]);
};

/* ---------- 8. Renderizado (manipulación del DOM) ---------- */
const plantillaGasto = ({ id, descripcion, monto, fecha, categoria }) => {
  const cat = buscarCategoria(categoria);
  return `
    <li class="gasto" data-id="${id}">
      <span class="chip" style="--chip:${cat.color}">${cat.nombre}</span>
      <div class="gasto-info">
        <p class="gasto-desc">${escaparHTML(descripcion)}</p>
        <p class="gasto-fecha">${formatoFecha(fecha)}</p>
      </div>
      <p class="gasto-monto">${dinero(monto)}</p>
      <div class="gasto-acciones">
        <button type="button" class="btn-icono" data-accion="editar"
                aria-label="Editar ${escaparHTML(descripcion)}">Editar</button>
        <button type="button" class="btn-icono btn-icono--peligro" data-accion="eliminar"
                aria-label="Eliminar ${escaparHTML(descripcion)}">Eliminar</button>
      </div>
    </li>`;
};

const renderLista = () => {
  const visibles = obtenerVisibles();
  lista.innerHTML = visibles.map(plantillaGasto).join('');

  mensajeVacio.hidden = visibles.length > 0;
  mensajeVacio.textContent = gastos.length === 0
    ? 'Todavía no hay gastos registrados. Agrega el primero con el formulario.'
    : 'Ningún gasto coincide con la búsqueda o el filtro.';

  contador.textContent = `${visibles.length} de ${gastos.length} registro${gastos.length === 1 ? '' : 's'}`;
};

const renderResumen = () => {
  const total = gastos.reduce((suma, g) => suma + g.monto, 0);
  const mesActual = hoyISO().slice(0, 7);
  const totalMes = gastos
    .filter((g) => g.fecha.startsWith(mesActual))
    .reduce((suma, g) => suma + g.monto, 0);

  $('#stat-total').textContent = dinero(total);
  $('#stat-mes').textContent = dinero(totalMes);
  $('#stat-registros').textContent = gastos.length;

  const barra = $('#barra-presupuesto');
  const statPresupuesto = $('#stat-presupuesto');
  if (presupuesto > 0) {
    const porcentaje = Math.min((totalMes / presupuesto) * 100, 100);
    const restante = presupuesto - totalMes;
    statPresupuesto.textContent = restante >= 0
      ? `Quedan ${dinero(restante)}`
      : `Excedido por ${dinero(Math.abs(restante))}`;
    barra.style.width = `${porcentaje}%`;
    barra.classList.toggle('excedido', restante < 0);
  } else {
    statPresupuesto.textContent = 'Sin definir';
    barra.style.width = '0';
  }

  // Total por categoría (solo las que tienen gastos), de mayor a menor
  const totales = CATEGORIAS
    .map((cat) => ({
      ...cat,
      total: gastos.filter((g) => g.categoria === cat.id).reduce((s, g) => s + g.monto, 0),
    }))
    .filter((cat) => cat.total > 0)
    .sort((a, b) => b.total - a.total);

  porCategoria.innerHTML = totales.length === 0
    ? '<li class="vacio">Sin datos todavía.</li>'
    : totales.map(({ nombre, color, total: t }) => `
        <li>
          <span class="punto" style="--chip:${color}" aria-hidden="true"></span>
          <span>${nombre}</span>
          <span class="pc-barra" aria-hidden="true"><span style="width:${(t / total) * 100}%; --chip:${color}"></span></span>
          <strong>${dinero(t)}</strong>
        </li>`).join('');
};

const render = () => {
  renderLista();
  renderResumen();
};

/* ---------- 9. Modo edición ---------- */
const entrarEdicion = (gasto) => {
  campos.id.value = gasto.id;
  campos.descripcion.value = gasto.descripcion;
  campos.monto.value = gasto.monto;
  campos.fecha.value = gasto.fecha;
  campos.categoria.value = gasto.categoria;
  tituloForm.textContent = 'Editar gasto';
  btnGuardar.textContent = 'Guardar cambios';
  btnCancelar.hidden = false;
  mostrarErrores({});
  campos.descripcion.focus();
};

const salirEdicion = () => {
  form.reset();
  campos.id.value = '';
  campos.fecha.value = hoyISO();
  tituloForm.textContent = 'Nuevo gasto';
  btnGuardar.textContent = 'Agregar gasto';
  btnCancelar.hidden = true;
  mostrarErrores({});
};

/* ---------- 10. Eventos ---------- */
form.addEventListener('submit', (evento) => {
  evento.preventDefault(); // Evita que la página se recargue

  const datos = {
    descripcion: campos.descripcion.value.trim(),
    monto: Math.round(parseFloat(campos.monto.value) * 100) / 100,
    fecha: campos.fecha.value,
    categoria: campos.categoria.value,
  };

  const errores = validarGasto(datos);
  mostrarErrores(errores);
  if (Object.keys(errores).length > 0) {
    mostrarMensaje('Revisa los campos marcados en rojo.', 'error');
    return;
  }

  const id = campos.id.value;
  if (id) {
    actualizarGasto(id, datos);
    mostrarMensaje(`Se actualizó «${datos.descripcion}».`);
  } else {
    agregarGasto(datos);
    mostrarMensaje(`Se agregó «${datos.descripcion}» por ${dinero(datos.monto)}.`);
  }

  guardarDatos();
  salirEdicion();
  render();
});

btnCancelar.addEventListener('click', salirEdicion);

// Delegación de eventos: un solo listener para los botones de todos los registros
lista.addEventListener('click', (evento) => {
  const boton = evento.target.closest('button[data-accion]');
  if (!boton) return;

  const { id } = boton.closest('.gasto').dataset;
  const gasto = gastos.find((g) => g.id === id);
  if (!gasto) return;

  if (boton.dataset.accion === 'editar') {
    entrarEdicion(gasto);
  } else if (boton.dataset.accion === 'eliminar') {
    if (confirm(`¿Eliminar «${gasto.descripcion}» de ${dinero(gasto.monto)}?`)) {
      eliminarGasto(id);
      if (campos.id.value === id) salirEdicion();
      guardarDatos();
      render();
      mostrarMensaje('Gasto eliminado.', 'info');
    }
  }
});

// Búsqueda, filtro y orden se aplican al momento
buscar.addEventListener('input', renderLista);
filtroCategoria.addEventListener('change', renderLista);
ordenar.addEventListener('change', renderLista);

// Limpia el error de un campo en cuanto el usuario lo corrige
Object.values(campos).forEach((campo) => {
  campo.addEventListener('input', () => {
    const error = $(`#error-${campo.id}`);
    if (error && error.textContent) {
      error.textContent = '';
      campo.setAttribute('aria-invalid', 'false');
    }
  });
});

formPresupuesto.addEventListener('submit', (evento) => {
  evento.preventDefault();
  const valor = parseFloat(inputPresupuesto.value);
  if (inputPresupuesto.value !== '' && (Number.isNaN(valor) || valor < 0)) {
    mostrarMensaje('El presupuesto debe ser un número positivo.', 'error');
    return;
  }
  presupuesto = Number.isNaN(valor) ? 0 : valor;
  guardarDatos();
  renderResumen();
  mostrarMensaje(presupuesto > 0 ? `Presupuesto mensual: ${dinero(presupuesto)}.` : 'Se quitó el presupuesto mensual.');
});

/* ---------- 11. Inicio ---------- */
const llenarCategorias = () => {
  const opciones = CATEGORIAS.map(({ id, nombre }) => `<option value="${id}">${nombre}</option>`).join('');
  campos.categoria.insertAdjacentHTML('beforeend', opciones);
  filtroCategoria.insertAdjacentHTML('beforeend', opciones);
};

const iniciar = () => {
  llenarCategorias();
  cargarDatos();
  campos.fecha.value = hoyISO();
  campos.fecha.max = hoyISO();
  if (presupuesto > 0) inputPresupuesto.value = presupuesto;
  render();
};

iniciar();

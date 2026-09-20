# Mis Gastos — Aplicación interactiva con JavaScript moderno

**Laboratorio de Programación Web · Actividad 3**<br>
Unidad temática 3: JavaScript, principales instrucciones<br>
Facultad de Ingeniería Mecánica y Eléctrica (FIME), UANL

| | |
|---|---|
| **Alumno** | Angel Bernardo Rodríguez Parlanch |
| **Matrícula** | 1951732 |
| **Aplicación publicada** | https://id0cool.github.io/mis-gastos/ |
| **Repositorio** | https://github.com/id0cool/mis-gastos |

---

## 1. Objetivo

Desarrollar una aplicación web del lado del cliente con **JavaScript ES6+** que use manipulación del DOM, eventos, validación de datos y persistencia local con `localStorage`, para administrar información sin depender de un servidor.

## 2. Caso elegido: control de gastos personales

**Mis Gastos** permite registrar lo que gastas día a día, corregir o borrar registros, buscar y filtrar, y ver cuánto llevas gastado en total, en el mes y por categoría. Los datos se conservan entre sesiones porque se guardan en el navegador.

## 3. Funcionalidades

| Requisito de la actividad | Cómo se cumple |
|---|---|
| Modelar datos con objetos y arreglos | Cada gasto es un objeto `{ id, descripcion, monto, fecha, categoria, creado }` dentro del arreglo `gastos`. Las categorías también son un arreglo de objetos. |
| Agregar, visualizar, editar y eliminar | Formulario para agregar y editar (el mismo formulario cambia a «modo edición»); cada registro tiene botones **Editar** y **Eliminar** (con confirmación). |
| Manipular el DOM sin recargar | La lista, el contador y los totales se vuelven a dibujar con `innerHTML` y *template literals* después de cada cambio; `preventDefault()` evita que el formulario recargue la página. |
| Eventos y funciones | `submit`, `click` (con **delegación de eventos** en la lista), `input` y `change`. Toda la lógica está dividida en funciones pequeñas. |
| Sintaxis moderna | `const`/`let`, *arrow functions*, *template literals*, desestructuración, *spread* (`...`), `??`, `Array.prototype.map/filter/reduce/sort/find`, `Intl.NumberFormat`. |
| Validación con mensajes claros | Descripción de al menos 3 caracteres, monto mayor a $0 y menor a $1,000,000, fecha obligatoria y no futura, categoría obligatoria. Cada error aparece debajo de su campo, el campo se marca en rojo y se muestra un aviso. |
| Persistencia con `localStorage` | Los gastos se guardan como JSON en la clave `misGastos.gastos` y el presupuesto en `misGastos.presupuesto`. Al abrir la página se leen y se validan antes de usarse. |
| Función adicional | **Búsqueda** por descripción, **filtro** por categoría, **ordenamiento** (fecha, monto, descripción), **contador** de registros, **categorías**, **cálculo automático** de totales (general, del mes y por categoría) y **presupuesto mensual** con barra de avance. |

## 4. Tecnologías

- HTML5 semántico
- CSS3 (variables, Grid, Flexbox, media queries) — diseño responsivo *mobile-first*
- JavaScript ES6+ sin librerías ni frameworks
- `localStorage` (Web Storage API)
- Git, GitHub y GitHub Pages
- DevTools del navegador para depurar y revisar `localStorage`

## 5. Estructura del proyecto

```
mis-gastos/
├── index.html          # Estructura de la interfaz
├── css/
│   └── styles.css      # Estilos (mobile-first)
├── js/
│   └── app.js          # Lógica: datos, validación, CRUD, render, eventos
├── img/
│   └── logo.svg
└── README.md
```

### Organización de `js/app.js`

1. Configuración y estado (`gastos`, `presupuesto`, `CATEGORIAS`)
2. Referencias al DOM
3. Utilidades (formato de moneda y fecha, escape de HTML, mensajes)
4. Persistencia (`guardarDatos`, `cargarDatos`)
5. Validación (`validarGasto`, `mostrarErrores`)
6. Operaciones CRUD (`agregarGasto`, `actualizarGasto`, `eliminarGasto`)
7. Consultas: búsqueda, filtro y ordenamiento (`obtenerVisibles`)
8. Renderizado (`renderLista`, `renderResumen`)
9. Modo edición
10. Eventos
11. Inicio

## 6. Vista de la aplicación

La interfaz se adapta a la pantalla con **CSS Grid** y **Flexbox**:

- **Escritorio (≥ 1024 px):** formulario fijo a la izquierda y lista de gastos a la derecha; resumen en 4 tarjetas.
- **Tableta (≥ 640 px):** resumen en 4 columnas, cada gasto en una sola fila y filtros en línea.
- **Móvil:** una sola columna, resumen en 2 × 2 y botones grandes para usar con el dedo.

Las capturas de cada operación (agregar, validar, editar, eliminar, buscar, filtrar y persistencia) están en el reporte de la actividad.

## 7. Cómo usarla

1. Abre https://id0cool.github.io/mis-gastos/ (o `index.html` en tu navegador).
2. Llena descripción, monto, fecha y categoría, y presiona **Agregar gasto**.
3. Usa **Editar** o **Eliminar** en cualquier registro.
4. Filtra con el buscador, la categoría o el orden.
5. Opcional: escribe un presupuesto mensual para ver cuánto te queda.
6. Recarga la página o cierra el navegador: tus datos siguen ahí.

## 8. Calidad del código

- HTML y CSS validados con el **W3C Nu Html Checker**: sin errores ni advertencias.
- JavaScript revisado con **ESLint** (`no-undef`, `no-unused-vars`): sin errores.
- El texto que escribe el usuario se escapa antes de insertarse en el DOM para evitar inyección de HTML.
- Accesibilidad: etiquetas `label` en todos los campos, errores anunciados con `aria-live`, `aria-invalid` en campos con error, foco visible y enlace para saltar al contenido.

## 9. Demostración

El video de demostración (menos de 3 minutos) muestra las operaciones principales: validación, agregar, editar, eliminar, buscar, filtrar, ordenar, presupuesto y persistencia al recargar.

---

Proyecto académico. Los datos de ejemplo de las capturas son ficticios.

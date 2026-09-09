const PASS = "AdminSERVIPREL",
  BD = "serviprel_final_v1";
let base = [],
  carpeta = "TOLUCA",
  fotoB64 = "",
  editId = null;
// DATOS POR CARPETA — EXACTOS A TUS IMÁGENES
const DATOS = {
  TOLUCA: {
    regPat: "C2234478107",
    tipo: "OFICINAS",
    dir: "BOULEVARD ADOLFO LÓPEZ MATEOS #68<br>COL. EL POTRERO, ATIZAPAN DE ZARAGOZA,<br>EDO. DE MÉXICO C.P. 52975",
  },
  CUERNAVACA: {
    regPat: "C2234478107",
    tipo: "OFICINAS",
    dir: "BOULEVARD ADOLFO LÓPEZ MATEOS #68<br>COL. EL POTRERO, ATIZAPAN DE ZARAGOZA,<br>EDO. DE MÉXICO C.P. 52975",
  },
  HIDALGO: {
    regPat: "C2234478107",
    tipo: "OFICINAS",
    dir: "BOULEVARD ADOLFO LÓPEZ MATEOS #68<br>COL. EL POTRERO, ATIZAPAN DE ZARAGOZA,<br>EDO. DE MÉXICO C.P. 52975",
  },
  CDMX: {
    regPat: "Y5242147105",
    tipo: "OFICINAS",
    dir: "BLVD. ADOLFO LÓPEZ MATEOS No. 68<br>COL. EL POTRERO, ATIZAPAN DE ZARAGOZA, EDO.<br>DE MÉXICO C.P. 52975",
  },
};
function generarID() {
  return "SRV-" + Date.now().toString(36).toUpperCase();
}
function login() {
  if (document.getElementById("pass").value.trim() === PASS) {
    document.getElementById("login").classList.add("hidden");
    document.getElementById("app").classList.remove("hidden");
    cargarBD();
    cambiarCarpeta("TOLUCA");
    renderLista();
    genQR();
  } else alert("❌ Contraseña incorrecta");
}
function cerrarSesion() {
  document.getElementById("app").classList.add("hidden");
  document.getElementById("login").classList.remove("hidden");
  document.getElementById("pass").value = "";
}
// CAMBIO DE PLANTILLA AL SELECCIONAR CARPETA
function cambiarCarpeta(c) {
  carpeta = c;
  document
    .querySelectorAll(".folder-btn")
    .forEach((b) => b.classList.remove("active"));
  event.target.classList.add("active");
  document.getElementById("carpeta-act").textContent = c;
  // MOSTRAR PLANTILLA CORRECTA
  if (c === "CDMX") {
    document.getElementById("plantilla-CDMX").classList.remove("hidden");
    document.getElementById("plantilla-OTROS").classList.add("hidden");
  } else {
    document.getElementById("plantilla-CDMX").classList.add("hidden");
    document.getElementById("plantilla-OTROS").classList.remove("hidden");
  }
  document.getElementById("oficinas-ref").innerHTML = DATOS[c].dir;
  renderLista();
  genQR();
}
// MARCA DE AGUA EN FOTO
function marcaAgua(img, cb) {
  const c = document.createElement("canvas");
  c.width = 240;
  c.height = 300;
  const x = c.getContext("2d");
  x.drawImage(img, 0, 0, 240, 300);
  x.globalAlpha = 0.15;
  x.translate(120, 150);
  x.rotate(-Math.PI / 4);
  x.font = "bold 26px Arial";
  x.fillStyle = "#000";
  x.textAlign = "center";
  x.fillText("SERVIPREL", 0, 0);
  cb(c.toDataURL("image/jpeg", 0.8));
}
document.getElementById("foto-file").addEventListener("change", (e) => {
  const f = e.target.files[0];
  if (!f) return;
  const r = new FileReader();
  r.onload = (ev) => {
    const i = new Image();
    i.onload = () =>
      marcaAgua(i, (d) => {
        fotoB64 = d;
        document.getElementById("prev-foto").src = d;
      });
    i.src = ev.target.result;
  };
  r.readAsDataURL(f);
});
// QR EN COLUMNA IZQUIERDA
function genQR() {
  const n = document.getElementById("nombre").value || "";
  if (n.length < 3) return;
  const t = `SERVIPREL | ${carpeta} | ${n} | PUESTO:${document.getElementById("puesto").value} | NSS:${document.getElementById("nss").value} | CURP:${document.getElementById("curp").value} | RFC:${document.getElementById("rfc-emp").value} | VIG:${document.getElementById("vig-emp").value}`;
  const p = document.getElementById("prev-qr-left");
  p.innerHTML = "";
  new QRCode(p, { text: t, width: 110, height: 110 });
  const q = document.getElementById("qr-oculto");
  q.innerHTML = "";
  new QRCode(q, { text: t, width: 150, height: 150 });
}
function formatoFecha(f) {
  if (!f) return "—";
  const m = [
    "ENERO",
    "FEB",
    "MAR",
    "ABR",
    "MAY",
    "JUN",
    "JUL",
    "AGO",
    "SEP",
    "OCT",
    "NOV",
    "DIC",
  ];
  const d = new Date(f);
  return `${d.getDate()}-${m[d.getMonth()]}-${d.getFullYear()}`;
}
function actualizarVista() {
  document.getElementById("prev-nombre").textContent =
    document.getElementById("nombre").value || "NOMBRE DEL EMPLEADO";
  document.getElementById("prev-puesto").textContent =
    document.getElementById("puesto").value || "—";
  document.getElementById("prev-codigo").textContent =
    document.getElementById("codigo").value || "—";
  document.getElementById("prev-fecha").textContent = formatoFecha(
    document.getElementById("fecha").value,
  );
  document.getElementById("prev-vig").textContent =
    document.getElementById("vig-emp").value;
  document.getElementById("prev-nss").textContent =
    document.getElementById("nss").value || "—";
  document.getElementById("prev-curp").textContent =
    document.getElementById("curp").value || "—";
  document.getElementById("prev-rfc-emp").textContent =
    document.getElementById("rfc-emp").value || "—";
  document.getElementById("vig-emp").value =
    document.getElementById("vig-general").value;
  genQR();
}
// BASE DE DATOS
function cargarBD() {
  try {
    base = JSON.parse(localStorage.getItem(BD)) || [];
  } catch {
    base = [];
  }
  renderLista();
}
function guardarBD() {
  localStorage.setItem(BD, JSON.stringify(base));
  renderLista();
}
function guardar() {
  const n = document.getElementById("nombre").value.trim(),
    c = document.getElementById("curp").value.trim();
  if (!n || !c) return alert("⚠️ Nombre y CURP son obligatorios");
  const emp = {
    id: editId || generarID(),
    carpeta,
    nombre: n.toUpperCase(),
    puesto: document.getElementById("puesto").value.trim().toUpperCase(),
    codigo: document.getElementById("codigo").value.trim(),
    fecha: document.getElementById("fecha").value,
    nss: document.getElementById("nss").value,
    curp: c.toUpperCase(),
    rfcEmp: document.getElementById("rfc-emp").value.toUpperCase(),
    vigencia: document.getElementById("vig-emp").value,
    foto: fotoB64,
  };
  const i = base.findIndex((e) => e.curp === c);
  i >= 0 ? (base[i] = emp) : base.push(emp);
  guardarBD();
  alert(i >= 0 ? "✅ Actualizado" : "✅ Guardado");
  limpiar();
}
window.cargarEmpleado = function (id) {
  const e = base.find((x) => x.id === id);
  if (!e) return;
  editId = e.id;
  carpeta = e.carpeta;
  document.getElementById("nombre").value = e.nombre;
  document.getElementById("puesto").value = e.puesto;
  document.getElementById("codigo").value = e.codigo;
  document.getElementById("fecha").value = e.fecha;
  document.getElementById("nss").value = e.nss;
  document.getElementById("curp").value = e.curp;
  document.getElementById("rfc-emp").value = e.rfcEmp;
  document.getElementById("vig-emp").value = e.vigencia;
  document.getElementById("vig-general").value = e.vigencia;
  fotoB64 = e.foto || "";
  if (fotoB64) document.getElementById("prev-foto").src = fotoB64;
  document
    .querySelectorAll(".folder-btn")
    .forEach((b) =>
      b.classList.toggle("active", b.textContent.includes(carpeta)),
    );
  cambiarCarpeta(carpeta);
  actualizarVista();
};
window.borrarEmpleado = function (id) {
  if (!confirm("⚠️ ¿Eliminar? No se puede deshacer.")) return;
  base = base.filter((e) => e.id !== id);
  guardarBD();
  alert("✅ Eliminado");
  limpiar();
};
function renderLista() {
  const b = document.getElementById("buscar").value.toLowerCase(),
    f = document.getElementById("filtro").value;
  let r = base;
  if (f !== "TODAS") r = r.filter((e) => e.carpeta === f);
  if (b)
    r = r.filter(
      (e) =>
        e.nombre.toLowerCase().includes(b) ||
        e.curp.toLowerCase().includes(b),
    );
  const c = { TOLUCA: 0, CDMX: 0, CUERNAVACA: 0, HIDALGO: 0 };
  base.forEach((e) => c[e.carpeta]++);
  Object.keys(c).forEach((k) => {
    const el = document.getElementById("c-" + k);
    if (el) el.textContent = c[k];
  });
  document.getElementById("total").textContent = base.length;
  document.getElementById("lista").innerHTML = r.length
    ? r
        .map((e) => {
          const col = {
            TOLUCA: "#b45309",
            CDMX: "#1e40af",
            CUERNAVACA: "#15803d",
            HIDALGO: "#7e22ce",
          }[e.carpeta];
          return `<div class="lista-item"><div onclick="cargarEmpleado('${e.id}')"><span class="badge" style="background:${col}">${e.carpeta}</span><strong>${e.nombre}</strong><br><small>${e.puesto} | ${e.vigencia}</small></div><div class="acciones"><button class="btn-sm btn-blue" onclick="cargarEmpleado('${e.id}')">✏️</button><button class="btn-sm btn-red" onclick="event.stopPropagation();borrarEmpleado('${e.id}')">🗑️</button></div></div>`;
        })
        .join("")
    : '<p style="text-align:center;color:#777;padding:15px">Sin registros</p>';
}
function actualizarTodas() {
  const v = document.getElementById("vig-general").value;
  if (!base.length) return alert("⚠️ No hay registros");
  if (!confirm(`¿Actualizar ${base.length} credenciales a ${v}?`)) return;
  base = base.map((e) => ({ ...e, vigencia: v }));
  guardarBD();
  document.getElementById("vig-emp").value = v;
  actualizarVista();
  alert("✅ Actualizadas");
}
function limpiar() {
  editId = null;
  fotoB64 = "";
  [
    "nombre",
    "puesto",
    "codigo",
    "fecha",
    "nss",
    "curp",
    "rfc-emp",
    "foto-file",
  ].forEach((i) => (document.getElementById(i).value = ""));
  document.getElementById("prev-foto").src = "";
  document.getElementById("prev-qr-left").innerHTML = "";
  document.getElementById("vig-emp").value =
    document.getElementById("vig-general").value;
  actualizarVista();
}
// PDF EXACTO A LA PLANTILLA
async function exportarPDF() {
  const { jsPDF } = window.jspdf;
  const d = new jsPDF({
    unit: "mm",
    format: [54, 86],
    orientation: "portrait",
  });
  const n = document.getElementById("nombre").value || "SIN_NOMBRE";
  await new Promise((r) => setTimeout(r, 300));
  const qr =
    document.querySelector("#qr-oculto canvas") ||
    document.querySelector("#prev-qr-left canvas");
  const qrImg = qr ? qr.toDataURL("image/png") : "";
  d.setLineWidth(0.5);
  d.rect(1, 1, 52, 84);
  d.line(26, 1, 26, 85);
  // COLUMNA IZQUIERDA
  d.setFont("helvetica", "bold");
  d.setFontSize(6.5);
  d.text("SERVIPREL, S.A. DE C.V.", 13, 4, { align: "center" });
  d.setFont("helvetica", "normal");
  d.setFontSize(5);
  if (carpeta === "CDMX") {
    d.text("R.F.C. SER111010AM9", 2, 8);
    d.text("REPSE: STPS/UTD/DGIFT/ARR/4152/2024", 2, 12);
    d.text("REGISTRO PATRONAL: Y5242147105", 2, 17);
    d.text("DOMICILIO:", 2, 22);
    d.text("RODOLFO GAONA No. 3", 2, 26);
    d.text("INT. 502, LOMAS DE SOTELO", 2, 30);
    d.text("CDMX C.P. 11200", 2, 34);
  } else {
    d.text("REGISTRO PATRONAL: C2234478107", 2, 8);
    d.text("R.F.C. SER111010AM9", 2, 12);
    d.text("REPSE: STPS/UTD/DGIFT/ARR/4152/2024", 2, 16);
    d.text("OFICINAS:", 2, 21);
    d.text("BLVD. ADOLFO LÓPEZ MATEOS #68", 2, 25);
    d.text("COL. EL POTRERO, ATIZAPAN", 2, 29);
    d.text("EDO. MÉXICO C.P. 52975", 2, 33);
  }
  d.text("TEL: 555077-26-84 / 555816-27-89", 2, 39);
  d.text("800-837-40-95", 2, 43);
  if (qrImg) d.addImage(qrImg, "PNG", 5, 47, 15, 15);
  d.line(2, 72, 24, 72);
  d.text("FIRMA DEL EMPLEADO", 13, 76, { align: "center" });
  // COLUMNA DERECHA
  d.setFontSize(5.5);
  d.text("ESTA PERSONA LABORA PARA:", 40, 4, { align: "center" });
  d.setFontSize(6.5);
  d.setFont("helvetica", "bold");
  d.text("SERVIPREL, S.A. DE C.V.", 40, 7.5, { align: "center" });
  d.setFont("helvetica", "normal");
  d.setFontSize(4);
  d.text("OFICINAS: BLVD. ADOLFO LÓPEZ MATEOS", 28, 12);
  d.text("#68, COL. EL POTRERO, ATIZAPAN", 28, 15);
  d.text("EDO. MÉXICO C.P. 52975", 28, 18);
  if (fotoB64) d.addImage(fotoB64, "JPEG", 33, 21, 14, 18);
  else {
    d.rect(33, 21, 14, 18);
    d.text("FOTO", 40, 31, { align: "center" });
  }
  d.setFontSize(5);
  d.text(n.substring(0, 24).toUpperCase(), 40, 42, { align: "center" });
  d.text(
    `PUESTO: ${document.getElementById("puesto").value || "—"}`,
    28,
    46,
  );
  d.text(`${document.getElementById("codigo").value || "—"}`, 28, 50);
  d.text(
    `FECHA DE INGRESO: ${formatoFecha(document.getElementById("fecha").value)}`,
    28,
    54,
  );
  d.text(`VIGENCIA: ${document.getElementById("vig-emp").value}`, 28, 58);
  d.text(
    `NSS IMSS: ${document.getElementById("nss").value || "—"}`,
    28,
    62,
  );
  d.text(`CURP: ${document.getElementById("curp").value || "—"}`, 28, 66);
  d.text(
    `R.F.C.: ${document.getElementById("rfc-emp").value || "—"}`,
    28,
    70,
  );
  d.save(`Cred_${carpeta}_${n.replace(/ /g, "_")}.pdf`);
}
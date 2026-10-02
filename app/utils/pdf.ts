import { jsPDF } from "jspdf";
import type { Colaborador } from "~/types/colaborador";

const doc = new jsPDF({
  unit: "mm",
  format: 'letter',
  orientation: "portrait",
});

let x_inicial = 18, y_inicial = 19, alto = 84, ancho = 60;
function margenes() {
  doc.setLineWidth(0.5);
  doc.rect(x_inicial, y_inicial, ancho * 2, alto);
  doc.line(x_inicial + ancho, y_inicial, x_inicial + ancho, y_inicial + alto);
}

// COLUMNA IZQUIERDA
function reverso(qrObjectURL: string) {
  let x_actual = x_inicial + (ancho / 2), y_actual = y_inicial + 4;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("SERVIPREL, S.A. DE C.V.", x_actual, y_actual, { align: "center" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  let texto = "";
  doc.setFont("helvetica", "bold");
  texto = "TEL: 555077-26-84 / 555816-27-89";
  texto += "\n800-837-40-95";
  doc.text(texto, x_actual, y_actual + 45, { align: "center" });

  doc.line(x_inicial + 2, y_actual + 74, x_inicial + ancho - 2, y_actual + 74);
  doc.text("FIRMA DEL EMPLEADO", x_actual, y_actual + 78, { align: "center" });
}

// COLUMNA DERECHA
function frontal(colaborador: Colaborador, fotoPreview: string) {
  let x_actual = x_inicial + ancho + (ancho / 2), y_actual = y_inicial + 4;
  // doc.setFontSize(5.5);
  doc.text("ESTA PERSONA LABORA PARA:", x_actual, y_actual, { align: "center" });
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("SERVIPREL, S.A. DE C.V.", x_actual, y_actual + 6, { align: "center" });

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  let texto = "OFICINAS:\nBLVD. ADOLFO LÓPEZ MATEOS";
  texto += "\n#68, COL. EL POTRERO, ATIZAPAN";
  texto += "\nEDO. MÉXICO C.P. 52975";

  let alto_foto = 28, ancho_foto = 20;
  if (fotoPreview) {
    doc.addImage(fotoPreview, "JPEG", x_actual - (ancho_foto / 2), y_actual + 14, ancho_foto, alto_foto);
  } else {
    doc.rect(x_actual - (ancho_foto / 2), y_actual + 14, ancho_foto, alto_foto);
    doc.text("FOTO", x_actual, y_actual + 28, { align: "center" });
  }
  // doc.rect(x_actual - (ancho_foto / 2), y_actual + 14, ancho_foto, alto_foto);
  // doc.text("FOTO", x_actual, y_actual + 28, { align: "center" });

  texto = colaborador.nombre.substring(0, 24).toUpperCase();
  texto += `\nPUESTO: ${colaborador.puesto  || "—"}`;
  doc.text(texto, x_actual, y_actual + 46, { align: "center" });

  doc.setFont("helvetica", "normal");
  texto = `${colaborador.codigo_interno || "—"}`;
  // texto += `\nFECHA DE INGRESO: ${formatoFecha(colaborador.f_ingreso)}`;
  doc.text(texto, x_actual, y_actual + 54, { align: "center" });

  doc.setFont("helvetica", "bold");
  texto = `VIGENCIA: ${colaborador.vigencia}`;
  texto += `\nNSS IMSS: ${colaborador.nss_imss || "—"}`;
  texto += `\nCURP: ${colaborador.curp || "—"}`;
  texto += `\nR.F.C.: ${colaborador.rfc || "—"}`;
  doc.text(texto, x_actual, y_actual + 64, { align: "center" });
}

export default async function(colaborador: Colaborador, qrObjectURL: string) {
  margenes();
  reverso(qrObjectURL);
  frontal(colaborador, qrObjectURL);

  doc.save(`Cred_${'carpeta'}_${colaborador.nombre.replace(/ /g, "_")}.pdf`);
}
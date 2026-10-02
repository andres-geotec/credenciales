import { jsPDF } from "jspdf";

export async function exportarPDF() {
  const doc = new jsPDF({
    unit: "mm",
    format: 'letter',
    orientation: "portrait",
  });

  let x_inicial = 18, y_inicial = 19, alto = 84, ancho = 60;
  doc.setLineWidth(0.5);
  doc.rect(x_inicial, y_inicial, ancho * 2, alto);
  doc.line(x_inicial + ancho, y_inicial, x_inicial + ancho, y_inicial + alto);

  doc.save(`Cred_${'carpeta'}_${'form.nombre'.replace(/ /g, "_")}.pdf`);
}
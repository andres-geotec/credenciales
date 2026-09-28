import { jsPDF } from "jspdf";



export async function exportarPDF(colaborador) {
  console.log(colaborador);
  

  // await new Promise((r) => setTimeout(r, 300));
  const d = new jsPDF({
    unit: "mm",
    format: 'letter',
    orientation: "portrait",
  });

  let x_inicial = 18, y_inicial = 19, alto = 84, ancho = 60;
  d.setLineWidth(0.5);
  d.rect(x_inicial, y_inicial, ancho * 2, alto);
  d.line(x_inicial + ancho, y_inicial, x_inicial + ancho, y_inicial + alto);

  // COLUMNA IZQUIERDA
  let x_actual = x_inicial + (ancho / 2), y_actual = y_inicial + 4;
  d.setFont("helvetica", "bold");
  d.setFontSize(10);
  d.text("SERVIPREL, S.A. DE C.V.", x_actual, y_actual, { align: "center" });
  // d.text("SERVIPREL, S.A. DE C.V.", 13, 4, { align: "center" });

  d.setFont("helvetica", "normal");
  d.setFontSize(9);
  let texto = "";
  // if (carpeta === "CDMX") {
    // d.text("R.F.C. SER111010AM9", 2, 8);
    texto += "R.F.C. SER111010AM9";
    // d.text("REPSE: STPS/UTD/DGIFT/ARR/4152/2024", 2, 12);
    texto += "\nREPSE: STPS/UTD/DGIFT/ARR/4152/2024";
    // d.text("REGISTRO PATRONAL: Y5242147105", 2, 17);
    texto += "\nREGISTRO PATRONAL: Y5242147105";
    // d.text("DOMICILIO:", 2, 22);
    texto += "\nDOMICILIO:";
    // d.text("RODOLFO GAONA No. 3", 2, 26);
    texto += "\nRODOLFO GAONA No. 3";
    // d.text("COL. LOMAS DE SOTELO", 2, 30);
    texto += "\nCOL. LOMAS DE SOTELO";
    // d.text("CDMX C.P. 11200", 2, 34);
    texto += "\nCDMX C.P. 11200";
    // d.text("INT. 502, LOMAS DE SOTELO", 2, 30);
    texto += "\nINT. 502, LOMAS DE SOTELO";
    // d.text("CDMX C.P. 11200", 2, 34);
    texto += "\nCDMX C.P. 11200";
  // } else {
  //   // d.text("REGISTRO PATRONAL: C2234478107", 2, 8);
  //   texto += "REGISTRO PATRONAL: C2234478107";
  //   // d.text("R.F.C. SER111010AM9", 2, 12);
  //   texto += "\n\nR.F.C. SER111010AM9";
  //   // d.text("REPSE: STPS/UTD/DGIFT/ARR/4152/2024", 2, 16);
  //   texto += "\nREPSE:\nSTPS/UTD/DGIFT/ARR/4152/2024";
  //   // d.text("OFICINAS:", 2, 21);
  //   texto += "\n\nOFICINAS:";
  //   // d.text("BLVD. ADOLFO LÓPEZ MATEOS #68", 2, 25);
  //   texto += "\nBLVD. ADOLFO LÓPEZ MATEOS #68";
  //   // d.text("COL. EL POTRERO, ATIZAPAN", 2, 29);
  //   texto += "\nCOL. EL POTRERO, ATIZAPAN";
  //   // d.text("EDO. MÉXICO C.P. 52975", 2, 33);
  //   texto += "\nEDO. MÉXICO C.P. 52975";
  // }
  d.text(texto, x_actual, y_actual + 6, { align: "center" });

  d.setFont("helvetica", "bold");
  // d.text("TEL: 555077-26-84 / 555816-27-89", 2, 39);
  texto = "TEL: 555077-26-84 / 555816-27-89";
  // d.text("800-837-40-95", 2, 43);
  texto += "\n800-837-40-95";
  d.text(texto, x_actual, y_actual + 45, { align: "center" });
  
  // if (qrImg) d.addImage(qrImg, "PNG", x_inicial + 2, y_actual + 52, 20, 20);
  d.line(x_inicial + 2, y_actual + 74, x_inicial + ancho - 2, y_actual + 74);
  d.text("FIRMA DEL EMPLEADO", x_actual, y_actual + 78, { align: "center" });

  // COLUMNA DERECHA
  x_actual = x_inicial + ancho + (ancho / 2);
  // d.setFontSize(5.5);
  d.text("ESTA PERSONA LABORA PARA:", x_actual, y_actual, { align: "center" });
  d.setFontSize(12);
  d.setFont("helvetica", "bold");
  d.text("SERVIPREL, S.A. DE C.V.", x_actual, y_actual + 6, { align: "center" });
  d.setFontSize(9);
  d.setFont("helvetica", "normal");
  // d.text("OFICINAS: BLVD. ADOLFO LÓPEZ MATEOS", x_inicial + ancho + 2, 12);
  texto = "OFICINAS:\nBLVD. ADOLFO LÓPEZ MATEOS";
  // d.text("#68, COL. EL POTRERO, ATIZAPAN", x_inicial + ancho + 2, 15);
  texto += "\n#68, COL. EL POTRERO, ATIZAPAN";
  // d.text("EDO. MÉXICO C.P. 52975", x_inicial + ancho + 2, 18);
  texto += "\nEDO. MÉXICO C.P. 52975";
  // d.text(texto, x_actual, y_actual + 12, { align: "center" });
  let alto_foto = 28, ancho_foto = 20;
  // if (fotoB64) d.addImage(fotoB64, "JPEG", x_actual - (ancho_foto / 2), y_actual + 14, ancho_foto, alto_foto);
  // else {
    d.rect(x_actual - (ancho_foto / 2), y_actual + 14, ancho_foto, alto_foto);
    d.text("FOTO", x_actual, y_actual + 28, { align: "center" });
  // }
  // d.setFontSize(5);
    
  // d.text(n.substring(0, 24).toUpperCase(), x_inicial + ancho + 14, 42, { align: "center" });
  texto = colaborador.nombre.substring(0, 24).toUpperCase();
  // d.text(
  //   `PUESTO: ${document.getElementById("puesto").value || "—"}`,
  //   x_inicial + ancho + 2,
  //   46,
  // );
  texto += `\nPUESTO: ${document.getElementById("puesto").value || "—"}`;
  d.text(texto, x_actual, y_actual + 46, { align: "center" });
  d.setFont("helvetica", "normal");
  // d.text(${document.getElementById("codigo").value || "—"}`, x_inicial + ancho + 2, 50);
  texto = `${document.getElementById("codigo").value || "—"}`;
  // d.text(
  //   `FECHA DE INGRESO: ${formatoFecha(document.getElementById("fecha").value)}`,
  //   x_inicial + ancho + 2,
  //   54,
  // );
  texto += `\nFECHA DE INGRESO: ${formatoFecha(document.getElementById("fecha").value)}`;
  d.text(texto, x_actual, y_actual + 54, { align: "center" });
  d.setFont("helvetica", "bold");
  // d.text(`VIGENCIA: ${document.getElementById("vig-emp").value}`, x_inicial + ancho + 2, 58);
  texto = `VIGENCIA: ${document.getElementById("vig-emp").value}`;
  // d.text(
  //   `NSS IMSS: ${document.getElementById("nss").value || "—"}`,
  //   x_inicial + ancho + 2,
  //   62,
  // );
  texto += `\nNSS IMSS: ${document.getElementById("nss").value || "—"}`;
  // d.text(`CURP: ${document.getElementById("curp").value || "—"}`, x_inicial + ancho + 2, 66);
  texto += `\nCURP: ${document.getElementById("curp").value || "—"}`;
  // d.text(
  //   `R.F.C.: ${document.getElementById("rfc-emp").value || "—"}`,
  //   x_inicial + ancho + 2,
  //   70,
  // );
  texto += `\nR.F.C.: ${document.getElementById("rfc-emp").value || "—"}`;
  d.text(texto, x_actual, y_actual + 64, { align: "center" });
  d.save(`Cred_${carpeta}_${n.replace(/ /g, "_")}.pdf`);
}


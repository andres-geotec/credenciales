import { jsPDF } from 'jspdf'
import type { Colaborador } from '~/types/colaborador'

const doc = new jsPDF({
  unit: 'mm',
  format: 'letter',
  orientation: 'portrait',
})

const x_inicial = 18,
  y_inicial = 19,
  alto = 84,
  ancho = 60
function margenes() {
  doc.setLineWidth(0.5)
  doc.rect(x_inicial, y_inicial, ancho * 2, alto)
  doc.line(x_inicial + ancho, y_inicial, x_inicial + ancho, y_inicial + alto)
}

// COLUMNA IZQUIERDA
function reverso(qrObjectURL: string) {
  const x_actual = x_inicial + ancho / 2,
    y_actual = y_inicial + 4
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.text('SERVIPREL, S.A. DE C.V.', x_actual, y_actual, { align: 'center' })

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  let texto = ''
  const carpeta = 'CDMX'
  if (carpeta === 'CDMX') {
    texto += 'R.F.C. SER111010AM9'
    texto += '\nREPSE: STPS/UTD/DGIFT/ARR/4152/2024'
    texto += '\nREGISTRO PATRONAL: Y5242147105'
    texto += '\nDOMICILIO:'
    texto += '\nRODOLFO GAONA No. 3'
    texto += '\nCOL. LOMAS DE SOTELO'
    texto += '\nCDMX C.P. 11200'
    texto += '\nINT. 502, LOMAS DE SOTELO'
    texto += '\nCDMX C.P. 11200'
  } else {
    texto += 'REGISTRO PATRONAL: C2234478107'
    texto += '\n\nR.F.C. SER111010AM9'
    texto += '\nREPSE:\nSTPS/UTD/DGIFT/ARR/4152/2024'
    texto += '\n\nOFICINAS:'
    texto += '\nBLVD. ADOLFO LÓPEZ MATEOS #68'
    texto += '\nCOL. EL POTRERO, ATIZAPAN'
    texto += '\nEDO. MÉXICO C.P. 52975'
  }
  doc.text(texto, x_actual, y_actual + 6, { align: 'center' })

  doc.setFont('helvetica', 'bold')
  texto = 'TEL: 555077-26-84 / 555816-27-89'
  texto += '\n800-837-40-95'
  doc.text(texto, x_actual, y_actual + 45, { align: 'center' })

  doc.line(x_inicial + 2, y_actual + 74, x_inicial + ancho - 2, y_actual + 74)
  doc.text('FIRMA DEL EMPLEADO', x_actual, y_actual + 78, { align: 'center' })
}

// COLUMNA DERECHA
function frontal(colaborador: Colaborador, fotoPreview: string) {
  const x_actual = x_inicial + ancho + ancho / 2,
    y_actual = y_inicial + 4
  // doc.setFontSize(5.5);
  doc.text('ESTA PERSONA LABORA PARA:', x_actual, y_actual, { align: 'center' })
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text('SERVIPREL, S.A. DE C.V.', x_actual, y_actual + 6, {
    align: 'center',
  })

  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  // let texto = 'OFICINAS:\nBLVD. ADOLFO LÓPEZ MATEOS'
  // // texto += '\n#68, COL. EL POTRERO, ATIZAPAN'
  // // texto += '\nEDO. MÉXICO C.P. 52975'

  const alto_foto = 28,
    ancho_foto = 20
  if (fotoPreview) {
    doc.addImage(
      fotoPreview,
      'JPEG',
      x_actual - ancho_foto / 2,
      y_actual + 14,
      ancho_foto,
      alto_foto
    )
  } else {
    doc.rect(x_actual - ancho_foto / 2, y_actual + 14, ancho_foto, alto_foto)
    doc.text('FOTO', x_actual, y_actual + 28, { align: 'center' })
  }
  // doc.rect(x_actual - (ancho_foto / 2), y_actual + 14, ancho_foto, alto_foto);
  // doc.text("FOTO", x_actual, y_actual + 28, { align: "center" });

  let texto = colaborador.nombre.substring(0, 24).toUpperCase()
  texto += `\nPUESTO: ${colaborador.puesto || '—'}`
  doc.text(texto, x_actual, y_actual + 46, { align: 'center' })

  doc.setFont('helvetica', 'normal')
  texto = `${colaborador.codigo_interno || '—'}`
  // texto += `\nFECHA DE INGRESO: ${formatoFecha(colaborador.f_ingreso)}`;
  doc.text(texto, x_actual, y_actual + 54, { align: 'center' })

  doc.setFont('helvetica', 'bold')
  texto = `VIGENCIA: ${colaborador.vigencia}`
  texto += `\nNSS IMSS: ${colaborador.nss_imss || '—'}`
  texto += `\nCURP: ${colaborador.curp || '—'}`
  texto += `\nR.F.C.: ${colaborador.rfc || '—'}`
  doc.text(texto, x_actual, y_actual + 64, { align: 'center' })
}

export default async function (
  colaborador: Colaborador,
  qrObjectURL: string,
  fotoPreview: string
) {
  margenes()
  reverso(qrObjectURL)
  frontal(colaborador, fotoPreview)

  doc.save(`Cred_${'carpeta'}_${colaborador.nombre.replace(/ /g, '_')}.pdf`)
}

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

const empresa = {
  nombre: 'SERVIPREL, S.A. DE C.V.',
  rfc: 'SER111010AM9',
  repse: 'STPS/UTD/DGIFT/ARR/4152/2024',
  r_patronal: {
    CDMX: 'Y5242147105',
    otros: 'C2234478107',
  },
  domicilio: 'RODOLFO GAONA No. 3, COL. LOMAS DE SOTELO, CDMX, C.P. 11200',
  tel: ['555-077-26-84', '555-816-27-89', '800-837-40-95'],
}

function agregarTexto(texto: string, x: number, y: number, margenTop: number = 1, fontSize: number = 10) {
  doc.setFontSize(fontSize)
  // fontSize 12 = 3 en y
  // fontSize 10 = 2.5 en y
  y += (fontSize / 4) + margenTop

  doc.setFont('helvetica', 'bold')
  doc.text(texto, x, y, { align: 'center' })
  return y
}

// COLUMNA IZQUIERDA
function reverso(r_patronal: string, qrObjectURL: string) {
  const x_actual = x_inicial + ancho / 2
  let y_actual = y_inicial

  y_actual = agregarTexto(empresa.nombre, x_actual, y_actual, 2, 12)
  // doc.setFont('helvetica', 'normal')
  y_actual = agregarTexto('RFC:', x_actual, y_actual, 4)
  y_actual = agregarTexto(empresa.rfc, x_actual, y_actual)
  // y_actual = agregarTexto(`RFC:\n${empresa.rfc}`, x_actual, y_actual, 4)
  // y_actual += 2.5 + 1
  y_actual = agregarTexto('REPSE:', x_actual, y_actual, 4)
  y_actual = agregarTexto(empresa.repse, x_actual, y_actual)
  y_actual = agregarTexto('REGISTRO PATRONAL:', x_actual, y_actual, 4)
  y_actual = agregarTexto(r_patronal, x_actual, y_actual)
  y_actual = agregarTexto('TEL:', x_actual, y_actual, 4)
  y_actual = agregarTexto(`${empresa.tel[0]} / ${empresa.tel[1]} /`, x_actual, y_actual)
  y_actual = agregarTexto(`${empresa.tel[2]}`, x_actual, y_actual)

  const tamanio_qr = 25
  // doc.rect(x_inicial + 2, y_inicial + alto - tamanio_qr - 2, tamanio_qr, tamanio_qr)
  doc.addImage(
    qrObjectURL, 'JPEG',
    x_inicial + 2,
    y_inicial + alto - tamanio_qr - 2,
    tamanio_qr, tamanio_qr
  )

  y_actual += 26
  doc.line(x_inicial + tamanio_qr + 4, y_actual, x_inicial + ancho - 4, y_actual)
  // doc.text('Firmna del empleado', x_actual, y_actual, { align: 'center' })
  agregarTexto('FIRMA DEL\nEMPLEADO', x_actual + (tamanio_qr / 2), y_actual)
}

// COLUMNA DERECHA
function frontal(colaborador: Colaborador, fotoPreview: string) {
  const x_actual = x_inicial + ancho + ancho / 2
  let y_actual = y_inicial

  y_actual = agregarTexto('ESTA PERSONA LABORA PARA:', x_actual, y_actual)
  y_actual = agregarTexto(empresa.nombre, x_actual, y_actual, 4, 12)

  y_actual += 4
  const procentaje = .85
  const alto_foto = 45 * procentaje, ancho_foto = 35 * procentaje
  if (fotoPreview) {
    doc.addImage(
      fotoPreview,
      'JPEG',
      x_actual - ancho_foto / 2,
      y_actual,
      ancho_foto,
      alto_foto
    )
  } else {
    doc.rect(x_actual - ancho_foto / 2, y_actual, ancho_foto, alto_foto)
    // doc.text('FOTO', x_actual, y_actual + 28, { align: 'center' })
  }
  y_actual += alto_foto

  y_actual = agregarTexto(colaborador.nombre, x_actual, y_actual, 4)
  let texto = `PUESTO: ${colaborador.puesto || '—'}`
  texto += `\nEMAGO${colaborador.codigo_interno || '—'}SERV`
  texto += `\nFECHA DE INGRESO: ${FormatoFecha(colaborador.f_ingreso)}`
  texto += `\nVIGENCIA: ${FormatoFecha(colaborador.vigencia)}`
  texto += `\nNSS IMSS: ${colaborador.nss_imss || '—'}`
  agregarTexto(texto, x_actual, y_actual, 4)
}

export default async function (
  colaborador: Colaborador,
  qrObjectURL: string,
  fotoPreview: string
) {
  margenes()
  reverso(colaborador.descripcion === 'CDMX' ? empresa.r_patronal.CDMX : empresa.r_patronal.otros, qrObjectURL)
  frontal(colaborador, fotoPreview)

  doc.save(`Cred_${colaborador.descripcion}_${colaborador.nombre.replace(/ /g, '_')}.pdf`)
}

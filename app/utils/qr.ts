import QRCode from 'qrcode'

export default async function (
  canvas: HTMLCanvasElement,
  valor: string,
  alGenerar: (objectUrl: string) => void
) {
  if (!canvas) return

  try {
    // 1. Dibujar el código QR en el Canvas oculto
    await QRCode.toCanvas(canvas, valor, {
      width: 300,
      margin: 2,
    })

    // 2. Convertir el Canvas en un Blob (Archivo binario en memoria)
    canvas.toBlob((blob: Blob | null) => {
      if (!blob) return

      // 3. Crear la URL local apuntando al Blob
      // generarPDF(form as Colaborador, URL.createObjectURL(blob))
      alGenerar(URL.createObjectURL(blob))
    }, 'image/png')
  } catch (err) {
    console.error('Error generando el código QR:', err)
  }
}

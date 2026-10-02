<script setup>
import generarPDF from '~/utils/pdf'
import QRCode from 'qrcode'

const form = reactive({
  nombre: '',
  puesto: '',
  codigo_interno: '',
  f_ingreso: '',
  nss_imss: '',
  curp: '',
  rfc: '',
  vigencia: '',
  foto_url: '',
  // descripcion: ''
})

function guardar() {
  console.log('Guardando colaborador:', form)
  // Aquí puedes agregar la lógica para enviar los datos a un servidor o guardarlos localmente
}

const canvasRef = ref(null)
async function generateQrUrl() {
  if (!form.nombre || !canvasRef.value) return

  try {
    // 1. Dibujar el código QR en el Canvas oculto
    await QRCode.toCanvas(canvasRef.value, form.nombre, {
      width: 300,
      margin: 2,
    })

    // 2. Convertir el Canvas en un Blob (Archivo binario en memoria)
    canvasRef.value.toBlob((blob) => {
      if (!blob) return

      // 3. Crear la URL local apuntando al Blob
      generarPDF(form, URL.createObjectURL(blob))
    }, 'image/png')

  } catch (err) {
    console.error('Error generando el código QR:', err)
  }
}
</script>

<template>
  <div>
    <form @submit.prevent="guardar">
      <div>
        <label for="nombre">Nombre:</label>
        <input id="nombre" v-model="form.nombre" type="text" required>
      </div>

      <div>
        <button type="submit">
          💾 Guardar
        </button>
        <!-- <button @click.prevent="generarPDF(form)"> -->
        <button @click.prevent="generateQrUrl">
          📄 PDF
        </button>
        <button>
          ❌ Cancelar
        </button>
      </div>

      <canvas ref="canvasRef" style="display: none;"></canvas>
    </form>
  </div>
</template>
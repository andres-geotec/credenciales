<script setup>
import { ref, onBeforeUnmount } from 'vue'
import QRCode from 'qrcode'

const textToEncode = ref('https://nuxt.com')
const canvasRef = ref(null)
const qrObjectURL = ref('')

const generateQrUrl = async () => {
  if (!textToEncode.value || !canvasRef.value) return

  try {
    // 1. Dibujar el código QR en el Canvas oculto
    await QRCode.toCanvas(canvasRef.value, textToEncode.value, {
      width: 300,
      margin: 2,
    })

    // 2. Convertir el Canvas en un Blob (Archivo binario en memoria)
    canvasRef.value.toBlob((blob) => {
      if (!blob) return

      // Limpieza preventiva de URLs de objeto anteriores para evitar fugas de memoria
      if (qrObjectURL.value) {
        URL.revokeObjectURL(qrObjectURL.value)
      }

      // 3. Crear la URL local apuntando al Blob
      qrObjectURL.value = URL.createObjectURL(blob)
    }, 'image/png')

  } catch (err) {
    console.error('Error generando el código QR:', err)
  }
}

// Es una buena práctica liberar la memoria cuando el componente se destruye
onBeforeUnmount(() => {
  if (qrObjectURL.value) {
    URL.revokeObjectURL(qrObjectURL.value)
  }
})
</script>

<template>
  <div class="qr-container">
    <h2>Generador de QR</h2>
    <input v-model="textToEncode" placeholder="Escribe un enlace o texto..." />
    <button @click="generateQrUrl">Generar URL de Imagen</button>

    <!-- Canvas oculto utilizado para procesar el QR en memoria -->
    <canvas ref="canvasRef" style="display: none;"></canvas>

    <!-- Mostrar el resultado si la URL del objeto existe -->
    <div v-if="qrObjectURL" class="result">
      <p>Imagen cargada vía <code>URL.createObjectURL</code>:</p>
      <img :src="qrObjectURL" alt="Código QR Generado" />
      <br />
      <a :href="qrObjectURL" download="qr-code.png">Descargar Imagen</a>
    </div>
  </div>
</template>

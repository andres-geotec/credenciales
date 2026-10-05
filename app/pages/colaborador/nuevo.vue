<script setup lang="ts">
definePageMeta({
  middleware: 'auth',
})

// const router = useRouter()

async function empleadoGuardado(id: string) {
  // await router.push(`/colaborador/${id}`)
  console.log(id)
}
</script>

<template>
  <div class="contenedor ancho-lectura m-y-5-mov m-b-maximo-esc">
    <h1>DATOS DEL EMPLEADO - REGISTRO</h1>

    <FormsColaborador @saved="empleadoGuardado" />
  </div>
</template>

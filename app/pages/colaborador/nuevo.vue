<script setup lang="ts">
definePageMeta({
  middleware: 'auth'
})

const router = useRouter()

async function empleadoGuardado(id: string) {
  // await router.push(`/colaborador/${id}`)
  console.log(id);
}
</script>

<template>
  <div>
    <h1>DATOS DEL EMPLEADO - REGISTRO</h1>

    <FormsColaborador @saved="empleadoGuardado" />
  </div>
</template>

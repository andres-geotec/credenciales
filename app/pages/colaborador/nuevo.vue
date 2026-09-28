<script setup lang="ts">
definePageMeta({
  middleware: 'auth'
})

const router = useRouter()

async function empleadoGuardado(id: string) {
  await router.push(`/colaborador/${id}`)
}
</script>

<template>
  <div class="card">
    <h1>DATOS DEL EMPLEADO - REGISTRO</h1>

    <ColaboradorForm @saved="empleadoGuardado" />
  </div>
</template>

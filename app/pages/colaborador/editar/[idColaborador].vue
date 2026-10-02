<script setup lang="ts">
definePageMeta({
  middleware: 'auth'
})

const route = useRoute()
const router = useRouter()
const supabase = useSupabaseClient()

const idColaborador = String(route.params.idColaborador)

const {
  data: colaborador,
  error
} = await useAsyncData(
  `colaborador-editar-${idColaborador}`,
  async () => {
    const { data, error } = await supabase
      .from('colaboradores')
      .select(`
        id,
        nombre,
        puesto,
        codigo_interno,
        f_ingreso,
        nss_imss,
        curp,
        rfc,
        vigencia,
        foto_url,
        descripcion
      `)
      .eq('id', idColaborador)
      .single()

    if (error) {
      throw error
    }

    return data
  }
)

if (error.value || !colaborador.value) {
  throw createError({
    statusCode: 404,
    statusMessage: 'Colaborador no encontrado'
  })
}

async function colaboradorGuardado() {
  await router.push(`/colaborador/${idColaborador}`)
}
</script>

<template>
  <div>
    <h1>Editar colaborador</h1>

    <FormsColaborador
      v-if="colaborador"
      :colaborador="colaborador"
      @saved="colaboradorGuardado"
    />
  </div>
</template>
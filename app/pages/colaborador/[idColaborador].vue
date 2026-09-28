<script setup lang="ts">
const supabase = useSupabaseClient()
const route = useRoute()

const idColaborador = String(route.params.idColaborador)

const {
  data: colaborador,
  pending,
  error
} = await useAsyncData(
  `colaborador-publico-${idColaborador}`,
  async () => {
    const { data, error } = await (supabase.rpc as any)(
      'obtener_colaborador_publico',
      {
        p_id: idColaborador,
      }
    )

    if (error) {
      throw error
    }

    return data?.[0] ?? null
  }
)

if (!colaborador.value) {
  throw createError({
    statusCode: 404,
    statusMessage: 'Colaborador no encontrado'
  })
}
</script>

<template>
  <div class="container">
    <div v-if="pending">
      Cargando...
    </div>

    <div
      v-else-if="error"
      class="error"
    >
      No fue posible cargar el colaborador.
    </div>

    <article
      v-else-if="colaborador"
      class="employee-detail"
    >
      <img
        v-if="colaborador.foto_url"
        :src="colaborador.foto_url"
        :alt="`${colaborador.nombre} ${colaborador.apellidos}`"
        class="photo"
      >

      <h1>
        {{ colaborador.nombre }}
      </h1>

      <p
        v-if="colaborador.puesto"
        class="puesto"
      >
        {{ colaborador.puesto }}
      </p>

      <!-- <p v-if="colaborador.departamento">
        <strong>Departamento:</strong>
        {{ colaborador.departamento }}
      </p> -->

      <!-- <p
        v-if="colaborador.descripcion"
        class="description"
      >
        {{ colaborador.descripcion }}
      </p> -->
    </article>
  </div>
</template>

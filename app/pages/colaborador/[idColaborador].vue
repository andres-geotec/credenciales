<script setup lang="ts">
import type { Colaborador } from '~/types/Colaborador'

const supabase = useSupabaseClient()
const user = useSupabaseUser()
const route = useRoute()

const idColaborador = String(route.params.idColaborador)

const {
  data: colaborador,
  pending,
  error,
} = await useAsyncData<Colaborador>(
  `colaborador-publico-${idColaborador}`,
  async () => {
    const { data, error } = await supabase.rpc(
      'obtener_colaborador_publico' as never,
      { p_id: idColaborador } as never
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
    statusMessage: 'Colaborador no encontrado',
  })
}
</script>

<template>
  <main class="contenedor ancho-lectura m-y-maximo-esc m-y-5-mov">
    <div v-if="pending">Cargando...</div>

    <div v-else-if="error">No fue posible cargar el colaborador.</div>

    <div
      v-else-if="colaborador"
      class="tarjeta tarjeta-horizontal"
    >
      <img
        class="tarjeta-imagen"
        :src="colaborador.foto_url"
        :alt="`Colaborador ${colaborador.nombre}.`"
      />
      <div class="tarjeta-cuerpo">
        <p class="tarjeta-etiqueta flex flex-contenido-separado">
          <span class="etiqueta fondo-color-alerta">
            {{ colaborador.entidad_federativa }}
          </span>
          <span
            class="etiqueta"
            :class="{
              'fondo-color-confirmacion': !validarFechaEnMexico(
                colaborador.vigencia
              ),
            }"
          >
            {{ validarFechaEnMexico(colaborador.vigencia) ? 'NO' : '' }}
            VIEGENTE
          </span>
        </p>

        <p class="tarjeta-titulo">{{ colaborador.nombre }}</p>

        <ul>
          <li>
            Puesto:
            <b>{{ colaborador.puesto }}</b>
          </li>
          <li>
            Código interno:
            <b>{{ colaborador.codigo_interno }}</b>
          </li>
          <li>
            NSS IMSS:
            <b>{{ colaborador.nss_imss }}</b>
          </li>
          <li>
            CURP:
            <b>{{ colaborador.curp }}</b>
          </li>
          <li>
            RFC:
            <b>{{ colaborador.rfc }}</b>
          </li>
          <li>
            Fecha de ingreso:
            <b>{{ FormatoFecha(colaborador.f_ingreso) }}</b>
          </li>
          <li>
            Vigencia:
            <b>{{ FormatoFecha(colaborador.vigencia) }}</b>
          </li>
        </ul>
      </div>

      <div class="tarjeta-pie flex flex-contenido-centrado">
        <NuxtLink
          v-if="user"
          class="boton boton-primario"
          :to="`/colaborador/editar/${colaborador.id}`"
        >
          Editar
        </NuxtLink>
      </div>
    </div>
  </main>
</template>

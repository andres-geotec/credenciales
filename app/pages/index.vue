<script setup lang="ts">
import { useEntidadesFederativasStore } from '~/stores/entidadesFederativas'
import type { Colaborador } from '~/types/Colaborador'

definePageMeta({
  middleware: 'auth',
})

const supabase = useSupabaseClient()

const {
  data: colaboradores,
  pending,
  error,
} = await useAsyncData<Colaborador[]>('colaboradores', async () => {
  const { data, error } = await supabase
    .from('colaboradores')
    .select(
      `
      id,
      nombre,
      puesto,
      vigencia,
      entidad_federativa_id
    `
    )
    // .order('apellidos', { ascending: true })
    .order('nombre', { ascending: true })

  if (error) {
    throw error
  }

  return data as Colaborador[]
})

const { entidadesObj } = await useEntidadesFederativasStore()

const filtro_texto = ref('')
const filtro_ubicacion = ref('TODO')
const colaboradoresFiltrados = computed(() => {
  return colaboradores.value?.filter(colaborador => {
    const coincide_texto =
      NormalizarTexto(colaborador.nombre).includes(
        NormalizarTexto(filtro_texto.value)
      ) ||
      NormalizarTexto(colaborador.puesto).includes(
        NormalizarTexto(filtro_texto.value)
      )

    const coincide_ubicacion =
      filtro_ubicacion.value === 'TODO' ||
      NormalizarTexto(colaborador.entidad_federativa_id as string) ===
        NormalizarTexto(filtro_ubicacion.value)

    return coincide_texto && coincide_ubicacion
  })
})
</script>

<template>
  <main class="contenedor ancho-lectura m-y-5-mov m-b-maximo-esc">
    <h1>Colaboradores</h1>

    <div class="m-y-3">
      <div class="m-y-3">
        <label for="buscar">Buscar:</label>
        <input
          id="buscar"
          v-model="filtro_texto"
          autocomplete="buscar"
          placeholder="Buscar..."
        />
      </div>

      <div class="m-y-3">
        <label for="entidad-federativa">Filtrar por entidad:</label>
        <EntidadesFederativas
          id="entidad-federativa"
          v-model="filtro_ubicacion"
          :requerido="false"
        />
        <!-- <EntidadesFederativas /> -->
      </div>
    </div>

    <div>
      <p v-if="pending">Cargando registros...</p>

      <p
        v-else-if="error"
        class="texto-color-error"
      >
        Error al cargar los registros.
      </p>

      <p v-else-if="!colaboradores?.length">Sin registros</p>

      <div v-else>
        <ol>
          <li
            v-for="colaborador in colaboradoresFiltrados"
            :key="colaborador.id"
            class="m-y-3"
          >
            <div>
              <strong>{{ colaborador.nombre }}</strong>
              <br />
              <small>
                <span class="etiqueta">
                  {{ entidadesObj[colaborador.entidad_federativa_id] }}
                </span>
                {{ colaborador.puesto }} | {{ colaborador.vigencia }}
              </small>
            </div>

            <div class="flex flex-contenido-final">
              <button
                class="boton-secundario boton-chico"
                @click="navigateTo(`/colaborador/${colaborador.id}`)"
              >
                Detalles
              </button>

              <button
                class="boton-primario boton-chico"
                @click="navigateTo(`/colaborador/editar/${colaborador.id}`)"
              >
                Editar
              </button>

              <button class="boton-primario boton-chico">Borrar</button>
            </div>

            <hr class="m-y-3" />
          </li>
        </ol>
      </div>
    </div>
  </main>
</template>

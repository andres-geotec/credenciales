<script setup lang="ts">
import { useEntidadesFederativasStore } from '~/stores/entidadesFederativas'
import type { Colaborador } from '~/types/Colaborador2'

definePageMeta({
  middleware: 'auth',
})

const supabase = useSupabaseClient()

const {
  data: colaboradores,
  pending,
  error,
} = await useAsyncData<
  Pick<
    Colaborador,
    | 'id'
    | 'nombre'
    | 'puesto'
    | 'vigencia'
    | 'entidad_federativa_id'
    | 'foto_url'
  >[]
>('colaboradores', async () => {
  const { data, error } = await supabase
    .from('colaboradores')
    .select(
      `
      id,
      nombre,
      puesto,
      vigencia,
      entidad_federativa_id,
      foto_url
    `
    )
    // .order('apellidos', { ascending: true })
    .order('nombre', { ascending: true })

  if (error) {
    throw error
  }

  return data
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

const modal = ref<{ abrir: () => void; cerrar: () => void } | null>(null)
type ColaboradorLista = NonNullable<typeof colaboradores.value>[number]
const colaboradorEliminar = ref<ColaboradorLista | null>(null)
const eliminando = ref(false)
const errorEliminar = ref('')
const config = useRuntimeConfig()

function confirmarEliminacion(colaborador: ColaboradorLista) {
  errorEliminar.value = ''
  colaboradorEliminar.value = colaborador
  modal.value?.abrir()
}

function obtenerRutaFotoStorage(fotoUrl: string): string {
  const foto = new URL(fotoUrl)
  const supabaseUrl = new URL(config.public.supabaseUrl)
  const prefijo = '/storage/v1/object/public/colaboradores/fotos/'

  if (
    foto.origin !== supabaseUrl.origin ||
    !foto.pathname.startsWith(prefijo)
  ) {
    throw new Error('La URL de la foto no pertenece al bucket colaboradores.')
  }

  const ruta = decodeURIComponent(foto.pathname.slice(prefijo.length))

  if (!ruta || ruta.includes('/') || ruta === '.' || ruta === '..') {
    throw new Error('La ruta de la foto asociada no es válida.')
  }

  return `fotos/${ruta}`
}

async function eliminar() {
  const colaborador = colaboradorEliminar.value

  if (!colaborador || eliminando.value) {
    return
  }

  eliminando.value = true
  errorEliminar.value = ''

  try {
    const rutaFoto = obtenerRutaFotoStorage(colaborador.foto_url)
    const { data, error } = await supabase
      .from('colaboradores')
      .delete()
      .eq('id', colaborador.id)
      .select('id')
      .maybeSingle()

    if (error) {
      throw error
    }

    if (!data) {
      throw new Error('No se encontró el colaborador para eliminar.')
    }

    colaboradores.value =
      colaboradores.value?.filter(({ id }) => id !== colaborador.id) ?? []
    colaboradorEliminar.value = null
    modal.value?.cerrar()

    try {
      const { error: errorFoto } = await supabase.storage
        .from('colaboradores')
        .remove([rutaFoto])

      if (errorFoto) {
        throw errorFoto
      }
    } catch (cause) {
      console.error(
        'El colaborador se eliminó, pero falló la eliminación de su foto:',
        cause
      )
      errorEliminar.value =
        'El colaborador se eliminó, pero no fue posible eliminar su foto. Intenta eliminarla desde Storage.'
    }
  } catch (cause) {
    console.error('No fue posible eliminar el colaborador:', cause)
    errorEliminar.value =
      cause instanceof Error
        ? cause.message
        : 'No fue posible eliminar el colaborador.'
  } finally {
    eliminando.value = false
  }
}
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
      </div>
    </div>

    <div>
      <p
        v-if="errorEliminar"
        class="texto-color-error"
        role="alert"
      >
        {{ errorEliminar }}
      </p>

      <p v-if="pending">Cargando registros...</p>

      <p
        v-else-if="error"
        class="texto-color-error"
      >
        Error al cargar los registros.
      </p>

      <p v-else-if="!colaboradores?.length">Sin registros</p>

      <ol v-else>
        <li
          v-for="colaborador in colaboradoresFiltrados"
          :key="colaborador.id"
          class="borde-b borde-color-secundario m-y-3 p-b-2"
        >
          <div>
            <strong>{{ colaborador.nombre }}</strong>
            <br />
            <small>
              <span class="etiqueta">
                {{ entidadesObj[colaborador.entidad_federativa_id]?.nombre }}
              </span>
              {{ colaborador.puesto }} | {{ colaborador.vigencia }}
            </small>
          </div>

          <div class="flex flex-contenido-final">
            <button
              class="boton-chico boton-secundario"
              @click="navigateTo(`/colaborador/${colaborador.id}`)"
            >
              <!-- borde borde-color-confirmacion texto-color-confirmacion -->
              Detalles
              <span
                class="pictograma-persona"
                aria-hidden="true"
              />
            </button>

            <button
              class="boton-chico boton-secundario"
              @click="navigateTo(`/colaborador/editar/${colaborador.id}`)"
            >
              <!-- borde borde-color-alerta texto-color-alerta -->
              Editar
              <span
                class="pictograma-editar"
                aria-hidden="true"
              />
            </button>

            <button
              class="boton-chico boton-secundario"
              @click="confirmarEliminacion(colaborador)"
            >
              <!-- borde borde-color-error texto-color-error -->
              Eliminar
              <span
                class="pictograma-eliminar"
                aria-hidden="true"
              />
            </button>
          </div>
        </li>
      </ol>
    </div>

    <ClientOnly>
      <SisdaiModal ref="modal">
        <template #encabezado>
          <h3 class="m-1">Eliminar</h3>
        </template>

        <!-- <GeocontenidosLoader v-if="cargando" :mensaje="mensajeCargando" /> -->

        <div class="">
          El colaborador {{ colaboradorEliminar?.nombre }} será eliminado de la
          base de datos y su fotografía asociada.
          <!-- <span :class="`pictograma-${pictograma}`" /> -->
        </div>

        <template #pie>
          <p class="m-0">
            <button
              class="boton-secundario"
              :disabled="eliminando"
              @click="eliminar"
            >
              {{ eliminando ? 'Eliminando...' : 'Confirmar' }}
              <span
                class="pictograma-eliminar"
                aria-hidden="true"
              />
            </button>
          </p>
        </template>
      </SisdaiModal>
    </ClientOnly>
  </main>
</template>

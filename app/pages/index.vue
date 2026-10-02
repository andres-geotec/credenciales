<script setup lang="ts">
import type { Colaborador } from '~/types/colaborador'

definePageMeta({
  middleware: 'auth'
})

const supabase = useSupabaseClient()

async function logout() {
  const { error } = await supabase.auth.signOut()

  if (error) {
    console.error(error)
    return
  }

  await navigateTo('/login')
}

const {
  data: colaboradores,
  pending,
  error
} = await useAsyncData<Colaborador[]>('colaboradores', async () => {
  const { data, error } = await supabase
    .from('colaboradores')
    .select(`
      id,
      nombre,
      puesto,
      vigencia,
      descripcion
    `)
    // .order('apellidos', { ascending: true })
    .order('nombre', { ascending: true })

  if (error) {
    throw error
  }

  return data as Colaborador[]
})

const filtro_texto = ref('')
const filtro_ubicacion = ref('TODAS')
const colaboradoresFiltrados = computed(() => {
  return colaboradores.value?.filter((colaborador) => {
    const coincide_texto =
      NormalizarTexto(colaborador.nombre).includes(NormalizarTexto(filtro_texto.value)) ||
      NormalizarTexto(colaborador.puesto).includes(NormalizarTexto(filtro_texto.value))

    const coincide_ubicacion =
      filtro_ubicacion.value === 'TODAS' ||
      NormalizarTexto(colaborador.descripcion as string) === NormalizarTexto(filtro_ubicacion.value)
      
    return coincide_texto && coincide_ubicacion
  })
})
</script>

<template>
  <div>
    <div>
      Sesión iniciada
    </div>

    <button
      @click="navigateTo('/colaborador/nuevo')"
    >
      Registrar
    </button>

    <button
      @click="logout"
    >
      Cerrar sesión
    </button>
  </div>

  <main>
    <h1>REGISTROS</h1>
    <div>
      <div>
        <label for="buscar">Buscar:</label>
        <input
          id="buscar"
          autocomplete="buscar"
          placeholder="Buscar..."
          v-model="filtro_texto"
        />
      </div>

      <div>
        <label for="filtro">Filtrar por ubicación:</label>
        <select id="filtro" v-model="filtro_ubicacion">
          <option value="TODAS">Todas</option>
          <option value="ESTADO DE MÉXICO">ESTADO DE MÉXICO</option>
          <option value="CDMX">CDMX</option>
          <option value="CUERNAVACA">CUERNAVACA</option>
          <option value="HIDALGO">HIDALGO</option>
        </select>
      </div>
    </div>

    {{ filtro_texto }} - {{ filtro_ubicacion }}

    <div>
      <div v-if="pending">
        Cargando registros...
      </div>

      <div
        v-else-if="error"
      >
        Error al cargar los registros.
      </div>

      <p
        v-else-if="!colaboradores?.length"
      >
        Sin registros
      </p>

      <div
        v-else
      >
        <ol>
          <li
            v-for="colaborador in colaboradoresFiltrados"
            :key="colaborador.id"
          >
            <div>
              <span>{{ colaborador.descripcion }}</span>
              <strong>{{ colaborador.nombre }}</strong>
              <br>
              <small>{{ colaborador.puesto }} | {{ colaborador.vigencia }}</small>
            </div>

            <div class="acciones">
              <button
                @click="navigateTo(`/colaborador/${colaborador.id}`)"
              >
                Detalles
              </button>

              <button
                @click="navigateTo(`/colaborador/editar/${colaborador.id}`)"
              >
                Editar
              </button>

              <button>
                Borrar
              </button>
            </div>
          </li>
        </ol>
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: 'auth'
})

const supabase = useSupabaseClient()

const {
  data: colaboradores,
  pending,
  error
} = await useAsyncData('colaboradores', async () => {
  const { data, error } = await supabase
    .from('colaboradores')
    .select(`
      id,
      nombre,
      puesto,
      vigencia
    `)
    // .order('apellidos', { ascending: true })
    .order('nombre', { ascending: true })

  if (error) {
    throw error
  }

  return data
})

async function logout() {
  const { error } = await supabase.auth.signOut()

  if (error) {
    console.error(error)
    return
  }

  await navigateTo('/login')
}
</script>

<template>
  <div
    class="card"
    style="
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
    "
  >
    <div>
      👤 Sesión iniciada
       <!-- | Total: <b id="total">0</b> / 550 -->
    </div>

    <button
      class="btn-green"
      style="padding: 6px 12px; font-size: 13px"
      @click="navigateTo('/colaborador/nuevo')"
    >
      Registrar
    </button>

    <button
      class="btn-black"
      style="padding: 6px 12px; font-size: 13px"
      @click="logout"
    >
      Cerrar sesión
    </button>
  </div>

  <div class="card">
    <h3>📋 REGISTROS</h3>
    <div class="flex" style="margin-bottom: 10px">
      <!-- <input
        id="buscar"
        placeholder="🔍 Buscar..."
        style="flex: 1"
        oninput="renderLista()"
      /> -->
      <select id="filtro" onchange="renderLista()">
        <option value="TODAS">Todas</option>
        <option>TOLUCA</option>
        <option>CDMX</option>
        <option>CUERNAVACA</option>
        <option>HIDALGO</option>
      </select>
    </div>

    <div id="lista">
      <div v-if="pending">
        Cargando colaboradores...
      </div>

      <div
        v-else-if="error"
        class="error"
      >
        Error al cargar los colaboradores.
      </div>

      <p
        v-else-if="!colaboradores?.length"
        style="text-align:center;color:#777;padding:15px"
      >
        Sin registros
      </p>

      <div
        v-else  
      >
        <article class="lista-item" 
          v-for="colaborador in colaboradores"
          :key="colaborador['id']"
        >
          <div>
            <span class="badge" :style="{background: '#b45309'}">{{ 'TOLUCA' }}</span>
            <strong>{{ colaborador['nombre'] }}</strong>
            <br>
            <small>{{ colaborador['puesto'] }} | {{ colaborador['vigencia'] }}</small>
          </div>

          <div class="acciones">
            <button class="btn-sm btn-green" @click="navigateTo(`/colaborador/${colaborador['id']}`)">📄 Detalles</button>
            <button class="btn-sm btn-blue" @click="navigateTo(`/colaborador/editar/${colaborador['id']}`)">✏️ Editar</button>
            <button class="btn-sm btn-red">🗑️ Borrar</button>
          </div>
        </article>
      </div>
    </div>
  </div>
</template>

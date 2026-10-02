<script setup lang="ts">
const supabase = useSupabaseClient()

async function logout() {
  const { error } = await supabase.auth.signOut()

  if (error) {
    console.error(error)
    return
  }

  await navigateTo('/login')
}

/*
 * Si ya existe una sesión, no debe poder quedarse
 * en /login.
 */
const user = useSupabaseUser()
</script>

<template>
  <div>
    <div v-if="user">
      <div>
        Sesión iniciada
      </div>

      <button
        @click="navigateTo('/colaborador/nuevo')"
      >
        Registrar colaorador
      </button>

      <button
        @click="logout"
      >
        Cerrar sesión
      </button>
    </div>

    <main>
      <slot />
    </main>
  </div>
</template>

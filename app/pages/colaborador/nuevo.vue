<script setup lang="ts">
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
</script>

<template>
  <div>
    <button @click="logout">Cerrar sesión</button>

    <FormsColaborador />
  </div>
</template>

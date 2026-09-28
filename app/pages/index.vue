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

// // Importa la función `useRuntimeConfig` para acceder a las variables de entorno
// const config = useRuntimeConfig();

// // Accede a las variables de entorno definidas en `nuxt.config.ts`
// const supabaseUrl = config.public.supabaseUrl;
// const supabaseAnonKey = config.public.supabaseAnonKey;

// // Puedes usar estas variables para inicializar tu cliente de Supabase o para otros propósitos
// console.log('Supabase URL:', supabaseUrl);
// console.log('Supabase Anon Key:', supabaseAnonKey);
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
      Sesión iniciada
       <!-- | Total: <b id="total">0</b> / 550 -->
    </div>

    <button
      class="btn-black"
      style="padding: 6px 12px; font-size: 13px"
      @click="logout"
    >
      Salir
    </button>
  </div>
</template>

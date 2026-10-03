<script setup lang="ts">
const supabase = useSupabaseClient()
const route = useRoute()
const user = useSupabaseUser()
const config = useRuntimeConfig()

const email = ref(config.public.emailAdmin)
const password = ref('')

const loading = ref(false)
const errorMessage = ref('')


const redirectTo = computed(() => {
  const redirect = route.query.redirect

  if (
    typeof redirect === 'string' &&
    redirect.startsWith('/') &&
    !redirect.startsWith('//')
  ) {
    return redirect
  }

  return '/'
})

/*
 * Si ya existe una sesión, no debe poder quedarse
 * en /login.
 */
watch(
  user,
  async (currentUser) => {
    if (currentUser) {
      await navigateTo(redirectTo.value)
    }
  },
  { immediate: true }
)

async function login() {
  errorMessage.value = ''
  if (!email.value || !password.value) {
    errorMessage.value = 'Ingresa correo y contraseña.'
    return
  }

  loading.value = true

  try {
    const { error } = await supabase.auth.signInWithPassword({
      email: email.value,
      password: password.value
    })

    if (error) {
      errorMessage.value = 'Correo o contraseña incorrectos.'
      return
    }

    await navigateTo(redirectTo.value)
  } catch (error) {
    console.error(error)
    errorMessage.value = 'Ocurrió un error al iniciar sesión.'
  } finally {
    loading.value = false
  }
}
</script>


<template>
  <main
    class="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-8 sm:px-6 sm:py-12"
  >
    <section
      class="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-10"
    >
      <form
        class="space-y-5"
        @submit.prevent="login"
      >
        <h1
          class="text-lg font-semibold text-slate-800"
        >
          Acceso como administrador
        </h1>

        <div
          class="space-y-2"
        >
          <label
            for="email"
            class="block text-sm font-medium text-slate-700"
          >
            Correo electrónico
          </label>
          <input
            id="email"
            v-model="email"
            type="email"
            autocomplete="email"
            placeholder="Correo electrónico"
            required
            disabled
            class="block min-h-11 w-full rounded-lg border border-slate-300 bg-slate-100 px-3.5 py-2.5 text-base text-slate-600 disabled:cursor-not-allowed disabled:opacity-75 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-600/20"
          >
        </div>

        <div
          class="space-y-2"
        >
          <label
            for="pass"
            class="block text-sm font-medium text-slate-700"
          >
            Contraseña
          </label>
          <input
            id="pass"
            v-model="password"
            type="password"
            autocomplete="current-password"
            placeholder="Contraseña"
            :disabled="loading"
            required
            class="block min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-base text-slate-900 placeholder:text-slate-500 focus:border-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-600/20 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:opacity-75"
          >
        </div>

        <p
          v-if="errorMessage"
          role="alert"
          class="rounded-lg border border-red-200 bg-red-50 px-3.5 py-3 text-sm leading-5 text-red-800"
        >
          {{ errorMessage }}
        </p>

        <button
          type="submit"
          :disabled="loading"
          class="min-h-11 w-full rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-slate-900/25 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {{ loading ? 'Iniciando sesión...' : 'Iniciar sesión' }}
        </button>
      </form>
    </section>
  </main>
</template>

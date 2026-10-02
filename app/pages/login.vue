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
  <div>
    <h1 class="text-3xl font-bold underline">
      SERVIPREL — Credenciales Oficiales
    </h1>

    <form @submit.prevent="login">
      <div>
        <h2>ACCESO COMO ADMINISTRADOR</h2>

        <div>
          <label for="email">
            Correo electrónico
          </label>

          <input
            id="email"
            v-model="email"
            type="email"
            autocomplete="email"
            placeholder="Correo electrónico"
            required
          >
        </div>

        <div style="margin-top: 8px">
          <label for="pass">
            Contraseña
          </label>

          <input
            id="pass"
            v-model="password"
            type="password"
            autocomplete="password"
            placeholder="Contraseña"
            required
          />
        </div>

        <p v-if="errorMessage">
          {{ errorMessage }}
        </p>


        <div>
          <button type="submit" :disabled="loading">{{ loading ? 'Iniciando sesión...' : 'Iniciar sesión' }}</button>
        </div>
      </div>
    </form>
  </div>
</template>

<style scoped>
</style>
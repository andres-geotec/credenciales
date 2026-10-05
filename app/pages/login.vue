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
  async currentUser => {
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
      password: password.value,
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
  <main class="contenedor ancho-lectura m-y-5-mov m-b-maximo-esc">
    <form
      class="m-10-esc"
      @submit.prevent="login"
    >
      <h1>Acceso como administrador</h1>

      <div class="m-y-3">
        <label for="email">Correo electrónico</label>
        <input
          id="email"
          v-model="email"
          type="email"
          autocomplete="email"
          placeholder="Correo electrónico"
          required
          disabled
        />
      </div>

      <div class="m-y-3">
        <label for="pass">Contraseña</label>
        <input
          id="pass"
          v-model="password"
          type="password"
          autocomplete="current-password"
          placeholder="Contraseña"
          :disabled="loading"
          required
        />
      </div>

      <p
        v-if="errorMessage"
        role="alert"
        class="texto-color-error"
      >
        {{ errorMessage }}
      </p>

      <div class="flex flex-contenido-centrado m-y-3">
        <input
          type="submit"
          :disabled="loading"
          class="boton-primario"
          :value="loading ? 'Iniciando sesión...' : 'Iniciar sesión'"
        />
      </div>
    </form>
  </main>
</template>

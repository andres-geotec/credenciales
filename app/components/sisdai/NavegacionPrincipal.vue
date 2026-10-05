<script setup lang="ts">
const supabase = useSupabaseClient()
const user = useSupabaseUser()
const route = useRoute()

async function logout() {
  const { error } = await supabase.auth.signOut()

  if (error) {
    console.error(error)
    return
  }

  await navigateTo('/login')
}

const anchoNavegacion = 768
const esColapsable = ref(false)

function validarNavegacionColapsable() {
  esColapsable.value = anchoNavegacion > window.innerWidth ? true : false
}

onMounted(() => {
  window.addEventListener('resize', validarNavegacionColapsable)
})

onUnmounted(() => {
  window.removeEventListener('resize', validarNavegacionColapsable)
})

const menuEstaAbierto = ref(false)
function alternarMenu() {
  menuEstaAbierto.value = !menuEstaAbierto.value
}
</script>

<template>
  <nav
    class="navegacion navegacion-pegada"
    :class="{ 'navegacion-extendida': !esColapsable }"
    aria-label="Menú principal"
  >
    <div class="nav-contenedor-identidad">
      <a
        href="https://serviprel.com"
        aria-label="SERVIPREL, sitio web externo"
      >
        <img
          class="nav-logo"
          src="/img/LOGO-SERVIPREL-scaled-e1776093285127-1024x270.png"
          alt="SERVIPREL"
        />
      </a>

      <button
        testid="nav-boton-menu-principal"
        type="button"
        class="nav-boton-menu"
        :class="{ abierto: menuEstaAbierto }"
        :aria-expanded="menuEstaAbierto"
        aria-label="Menú Principal"
        aria-controls="menuprincipal"
        @click="alternarMenu"
      >
        <span
          class="nav-icono-menu"
          aria-hidden="true"
        />
      </button>

      <!-- <div
        v-if="esColapsable"
        class="nav-informacion"
      /> -->
    </div>

    <div
      class="nav-menu-contenedor"
      :class="{ abierto: menuEstaAbierto }"
    >
      <!-- <div class="nav-menu-complementario">
        <NuxtLink
          class="nav-hipervinculo"
          to="/"
        >
          Credenciales oficiales
        </NuxtLink>
      </div> -->

      <div
        class="nav-menu-principal"
        :tabindex="esColapsable ? 0 : -1"
      >
        <ul class="nav-menu">
          <li>
            <NuxtLink
              class="nav-hipervinculo"
              to="/"
            >
              Credenciales oficiales
            </NuxtLink>
          </li>

          <li v-if="!user">
            <NuxtLink
              :to="`/login?redirect=${route.path}`"
              class="nav-hipervinculo"
            >
              Iniciar sesión
            </NuxtLink>
          </li>

          <li v-if="user">
            <NuxtLink
              to="/colaborador/nuevo"
              class="nav-hipervinculo"
            >
              Registrar colaborador
            </NuxtLink>
          </li>

          <li v-if="user">
            <button
              type="button"
              class="nav-boton boton-sin-contenedor-secundario"
              @click="logout"
            >
              Cerrar sesión
            </button>
          </li>
        </ul>
      </div>
    </div>
  </nav>
</template>

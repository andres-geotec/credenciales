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

const user = useSupabaseUser()
</script>

<template>
  <header
    class="border-b border-slate-200 bg-white"
  >
    <div
      class="mx-auto flex w-full max-w-7xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8"
    >
      <div
        class="flex min-w-0 items-center gap-4"
      >
        <a
          href="https://serviprel.com"
          aria-label="SERVIPREL, sitio web externo"
          class="inline-flex shrink-0 rounded-md focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-600/20"
        >
          <img
            src="/img/LOGO-SERVIPREL-scaled-e1776093285127-1024x270.png"
            alt="SERVIPREL"
            class="h-8 w-auto sm:h-9"
          >
        </a>

        <NuxtLink
          to="/"
          class="truncate rounded-md text-sm font-semibold tracking-tight text-slate-900 transition-colors hover:text-emerald-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-600/20 sm:text-base"
        >
          Credenciales oficiales
        </NuxtLink>
      </div>

      <nav
        v-if="user"
        aria-label="Navegación principal"
        class="flex flex-wrap items-center gap-2"
      >
        <NuxtLink
          to="/colaborador/nuevo"
          class="inline-flex min-h-10 items-center justify-center rounded-lg px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-600/20"
        >
          Registrar colaborador
        </NuxtLink>

        <button
          type="button"
          class="inline-flex min-h-10 items-center justify-center rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:border-slate-400 hover:bg-slate-50 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-600/20"
          @click="logout"
        >
          Cerrar sesión
        </button>
      </nav>
    </div>
  </header>

  <slot />
</template>

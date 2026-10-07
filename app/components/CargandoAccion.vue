<script setup lang="ts"></script>

<template>
  <ClientOnly>
    <SisdaiModal ref="modal">
      <template #encabezado>
        <h3 class="m-1">Eliminar</h3>
      </template>

      <div class="">
        <!-- El colaborador {{ colaboradorEliminar?.nombre }} será eliminado de la -->
        base de datos.
      </div>

      <template #pie>
        <p class="m-0">
          <button class="boton-secundario">
            <!-- borde borde-color-error texto-color-error -->
            Confirmar
            <span
              class="pictograma-eliminar"
              aria-hidden="true"
            />
          </button>
        </p>
      </template>
    </SisdaiModal>
  </ClientOnly>
</template>

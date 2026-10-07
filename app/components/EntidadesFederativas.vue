<script setup lang="ts">
import { defineEmits, defineProps, withDefaults } from 'vue'
import { useEntidadesFederativasStore } from '~/stores/entidadesFederativas'

const props = withDefaults(
  defineProps<{
    id?: string
    modelValue: string
    requerido?: boolean
  }>(),
  { id: 'entidad-federativa', requerido: true }
)

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const { entidades, cargando, error } = await useEntidadesFederativasStore()
</script>

<template>
  <select
    :id="props.id"
    :value="props.modelValue"
    :disabled="cargando || !entidades?.length"
    :required="props.requerido"
    @change="
      emit('update:modelValue', ($event.target as HTMLSelectElement).value)
    "
  >
    <option
      value=""
      disabled
    >
      {{ cargando ? 'Cargando entidades...' : 'Selecciona una entidad' }}
    </option>
    <option
      v-if="!props.requerido"
      value="TODO"
    >
      TODO
    </option>
    <option
      v-for="entidad in entidades"
      :key="entidad.id"
      :value="entidad.id"
    >
      {{ entidad.nombre }}
    </option>
  </select>
  <p
    v-if="error"
    class="texto-color-error"
    role="alert"
  >
    No fue posible cargar las entidades federativas: {{ error }}
  </p>
</template>

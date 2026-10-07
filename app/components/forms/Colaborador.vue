<script setup lang="ts">
import { defineEmits, defineProps, reactive } from 'vue'
import { useEntidadesFederativasStore } from '~/stores/entidadesFederativas'
import type { Colaborador } from '~/types/Colaborador'
import generarPDF from '~/utils/pdf'
import generarQR from '~/utils/qr'

const props = defineProps<{
  colaborador?: Colaborador
}>()

const emit = defineEmits<{
  saved: [id: string]
}>()

const supabase = useSupabaseClient()
const config = useRuntimeConfig()
const BUCKET_NAME = 'colaboradores'
const DOMAIN = config.public.domain

const form = reactive({
  nombre: '',
  puesto: '',
  codigo_interno: '',
  f_ingreso: '',
  nss_imss: '',
  curp: '',
  rfc: '',
  vigencia: '',
  foto_url: '',
  entidad_federativa_id: '',
  // entidad_federativa: '',
  // regimen_patronal_id: '',
  regimen_patronal: '',
})

const fotoFile = ref<File | null>(null)
const fotoPreview = ref<string | null>(null)

const loading = ref(false)
const errorMessage = ref('')

const { entidadesObj } = await useEntidadesFederativasStore()

watch(
  () => props.colaborador,
  colaborador => {
    if (!colaborador) {
      return
    }

    form.nombre = colaborador.nombre ?? ''
    form.puesto = colaborador.puesto ?? ''
    form.codigo_interno = colaborador.codigo_interno ?? ''
    form.f_ingreso = colaborador.f_ingreso ?? ''
    form.nss_imss = colaborador.nss_imss ?? ''
    form.curp = colaborador.curp ?? ''
    form.rfc = colaborador.rfc ?? ''
    form.vigencia = colaborador.vigencia ?? ''
    form.foto_url = colaborador.foto_url ?? ''
    form.entidad_federativa_id = colaborador.entidad_federativa_id ?? ''
    form.regimen_patronal =
      entidadesObj[form.entidad_federativa_id]?.regimen_patronal.clave ?? ''

    // Preview de la foto que ya existe
    fotoPreview.value = colaborador.foto_url ?? null
  },
  {
    immediate: true,
  }
)

const editing = computed(() => Boolean(props.colaborador?.id))

function seleccionarFoto(event: Event) {
  const input = event.target as HTMLInputElement

  const file = input.files?.[0]

  if (!file) {
    return
  }

  errorMessage.value = ''

  /* * Validar tipo */
  if (!file.type.startsWith('image/')) {
    errorMessage.value = 'El archivo seleccionado no es una imagen.'
    input.value = ''
    return
  }

  /* * Limitar tamaño a 5 MB */
  const maxSize = 5 * 1024 * 1024

  if (file.size > maxSize) {
    errorMessage.value = 'La imagen no puede superar los 5 MB.'

    input.value = ''
    return
  }

  fotoFile.value = file

  /* * Crear preview */
  fotoPreview.value = URL.createObjectURL(file)
}

async function subirFoto(): Promise<string | null> {
  if (!fotoFile.value) {
    /*
     * Si estamos editando y no se seleccionó
     * una nueva fotografía, conservar la actual.
     */
    return form.foto_url || null
  }

  const file = fotoFile.value

  /*
   * Extensión original
   */
  const extension = file.name.split('.').pop()?.toLowerCase() || 'jpg'

  /*
   * Nombre único para evitar colisiones.
   *
   * Ejemplo:
   * fotos/550e8400-e29b-41d4-a716-446655440000.jpg
   */
  const fileName = `fotos/${crypto.randomUUID()}.${extension}`
  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(fileName, file, {
      cacheControl: '3600',
      contentType: file.type,
      upsert: false,
    })

  if (error) {
    console.error('Error al subir fotografía:', error)

    throw new Error('No fue posible subir la fotografía.')
  }

  /*
   * Obtener URL pública
   */
  const { data: publicUrlData } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(data.path)
  return publicUrlData.publicUrl
}

async function guardar() {
  errorMessage.value = ''

  // if (!form.nombre) {
  //   errorMessage.value = 'Todos los datos son obligatorios.'
  //   return
  // }

  loading.value = true

  try {
    const fotoUrl = (await subirFoto()) as string

    const payload: Partial<Colaborador> = {
      nombre: form.nombre,
      puesto: form.puesto,
      codigo_interno: form.codigo_interno,
      f_ingreso: form.f_ingreso,
      nss_imss: form.nss_imss,
      curp: form.curp,
      rfc: form.rfc,
      vigencia: form.vigencia,
      foto_url: fotoUrl,
      entidad_federativa_id: form.entidad_federativa_id,
      // updated_at: new Date().toISOString(),
    }

    // Edición
    if (editing.value && props.colaborador?.id) {
      const { error } = await supabase
        .from('colaboradores')
        .update(payload as never)
        .eq('id', props.colaborador.id)

      if (error) {
        throw error
      }

      emit('saved', props.colaborador.id)
      return
    }

    // Alta
    const { data, error } = await supabase
      .from('colaboradores')
      .insert(payload as never)
      .select('id')
      .single()

    if (error) {
      throw error
    }

    emit('saved', (data as Colaborador).id)
  } catch (error) {
    console.error(error)

    errorMessage.value =
      (error instanceof Error ? error.message : '') ||
      'No fue posible guardar el colaborador.'
  } finally {
    loading.value = false
  }
}

const canvasRef = ref<HTMLCanvasElement>()
function construirCredencial() {
  generarQR(
    canvasRef.value as HTMLCanvasElement,
    `${DOMAIN}/colaborador/${props.colaborador?.id}`,
    objectUrl =>
      generarPDF(form as Colaborador, objectUrl, fotoPreview.value as string)
  )
}
</script>

<template>
  <form
    class="grid dos-columnas"
    @submit.prevent="guardar"
  >
    <div class="renglon-completo">
      <label for="nombre">Nombre:</label>
      <input
        id="nombre"
        v-model="form.nombre"
        type="text"
        required
      />
    </div>

    <div>
      <label for="entidad-federativa">Entidad de trabajo:</label>
      <EntidadesFederativas
        id="entidad-federativa"
        v-model="form.entidad_federativa_id"
      />
    </div>

    <div>
      <label for="puesto">Puesto:</label>
      <input
        id="puesto"
        v-model="form.puesto"
        type="text"
        required
      />
    </div>

    <div>
      <label for="codigo_interno">Código Interno:</label>
      <input
        id="codigo_interno"
        v-model="form.codigo_interno"
        type="text"
        required
      />
    </div>

    <div>
      <label for="f_ingreso">Fecha de ingreso:</label>
      <input
        id="f_ingreso"
        v-model="form.f_ingreso"
        type="date"
        required
      />
    </div>

    <div>
      <label for="vigencia">Vigencia:</label>
      <input
        id="vigencia"
        v-model="form.vigencia"
        type="date"
        required
      />
    </div>

    <div>
      <label for="nss_imss">NSS IMSS (11 dígitos):</label>
      <input
        id="nss_imss"
        v-model="form.nss_imss"
        type="text"
        maxlength="11"
        required
      />
    </div>

    <div>
      <label for="curp">CURP (18 caracteres):</label>
      <input
        id="curp"
        v-model="form.curp"
        class="mayusculas"
        type="text"
        maxlength="18"
        required
      />
    </div>

    <div>
      <label for="rfc">RFC Empleado:</label>
      <input
        id="rfc"
        v-model="form.rfc"
        type="text"
        maxlength="13"
        class="mayusculas"
        required
      />
    </div>

    <div>
      <label for="foto">Fotografía:</label>
      <input
        id="foto"
        type="file"
        accept="image/jpeg,image/png,image/webp"
        :required="!editing"
        @change="seleccionarFoto"
      />
      <small>JPG, PNG o WebP. Máximo 5 MB.</small>
    </div>

    <!-- Preview -->
    <div
      v-if="fotoPreview"
      class="flex flex-contenido-centrado"
    >
      <img
        :src="fotoPreview"
        alt="Vista previa de fotografía"
        style="max-height: 250px"
      />
    </div>
    <!-- <div class="renglon-completo">{{ form }}</div> -->

    <div class="renglon-completo flex flex-contenido-final">
      <NuxtLink
        v-if="!editing"
        to="/"
        class="boton boton-secundario"
      >
        Cancelar
      </NuxtLink>

      <button
        v-if="editing"
        class="boton-secundario"
        @click.prevent="construirCredencial"
      >
        Descargar
      </button>

      <NuxtLink
        v-if="editing"
        :to="`/colaborador/${props.colaborador?.id}`"
        class="boton boton-secundario"
      >
        Ver página QR
      </NuxtLink>

      <!-- <button @click="navigateTo('/')">Cancelar</button> -->
      <button
        class="boton-primario"
        type="submit"
      >
        Guardar
      </button>
    </div>

    <canvas
      ref="canvasRef"
      style="display: none"
    />
  </form>
</template>

<style scoped lang="scss">
.grid.dos-columnas {
  grid-template-columns: 1fr 1fr;

  .renglon-completo {
    grid-column: span 2;
  }
}
.mayusculas {
  text-transform: uppercase;
}
</style>

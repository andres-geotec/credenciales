<script setup lang="ts">
import type { Colaborador } from '~/types/colaborador'

const props = defineProps<{
  colaborador?: Partial<Colaborador>
}>()

const emit = defineEmits<{
  saved: [id: string]
}>()

const supabase = useSupabaseClient()
const config = useRuntimeConfig()
const BUCKET_NAME = config.public.bucketImg

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
  descripcion: ''
})

const fotoFile = ref<File | null>(null)
const fotoPreview = ref<string | null>(null)

const loading = ref(false)
const errorMessage = ref('')

watch(
  () => props.colaborador,
  (colaborador) => {
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
    form.descripcion = colaborador.descripcion ?? ''

    // Preview de la foto que ya existe
    fotoPreview.value = colaborador.foto_url ?? null
  },
  {
    immediate: true
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
   * empleados/550e8400-e29b-41d4-a716-446655440000.jpg
   */
  const fileName = `colaborador/${crypto.randomUUID()}.${extension}`
  const { data, error } = await supabase.storage.from(BUCKET_NAME).upload(fileName, file, {
    cacheControl: '3600',
    contentType: file.type,
    upsert: false
  })
  
  if (error) {
    console.error('Error al subir fotografía:', error)
    
    throw new Error('No fue posible subir la fotografía.')
  }

  /*
   * Obtener URL pública
   */
  const { data: publicUrlData } = supabase.storage .from(BUCKET_NAME) .getPublicUrl(data.path)
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
    const fotoUrl = await subirFoto()

    const payload = {
      nombre: form.nombre,
      puesto: form.puesto || null,
      codigo_interno: form.codigo_interno || null,
      f_ingreso: form.f_ingreso || null,
      nss_imss: form.nss_imss || null,
      curp: form.curp || null,
      rfc: form.rfc || null,
      vigencia: form.vigencia || null,
      // foto_url: form.foto_url || null,
      foto_url: fotoUrl || null,
      descripcion: form.descripcion || null,
      updated_at: new Date().toISOString()
    }

    // Edición
    if (editing.value && props.colaborador?.id) {
      const { error } = await supabase
        .from('colaboradores')
        .update(payload)
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
      .insert(payload)
      .select('id')
      .single()

    if (error) {
      throw error
    }

    emit('saved', data.id)
  } catch (error: any) {
    console.error(error)

    errorMessage.value =
      error?.message ||
      'No fue posible guardar el colaborador.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <form @submit.prevent="guardar">
    <div
      style="
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 8px;
        margin-top: 10px;
      "
    >
      <div>
        <label for="nombre">Nombre:</label>
        <input id="nombre" v-model="form.nombre" type="text" required>
      </div>

      <div>
        <label for="puesto">Puesto:</label>
        <input id="puesto" v-model="form.puesto" type="text" required>
      </div>

      <div>
        <label for="codigo_interno">Código Interno:</label>
        <input id="codigo_interno" v-model="form.codigo_interno" type="text" required>
      </div>

      <div>
        <label for="f_ingreso"> Fecha de ingreso:</label>
        <input id="f_ingreso" v-model="form.f_ingreso" type="date" required>
      </div>

      <div>
        <label for="vigencia">Vigencia:</label>
        <input id="vigencia" v-model="form.vigencia" type="date" required>
      </div>

      <div>
        <label for="nss_imss">NSS IMSS (11 dígitos):</label>
        <input id="nss_imss" v-model="form.nss_imss" type="text" maxlength="11" required>
      </div>

      <div>
        <label for="curp">CURP (18 caracteres):</label>
        <input id="curp" v-model="form.curp" type="text" maxlength="18" style="text-transform: uppercase" required>
      </div>

      <div>
        <label for="rfc">RFC Empleado:</label>
        <input id="rfc" v-model="form.rfc" type="text" maxlength="13" style="text-transform: uppercase" required>
      </div>

      <div>
        <label for="foto">Fotografía:</label>
        <input id="foto" type="file" accept="image/jpeg,image/png,image/webp" @change="seleccionarFoto" :required="!editing">
        <small> JPG, PNG o WebP. Máximo 5 MB. </small>
      </div>

      <!-- Preview -->
      <div v-if="fotoPreview" class="photo-preview" style="display: flex; justify-content: center;">
        <img :src="fotoPreview" alt="Vista previa de fotografía" style="max-height: 250px;">
      </div>

      <!-- <div>
        <label for="descripcion"> Descripción </label>
        <textarea id="descripcion" v-model="form.descripcion" rows="5" />
      </div> -->
    </div>
      
    <p v-if="errorMessage" class="error" >{{ errorMessage }}</p>

    <div class="flex" style="margin-top: 12px">
      <button class="btn-black" :disabled="loading" type="submit" style="flex: 1">
        💾 {{ loading ? 'Guardando...' : editing ? 'Guardar cambios' : 'Registrar' }}
      </button>
      <button class="btn-orange" :disabled="loading" @click="" style="flex: 1">
        📄 PDF
      </button>
      <button class="btn-blue" :disabled="loading" @click="navigateTo('/')" style="flex: 1">
        ❌ Cancelar
      </button>
    </div>
  </form>
</template>

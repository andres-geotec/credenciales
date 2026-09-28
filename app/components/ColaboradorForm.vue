<script setup lang="ts">
import type { Colaborador } from '~/types/colaborador'
// import { exportarPDF } from '~/utils/pdf'
import { jsPDF } from "jspdf";

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

function formatoFecha(f: any) {
  if (!f) return "—";
  const m = [
    "ENERO",
    "FEB",
    "MAR",
    "ABR",
    "MAY",
    "JUN",
    "JUL",
    "AGO",
    "SEP",
    "OCT",
    "NOV",
    "DIC",
  ];
  const d = new Date(f);
  return `${d.getDate()}-${m[d.getMonth()]}-${d.getFullYear()}`;
}

async function exportarPDF() {
  // await new Promise((r) => setTimeout(r, 300));
  const d = new jsPDF({
    unit: "mm",
    format: 'letter',
    orientation: "portrait",
  });

  let x_inicial = 18, y_inicial = 19, alto = 84, ancho = 60;
  d.setLineWidth(0.5);
  d.rect(x_inicial, y_inicial, ancho * 2, alto);
  d.line(x_inicial + ancho, y_inicial, x_inicial + ancho, y_inicial + alto);

  // COLUMNA IZQUIERDA
  let x_actual = x_inicial + (ancho / 2), y_actual = y_inicial + 4;
  d.setFont("helvetica", "bold");
  d.setFontSize(10);
  d.text("SERVIPREL, S.A. DE C.V.", x_actual, y_actual, { align: "center" });
  // d.text("SERVIPREL, S.A. DE C.V.", 13, 4, { align: "center" });

  d.setFont("helvetica", "normal");
  d.setFontSize(9);
  let texto = "";
  const carpeta = "CDMX"
  if (carpeta === "CDMX") {
    // d.text("R.F.C. SER111010AM9", 2, 8);
    texto += "R.F.C. SER111010AM9";
    // d.text("REPSE: STPS/UTD/DGIFT/ARR/4152/2024", 2, 12);
    texto += "\nREPSE: STPS/UTD/DGIFT/ARR/4152/2024";
    // d.text("REGISTRO PATRONAL: Y5242147105", 2, 17);
    texto += "\nREGISTRO PATRONAL: Y5242147105";
    // d.text("DOMICILIO:", 2, 22);
    texto += "\nDOMICILIO:";
    // d.text("RODOLFO GAONA No. 3", 2, 26);
    texto += "\nRODOLFO GAONA No. 3";
    // d.text("COL. LOMAS DE SOTELO", 2, 30);
    texto += "\nCOL. LOMAS DE SOTELO";
    // d.text("CDMX C.P. 11200", 2, 34);
    texto += "\nCDMX C.P. 11200";
    // d.text("INT. 502, LOMAS DE SOTELO", 2, 30);
    texto += "\nINT. 502, LOMAS DE SOTELO";
    // d.text("CDMX C.P. 11200", 2, 34);
    texto += "\nCDMX C.P. 11200";
  } else {
    // d.text("REGISTRO PATRONAL: C2234478107", 2, 8);
    texto += "REGISTRO PATRONAL: C2234478107";
    // d.text("R.F.C. SER111010AM9", 2, 12);
    texto += "\n\nR.F.C. SER111010AM9";
    // d.text("REPSE: STPS/UTD/DGIFT/ARR/4152/2024", 2, 16);
    texto += "\nREPSE:\nSTPS/UTD/DGIFT/ARR/4152/2024";
    // d.text("OFICINAS:", 2, 21);
    texto += "\n\nOFICINAS:";
    // d.text("BLVD. ADOLFO LÓPEZ MATEOS #68", 2, 25);
    texto += "\nBLVD. ADOLFO LÓPEZ MATEOS #68";
    // d.text("COL. EL POTRERO, ATIZAPAN", 2, 29);
    texto += "\nCOL. EL POTRERO, ATIZAPAN";
    // d.text("EDO. MÉXICO C.P. 52975", 2, 33);
    texto += "\nEDO. MÉXICO C.P. 52975";
  }
  d.text(texto, x_actual, y_actual + 6, { align: "center" });

  d.setFont("helvetica", "bold");
  // d.text("TEL: 555077-26-84 / 555816-27-89", 2, 39);
  texto = "TEL: 555077-26-84 / 555816-27-89";
  // d.text("800-837-40-95", 2, 43);
  texto += "\n800-837-40-95";
  d.text(texto, x_actual, y_actual + 45, { align: "center" });
  
  // if (qrImg) d.addImage(qrImg, "PNG", x_inicial + 2, y_actual + 52, 20, 20);
  d.line(x_inicial + 2, y_actual + 74, x_inicial + ancho - 2, y_actual + 74);
  d.text("FIRMA DEL EMPLEADO", x_actual, y_actual + 78, { align: "center" });

  // COLUMNA DERECHA
  x_actual = x_inicial + ancho + (ancho / 2);
  // d.setFontSize(5.5);
  d.text("ESTA PERSONA LABORA PARA:", x_actual, y_actual, { align: "center" });
  d.setFontSize(12);
  d.setFont("helvetica", "bold");
  d.text("SERVIPREL, S.A. DE C.V.", x_actual, y_actual + 6, { align: "center" });
  d.setFontSize(9);
  d.setFont("helvetica", "normal");
  // d.text("OFICINAS: BLVD. ADOLFO LÓPEZ MATEOS", x_inicial + ancho + 2, 12);
  texto = "OFICINAS:\nBLVD. ADOLFO LÓPEZ MATEOS";
  // d.text("#68, COL. EL POTRERO, ATIZAPAN", x_inicial + ancho + 2, 15);
  texto += "\n#68, COL. EL POTRERO, ATIZAPAN";
  // d.text("EDO. MÉXICO C.P. 52975", x_inicial + ancho + 2, 18);
  texto += "\nEDO. MÉXICO C.P. 52975";
  // d.text(texto, x_actual, y_actual + 12, { align: "center" });
  let alto_foto = 28, ancho_foto = 20;
  if (fotoB64) d.addImage(fotoB64, "JPEG", x_actual - (ancho_foto / 2), y_actual + 14, ancho_foto, alto_foto);
  else {
    d.rect(x_actual - (ancho_foto / 2), y_actual + 14, ancho_foto, alto_foto);
    d.text("FOTO", x_actual, y_actual + 28, { align: "center" });
  }
  // d.setFontSize(5);
    
  // d.text(n.substring(0, 24).toUpperCase(), x_inicial + ancho + 14, 42, { align: "center" });
  texto = form.nombre.substring(0, 24).toUpperCase();
  // d.text(
  //   `PUESTO: ${form.puesto || "—"}`,
  //   x_inicial + ancho + 2,
  //   46,
  // );
  texto += `\nPUESTO: ${form.puesto  || "—"}`;
  d.text(texto, x_actual, y_actual + 46, { align: "center" });
  d.setFont("helvetica", "normal");
  // d.text(${document.getElementById("codigo").value || "—"}`, x_inicial + ancho + 2, 50);
  texto = `${form.codigo_interno || "—"}`;
  // d.text(
  //   `FECHA DE INGRESO: ${formatoFecha(document.getElementById("fecha").value)}`,
  //   x_inicial + ancho + 2,
  //   54,
  // );
  texto += `\nFECHA DE INGRESO: ${formatoFecha(form.f_ingreso)}`;
  d.text(texto, x_actual, y_actual + 54, { align: "center" });
  d.setFont("helvetica", "bold");
  // d.text(`VIGENCIA: ${document.getElementById("vig-emp").value}`, x_inicial + ancho + 2, 58);
  texto = `VIGENCIA: ${form.vigencia}`;
  // d.text(
  //   `NSS IMSS: ${document.getElementById("nss").value || "—"}`,
  //   x_inicial + ancho + 2,
  //   62,
  // );
  texto += `\nNSS IMSS: ${form.nss_imss || "—"}`;
  // d.text(`CURP: ${document.getElementById("curp").value || "—"}`, x_inicial + ancho + 2, 66);
  texto += `\nCURP: ${form.curp || "—"}`;
  // d.text(
  //   `R.F.C.: ${document.getElementById("rfc-emp").value || "—"}`,
  //   x_inicial + ancho + 2,
  //   70,
  // );
  texto += `\nR.F.C.: ${form.rfc || "—"}`;
  d.text(texto, x_actual, y_actual + 64, { align: "center" });
  d.save(`Cred_${carpeta}_${form.nombre.replace(/ /g, "_")}.pdf`);
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
      <button class="btn-orange" :disabled="loading" @click="exportarPDF" style="flex: 1">
        📄 PDF
      </button>
      <button class="btn-blue" :disabled="loading" @click="navigateTo('/')" style="flex: 1">
        ❌ Cancelar
      </button>
    </div>
  </form>
</template>

export interface Colaborador {
  id: string
  nombre: string
  puesto: string | null
  codigo_interno: string | null
  f_ingreso: string | null
  nss_imss: string | null
  curp: string | null
  rfc: string | null
  vigencia: string | null
  foto_url: string | null
  descripcion: string | null
  created_at?: string
  updated_at?: string
}

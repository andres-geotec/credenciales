export interface Colaborador {
  id: string
  nombre: string
  puesto: string
  codigo_interno: string
  f_ingreso: string
  nss_imss: string
  curp: string
  rfc: string
  vigencia: string
  foto_url: string
  descripcion: string | null
  created_at?: string
  updated_at?: string
}

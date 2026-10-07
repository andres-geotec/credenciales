import type { RegimenPatronal } from '~/types/RegimenPatronal'

export interface EntidadFederativa {
  id: string
  nombre: string
  regimen_patronal_id?: string
  regimen_patronal: Pick<RegimenPatronal, 'clave'>
  created_at?: string
  updated_at?: string
}

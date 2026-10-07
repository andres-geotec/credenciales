import type { EntidadFederativa } from "~/types/EntidadFederativa"

export async function useEntidadesFederativasStore() {
  const supabase = useSupabaseClient()
  const entidades = useState<EntidadFederativa[] | null>(
    'entidades-federativas',
    () => null
  )
  const cargando = useState('entidades-federativas-cargando', () => false)
  const error = useState<string | null>(
    'entidades-federativas-error',
    () => null
  )

  if (entidades.value === null) {
    cargando.value = true
    error.value = null

    try {
      const { data, error: consultaError } =
        await useAsyncData<EntidadFederativa[]>(
          'consulta-entidades-federativas',
          async () => {
            const { data, error } = await supabase
              .from('entidades_federativas')
              .select('id, nombre')
              .order('nombre', { ascending: true })

            if (error) {
              throw error
            }

            return data ?? []
          },
          { default: () => [] }
        )

      if (consultaError.value) {
        throw consultaError.value
      }

      entidades.value = data.value ?? []
    } catch (cause) {
      error.value =
        cause instanceof Error
          ? cause.message
          : 'No fue posible cargar las entidades federativas.'
    } finally {
      cargando.value = false
    }
  }

  return { entidades, cargando, error }
}

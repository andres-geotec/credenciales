import type { RegimenPatronal } from '~/types/RegimenPatronal'

export async function useRegimenesPatronalesStore() {
  const supabase = useSupabaseClient()
  const regimenes = useState<RegimenPatronal[] | null>(
    'regimenes-patronales',
    () => null
  )
  const cargando = useState('regimenes-patronales-cargando', () => false)
  const error = useState<string | null>(
    'regimenes-patronales-error',
    () => null
  )

  if (regimenes.value === null) {
    cargando.value = true
    error.value = null

    try {
      const { data, error: consultaError } = await useAsyncData<
        RegimenPatronal[]
      >(
        'consulta-regimenes-patronales',
        async () => {
          const { data, error } = await supabase
            .from('regimenes_patronales')
            .select('id, clave')
            .order('clave', { ascending: true })

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

      regimenes.value = data.value ?? []
    } catch (cause) {
      error.value =
        cause instanceof Error
          ? cause.message
          : 'No fue posible cargar los registros patronales.'
    } finally {
      cargando.value = false
    }
  }

  return {
    regimenes,
    cargando,
    error,
    regimenesObj: Object.fromEntries(
      regimenes.value?.map(({ id, clave }) => [id, clave]) ?? []
    ),
  }
}

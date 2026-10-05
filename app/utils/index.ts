function fechaMas(fechaStr: string, diasAdicionales: number = 1) {
  const fecha = new Date(fechaStr)
  fecha.setDate(fecha.getDate() + diasAdicionales)

  return fecha
}

export function validarFechaEnMexico(fechaAComprobar: string) {
  // 1. Obtener la fecha actual en la zona horaria de México (CDMX)
  const opciones = {
    timeZone: 'America/Mexico_City',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }

  // 'fr-CA' devuelve formato YYYY-MM-DD
  const formateador = new Intl.DateTimeFormat('fr-CA', opciones as never)
  const hoyMexicoStr = formateador.format(new Date())

  // 2. Formatear la fecha que quieres comprobar a YYYY-MM-DD
  // const fechaAComprobar = new Date(fechaStr)
  // fechaAComprobar.setDate(fechaAComprobar.getDate() + 1);
  const fechaCompStr = formateador.format(fechaMas(fechaAComprobar))

  // 3. Comparar las cadenas de texto directamente
  return fechaCompStr < hoyMexicoStr
}

export function FormatoFecha(fechaStr: string) {
  // const [year, month, day] = fechaStr.split('-');
  // const fecha = new Date(fechaStr);
  // fecha.setDate(fecha.getDate() + 1);

  return new Intl.DateTimeFormat('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
    .format(fechaMas(fechaStr))
    .replace(/\//g, '-')
}

export function NormalizarTexto(texto: string): string {
  return texto.trim().length > 0
    ? texto
        .trim()
        .normalize('NFD')
        .replace(/\p{Diacritic}/gu, '')
        .toLowerCase()
    : ''
}

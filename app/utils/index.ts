export function NormalizarTexto(texto: string): string {
  return texto.trim().length > 0
    ? texto
        .trim()
        .normalize('NFD')
        .replace(/\p{Diacritic}/gu, '')
        .toLowerCase()
    : ''
}

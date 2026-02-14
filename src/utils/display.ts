/** Nombre para mostrar de la sede (valor guardado en DB: piura | paita). */
export function formatCityName(city: string): string {
  if (city === 'piura') return 'Piura';
  if (city === 'paita') return 'Paita';
  return city;
}

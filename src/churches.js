export const defaultChurches = [
  { value: 'av_barcelona_norte', label: 'AV Barcelona Norte' },
  { value: 'av_tarragona', label: 'AV Tarragona' },
  { value: 'av_glories', label: 'AV Glòries' },
  { value: 'av_meridiana', label: 'AV Meridiana' },
  { value: 'av_valencia_massamagrell', label: 'AV Valencia Massamagrell' },
  { value: 'av_valencia_norte', label: 'AV Valencia Norte' },
]

const specialChurchOptions = [
  { value: 'av_other', label: 'Otra iglesia de Alcance Victoria' },
  { value: 'other_church', label: 'Otra iglesia' },
  { value: 'none', label: 'No pertenece a una iglesia' },
  { value: 'prefer_not_say', label: 'Prefiere no indicarlo' },
]

export const churchOptions = [
  { value: 'unknown', label: 'Sin indicar' },
  ...defaultChurches,
  ...specialChurchOptions,
]

export function buildChurchOptions(churches = []) {
  const managed = churches.length
    ? churches.filter((church) => church.active !== false).map((church) => ({ value: church.slug, label: church.name }))
    : defaultChurches
  return [{ value: 'unknown', label: 'Sin indicar' }, ...managed, ...specialChurchOptions]
}

export const personTypeOptions = [
  { value: 'unknown', label: 'Sin clasificar' },
  { value: 'av_member', label: 'Miembro de AV' },
  { value: 'guest', label: 'Invitado/a' },
  { value: 'other_church', label: 'Otra iglesia' },
]

export function churchLabel(value, customName = '', churches = []) {
  if (value === 'other_church' && customName) return customName
  const managedChurch = churches.find((church) => church.slug === value)
  if (managedChurch) return managedChurch.name
  return buildChurchOptions(churches).find((option) => option.value === value)?.label || customName || 'Sin indicar'
}

export function personTypeLabel(value) {
  return personTypeOptions.find((option) => option.value === value)?.label || 'Sin clasificar'
}

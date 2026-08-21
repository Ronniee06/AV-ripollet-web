export const churchOptions = [
  { value: 'unknown', label: 'Sin indicar' },
  { value: 'av_barcelona_norte', label: 'AV Barcelona Norte' },
  { value: 'av_tarragona', label: 'AV Tarragona' },
  { value: 'av_glories', label: 'AV Glòries' },
  { value: 'av_meridiana', label: 'AV Meridiana' },
  { value: 'av_valencia_massamagrell', label: 'AV Valencia Massamagrell' },
  { value: 'av_valencia_norte', label: 'AV Valencia Norte' },
  { value: 'av_other', label: 'Otra iglesia de Alcance Victoria' },
  { value: 'other_church', label: 'Otra iglesia' },
  { value: 'none', label: 'No pertenece a una iglesia' },
  { value: 'prefer_not_say', label: 'Prefiere no indicarlo' },
]

export const personTypeOptions = [
  { value: 'unknown', label: 'Sin clasificar' },
  { value: 'av_member', label: 'Miembro de AV' },
  { value: 'guest', label: 'Invitado/a' },
  { value: 'other_church', label: 'Otra iglesia' },
]

export function churchLabel(value, customName = '') {
  if (value === 'other_church' && customName) return customName
  return churchOptions.find((option) => option.value === value)?.label || 'Sin indicar'
}

export function personTypeLabel(value) {
  return personTypeOptions.find((option) => option.value === value)?.label || 'Sin clasificar'
}

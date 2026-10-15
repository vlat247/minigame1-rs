// Recipe selection and brewing are implemented in the next feature.
export const PREVIEW_PARAMETERS = [
  {
    key: 'temperature',
    name: 'Temperature',
    icon: 'temperature',
    className: 'temperature',
    min: 17,
    max: 27,
  },
  { key: 'density', name: 'Density', icon: 'density', className: 'density', min: 18, max: 28 },
  { key: 'magicPower', name: 'Magic Power', icon: 'magic', className: 'magic', min: 29, max: 39 },
] as const;

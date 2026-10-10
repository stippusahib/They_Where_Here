export interface MapColors {
  accent: string;
  reach: string;
  labelOnMap: string;
  halo: string;
  rare: string;
  legendary: string;
  common: string;
}

export function getMapColors(): MapColors {
  if (typeof window === 'undefined') {
    return {
      accent: '#D23F5A',
      reach: '#8FA2D8',
      labelOnMap: '#FFFFFF',
      halo: '#0F1230',
      rare: '#35B6FF',
      legendary: '#FFC93C',
      common: '#FFF3D6',
    };
  }

  const s = getComputedStyle(document.documentElement);
  return {
    accent: s.getPropertyValue('--accent').trim() || '#D23F5A',
    reach: s.getPropertyValue('--reach').trim() || '#8FA2D8',
    labelOnMap: s.getPropertyValue('--label-on-map').trim() || '#FFFFFF',
    halo: s.getPropertyValue('--halo').trim() || '#0F1230',
    rare: s.getPropertyValue('--rare').trim() || '#35B6FF',
    legendary: s.getPropertyValue('--legendary').trim() || '#FFC93C',
    common: s.getPropertyValue('--common').trim() || '#FFF3D6',
  };
}

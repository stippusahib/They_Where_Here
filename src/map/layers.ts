import type { Map as MapLibreMap } from 'maplibre-gl';
import { getMapColors } from './mapColors';

export function setupMapLayers(map: MapLibreMap) {
  const colors = getMapColors();

  // 1. Notes source
  if (!map.getSource('notes')) {
    map.addSource('notes', {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: [],
      },
    });
  }

  // 2. Orbs symbol layer (visible at all zooms)
  if (!map.getLayer('orbs')) {
    map.addLayer({
      id: 'orbs',
      type: 'symbol',
      source: 'notes',
      minzoom: 1,
      layout: {
        'icon-image': ['coalesce', ['get', 'icon'], 'orb-common-sealed'],
        'icon-size': [
          '*',
          ['interpolate', ['linear'], ['zoom'], 1, 0.5, 6, 0.65, 11, 0.85, 14, 1.0, 16, 1.2],
          ['case', ['==', ['get', 'rarity'], 'legendary'], 1.25, ['==', ['get', 'rarity'], 'rare'], 1.12, 1.0],
        ],
        'symbol-sort-key': [
          'case',
          ['==', ['get', 'rarity'], 'legendary'], 3,
          ['==', ['get', 'rarity'], 'rare'], 2,
          1,
        ],
        'icon-allow-overlap': true,
        'icon-ignore-placement': true,
      },
    });
  }

  // 3. Orb distance labels layer (sealed notes only, zoom 8 and up)
  if (!map.getLayer('orb-labels')) {
    map.addLayer({
      id: 'orb-labels',
      type: 'symbol',
      source: 'notes',
      minzoom: 8,
      filter: ['!', ['get', 'unlocked']],
      layout: {
        'text-field': [
          'case',
          ['>=', ['zoom'], 13],
          ['concat', ['get', 'title'], '\n', ['get', 'distLabel']],
          ['get', 'distLabel'],
        ],
        'text-font': ['Noto Sans Bold'],
        'text-size': 11,
        'text-offset': [0, 2.3],
        'text-anchor': 'top',
        'text-allow-overlap': false,
        'text-max-width': 12,
      },
      paint: {
        'text-color': colors.labelOnMap,
        'text-halo-color': colors.halo,
        'text-halo-width': 2.0,
      },
    });
  }

  // 4. Accuracy GeoJSON source & layers (me-accuracy)
  if (!map.getSource('me-accuracy')) {
    map.addSource('me-accuracy', {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: [],
      },
    });
  }

  if (!map.getLayer('accuracy-fill')) {
    map.addLayer({
      id: 'accuracy-fill',
      type: 'fill',
      source: 'me-accuracy',
      paint: {
        'fill-color': colors.accent,
        'fill-opacity': 0.10,
      },
    });
  }

  if (!map.getLayer('accuracy-line')) {
    map.addLayer({
      id: 'accuracy-line',
      type: 'line',
      source: 'me-accuracy',
      paint: {
        'line-color': colors.accent,
        'line-opacity': 0.45,
        'line-width': 1.5,
      },
    });
  }

  // 5. Layover reach source & layers
  if (!map.getSource('reach')) {
    map.addSource('reach', {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: [],
      },
    });
  }

  if (!map.getLayer('reach-fill')) {
    map.addLayer({
      id: 'reach-fill',
      type: 'fill',
      source: 'reach',
      paint: {
        'fill-color': colors.reach,
        'fill-opacity': 0.06,
      },
    });
  }

  if (!map.getLayer('reach-line')) {
    map.addLayer({
      id: 'reach-line',
      type: 'line',
      source: 'reach',
      paint: {
        'line-color': colors.reach,
        'line-opacity': 0.55,
        'line-dasharray': [3, 3],
        'line-width': 1.5,
      },
    });
  }
}

/**
 * Updates paint properties when theme changes without re-adding layers
 */
export function updateMapLayerColors(map: MapLibreMap) {
  const colors = getMapColors();

  if (map.getLayer('orb-labels')) {
    map.setPaintProperty('orb-labels', 'text-color', colors.labelOnMap);
    map.setPaintProperty('orb-labels', 'text-halo-color', colors.halo);
  }
  if (map.getLayer('accuracy-fill')) {
    map.setPaintProperty('accuracy-fill', 'fill-color', colors.accent);
  }
  if (map.getLayer('accuracy-line')) {
    map.setPaintProperty('accuracy-line', 'line-color', colors.accent);
  }
  if (map.getLayer('reach-fill')) {
    map.setPaintProperty('reach-fill', 'fill-color', colors.reach);
  }
  if (map.getLayer('reach-line')) {
    map.setPaintProperty('reach-line', 'line-color', colors.reach);
  }
}

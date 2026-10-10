import type { Map } from 'maplibre-gl';

export function setupMapLayers(map: Map) {
  // Notes source
  if (!map.getSource('notes')) {
    map.addSource('notes', {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: [],
      },
    });
  }

  // Heat layer for zoom < 13.5
  if (!map.getLayer('notes-heat')) {
    map.addLayer({
      id: 'notes-heat',
      type: 'heatmap',
      source: 'notes',
      maxzoom: 13.5,
      paint: {
        'heatmap-weight': ['case', ['==', ['get', 'rarity'], 'legendary'], 3, ['==', ['get', 'rarity'], 'rare'], 2, 1],
        'heatmap-color': [
          'interpolate', ['linear'], ['heatmap-density'],
          0, 'transparent',
          0.4, 'rgba(53,182,255,0.3)',
          1,   'rgba(255,201,60,0.6)'
        ],
        'heatmap-radius': 30,
        'heatmap-opacity': 0.7,
      },
    });
  }

  // Symbol layer for orbs
  if (!map.getLayer('orbs')) {
    map.addLayer({
      id: 'orbs',
      type: 'symbol',
      source: 'notes',
      minzoom: 13.5,
      layout: {
        'icon-image': [
          'concat',
          'orb-',
          ['get', 'rarity'],
          '-',
          ['case', ['get', 'unlocked'], 'opened', 'sealed'],
        ],
        'icon-size': [
          'interpolate', ['linear'], ['zoom'],
          13.5, 0.55,
          15, 0.80,
          17, 1.0,
        ],
        'icon-allow-overlap': true,
        'icon-ignore-placement': true,
      },
    });
  }

  // Reach circle source
  if (!map.getSource('reach')) {
    map.addSource('reach', {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: [],
      },
    });
  }

  // Reach circle line
  if (!map.getLayer('reach-circle')) {
    map.addLayer({
      id: 'reach-circle',
      type: 'line',
      source: 'reach',
      paint: {
        'line-color': '#35B6FF',
        'line-opacity': 0.35,
        'line-width': 1.5,
        'line-dasharray': [4, 4],
      },
    });
  }
}

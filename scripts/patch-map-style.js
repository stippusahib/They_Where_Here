import fs from 'node:fs';

const style = JSON.parse(fs.readFileSync('public/map-style.json', 'utf8'));

const LAND       = '#1A2040';   // deep navy, not pitch black
const WATER      = '#142035';   // darker indigo water
const PARK       = '#1A2A30';   // dark teal green
const BUILDING   = '#1E2550';   // slightly lighter than land
const ROAD_MIN   = '#252E5C';   // minor roads
const ROAD_MAJ   = '#2E3A6E';   // major roads
const ROAD_HIGH  = '#3A4880';   // highways
const LABEL_PRI  = '#C8D8FF';   // primary labels (stations, landmarks)
const LABEL_SEC  = '#7A8FC4';   // secondary labels
const LABEL_HALO = '#0F1230';   // halo behind labels

style.layers.forEach(layer => {
  if (!layer.paint) return;
  // Land background
  if (layer.type === 'background') layer.paint['background-color'] = LAND;
  // Water
  if (layer.paint['fill-color'] && layer.id.includes('water')) layer.paint['fill-color'] = WATER;
  // Parks
  if (layer.paint['fill-color'] && (layer.id.includes('park') || layer.id.includes('green'))) layer.paint['fill-color'] = PARK;
  // Buildings
  if (layer.paint['fill-color'] && layer.id.includes('building')) { layer.paint['fill-color'] = BUILDING; layer.paint['fill-opacity'] = 0.8; }
  // Roads by class
  if (layer.type === 'line' && layer.id.includes('road')) {
    const id = layer.id;
    layer.paint['line-color'] = id.includes('motorway') || id.includes('trunk') ? ROAD_HIGH : id.includes('primary') || id.includes('secondary') ? ROAD_MAJ : ROAD_MIN;
  }
  // Labels
  if (layer.type === 'symbol' && layer.paint['text-color']) {
    const id = layer.id;
    layer.paint['text-color'] = id.includes('station') || id.includes('airport') ? LABEL_PRI : LABEL_SEC;
    layer.paint['text-halo-color'] = LABEL_HALO;
    layer.paint['text-halo-width'] = 1.5;
  }
});

fs.writeFileSync('public/map-style.json', JSON.stringify(style, null, 2));
console.log('Map style patched.');

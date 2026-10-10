import fs from 'node:fs';

const style = JSON.parse(fs.readFileSync('public/map-style.json', 'utf8'));

// Part 7.1 Master Prompt Light Dusk Postcard Tokens:
// land warm cream, parks soft green, water light cyan, roads white with a soft outline, buildings pale sand, labels deep indigo with a white halo.
const LAND       = '#FFF6E5';   // warm cream land
const WATER      = '#CCEAF7';   // soft light cyan water
const PARK       = '#DCF0D8';   // soft pastel green parks
const BUILDING   = '#F2E8D5';   // pale sand buildings
const ROAD_MIN   = '#FFFFFF';   // crisp white minor roads
const ROAD_MAJ   = '#FFFFFF';   // crisp white major roads
const ROAD_HIGH  = '#FFFFFF';   // crisp white highways
const ROAD_CASING= '#E5DAC0';   // soft casing outline for roads
const LABEL_PRI  = '#0F1230';   // deep indigo primary labels
const LABEL_SEC  = '#3B4A8C';   // secondary labels
const LABEL_HALO = '#FFFFFF';   // crisp white halo behind labels

style.layers.forEach(layer => {
  if (!layer.paint) return;
  // Land background
  if (layer.type === 'background') {
    layer.paint['background-color'] = LAND;
  }
  // Water
  if (layer.paint['fill-color'] && (layer.id.includes('water') || layer.id.includes('ocean'))) {
    layer.paint['fill-color'] = WATER;
  }
  // Parks & green
  if (layer.paint['fill-color'] && (layer.id.includes('park') || layer.id.includes('green') || layer.id.includes('forest') || layer.id.includes('wood') || layer.id.includes('grass'))) {
    layer.paint['fill-color'] = PARK;
  }
  // Buildings
  if (layer.paint['fill-color'] && layer.id.includes('building')) {
    layer.paint['fill-color'] = BUILDING;
    layer.paint['fill-opacity'] = 0.85;
  }
  // Roads by class
  if (layer.type === 'line' && layer.id.includes('road')) {
    layer.paint['line-color'] = '#FFFFFF';
  }
  // Labels
  if (layer.type === 'symbol' && layer.paint['text-color']) {
    const id = layer.id;
    layer.paint['text-color'] = id.includes('station') || id.includes('airport') ? '#E8264C' : LABEL_PRI;
    layer.paint['text-halo-color'] = LABEL_HALO;
    layer.paint['text-halo-width'] = 2.0;
  }
});

fs.writeFileSync('public/map-style.json', JSON.stringify(style, null, 2));
console.log('Map style successfully updated to Light Dusk Postcard theme.');

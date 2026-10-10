const apiKey = process.env.STITCH_API_KEY || '';
const projectId = process.env.STITCH_PROJECT_ID || '15132933096736897357';

async function callMcp(name, args) {
  const res = await fetch('https://stitch.googleapis.com/mcp', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': apiKey,
    },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: Date.now(),
      method: 'tools/call',
      params: { name, arguments: args },
    }),
  });
  return await res.json();
}

console.log('Generating Map Screen in Google Stitch...');
const result = await callMcp('generate_screen_from_text', {
  projectId,
  prompt: 'A mobile location-based discovery map app named "They Were Here". Dark atmospheric map theme with glowing note orbs, a 3D folded paper-plane location indicator, top floating glass HUD with range radar, GPS chip, and time. Bottom arrived action card with "You\'re here - Tap to open this note" and tactile tab navigation at bottom for Map, Passport, Ranks, Me.',
  deviceType: 'MOBILE',
});

console.log('Stitch generate result:', JSON.stringify(result, null, 2));

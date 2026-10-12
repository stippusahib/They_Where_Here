/* ============================================================
 * THEY WERE HERE — High-Visibility User Location Pin (MapLibre GL)
 * High-definition procedural anime user location marker with
 * cinnabar hanko dot, white die-cut border, ink shadow,
 * directional heading beam cone, and radar ripple halo.
 * ============================================================ */

import { Marker } from 'maplibre-gl';

export function createUserPin(): {
  marker: Marker;
  el: HTMLDivElement;
  setHeading: (heading: number | null) => void;
} {
  const el = document.createElement('div');
  el.className = 'user-pin-marker-container';
  el.setAttribute('aria-label', 'Your current location');
  el.style.cssText = `
    width: 52px;
    height: 52px;
    display: flex;
    align-items: center;
    justify-content: center;
    pointer-events: none;
    user-select: none;
    z-index: 100;
  `;

  // 1. Radar Pulse Ripple Ring
  const halo = document.createElement('div');
  halo.className = 'user-pin-radar-halo';
  halo.style.cssText = `
    position: absolute;
    width: 48px;
    height: 48px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(232, 38, 76, 0.55) 0%, rgba(232, 38, 76, 0.2) 50%, transparent 75%);
    animation: userPinPulse 2.2s cubic-bezier(0.2, 0.8, 0.2, 1) infinite;
    pointer-events: none;
  `;
  el.appendChild(halo);

  // 2. Heading Pointer Beam (Anime Directional Compass Cone)
  const cone = document.createElement('div');
  cone.className = 'user-pin-heading-cone';
  cone.style.cssText = `
    position: absolute;
    top: -12px;
    left: 50%;
    transform: translateX(-50%);
    width: 0;
    height: 0;
    border-left: 8px solid transparent;
    border-right: 8px solid transparent;
    border-bottom: 14px solid #E8264C;
    filter: drop-shadow(0 2px 4px rgba(15, 18, 48, 0.45));
    transition: transform 0.2s ease-out;
    display: none;
    z-index: 2;
  `;
  el.appendChild(cone);

  // 3. User Core Hanko Disc
  const dot = document.createElement('div');
  dot.className = 'user-pin-core-dot';
  dot.style.cssText = `
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: radial-gradient(circle at 35% 35%, #FF7A95 0%, #E8264C 65%, #B81434 100%);
    border: 3.5px solid #FFFFFF;
    box-shadow: 0 0 0 1.5px #14143A, 0 4px 12px rgba(15, 18, 48, 0.45);
    position: relative;
    z-index: 3;
    display: flex;
    align-items: center;
    justify-content: center;
  `;
  el.appendChild(dot);

  // 4. White Specular Shine
  const shine = document.createElement('div');
  shine.style.cssText = `
    position: absolute;
    top: 2px;
    left: 3px;
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.95);
  `;
  dot.appendChild(shine);

  // 5. Center Golden Navigator Pip
  const pip = document.createElement('div');
  pip.style.cssText = `
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background: #FFFFFF;
    box-shadow: 0 0 4px #FFFFFF;
  `;
  dot.appendChild(pip);

  const marker = new Marker({
    element: el,
    anchor: 'center',
    pitchAlignment: 'viewport',
    rotationAlignment: 'viewport',
  });

  const setHeading = (heading: number | null) => {
    if (heading !== null && !Number.isNaN(heading)) {
      cone.style.display = 'block';
      cone.style.transform = `translateX(-50%) rotate(${heading}deg)`;
    } else {
      cone.style.display = 'none';
    }
  };

  return { marker, el, setHeading };
}

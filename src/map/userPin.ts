import { Marker } from 'maplibre-gl';

export function createUserPin(): { marker: Marker; el: HTMLDivElement } {
  const el = document.createElement('div');
  el.className = 'user-pin';
  el.setAttribute('aria-label', 'Your location');
  el.innerHTML = '<span class="user-pin-halo"></span><span class="user-pin-dot"></span>';

  const marker = new Marker({
    element: el,
    anchor: 'center',
    pitchAlignment: 'viewport',
    rotationAlignment: 'viewport',
  });

  return { marker, el };
}

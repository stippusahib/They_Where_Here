/* ============================================================
 * THEY WERE HERE — 3D Procedural Paper Plane Mascot ("Pip")
 * Part 11 Spec: Procedural Three.js mesh (4-6 triangles),
 * flat shading in warm paper and coral, hemisphere + directional light,
 * gentle bob and bank animation, dpr capped at 1.5.
 * ============================================================ */

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface PaperPlaneCanvasProps {
  className?: string;
  style?: React.CSSProperties;
  speed?: number;
  interactive?: boolean;
}

export const PaperPlaneCanvas: React.FC<PaperPlaneCanvasProps> = ({
  className = '',
  style = {},
  speed = 1.0,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 320;
    const height = container.clientHeight || 240;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 1.2, 3.8);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.appendChild(renderer.domElement);

    // 2. Lighting (Part 11: Hemisphere + Directional)
    const hemiLight = new THREE.HemisphereLight(0xfff3d6, 0x0f1230, 1.6);
    scene.add(hemiLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 2.0);
    dirLight.position.set(3, 4, 3);
    scene.add(dirLight);

    const subtleBackLight = new THREE.DirectionalLight(0x35b6ff, 0.8);
    subtleBackLight.position.set(-3, -1, -2);
    scene.add(subtleBackLight);

    // 3. Procedural Paper Plane Geometry
    // Vertices:
    // Nose: [0, 0, 1.4]
    // Left Wing: [-1.3, 0.15, -0.9]
    // Right Wing: [1.3, 0.15, -0.9]
    // Keel (center bottom fold): [0, -0.35, -0.7]
    // Center Spine (top fold): [0, 0.05, -0.8]
    const planeGroup = new THREE.Group();

    // Body & Wings: Warm Paper (#FFF3D6)
    const paperMat = new THREE.MeshStandardMaterial({
      color: 0xfff3d6,
      roughness: 0.6,
      metalness: 0.05,
      flatShading: true,
      side: THREE.DoubleSide,
    });

    // Keel Accents: Coral/Hanko (#E8264C)
    const accentMat = new THREE.MeshStandardMaterial({
      color: 0xe8264c,
      roughness: 0.5,
      metalness: 0.1,
      flatShading: true,
      side: THREE.DoubleSide,
    });

    // Wings geometry
    // Triangle 1: Nose -> Center Spine -> Left Wing
    // Triangle 2: Nose -> Right Wing -> Center Spine
    const wingPositions = new Float32Array([
      // Left wing
      0, 0, 1.4,
      0, 0.05, -0.8,
      -1.3, 0.15, -0.9,

      // Right wing
      0, 0, 1.4,
      1.3, 0.15, -0.9,
      0, 0.05, -0.8,
    ]);

    const wingGeom = new THREE.BufferGeometry();
    wingGeom.setAttribute('position', new THREE.BufferAttribute(wingPositions, 3));
    wingGeom.computeVertexNormals();
    const wingMesh = new THREE.Mesh(wingGeom, paperMat);
    planeGroup.add(wingMesh);

    // Keel (Underbelly fold)
    // Triangle 3: Nose -> Left Keel -> Center Spine
    // Triangle 4: Nose -> Center Spine -> Right Keel
    const keelPositions = new Float32Array([
      // Left keel face
      0, 0, 1.4,
      -0.08, -0.35, -0.7,
      0, 0.05, -0.8,

      // Right keel face
      0, 0, 1.4,
      0, 0.05, -0.8,
      0.08, -0.35, -0.7,

      // Bottom gusset
      0, 0, 1.4,
      -0.08, -0.35, -0.7,
      0.08, -0.35, -0.7,
    ]);

    const keelGeom = new THREE.BufferGeometry();
    keelGeom.setAttribute('position', new THREE.BufferAttribute(keelPositions, 3));
    keelGeom.computeVertexNormals();
    const keelMesh = new THREE.Mesh(keelGeom, accentMat);
    planeGroup.add(keelMesh);

    scene.add(planeGroup);

    // Initial orientation
    planeGroup.rotation.y = -0.15;
    planeGroup.rotation.x = 0.1;

    // 4. Animation loop: bob & bank physics
    let animId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime() * speed;

      // Gentle floating bob
      planeGroup.position.y = Math.sin(elapsed * 2.2) * 0.12;

      // Banking turn oscillation
      planeGroup.rotation.z = Math.sin(elapsed * 1.5) * 0.22;
      planeGroup.rotation.y = -0.15 + Math.cos(elapsed * 1.2) * 0.25;
      planeGroup.rotation.x = 0.08 + Math.sin(elapsed * 2.0) * 0.08;

      renderer.render(scene, camera);
    };

    animate();

    // 5. Handle Resize
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth || 320;
      const h = container.clientHeight || 240;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    // 6. Cleanup
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      wingGeom.dispose();
      keelGeom.dispose();
      paperMat.dispose();
      accentMat.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
    };
  }, [speed]);

  return (
    <div
      ref={mountRef}
      className={`relative pointer-events-none select-none ${className}`}
      style={{
        width: '100%',
        height: '100%',
        minHeight: 180,
        ...style,
      }}
    />
  );
};

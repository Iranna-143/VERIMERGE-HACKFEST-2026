import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface VerificationVisualProps {
  status?: 'verified' | 'conflicts' | 'processing';
  score?: number;
}

export const VerificationVisual3D: React.FC<VerificationVisualProps> = ({
  status = 'verified',
  score = 100
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const currentMount = mountRef.current;
    if (!currentMount) return;

    const width = currentMount.clientWidth;
    const height = currentMount.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.z = 4.2;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    currentMount.appendChild(renderer.domElement);

    // Color based on status
    let primaryColor = 0x10b981; // emerald
    if (status === 'conflicts') primaryColor = 0xf43f5e; // rose/amber
    if (status === 'processing') primaryColor = 0x8b5cf6; // violet

    // Shield / Torus Knot Geometry
    const knotGeometry = new THREE.TorusKnotGeometry(0.9, 0.28, 100, 16);
    const knotMaterial = new THREE.MeshStandardMaterial({
      color: primaryColor,
      metalness: 0.8,
      roughness: 0.2,
      wireframe: false
    });
    const knotMesh = new THREE.Mesh(knotGeometry, knotMaterial);
    scene.add(knotMesh);

    // Outer wireframe sphere
    const sphereGeometry = new THREE.SphereGeometry(1.6, 16, 16);
    const sphereMaterial = new THREE.MeshBasicMaterial({
      color: 0x6366f1,
      wireframe: true,
      transparent: true,
      opacity: 0.18
    });
    const sphereMesh = new THREE.Mesh(sphereGeometry, sphereMaterial);
    scene.add(sphereMesh);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(primaryColor, 3, 10);
    pointLight.position.set(2, 2, 3);
    scene.add(pointLight);

    let animationId: number;
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      knotMesh.rotation.x += 0.01;
      knotMesh.rotation.y += 0.015;
      sphereMesh.rotation.y -= 0.005;
      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!currentMount) return;
      const w = currentMount.clientWidth;
      const h = currentMount.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationId);
      if (currentMount.contains(renderer.domElement)) {
        currentMount.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [status]);

  return (
    <div className="relative w-full h-[180px] flex items-center justify-center">
      <div ref={mountRef} className="absolute inset-0 w-full h-full" />
      <div className="relative z-10 pointer-events-none text-center">
        <span className="text-2xl font-extrabold text-white drop-shadow-md">
          {score}%
        </span>
        <span className="block text-[11px] font-medium uppercase tracking-wider text-indigo-200">
          Trust Score
        </span>
      </div>
    </div>
  );
};

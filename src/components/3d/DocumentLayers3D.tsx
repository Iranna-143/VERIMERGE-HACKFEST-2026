import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export const DocumentLayers3D: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const currentMount = mountRef.current;
    if (!currentMount) return;

    // Scene, Camera, Renderer
    const width = currentMount.clientWidth;
    const height = currentMount.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 2.5, 6.5);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    currentMount.appendChild(renderer.domElement);

    // Group to hold all 3D objects
    const mainGroup = new THREE.Group();
    scene.add(mainGroup);

    // Subtle Ambient & Point Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const violetLight = new THREE.PointLight(0x8b5cf6, 4, 15);
    violetLight.position.set(2, 3, 3);
    scene.add(violetLight);

    const cyanLight = new THREE.PointLight(0x06b6d4, 3, 15);
    cyanLight.position.set(-3, -2, 2);
    scene.add(cyanLight);

    // Document Layer Meshes (Stacked transparent glass cards in 3D)
    const docLayers: THREE.Mesh[] = [];
    const layerCount = 3;
    const cardGeometry = new THREE.BoxGeometry(2.4, 3.2, 0.04);

    const colors = [0x6366f1, 0x8b5cf6, 0x10b981];

    for (let i = 0; i < layerCount; i++) {
      const material = new THREE.MeshPhysicalMaterial({
        color: colors[i],
        metalness: 0.1,
        roughness: 0.2,
        transparent: true,
        opacity: 0.65,
        transmission: 0.4,
        ior: 1.5,
        reflectivity: 0.8,
        clearcoat: 0.8
      });

      const mesh = new THREE.Mesh(cardGeometry, material);
      // Stagger in Z and slightly offset in X and Y
      mesh.position.set((i - 1) * 0.45, (1 - i) * 0.35, (i - 1) * 0.6);
      mesh.rotation.set(-0.2, 0.35, 0.08);

      // Wireframe border for high-tech blueprint feel
      const edges = new THREE.EdgesGeometry(cardGeometry);
      const lineMaterial = new THREE.LineBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.4
      });
      const wireframe = new THREE.LineSegments(edges, lineMaterial);
      mesh.add(wireframe);

      mainGroup.add(mesh);
      docLayers.push(mesh);
    }

    // Central Verimerge Holographic Core (Glowing Icosahedron)
    const coreGeo = new THREE.IcosahedronGeometry(0.55, 1);
    const coreMat = new THREE.MeshStandardMaterial({
      color: 0xa78bfa,
      emissive: 0x4f46e5,
      emissiveIntensity: 0.8,
      wireframe: true
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    coreMesh.position.set(1.4, 0.2, 0.8);
    mainGroup.add(coreMesh);

    // Floating Evidence Particle Stream
    const particleCount = 120;
    const particleGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 5;
      positions[i + 1] = (Math.random() - 0.5) * 4;
      positions[i + 2] = (Math.random() - 0.5) * 3;
    }
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const particleMaterial = new THREE.PointsMaterial({
      color: 0xc4b5fd,
      size: 0.04,
      transparent: true,
      opacity: 0.75
    });
    const particleSystem = new THREE.Points(particleGeometry, particleMaterial);
    mainGroup.add(particleSystem);

    // Interactive mouse rotation
    let targetRotX = 0;
    let targetRotY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = currentMount.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      targetRotY = x * 0.35;
      targetRotX = -y * 0.25;
    };

    window.addEventListener('mousemove', handleMouseMove);

    // Animation Loop
    let animationId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      // Smooth mouse follow
      mainGroup.rotation.y += (targetRotY - mainGroup.rotation.y) * 0.05;
      mainGroup.rotation.x += (targetRotX - mainGroup.rotation.x) * 0.05;

      // Gentle floating layer oscillation
      docLayers.forEach((layer, i) => {
        layer.position.y += Math.sin(elapsed * 1.5 + i) * 0.0015;
        layer.rotation.z += Math.cos(elapsed * 1.2 + i) * 0.0008;
      });

      // Core rotation
      coreMesh.rotation.x += 0.01;
      coreMesh.rotation.y += 0.015;

      // Particles gentle drift
      particleSystem.rotation.y = elapsed * 0.04;

      renderer.render(scene, camera);
    };

    animate();

    // Resize Handler
    const handleResize = () => {
      if (!currentMount) return;
      const newWidth = currentMount.clientWidth;
      const newHeight = currentMount.clientHeight;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationId);
      if (currentMount.contains(renderer.domElement)) {
        currentMount.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div 
      ref={mountRef} 
      className="w-full h-full min-h-[380px] lg:min-h-[480px] relative pointer-events-auto cursor-grab active:cursor-grabbing"
      aria-label="Interactive 3D Verimerge Multi-Layer Ingestion Visual"
    />
  );
};

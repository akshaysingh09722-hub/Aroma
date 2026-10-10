import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

interface ARCanvasSceneProps {
  aqi: number;
  particlesEnabled: boolean;
  smokeEnabled: boolean;
  intensity: number; // 0.2 to 2.5 multiplier
  onWebGLError?: (message: string) => void;
}

// Function to map AQI to base color & parameters
function getPollutionVisualProfile(aqi: number) {
  // 0 - 50: Good (crisp clean air with tiny fresh green/aqua motes)
  if (aqi <= 50) {
    return {
      color: new THREE.Color(0x10b981), // Emerald
      particleSize: 0.04,
      particleCount: 220,
      speed: 0.25,
      smokeOpacity: 0.03,
      smokeColor: new THREE.Color(0x34d399),
      turbulence: 0.15,
      hazeOpacity: 0.02,
    };
  }
  // 51 - 100: Moderate (yellow/amber tint)
  if (aqi <= 100) {
    return {
      color: new THREE.Color(0xf59e0b), // Amber/Yellow
      particleSize: 0.06,
      particleCount: 500,
      speed: 0.45,
      smokeOpacity: 0.12,
      smokeColor: new THREE.Color(0xd97706),
      turbulence: 0.35,
      hazeOpacity: 0.08,
    };
  }
  // 101 - 150: Unhealthy for Sensitive Groups (orange)
  if (aqi <= 150) {
    return {
      color: new THREE.Color(0xf97316), // Orange
      particleSize: 0.08,
      particleCount: 900,
      speed: 0.7,
      smokeOpacity: 0.22,
      smokeColor: new THREE.Color(0xc2410c),
      turbulence: 0.55,
      hazeOpacity: 0.18,
    };
  }
  // 151 - 200: Unhealthy (red)
  if (aqi <= 200) {
    return {
      color: new THREE.Color(0xef4444), // Red
      particleSize: 0.11,
      particleCount: 1400,
      speed: 1.0,
      smokeOpacity: 0.36,
      smokeColor: new THREE.Color(0xb91c1c),
      turbulence: 0.8,
      hazeOpacity: 0.28,
    };
  }
  // 201 - 300: Very Unhealthy (purple)
  if (aqi <= 300) {
    return {
      color: new THREE.Color(0x8b5cf6), // Purple
      particleSize: 0.14,
      particleCount: 2000,
      speed: 1.3,
      smokeOpacity: 0.5,
      smokeColor: new THREE.Color(0x6d28d9),
      turbulence: 1.1,
      hazeOpacity: 0.4,
    };
  }
  // 301 - 500+: Hazardous (dark maroon / toxic smog)
  return {
    color: new THREE.Color(0x7f1d1d), // Maroon/Dark Red
    particleSize: 0.18,
    particleCount: 2800,
    speed: 1.6,
    smokeOpacity: 0.65,
    smokeColor: new THREE.Color(0x450a0a),
    turbulence: 1.4,
    hazeOpacity: 0.55,
  };
}

// Generate circular soft glow particle texture programmatically so no external assets are required
function createParticleTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
    gradient.addColorStop(0.2, 'rgba(255, 255, 255, 0.8)');
    gradient.addColorStop(0.6, 'rgba(255, 255, 255, 0.2)');
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 64, 64);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

// Generate soft cloud/smoke puff texture programmatically
function createSmokeTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    const gradient = ctx.createRadialGradient(64, 64, 5, 64, 64, 64);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
    gradient.addColorStop(0.3, 'rgba(230, 230, 230, 0.5)');
    gradient.addColorStop(0.7, 'rgba(180, 180, 180, 0.15)');
    gradient.addColorStop(1, 'rgba(100, 100, 100, 0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 128, 128);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

export const ARCanvasScene: React.FC<ARCanvasSceneProps> = ({
  aqi,
  particlesEnabled,
  smokeEnabled,
  intensity,
  onWebGLError,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const animFrameIdRef = useRef<number | null>(null);
  const isSceneInitializedRef = useRef<boolean>(false);
  const [initTick, setInitTick] = useState<number>(0);

  // References to dynamic objects in the scene
  const particleSystemRef = useRef<THREE.Points | null>(null);
  const particleMaterialRef = useRef<THREE.PointsMaterial | null>(null);
  const particleVelocitiesRef = useRef<Float32Array | null>(null);

  const smokeGroupRef = useRef<THREE.Group | null>(null);
  const smokeMaterialsRef = useRef<THREE.MeshLambertMaterial[]>([]);

  const hazeMeshRef = useRef<THREE.Mesh | null>(null);
  const hazeMaterialRef = useRef<THREE.MeshBasicMaterial | null>(null);

  // Setup Three.js scene
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
        powerPreference: 'high-performance',
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'WebGL not supported on this device/browser.';
      if (onWebGLError) onWebGLError(msg);
      return;
    }

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setClearColor(0x000000, 0); // Transparent background to show photo underneath
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      60,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    camera.position.z = 10;

    // Ambient and directional lighting for smoke scattering
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(5, 10, 7);
    scene.add(dirLight);

    // 1. Atmosphere haze overlay mesh (subtle depth tinting)
    const hazeGeo = new THREE.PlaneGeometry(30, 20);
    const hazeMat = new THREE.MeshBasicMaterial({
      color: 0x10b981,
      transparent: true,
      opacity: 0.05,
      depthWrite: false,
    });
    const hazeMesh = new THREE.Mesh(hazeGeo, hazeMat);
    hazeMesh.position.z = -5;
    scene.add(hazeMesh);
    hazeMeshRef.current = hazeMesh;
    hazeMaterialRef.current = hazeMat;

    // 2. Particulate matter particles (PM2.5 and PM10 simulation)
    const maxParticles = 3000;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(maxParticles * 3);
    const velocities = new Float32Array(maxParticles * 3);

    for (let i = 0; i < maxParticles; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 20; // x
      positions[i * 3 + 1] = (Math.random() - 0.5) * 14; // y
      positions[i * 3 + 2] = (Math.random() - 0.5) * 16; // z

      velocities[i * 3] = (Math.random() - 0.5) * 0.015;
      velocities[i * 3 + 1] = (Math.random() - 0.5) * 0.012 - 0.004; // slight settle/draft
      velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.015;
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleVelocitiesRef.current = velocities;

    const particleTexture = createParticleTexture();
    const particleMat = new THREE.PointsMaterial({
      color: 0x10b981,
      size: 0.08,
      map: particleTexture,
      transparent: true,
      opacity: 0.75,
      blending: THREE.NormalBlending,
      depthWrite: false,
    });

    const particleSystem = new THREE.Points(particleGeo, particleMat);
    scene.add(particleSystem);
    particleSystemRef.current = particleSystem;
    particleMaterialRef.current = particleMat;

    // 3. Volumetric smoke / smog puff layer
    const smokeGroup = new THREE.Group();
    const smokeTexture = createSmokeTexture();
    const smokeGeo = new THREE.PlaneGeometry(5, 5);
    const smokeMaterials: THREE.MeshLambertMaterial[] = [];

    const smokeCount = 35;
    for (let i = 0; i < smokeCount; i++) {
      const mat = new THREE.MeshLambertMaterial({
        map: smokeTexture,
        transparent: true,
        opacity: 0.1,
        color: 0x34d399,
        depthWrite: false,
      });
      smokeMaterials.push(mat);

      const smokeMesh = new THREE.Mesh(smokeGeo, mat);
      smokeMesh.position.set(
        (Math.random() - 0.5) * 18,
        (Math.random() - 0.5) * 12,
        (Math.random() - 0.5) * 10
      );
      smokeMesh.rotation.z = Math.random() * Math.PI * 2;
      smokeMesh.scale.setScalar(0.7 + Math.random() * 0.9);
      smokeGroup.add(smokeMesh);
    }

    scene.add(smokeGroup);
    smokeGroupRef.current = smokeGroup;
    smokeMaterialsRef.current = smokeMaterials;

    isSceneInitializedRef.current = true;
    // Notify render hook asynchronously
    queueMicrotask(() => {
      setInitTick((t) => t + 1);
    });

    // Animation Loop
    let clock = new THREE.Clock();
    const animate = () => {
      animFrameIdRef.current = requestAnimationFrame(animate);
      const delta = clock.getDelta();

      // Animate Particles
      if (particleSystemRef.current && particleVelocitiesRef.current) {
        const posAttr = particleSystemRef.current.geometry.attributes.position as THREE.BufferAttribute;
        const posArray = posAttr.array as Float32Array;
        const velArray = particleVelocitiesRef.current;
        const count = posAttr.count;

        for (let i = 0; i < count; i++) {
          const i3 = i * 3;
          posArray[i3] += velArray[i3];
          posArray[i3 + 1] += velArray[i3 + 1];
          posArray[i3 + 2] += velArray[i3 + 2];

          // Wrap boundaries
          if (posArray[i3] > 10) posArray[i3] = -10;
          if (posArray[i3] < -10) posArray[i3] = 10;
          if (posArray[i3 + 1] > 7) posArray[i3 + 1] = -7;
          if (posArray[i3 + 1] < -7) posArray[i3 + 1] = 7;
          if (posArray[i3 + 2] > 8) posArray[i3 + 2] = -8;
          if (posArray[i3 + 2] < -8) posArray[i3 + 2] = 8;
        }

        posAttr.needsUpdate = true;
        particleSystemRef.current.rotation.y += 0.03 * delta;
      }

      // Animate Smoke Puffs (slow organic swirling)
      if (smokeGroupRef.current) {
        smokeGroupRef.current.children.forEach((mesh, idx) => {
          mesh.rotation.z += (idx % 2 === 0 ? 0.04 : -0.04) * delta;
          mesh.position.x += Math.sin(clock.getElapsedTime() * 0.2 + idx) * 0.003;
          mesh.position.y += Math.cos(clock.getElapsedTime() * 0.2 + idx) * 0.002;
        });
      }

      renderer.render(scene, camera);
    };

    animate();

    // Handle container resize
    const handleResize = () => {
      if (!container || !renderer) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    const resizeObserver = new ResizeObserver(() => {
      handleResize();
    });
    resizeObserver.observe(container);

    // Cleanup resources to prevent WebGL context leaks
    return () => {
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
      resizeObserver.disconnect();

      // Dispose geometries
      hazeGeo.dispose();
      particleGeo.dispose();
      smokeGeo.dispose();

      // Dispose materials
      hazeMat.dispose();
      particleMat.dispose();
      smokeMaterials.forEach((m) => m.dispose());

      // Dispose textures
      particleTexture.dispose();
      smokeTexture.dispose();

      // Dispose renderer
      renderer.dispose();
      if (renderer.domElement && renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
      rendererRef.current = null;
    };
  }, [onWebGLError]);

  // Synchronize dynamic scene properties whenever AQI, visibility, or intensity change
  useEffect(() => {
    if (!isSceneInitializedRef.current) return;

    const profile = getPollutionVisualProfile(aqi);
    const effectiveIntensity = Math.max(0.2, Math.min(intensity, 3.0));

    // Update Particles
    if (particleSystemRef.current && particleMaterialRef.current && particleVelocitiesRef.current) {
      particleSystemRef.current.visible = particlesEnabled;
      particleMaterialRef.current.color.copy(profile.color);
      particleMaterialRef.current.size = profile.particleSize * (0.8 + 0.4 * effectiveIntensity);
      particleMaterialRef.current.opacity = Math.min(
        0.95,
        (aqi <= 50 ? 0.4 : 0.75) * effectiveIntensity
      );

      // Adjust particle active draw count based on AQI
      const targetCount = Math.min(
        3000,
        Math.round(profile.particleCount * effectiveIntensity)
      );
      particleSystemRef.current.geometry.setDrawRange(0, targetCount);

      // Adjust velocities based on speed and turbulence
      const baseSpeed = profile.speed * effectiveIntensity;
      const velArray = particleVelocitiesRef.current;
      for (let i = 0; i < 3000; i++) {
        const dir = (i % 2 === 0 ? 1 : -1) * (0.01 + (i % 5) * 0.003);
        velArray[i * 3] = dir * baseSpeed * 0.6;
        velArray[i * 3 + 1] = -0.005 * baseSpeed;
        velArray[i * 3 + 2] = (Math.sin(i) * 0.01) * baseSpeed;
      }
    }

    // Update Smoke Layer
    if (smokeGroupRef.current) {
      smokeGroupRef.current.visible = smokeEnabled;
      const effectiveOpacity = Math.min(
        0.85,
        profile.smokeOpacity * effectiveIntensity
      );
      smokeMaterialsRef.current.forEach((mat) => {
        mat.color.copy(profile.smokeColor);
        mat.opacity = effectiveOpacity;
      });
    }

    // Update Atmosphere Haze
    if (hazeMeshRef.current && hazeMaterialRef.current) {
      hazeMeshRef.current.visible = smokeEnabled;
      hazeMaterialRef.current.color.copy(profile.color);
      hazeMaterialRef.current.opacity = Math.min(
        0.6,
        profile.hazeOpacity * effectiveIntensity
      );
    }
  }, [aqi, particlesEnabled, smokeEnabled, intensity, initTick]);

  return (
    <div
      ref={containerRef}
      className="ar-canvas-layer"
      aria-label="3D Augmented Reality Air Pollution Simulation Canvas"
    />
  );
};

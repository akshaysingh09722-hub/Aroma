import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { getAQIScale } from '../../utils/aqiUtils';
import { RotateCcw, ZoomIn, ZoomOut, Eye } from 'lucide-react';

interface UrbanPollution3DCanvasProps {
  aqi: number;
  cityName: string;
  windSpeed?: number;
  showBoundaryLayer?: boolean;
  className?: string;
}

export const UrbanPollution3DCanvas: React.FC<UrbanPollution3DCanvasProps> = ({
  aqi,
  cityName,
  windSpeed = 12,
  showBoundaryLayer = true,
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [webglSupported, setWebglSupported] = useState(true);
  const [zoomLevel, setZoomLevel] = useState(1);

  // References to dynamic 3D elements
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const particlesRef = useRef<THREE.Points | null>(null);
  const boundaryLayerRef = useRef<THREE.Mesh | null>(null);
  const controlsStateRef = useRef({
    isDragging: false,
    prevX: 0,
    prevY: 0,
    rotX: 0.45,
    rotY: 0.65,
    zoom: 65,
  });

  const scale = getAQIScale(aqi);

  useEffect(() => {
    if (!containerRef.current) return;

    // Test WebGL support
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) {
        setWebglSupported(false);
        return;
      }
    } catch {
      setWebglSupported(false);
      return;
    }

    const width = containerRef.current.clientWidth || 800;
    const height = containerRef.current.clientHeight || 500;

    // 1. Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color('#070D1E'); // Deep midnight navy
    scene.fog = new THREE.FogExp2('#070D1E', 0.009);

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    cameraRef.current = camera;
    camera.position.set(45, 40, 55);
    camera.lookAt(0, 5, 0);

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    rendererRef.current = renderer;
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    containerRef.current.appendChild(renderer.domElement);

    // 4. Lights
    const ambientLight = new THREE.AmbientLight('#ffffff', 0.85);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight('#38BDF8', 1.8);
    dirLight.position.set(30, 60, 25);
    dirLight.castShadow = true;
    scene.add(dirLight);

    const pointLight = new THREE.PointLight(scale.hex, 2.5, 80);
    pointLight.position.set(0, 15, 0);
    scene.add(pointLight);

    // 5. Ground Plane & Grid
    const groundGeo = new THREE.PlaneGeometry(120, 120);
    const groundMat = new THREE.MeshStandardMaterial({
      color: '#0B132B',
      roughness: 0.9,
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    const gridHelper = new THREE.GridHelper(120, 30, '#10B981', '#1C2541');
    gridHelper.position.y = 0.05;
    scene.add(gridHelper);

    // 6. Procedural Stylized City Buildings
    const cityGroup = new THREE.Group();
    const buildingGeo = new THREE.BoxGeometry(1, 1, 1);
    const buildingMat = new THREE.MeshStandardMaterial({
      color: '#151F38',
      roughness: 0.4,
      metalness: 0.2,
    });
    const buildingEdgeMat = new THREE.LineBasicMaterial({ color: '#2C3E6B' });

    // Grid of buildings
    const citySize = 7;
    for (let x = -citySize; x <= citySize; x += 2) {
      for (let z = -citySize; z <= citySize; z += 2) {
        if (Math.random() > 0.85) continue; // Urban plazas

        const heightVal = 3 + Math.floor(Math.random() * 22) + (Math.abs(x) < 2 && Math.abs(z) < 2 ? 14 : 0);
        const building = new THREE.Mesh(buildingGeo, buildingMat);
        building.scale.set(1.5, heightVal, 1.5);
        building.position.set(x * 3.5, heightVal / 2, z * 3.5);
        building.castShadow = true;
        building.receiveShadow = true;
        cityGroup.add(building);

        // Add subtle edge outlines
        const edges = new THREE.EdgesGeometry(buildingGeo);
        const line = new THREE.LineSegments(edges, buildingEdgeMat);
        line.scale.copy(building.scale);
        line.position.copy(building.position);
        cityGroup.add(line);
      }
    }
    scene.add(cityGroup);

    // 7. Atmospheric Inversion Boundary Layer
    const boundaryGeo = new THREE.CylinderGeometry(45, 45, 2, 32);
    const boundaryMat = new THREE.MeshBasicMaterial({
      color: scale.hex,
      transparent: true,
      opacity: 0.15,
      wireframe: true,
    });
    const boundaryLayer = new THREE.Mesh(boundaryGeo, boundaryMat);
    boundaryLayer.position.y = 28;
    boundaryLayerRef.current = boundaryLayer;
    scene.add(boundaryLayer);

    // 8. Volumetric Smog & Aerosol Particle Cloud
    const particleCount = Math.min(Math.max(Math.round(aqi * 12), 250), 3000);
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const particleColors = new Float32Array(particleCount * 3);

    const smogColor = new THREE.Color(scale.hex);

    for (let i = 0; i < particleCount; i++) {
      particlePositions[i * 3] = (Math.random() - 0.5) * 80;
      particlePositions[i * 3 + 1] = Math.random() * 30; // Altitude 0 - 30m
      particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 80;

      particleColors[i * 3] = smogColor.r;
      particleColors[i * 3 + 1] = smogColor.g;
      particleColors[i * 3 + 2] = smogColor.b;
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    particleGeo.setAttribute('color', new THREE.BufferAttribute(particleColors, 3));

    const particleMat = new THREE.PointsMaterial({
      size: Math.max(aqi / 40, 1.2),
      vertexColors: true,
      transparent: true,
      opacity: Math.min(0.3 + (aqi / 300) * 0.45, 0.85),
      blending: THREE.AdditiveBlending,
    });

    const particles = new THREE.Points(particleGeo, particleMat);
    particlesRef.current = particles;
    scene.add(particles);

    // 9. Interactive Drag to Orbit
    const dom = renderer.domElement;
    const state = controlsStateRef.current;

    const onMouseDown = (e: MouseEvent) => {
      state.isDragging = true;
      state.prevX = e.clientX;
      state.prevY = e.clientY;
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!state.isDragging) return;
      const dx = e.clientX - state.prevX;
      const dy = e.clientY - state.prevY;
      state.rotY += dx * 0.008;
      state.rotX = Math.max(0.1, Math.min(Math.PI / 2.2, state.rotX + dy * 0.008));
      state.prevX = e.clientX;
      state.prevY = e.clientY;
    };

    const onMouseUp = () => {
      state.isDragging = false;
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      state.zoom = Math.max(30, Math.min(110, state.zoom + e.deltaY * 0.05));
      setZoomLevel(Math.round((80 / state.zoom) * 10) / 10);
    };

    dom.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    dom.addEventListener('wheel', onWheel, { passive: false });

    // 10. Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const delta = clock.getDelta();

      // Update camera position based on orbit angles
      camera.position.x = state.zoom * Math.sin(state.rotY) * Math.cos(state.rotX);
      camera.position.y = state.zoom * Math.sin(state.rotX) + 6;
      camera.position.z = state.zoom * Math.cos(state.rotY) * Math.cos(state.rotX);
      camera.lookAt(0, 8, 0);

      // Rotate particle cloud to simulate wind transport
      if (particles) {
        particles.rotation.y += (windSpeed / 100) * 0.05 * delta;
      }

      // Pulse boundary layer
      if (boundaryLayer) {
        boundaryLayer.rotation.y += 0.08 * delta;
        boundaryLayer.visible = showBoundaryLayer;
      }

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!containerRef.current) return;
      const newW = containerRef.current.clientWidth;
      const newH = containerRef.current.clientHeight;
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      dom.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      dom.removeEventListener('wheel', onWheel);

      cancelAnimationFrame(animationFrameId);
      groundGeo.dispose();
      groundMat.dispose();
      buildingGeo.dispose();
      buildingMat.dispose();
      buildingEdgeMat.dispose();
      boundaryGeo.dispose();
      boundaryMat.dispose();
      particleGeo.dispose();
      particleMat.dispose();
      renderer.dispose();
      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }
    };
  }, [aqi, showBoundaryLayer, windSpeed]);

  const handleResetCamera = () => {
    const state = controlsStateRef.current;
    state.rotX = 0.45;
    state.rotY = 0.65;
    state.zoom = 65;
    setZoomLevel(1);
  };

  const handleZoomIn = () => {
    const state = controlsStateRef.current;
    state.zoom = Math.max(30, state.zoom - 10);
    setZoomLevel(Math.round((80 / state.zoom) * 10) / 10);
  };

  const handleZoomOut = () => {
    const state = controlsStateRef.current;
    state.zoom = Math.min(110, state.zoom + 10);
    setZoomLevel(Math.round((80 / state.zoom) * 10) / 10);
  };

  if (!webglSupported) {
    return (
      <div className="h-96 rounded-2xl bg-slate-900 border border-slate-800 p-8 flex flex-col items-center justify-center text-center text-white space-y-3">
        <Eye className="w-12 h-12 text-slate-500" />
        <h4 className="text-base font-bold">3D WebGL Visualization Fallback</h4>
        <p className="text-xs text-slate-400 max-w-md">
          Hardware WebGL acceleration is unavailable in your browser environment. All air-quality metrics, charts, and forecasts remain fully operational in 2D mode.
        </p>
      </div>
    );
  }

  return (
    <div className={`relative rounded-3xl overflow-hidden bg-slate-950 border border-slate-800 shadow-2xl ${className}`}>
      {/* Three.js Canvas Container */}
      <div
        ref={containerRef}
        className="w-full h-[450px] sm:h-[540px] cursor-grab active:cursor-grabbing"
      />

      {/* Floating HUD Top Overlay */}
      <div className="absolute top-4 left-4 z-10 flex flex-wrap items-center gap-2 pointer-events-none">
        <div className="bg-slate-900/85 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-slate-700/80 text-white text-xs flex items-center gap-2 shadow-lg">
          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: scale.hex }} />
          <span className="font-bold">{cityName} 3D Urban Simulation</span>
          <span className="text-slate-400">•</span>
          <span className="font-mono text-emerald-400 font-bold">AQI {aqi} ({scale.category})</span>
        </div>
      </div>

      {/* Floating HUD Controls Bottom Left */}
      <div className="absolute bottom-4 left-4 z-10 hidden sm:flex items-center gap-2 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-800 text-[11px] text-slate-400">
        <span>Drag to orbit</span>
        <span>•</span>
        <span>Scroll to zoom</span>
        <span>•</span>
        <span>Zoom: {zoomLevel}x</span>
      </div>

      {/* Floating Camera Actions Top Right */}
      <div className="absolute top-4 right-4 z-10 flex items-center gap-1.5 bg-slate-900/80 backdrop-blur-md p-1.5 rounded-xl border border-slate-800">
        <button
          onClick={handleZoomIn}
          className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
          title="Zoom in"
          aria-label="Zoom in"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={handleZoomOut}
          className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
          title="Zoom out"
          aria-label="Zoom out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={handleResetCamera}
          className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
          title="Reset camera view"
          aria-label="Reset camera view"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Scientific Disclaimer Pill Bottom Right */}
      <div className="absolute bottom-4 right-4 z-10 text-[10px] font-mono text-slate-400 bg-slate-950/90 backdrop-blur-md px-2.5 py-1 rounded-lg border border-slate-800">
        Simulation layer is illustrative atmospheric modeling
      </div>
    </div>
  );
};

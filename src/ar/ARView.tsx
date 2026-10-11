import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Upload,
  Camera,
  CameraOff,
  RotateCcw,
  Sliders,
  AlertTriangle,
  Info,
  Sparkles,
  ArrowLeft,
  X,
  Layers,
  Wind,
  ShieldAlert,
  Flame,
  Maximize2,
  Minimize2,
  Image as ImageIcon,
} from 'lucide-react';
import { ARCanvasScene } from './ARCanvasScene';
import { AQI_LEVELS, getAQICategory, getAQIScale } from '../utils/aqiUtils';
import './ARView.css';

// Default realistic demo street background image
const DEFAULT_SAMPLE_PHOTO =
  'https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=1600&q=80';

// Alternative sample scenes that users can instantly test
const SAMPLE_PRESETS = [
  {
    name: 'City Skyline',
    url: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=1200&q=80',
    type: 'Urban Architecture',
  },
  {
    name: 'Busy Traffic Road',
    url: 'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&w=1200&q=80',
    type: 'Traffic Corridor',
  },
  {
    name: 'Public Park & Trees',
    url: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1200&q=80',
    type: 'Green Space',
  },
];

interface ARViewProps {
  initialAQI?: number;
  initialCityName?: string;
  onClose?: () => void;
  isModal?: boolean;
}

export const ARView: React.FC<ARViewProps> = ({
  initialAQI = 142,
  initialCityName = 'Tokyo',
  onClose,
  isModal = false,
}) => {
  // Visual Simulation State
  const [aqi, setAqi] = useState<number>(initialAQI);
  const [cityName, setCityName] = useState<string>(initialCityName);
  const [particlesEnabled, setParticlesEnabled] = useState<boolean>(true);
  const [smokeEnabled, setSmokeEnabled] = useState<boolean>(true);
  const [intensity, setIntensity] = useState<number>(1.0);

  // Synchronize when parent city or AQI updates
  useEffect(() => {
    setAqi(initialAQI);
    setCityName(initialCityName);
  }, [initialAQI, initialCityName]);

  // Background Media State: 'photo' | 'camera'
  const [mediaMode, setMediaMode] = useState<'photo' | 'camera'>('photo');
  const [bgImageUrl, setBgImageUrl] = useState<string>(DEFAULT_SAMPLE_PHOTO);
  const [uploadedFileName, setUploadedFileName] = useState<string>('City Skyline (Sample)');
  const [isCustomUpload, setIsCustomUpload] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isLoadingImage, setIsLoadingImage] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Camera Stream State
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Layout View State
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Cleanup object URLs on unmount or replacement
  const prevObjectUrlRef = useRef<string | null>(null);

  const cleanupObjectUrl = useCallback(() => {
    if (prevObjectUrlRef.current && prevObjectUrlRef.current.startsWith('blob:')) {
      URL.revokeObjectURL(prevObjectUrlRef.current);
      prevObjectUrlRef.current = null;
    }
  }, []);

  // Stop camera stream safely
  const stopCameraStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  }, []);

  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      cleanupObjectUrl();
      stopCameraStream();
    };
  }, [cleanupObjectUrl, stopCameraStream]);

  // Handle File Upload Validation & Processing
  const processImageFile = (file: File) => {
    setErrorMessage(null);

    // Validate mime type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type.toLowerCase())) {
      setErrorMessage('Unsupported file format. Please upload a JPG, JPEG, PNG, or WEBP image.');
      return;
    }

    // Validate size (max 10MB)
    const MAX_SIZE_MB = 10;
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setErrorMessage(`Image is too large (${(file.size / (1024 * 1024)).toFixed(1)} MB). Maximum allowed size is ${MAX_SIZE_MB} MB.`);
      return;
    }

    setIsLoadingImage(true);
    cleanupObjectUrl();

    try {
      const objectUrl = URL.createObjectURL(file);
      prevObjectUrlRef.current = objectUrl;

      // Ensure camera is turned off when switching to photo
      if (isCameraActive) {
        stopCameraStream();
      }

      setBgImageUrl(objectUrl);
      setUploadedFileName(file.name);
      setIsCustomUpload(true);
      setMediaMode('photo');
    } catch {
      setErrorMessage('Failed to load image preview. Please try another file.');
    } finally {
      setTimeout(() => setIsLoadingImage(false), 250);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processImageFile(e.target.files[0]);
    }
  };

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processImageFile(e.dataTransfer.files[0]);
    }
  };

  // Switch to sample preset
  const handleSelectPreset = (preset: typeof SAMPLE_PRESETS[0]) => {
    cleanupObjectUrl();
    if (isCameraActive) stopCameraStream();
    setBgImageUrl(preset.url);
    setUploadedFileName(preset.name);
    setIsCustomUpload(false);
    setMediaMode('photo');
    setErrorMessage(null);
  };

  // Reset image back to default
  const handleResetImage = () => {
    cleanupObjectUrl();
    if (isCameraActive) stopCameraStream();
    setBgImageUrl(DEFAULT_SAMPLE_PHOTO);
    setUploadedFileName('City Skyline (Sample)');
    setIsCustomUpload(false);
    setMediaMode('photo');
    setErrorMessage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Reset visualization settings
  const handleResetControls = () => {
    setAqi(initialAQI);
    setParticlesEnabled(true);
    setSmokeEnabled(true);
    setIntensity(1.0);
  };

  // Optional Live Camera Mode implementation
  const handleToggleCamera = async () => {
    if (isCameraActive) {
      stopCameraStream();
      setMediaMode('photo');
      return;
    }

    setCameraError(null);
    setErrorMessage(null);

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraError('Camera access is not supported by your browser or environment. Camera requires HTTPS or localhost.');
      return;
    }

    try {
      // Try to acquire camera (prefer environment/rear camera on mobile)
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }

      setIsCameraActive(true);
      setMediaMode('camera');
    } catch (err: unknown) {
      const errObj = err as Error;
      if (errObj.name === 'NotAllowedError' || errObj.name === 'PermissionDeniedError') {
        setCameraError('Camera permission was denied. Please allow camera permissions in your browser address bar.');
      } else if (errObj.name === 'NotFoundError' || errObj.name === 'DevicesNotFoundError') {
        setCameraError('No camera device was detected on your system.');
      } else {
        setCameraError(`Unable to start camera: ${errObj.message || 'Check security permissions'}`);
      }
      setIsCameraActive(false);
      setMediaMode('photo');
    }
  };

  // Toggle fullscreen for viewport
  const toggleFullscreen = () => {
    if (!viewportRef.current) return;
    if (!document.fullscreenElement) {
      viewportRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  // AQI Meta Helpers
  const currentScale = getAQIScale(aqi);
  const currentCategory = getAQICategory(aqi);

  return (
    <div className={`space-y-6 ${isModal ? 'p-1' : ''}`}>
      {/* Top Header & Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-3">
            {onClose && (
              <button
                onClick={onClose}
                type="button"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold shadow-sm transition-all"
                title="Return to Air Quality Dashboard"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Dashboard</span>
              </button>
            )}
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 shadow-md shadow-emerald-500/20">
                <Sparkles className="w-5 h-5 text-slate-950" />
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                AirVision AI — AR Visualization
              </h1>
            </div>
            <span className="hidden md:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-300">
              Interactive 3D WebGL
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-3xl">
            Simulate and visualize particulate matter (PM2.5, PM10) and airborne smog overlaid directly onto real outdoor photographs or live camera feeds in real time for {cityName} and surrounding environments.
          </p>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="self-end sm:self-center p-2 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors"
            aria-label="Close AR view"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Main Grid: Left is Viewport (large), Right is Controls & Preset Palette */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* VIEWPORT COLUMN (8 cols on lg) */}
        <div className="lg:col-span-8 space-y-4">
          {/* Main 3D AR Viewport Card */}
          <div
            ref={viewportRef}
            className="ar-viewport-container ar-glow-border relative w-full h-[380px] sm:h-[480px] md:h-[540px] rounded-2xl shadow-2xl bg-slate-950 border border-slate-800 group"
          >
            {/* 1. Underlying Media Background (The EXACT photo uploaded or camera stream) */}
            {mediaMode === 'camera' ? (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="absolute inset-0 w-full h-full object-cover z-0"
              />
            ) : (
              <img
                src={bgImageUrl}
                alt="AR Environment Background"
                className={`absolute inset-0 w-full h-full object-cover z-0 transition-opacity duration-300 ${
                  isLoadingImage ? 'opacity-30 blur-sm' : 'opacity-100'
                }`}
              />
            )}

            {/* Subtle atmospheric gradient overlay for contrast */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-slate-950/40 pointer-events-none z-5" />

            {/* 2. Real Three.js WebGL Particle & Smoke Canvas Layer */}
            <ARCanvasScene
              aqi={aqi}
              particlesEnabled={particlesEnabled}
              smokeEnabled={smokeEnabled}
              intensity={intensity}
              onWebGLError={(err) => setErrorMessage(`WebGL Notice: ${err}`)}
            />

            {/* 3. Viewport Head-Up Display (HUD) Controls & Badges */}
            <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none z-20">
              {/* AQI Status Badge */}
              <div className="pointer-events-auto flex items-center gap-2.5 px-3 py-1.5 rounded-xl ar-glass-panel shadow-lg border border-white/10">
                <div
                  className="w-3.5 h-3.5 rounded-full shadow-md animate-pulse"
                  style={{ backgroundColor: currentScale.hex }}
                />
                <div className="flex flex-col">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-xs font-bold uppercase text-slate-300">AQI</span>
                    <span className="text-base sm:text-lg font-black text-white leading-none">
                      {aqi}
                    </span>
                    <span
                      className="text-[11px] font-extrabold uppercase px-1.5 py-0.2 rounded"
                      style={{
                        backgroundColor: `${currentScale.hex}30`,
                        color: currentScale.hex,
                      }}
                    >
                      {currentCategory}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">
                    Mode: {mediaMode === 'camera' ? 'Live Camera Feed' : uploadedFileName}
                  </span>
                </div>
              </div>

              {/* Viewport Action Buttons */}
              <div className="pointer-events-auto flex items-center gap-1.5">
                <button
                  onClick={toggleFullscreen}
                  className="p-2 rounded-xl ar-glass-panel text-slate-300 hover:text-white hover:bg-slate-800/80 transition-colors shadow-lg"
                  title={isFullscreen ? 'Exit Fullscreen' : 'View Fullscreen'}
                >
                  {isFullscreen ? (
                    <Minimize2 className="w-4 h-4" />
                  ) : (
                    <Maximize2 className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Bottom HUD: Dynamic Health Warning Overlay */}
            <div className="absolute bottom-4 left-4 right-4 pointer-events-none z-20">
              <div className="pointer-events-auto ar-glass-panel p-3 rounded-xl border border-white/10 flex items-start sm:items-center justify-between gap-3 shadow-xl">
                <div className="flex items-center gap-2.5">
                  <ShieldAlert
                    className="w-5 h-5 shrink-0"
                    style={{ color: currentScale.hex }}
                  />
                  <div>
                    <p className="text-xs font-bold text-white leading-snug">
                      {currentScale.description}
                    </p>
                    <p className="text-[11px] text-slate-300 hidden sm:block">
                      {currentScale.actionAdvice}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Demonstration Mode
                  </span>
                </div>
              </div>
            </div>

            {/* Loading Spinner during image processing */}
            {isLoadingImage && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/70 z-30 backdrop-blur-xs">
                <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                <span className="text-xs font-bold text-slate-200 mt-3">
                  Processing high-resolution photo...
                </span>
              </div>
            )}
          </div>

          {/* Image & Camera Input Action Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-emerald-600" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Visual Input Source
                </span>
                {isCustomUpload && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    Custom Photo Loaded
                  </span>
                )}
              </div>

              {/* Action Buttons: Upload, Camera, Reset */}
              <div className="flex items-center gap-2 flex-wrap">
                {/* Upload Button */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleFileChange}
                  className="hidden"
                  id="ar-photo-input"
                />
                <label
                  htmlFor="ar-photo-input"
                  className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-all"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>{isCustomUpload ? 'Replace Photo' : 'Upload Street Photo'}</span>
                </label>

                {/* Live Camera Button */}
                <button
                  onClick={handleToggleCamera}
                  className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition-all ${
                    isCameraActive
                      ? 'bg-rose-50 text-rose-700 border-rose-300 hover:bg-rose-100'
                      : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                  }`}
                >
                  {isCameraActive ? (
                    <>
                      <CameraOff className="w-3.5 h-3.5 text-rose-600" />
                      <span>Stop Camera</span>
                    </>
                  ) : (
                    <>
                      <Camera className="w-3.5 h-3.5 text-slate-600" />
                      <span>Live Camera</span>
                    </>
                  )}
                </button>

                {/* Reset Image Button */}
                {(isCustomUpload || isCameraActive) && (
                  <button
                    onClick={handleResetImage}
                    className="inline-flex items-center gap-1 px-2.5 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-800 hover:bg-slate-100 border border-slate-200 transition-colors"
                    title="Reset to default scene"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset</span>
                  </button>
                )}
              </div>
            </div>

            {/* Drag & Drop Zone */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-4 sm:p-5 text-center cursor-pointer transition-all ${
                isDragging
                  ? 'border-emerald-500 bg-emerald-50/60 scale-[1.01]'
                  : 'border-slate-200 hover:border-emerald-400 hover:bg-slate-50/80'
              }`}
            >
              <div className="flex flex-col items-center justify-center gap-1.5">
                <div className="p-2 rounded-full bg-emerald-100 text-emerald-700">
                  <Upload className="w-4 h-4" />
                </div>
                <p className="text-xs font-bold text-slate-800">
                  Drag and drop your outdoor photo here, or <span className="text-emerald-600 underline">browse</span>
                </p>
                <p className="text-[11px] text-slate-400">
                  Supports JPG, JPEG, PNG, WEBP up to 10 MB. Your photo remains in-browser and is not uploaded to any remote server.
                </p>
              </div>
            </div>

            {/* Preset Scenes Picker */}
            <div className="pt-2 border-t border-slate-100">
              <span className="text-[11px] font-semibold text-slate-400 block mb-2">
                Or test with sample environments:
              </span>
              <div className="grid grid-cols-3 gap-2">
                {SAMPLE_PRESETS.map((preset) => {
                  const isActive = bgImageUrl === preset.url && mediaMode === 'photo';
                  return (
                    <button
                      key={preset.name}
                      onClick={() => handleSelectPreset(preset)}
                      className={`relative flex flex-col text-left p-2 rounded-xl border transition-all overflow-hidden ${
                        isActive
                          ? 'border-emerald-500 bg-emerald-50/70 ring-2 ring-emerald-500/20'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="h-12 w-full rounded-lg overflow-hidden mb-1.5 bg-slate-100">
                        <img
                          src={preset.url}
                          alt={preset.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <span className="text-[11px] font-bold text-slate-800 truncate">
                        {preset.name}
                      </span>
                      <span className="text-[9px] text-slate-400 truncate">
                        {preset.type}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Error Notifications */}
            {errorMessage && (
              <div className="flex items-start gap-2 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div className="flex-1 font-medium">{errorMessage}</div>
                <button
                  onClick={() => setErrorMessage(null)}
                  className="text-rose-600 hover:text-rose-900 font-bold"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {cameraError && (
              <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div className="flex-1 font-medium">{cameraError}</div>
                <button
                  onClick={() => setCameraError(null)}
                  className="text-amber-600 hover:text-amber-900 font-bold"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* CONTROLS COLUMN (4 cols on lg) */}
        <div className="lg:col-span-4 space-y-4">
          {/* AQI Interactive Simulation Panel */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-emerald-600" />
                <h2 className="text-sm font-extrabold text-slate-900 tracking-tight">
                  Pollution & AQI Controls
                </h2>
              </div>
              <button
                onClick={handleResetControls}
                className="text-[11px] font-semibold text-slate-500 hover:text-emerald-700 transition-colors flex items-center gap-1"
                title="Reset simulation parameters"
              >
                <RotateCcw className="w-3 h-3" />
                Reset
              </button>
            </div>

            {/* Current Value Display & Badge */}
            <div
              className="p-4 rounded-xl border flex items-center justify-between"
              style={{
                backgroundColor: `${currentScale.hex}12`,
                borderColor: `${currentScale.hex}40`,
              }}
            >
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Simulated AQI Level
                </span>
                <div className="text-3xl font-black text-slate-900 tracking-tight">
                  {aqi}{' '}
                  <span className="text-xs font-semibold text-slate-500">/ 500</span>
                </div>
              </div>

              <div
                className="px-3 py-1.5 rounded-xl text-xs font-extrabold text-white text-center shadow-sm"
                style={{ backgroundColor: currentScale.hex }}
              >
                {currentCategory}
              </div>
            </div>

            {/* AQI Slider */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                <span>AQI Slider</span>
                <span className="font-mono text-emerald-700">{aqi}</span>
              </div>
              <input
                type="range"
                min="0"
                max="500"
                step="1"
                value={aqi}
                onChange={(e) => setAqi(parseInt(e.target.value, 10))}
                className="ar-slider"
                aria-label="AQI Level Slider"
              />
              <div className="flex justify-between text-[10px] font-bold text-slate-400">
                <span>0 (Good)</span>
                <span>150</span>
                <span>300</span>
                <span>500 (Hazardous)</span>
              </div>
            </div>

            {/* Quick AQI Category Presets */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Quick Category Jump
              </span>
              <div className="grid grid-cols-3 gap-1.5">
                {AQI_LEVELS.map((lvl) => {
                  const isCurrent = currentCategory === lvl.category;
                  // Representative AQI midpoint
                  const sampleVal = Math.min(420, Math.round((lvl.min + Math.min(lvl.max, 500)) / 2));
                  return (
                    <button
                      key={lvl.category}
                      onClick={() => setAqi(sampleVal)}
                      className={`px-2 py-1.5 rounded-lg text-[10px] font-bold transition-all border text-left truncate ${
                        isCurrent
                          ? 'border-slate-900 bg-slate-900 text-white shadow-sm'
                          : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700'
                      }`}
                      title={`${lvl.category} (${lvl.range})`}
                    >
                      <span
                        className="inline-block w-2 h-2 rounded-full mr-1.5"
                        style={{ backgroundColor: lvl.hex }}
                      />
                      {lvl.category}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3D Effect Toggles & Density Multiplier */}
            <div className="space-y-3 pt-3 border-t border-slate-100">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Render Engine Layers
              </span>

              {/* Particles Toggle */}
              <label className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer hover:bg-slate-100/70 transition-colors">
                <div className="flex items-center gap-2">
                  <Wind className="w-4 h-4 text-emerald-600" />
                  <div>
                    <div className="text-xs font-bold text-slate-800">
                      3D Particulate Matter
                    </div>
                    <div className="text-[10px] text-slate-400">
                      Simulates PM2.5 & PM10 particle motion
                    </div>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={particlesEnabled}
                  onChange={(e) => setParticlesEnabled(e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                />
              </label>

              {/* Smoke / Smog Toggle */}
              <label className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer hover:bg-slate-100/70 transition-colors">
                <div className="flex items-center gap-2">
                  <Flame className="w-4 h-4 text-amber-600" />
                  <div>
                    <div className="text-xs font-bold text-slate-800">
                      Volumetric Smog & Haze
                    </div>
                    <div className="text-[10px] text-slate-400">
                      Translucent ambient air scattering
                    </div>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={smokeEnabled}
                  onChange={(e) => setSmokeEnabled(e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                />
              </label>

              {/* Particle Intensity Multiplier */}
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                  <span className="flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-slate-500" />
                    Effect Intensity Multiplier
                  </span>
                  <span className="font-mono text-emerald-700">{intensity.toFixed(1)}x</span>
                </div>
                <input
                  type="range"
                  min="0.3"
                  max="2.5"
                  step="0.1"
                  value={intensity}
                  onChange={(e) => setIntensity(parseFloat(e.target.value))}
                  className="w-full accent-emerald-600 cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Color Scale Legend Card */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-emerald-600" />
              Air Quality Scale & Particle Legend
            </h3>

            <div className="space-y-2">
              {AQI_LEVELS.map((lvl) => (
                <div
                  key={lvl.category}
                  className="flex items-center justify-between text-[11px] p-1.5 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full shrink-0 shadow-xs"
                      style={{ backgroundColor: lvl.hex }}
                    />
                    <span className="font-bold text-slate-800">{lvl.category}</span>
                  </div>
                  <span className="font-mono text-slate-500 font-semibold">{lvl.range}</span>
                </div>
              ))}
            </div>

            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-[10px] text-slate-500 leading-relaxed">
              <span className="font-bold text-slate-700">Demonstration Notice:</span> Unless connected to calibrated optical aerosol spectrometer sensors, rendering is a visual educational model illustrating relative particle concentrations across EPA categories.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default ARView;

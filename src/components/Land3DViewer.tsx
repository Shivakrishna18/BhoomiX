import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RotateCw, Compass, Maximize2, Eye, Sun, Layers } from 'lucide-react';
import { Property } from '../types';

interface Land3DViewerProps {
  property: Property;
}

export const Land3DViewer: React.FC<Land3DViewerProps> = ({ property }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [cameraMode, setCameraMode] = useState<'perspective' | 'top' | 'road'>('perspective');
  const [showFence, setShowFence] = useState(true);
  const [sunlightAngle, setSunlightAngle] = useState(45);

  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const fenceGroupRef = useRef<THREE.Group | null>(null);

  useEffect(() => {
    if (!mountRef.current) return;
    const container = mountRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight || 420;

    // 1. Scene Setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0f1715);
    scene.fog = new THREE.FogExp2(0x0f1715, 0.025);
    sceneRef.current = scene;

    // 2. Camera Setup
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(22, 18, 26);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // 3. Renderer Setup
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 4. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xfffaed, 1.4);
    dirLight.position.set(15, 30, 20);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    scene.add(dirLight);

    // 5. Ground / Surrounding Terrain Grid
    const groundGeo = new THREE.PlaneGeometry(80, 80, 40, 40);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x141f1b,
      roughness: 0.9,
      metalness: 0.1,
      wireframe: false,
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.05;
    ground.receiveShadow = true;
    scene.add(ground);

    // Grid helper
    const gridHelper = new THREE.GridHelper(70, 35, 0x10b981, 0x1f2e29);
    gridHelper.position.y = 0;
    scene.add(gridHelper);

    // 6. Demarcated Land Plot (Centerpiece)
    const plotWidth = 14;
    const plotDepth = 18;
    const plotGeo = new THREE.PlaneGeometry(plotWidth, plotDepth, 16, 16);
    const plotMat = new THREE.MeshStandardMaterial({
      color: property.purpose === 'agricultural' ? 0x2e4732 : property.purpose === 'commercial' ? 0x3d392e : 0x2d3a33,
      roughness: 0.8,
    });
    const plotMesh = new THREE.Mesh(plotGeo, plotMat);
    plotMesh.rotation.x = -Math.PI / 2;
    plotMesh.position.set(0, 0.05, 0);
    plotMesh.receiveShadow = true;
    scene.add(plotMesh);

    // 7. Road Frontage Strip
    const roadGeo = new THREE.PlaneGeometry(plotWidth + 12, 4);
    const roadMat = new THREE.MeshStandardMaterial({ color: 0x242426, roughness: 0.7 });
    const road = new THREE.Mesh(roadGeo, roadMat);
    road.rotation.x = -Math.PI / 2;
    road.position.set(0, 0.06, plotDepth / 2 + 2);
    scene.add(road);

    // Road dashed line
    const roadLineGeo = new THREE.PlaneGeometry(plotWidth + 10, 0.2);
    const roadLineMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b });
    const roadLine = new THREE.Mesh(roadLineGeo, roadLineMat);
    roadLine.rotation.x = -Math.PI / 2;
    roadLine.position.set(0, 0.07, plotDepth / 2 + 2);
    scene.add(roadLine);

    // 8. Boundary Fence Group
    const fenceGroup = new THREE.Group();
    fenceGroupRef.current = fenceGroup;

    // Corner Stone Pillars (Telangana Revenue Survey Demarcation Stones)
    const cornerPositions = [
      [-plotWidth / 2, plotDepth / 2],
      [plotWidth / 2, plotDepth / 2],
      [plotWidth / 2, -plotDepth / 2],
      [-plotWidth / 2, -plotDepth / 2],
    ];

    cornerPositions.forEach(([x, z], i) => {
      const stoneGeo = new THREE.BoxGeometry(0.5, 1.8, 0.5);
      const stoneMat = new THREE.MeshStandardMaterial({ color: 0x10b981, roughness: 0.5 });
      const stone = new THREE.Mesh(stoneGeo, stoneMat);
      stone.position.set(x, 0.9, z);
      stone.castShadow = true;
      fenceGroup.add(stone);

      // Glowing corner marker top
      const beaconGeo = new THREE.SphereGeometry(0.3, 16, 16);
      const beaconMat = new THREE.MeshBasicMaterial({ color: 0x34d399 });
      const beacon = new THREE.Mesh(beaconGeo, beaconMat);
      beacon.position.set(x, 1.9, z);
      fenceGroup.add(beacon);
    });

    // Perimeter boundary line glow
    const linePoints = [
      new THREE.Vector3(-plotWidth / 2, 0.2, plotDepth / 2),
      new THREE.Vector3(plotWidth / 2, 0.2, plotDepth / 2),
      new THREE.Vector3(plotWidth / 2, 0.2, -plotDepth / 2),
      new THREE.Vector3(-plotWidth / 2, 0.2, -plotDepth / 2),
      new THREE.Vector3(-plotWidth / 2, 0.2, plotDepth / 2),
    ];
    const lineGeo = new THREE.BufferGeometry().setFromPoints(linePoints);
    const lineMat = new THREE.LineBasicMaterial({ color: 0x10b981, linewidth: 2 });
    const perimeterLine = new THREE.Line(lineGeo, lineMat);
    fenceGroup.add(perimeterLine);

    scene.add(fenceGroup);

    // 9. Scatter a few low-poly trees / foliage near boundary
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const radius = 16 + Math.random() * 6;
      const tx = Math.cos(angle) * radius;
      const tz = Math.sin(angle) * radius;

      const trunkGeo = new THREE.CylinderGeometry(0.2, 0.3, 1.5, 6);
      const trunkMat = new THREE.MeshStandardMaterial({ color: 0x3e2723 });
      const trunk = new THREE.Mesh(trunkGeo, trunkMat);
      trunk.position.set(tx, 0.75, tz);

      const crownGeo = new THREE.ConeGeometry(1.2, 2.5, 6);
      const crownMat = new THREE.MeshStandardMaterial({ color: 0x1e3a24 });
      const crown = new THREE.Mesh(crownGeo, crownMat);
      crown.position.set(tx, 2.2, tz);

      const tree = new THREE.Group();
      tree.add(trunk);
      tree.add(crown);
      scene.add(tree);
    }

    setLoading(false);

    // 10. Interactive Mouse Drag to Rotate Camera
    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;
    let theta = Math.PI / 4;
    let phi = Math.PI / 3;
    let radius = 34;

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const deltaX = e.clientX - prevMouseX;
      const deltaY = e.clientY - prevMouseY;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;

      theta -= deltaX * 0.008;
      phi = Math.max(0.2, Math.min(Math.PI / 2.2, phi - deltaY * 0.008));

      camera.position.x = radius * Math.sin(phi) * Math.sin(theta);
      camera.position.y = radius * Math.cos(phi);
      camera.position.z = radius * Math.sin(phi) * Math.cos(theta);
      camera.lookAt(0, 0, 0);
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      radius = Math.max(12, Math.min(55, radius + e.deltaY * 0.04));
      camera.position.x = radius * Math.sin(phi) * Math.sin(theta);
      camera.position.y = radius * Math.cos(phi);
      camera.position.z = radius * Math.sin(phi) * Math.cos(theta);
      camera.lookAt(0, 0, 0);
    };

    const domEl = renderer.domElement;
    domEl.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    domEl.addEventListener('wheel', onWheel, { passive: false });

    // Render loop
    let reqId: number;
    const animate = () => {
      reqId = requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight || 420;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(reqId);
      domEl.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      domEl.removeEventListener('wheel', onWheel);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
    };
  }, [property]);

  const switchCamera = (mode: 'perspective' | 'top' | 'road') => {
    setCameraMode(mode);
    if (!cameraRef.current) return;
    const camera = cameraRef.current;
    if (mode === 'top') {
      camera.position.set(0, 36, 0.1);
    } else if (mode === 'road') {
      camera.position.set(0, 5, 20);
    } else {
      camera.position.set(22, 18, 26);
    }
    camera.lookAt(0, 0, 0);
  };

  const toggleFence = () => {
    setShowFence(!showFence);
    if (fenceGroupRef.current) {
      fenceGroupRef.current.visible = !showFence;
    }
  };

  return (
    <div className="relative w-full h-96 sm:h-[440px] rounded-3xl overflow-hidden bg-slate-950 border border-slate-800/80 shadow-md">
      {/* 3D WebGL Canvas Container */}
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Top Left Status & Title */}
      <div className="absolute top-3 left-3 z-10 space-y-1.5 pointer-events-none">
        <div className="bg-slate-900/85 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-700 text-white text-xs flex items-center space-x-2 pointer-events-auto shadow-xs">
          <Eye className="w-3.5 h-3.5 text-indigo-400" />
          <span className="font-bold">3D Spatial Land Model</span>
          <span className="text-[10px] text-indigo-300 font-mono">
            {property.landSize} {property.landUnit}
          </span>
        </div>

        <div className="bg-slate-900/75 backdrop-blur-md px-2.5 py-1 rounded-lg text-slate-300 text-[10px] pointer-events-auto flex items-center space-x-1.5 border border-slate-800 font-medium">
          <span>Facing: {property.facing || 'East'}</span>
          <span>•</span>
          <span>Zone: {property.zoneType || 'Growth Corridor'}</span>
        </div>
      </div>

      {/* Top Right Camera Presets & Toggles */}
      <div className="absolute top-3 right-3 z-10 flex items-center space-x-2">
        <div className="bg-slate-900/85 backdrop-blur-md p-1 rounded-xl border border-slate-700 flex space-x-1 shadow-xs">
          <button
            onClick={() => switchCamera('perspective')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors ${
              cameraMode === 'perspective' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            Perspective
          </button>
          <button
            onClick={() => switchCamera('top')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors ${
              cameraMode === 'top' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            Top Aerial
          </button>
          <button
            onClick={() => switchCamera('road')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors ${
              cameraMode === 'road' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            Road View
          </button>
        </div>

        <button
          onClick={toggleFence}
          className={`p-2 rounded-xl border border-slate-700 backdrop-blur-md transition-colors shadow-xs ${
            showFence ? 'bg-indigo-600 text-white' : 'bg-slate-900/85 text-slate-400 hover:bg-slate-800'
          }`}
          title="Toggle Boundary Demarcation"
        >
          <Layers className="w-4 h-4" />
        </button>
      </div>

      {/* Bottom Controls Info */}
      <div className="absolute bottom-3 left-3 right-3 z-10 flex items-center justify-between pointer-events-none">
        <div className="bg-slate-900/85 backdrop-blur-md px-3 py-1 rounded-lg text-slate-400 text-[11px] pointer-events-auto flex items-center space-x-1.5 border border-slate-800 font-medium">
          <RotateCw className="w-3 h-3 text-indigo-400" />
          <span>Click & drag to orbit • Scroll to zoom</span>
        </div>

        <div className="bg-indigo-950/80 backdrop-blur-md px-3 py-1 rounded-lg border border-indigo-700/60 text-indigo-300 text-[11px] pointer-events-auto flex items-center space-x-1.5 font-bold">
          <Compass className="w-3.5 h-3.5" />
          <span>True North Aligned</span>
        </div>
      </div>
    </div>
  );
};

'use client';

import React, { useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Environment, ContactShadows, Html } from '@react-three/drei';
import * as THREE from 'three';
import { ContributionDay } from '@/lib/githubContributions';
import { Magnetic } from '@/components/ui/Magnetic';
import { Loader2 } from 'lucide-react';

const THEME = {
  0: '#e5e5e5', // base gray/white for level 0
  1: '#ffc1a3', // light orange
  2: '#ff9c6b', // orange
  3: '#ff7733', // dark orange
  4: '#e65c00', // darkest orange
};

function DelayedSnapControls({ children }: { children: React.ReactNode }) {
  const { gl, size, viewport } = useThree();
  const groupRef = useRef<THREE.Group>(null!);
  const targetRotation = useRef({ x: 0, y: 0 });
  const isDragging = useRef(false);
  const idleTimer = useRef<NodeJS.Timeout | null>(null);

  React.useEffect(() => {
    const canvas = gl.domElement;
    let lastX = 0;
    let lastY = 0;

    const onPointerDown = (e: PointerEvent) => {
      isDragging.current = true;
      lastX = e.clientX;
      lastY = e.clientY;
      if (idleTimer.current) clearTimeout(idleTimer.current);
      canvas.style.cursor = 'grabbing';
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!isDragging.current) return;
      const deltaX = e.clientX - lastX;
      const deltaY = e.clientY - lastY;
      lastX = e.clientX;
      lastY = e.clientY;

      targetRotation.current.y += (deltaX / size.width) * Math.PI * 1.5;
      targetRotation.current.x += (deltaY / size.height) * Math.PI * 1.5;
    };

    const onPointerUp = () => {
      isDragging.current = false;
      canvas.style.cursor = 'grab';
      
      if (idleTimer.current) clearTimeout(idleTimer.current);
      idleTimer.current = setTimeout(() => {
        targetRotation.current = { x: 0, y: 0 };
      }, 1000);
    };

    canvas.style.cursor = 'grab';
    canvas.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    
    return () => {
      canvas.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      if (idleTimer.current) clearTimeout(idleTimer.current);
      canvas.style.cursor = '';
    };
  }, [gl, size]);

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    const lerpFactor = isDragging.current ? 25 : 3;
    groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, targetRotation.current.x, delta * lerpFactor);
    groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, targetRotation.current.y, delta * lerpFactor);
  });

  const responsiveScale = Math.min(0.65, viewport.width / 60);

  return (
    <group ref={groupRef} scale={responsiveScale}>
      {children}
    </group>
  );
}

const tempColor = new THREE.Color();
const tempEmissive = new THREE.Color();

function Box({ position, level, index }: { position: [number, number, number], level: number, index: number }) {
  const meshRef = useRef<THREE.Mesh>(null!);
  const [hovered, setHover] = useState(false);
  
  const [activeLevel, setActiveLevel] = useState(level);
  const [activePos, setActivePos] = useState(position);

  // Initialize position and color synchronously on mount
  React.useLayoutEffect(() => {
    if (meshRef.current) {
      meshRef.current.position.set(position[0], position[1], level * 0.4 + 0.1);
      const color = THEME[level as keyof typeof THEME] || THEME[0];
      (meshRef.current.material as THREE.MeshStandardMaterial).color.set(color);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Flowing wave effect for updates
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setActiveLevel(level);
      setActivePos(position);
    }, index * 2.5);
    return () => clearTimeout(timer);
  }, [level, position, index]);

  const targetScale = hovered ? 1.4 : 1;
  const targetZ = hovered ? (activeLevel * 0.4 + 1.5) : (activeLevel * 0.4 + 0.1);
  const colorStr = THEME[activeLevel as keyof typeof THEME] || THEME[0];

  useFrame((state, delta) => {
    if (!meshRef.current) return;
    
    // animate scale (avoids allocating new Vector3)
    meshRef.current.scale.setScalar(THREE.MathUtils.lerp(meshRef.current.scale.x, targetScale, delta * 12));
    
    // animate X, Y, Z position
    meshRef.current.position.x = THREE.MathUtils.lerp(meshRef.current.position.x, activePos[0], delta * 10);
    meshRef.current.position.y = THREE.MathUtils.lerp(meshRef.current.position.y, activePos[1], delta * 10);
    
    if (!hovered) {
      const wave = Math.sin(state.clock.elapsedTime * 3 + index * 0.1) * 0.1;
      meshRef.current.position.z = THREE.MathUtils.lerp(meshRef.current.position.z, targetZ + wave, delta * 10);
    } else {
      meshRef.current.position.z = THREE.MathUtils.lerp(meshRef.current.position.z, targetZ, delta * 10);
    }

    // animate color (avoids allocating new Color)
    const material = meshRef.current.material as THREE.MeshStandardMaterial;
    tempColor.set(hovered ? '#ffffff' : colorStr);
    material.color.lerp(tempColor, delta * 10);
    
    tempEmissive.set(hovered ? colorStr : '#000000');
    material.emissive.lerp(tempEmissive, delta * 10);
  });

  return (
    <mesh
      ref={meshRef}
      onPointerOver={(e) => { e.stopPropagation(); setHover(true); }}
      onPointerOut={() => setHover(false)}
      castShadow
      receiveShadow
    >
      <boxGeometry args={[0.75, 0.75, 1]} />
      <meshStandardMaterial 
        roughness={0.1}
        metalness={0.2}
      />
    </mesh>
  );
}

export default function GithubGraph3D({ 
  data, 
  year = "2026", 
  onYearChange,
  isFetching = false
}: { 
  data: ContributionDay[], 
  year?: "2026" | "2025",
  onYearChange?: (year: string) => void,
  isFetching?: boolean
}) {
  const { cubes, monthLabels } = useMemo(() => {
    if (!data || data.length === 0) return { cubes: [], monthLabels: [] };

    // 1. Sort data sequentially by date to fix row-major HTML parsing
    const sortedData = [...data].sort((a, b) => {
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    });

    const firstDate = new Date(sortedData[0].date);
    firstDate.setHours(0, 0, 0, 0);
    const firstDayOfWeek = firstDate.getDay();
    const msPerDay = 24 * 60 * 60 * 1000;

    const lastDate = new Date(sortedData[sortedData.length - 1].date);
    lastDate.setHours(0, 0, 0, 0);
    const totalDays = Math.round((lastDate.getTime() - firstDate.getTime()) / msPerDay);
    const totalCols = Math.floor((totalDays + firstDayOfWeek) / 7) + 1;

    const result = [];
    const labels = [];
    let lastMonth = '';

    for (let i = 0; i < sortedData.length; i++) {
      const current = sortedData[i];
      const currentDate = new Date(current.date);
      if (isNaN(currentDate.getTime())) continue;
      currentDate.setHours(0, 0, 0, 0);

      const diffDays = Math.round((currentDate.getTime() - firstDate.getTime()) / msPerDay);
      const col = Math.floor((diffDays + firstDayOfWeek) / 7);
      const row = currentDate.getDay(); // 0 (Sun) to 6 (Sat)

      const x = (col - (totalCols || 52) / 2) * 1.0 || 0;
      const y = (3 - row) * 1.0 || 0;

      result.push({
        position: [x, y, 0] as [number, number, number],
        level: current.level || 0,
        id: current.date || `fallback-${i}`,
      });

      // Calculate month labels
      const yearMonth = current.date.substring(0, 7);
      if (yearMonth !== lastMonth) {
        const monthShort = currentDate.toLocaleString('en-US', { month: 'short' }).toUpperCase();
        
        if (labels.length > 0 && (x - labels[labels.length - 1].x) < 2.5) {
          labels.pop(); // Remove the previous one if it's too close (usually the first partial month)
        }
        
        labels.push({
          id: yearMonth,
          text: monthShort,
          x: x,
        });
        lastMonth = yearMonth;
      }
    }

    return { cubes: result, monthLabels: labels };
  }, [data]);

  return (
    <div className="w-full h-[600px] rounded-3xl overflow-hidden bg-gradient-to-br from-neutral-50 to-neutral-200 relative group shadow-2xl border border-white/50">
      <Canvas camera={{ position: [0, 0, 30], fov: 40 }}>
        <ambientLight intensity={0.6} />
        <directionalLight 
          position={[20, 20, 20]} 
          intensity={1.2} 
          castShadow 
          shadow-mapSize={[2048, 2048]}
          shadow-camera-far={50}
          shadow-camera-left={-20}
          shadow-camera-right={20}
          shadow-camera-top={20}
          shadow-camera-bottom={-20}
        />
        <pointLight position={[-20, -20, -20]} intensity={0.4} color="#ffaa88" />
        
        <DelayedSnapControls>
          <group rotation={[0, 0, 0]}>
          {cubes.map((cube, index) => (
            <Box 
              key={index} 
              position={cube.position} 
              level={cube.level} 
              index={index} 
            />
          ))}
          
          {monthLabels.map((label) => (
            <Html 
              key={label.id} 
              position={[label.x, 4.5, 0]} 
              center
              className="pointer-events-none"
            >
              <div className="text-[10px] uppercase tracking-[0.3em] text-black font-researcher font-black select-none whitespace-nowrap opacity-90 drop-shadow-sm" style={{ transform: 'translate3d(0,0,0)' }}>
                {label.text}
              </div>
            </Html>
          ))}

          <ContactShadows 
            position={[0, -5, -1]} 
            opacity={0.6} 
            scale={70} 
            blur={2.5} 
            far={10} 
            color="#d3b5a8"
          />
          </group>
        </DelayedSnapControls>
        
        <Environment preset="city" />
      </Canvas>

      <div className="absolute top-8 left-10 pointer-events-none">
        <h3 className="font-researcher uppercase text-xl md:text-2xl font-black text-[#1a1612] flex items-center gap-4 tracking-[0.15em]">
          <span>GITHUB <span className="text-[#ff8a3d]">ACTIVITY</span></span>
          {isFetching && <Loader2 className="w-5 h-5 animate-spin text-[#ff8a3d]" />}
        </h3>
      </div>

      <div className="absolute top-6 right-8 z-10 flex gap-2 p-1.5 bg-white/40 backdrop-blur-md rounded-full shadow-[0_8px_32px_rgba(0,0,0,0.08)] border border-white/60">
        <Magnetic strength={0.2}>
          <button
            onClick={() => onYearChange?.("2025")}
            className={`px-5 py-2 rounded-full text-[13px] font-black font-syne tracking-wide uppercase transition-all duration-300 ${year === "2025" ? "bg-[#ff8a3d] text-white shadow-md scale-100" : "text-neutral-600 hover:text-neutral-900 hover:bg-white/50 scale-95"}`}
          >
            2025
          </button>
        </Magnetic>
        <Magnetic strength={0.2}>
          <button
            onClick={() => onYearChange?.("2026")}
            className={`px-5 py-2 rounded-full text-[13px] font-black font-syne tracking-wide uppercase transition-all duration-300 ${year === "2026" ? "bg-[#ff8a3d] text-white shadow-md scale-100" : "text-neutral-600 hover:text-neutral-900 hover:bg-white/50 scale-95"}`}
          >
            2026
          </button>
        </Magnetic>
      </div>
    </div>
  );
}

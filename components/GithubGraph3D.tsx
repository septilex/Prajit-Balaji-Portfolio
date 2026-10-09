'use client';

import React, { useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Environment, ContactShadows, Html } from '@react-three/drei';
import * as THREE from 'three';
import { ContributionDay } from '@/lib/githubContributions';
import { Magnetic } from '@/components/ui/Magnetic';
import { Loader2 } from 'lucide-react';

const THEME = {
  0: '#ebedf0',
  1: '#9be9a8',
  2: '#40c463',
  3: '#30a14e',
  4: '#216e39',
};

// Pre-parse colors to avoid allocating THREE.Color objects every frame for 365 cubes
const THEME_COLORS: Record<number, THREE.Color> = {
  0: new THREE.Color('#ebedf0'),
  1: new THREE.Color('#9be9a8'),
  2: new THREE.Color('#40c463'),
  3: new THREE.Color('#30a14e'),
  4: new THREE.Color('#216e39'),
};

const THEME_RGB: Record<number, [number, number, number]> = {
  0: [THEME_COLORS[0].r, THEME_COLORS[0].g, THEME_COLORS[0].b],
  1: [THEME_COLORS[1].r, THEME_COLORS[1].g, THEME_COLORS[1].b],
  2: [THEME_COLORS[2].r, THEME_COLORS[2].g, THEME_COLORS[2].b],
  3: [THEME_COLORS[3].r, THEME_COLORS[3].g, THEME_COLORS[3].b],
  4: [THEME_COLORS[4].r, THEME_COLORS[4].g, THEME_COLORS[4].b],
};

const COLOR_WHITE = new THREE.Color('#ffffff');
const COLOR_BLACK = new THREE.Color('#000000');

// Create a custom material that supports per-instance emissive colors
const instancedMaterial = new THREE.MeshStandardMaterial({
  roughness: 0.1,
  metalness: 0.2,
});
instancedMaterial.onBeforeCompile = (shader) => {
  shader.vertexShader = `
    attribute vec3 instanceEmissive;
    varying vec3 vInstanceEmissive;
    ${shader.vertexShader}
  `.replace(
    `void main() {`,
    `void main() {
     vInstanceEmissive = instanceEmissive;`
  );
  shader.fragmentShader = `
    varying vec3 vInstanceEmissive;
    ${shader.fragmentShader}
  `.replace(
    `vec3 totalEmissiveRadiance = emissive;`,
    `vec3 totalEmissiveRadiance = vInstanceEmissive;`
  );
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

  const responsiveScale = Math.min(0.8, viewport.width / 48);

  return (
    <group ref={groupRef} scale={responsiveScale}>
      {children}
    </group>
  );
}

function InstancedCubes({ cubes, onHover, onHoverOut, isInView = true }: { 
  cubes: { position: [number, number, number], level: number, text: string }[], 
  onHover: (t: string) => void, 
  onHoverOut: () => void,
  isInView?: boolean
}) {
  const meshRef = useRef<THREE.InstancedMesh>(null!);
  const emissiveRef = useRef<THREE.InstancedBufferAttribute>(null!);
  const count = cubes.length;

  const hoveredIndex = useRef<number>(-1);

  const hasInitialized = useRef(false);
  const entranceStartTime = useRef<number | null>(null);
  const entranceProgressIndex = useRef<number>(0);

  // Pre-allocate typed arrays for physics and color states
  const { currentX, currentY, activePositionsX, activePositionsY, currentZ, currentScale, hoverAmt, activeLevels, emissiveArray, currentColorArray } = useMemo(() => {
    hasInitialized.current = false;
    return {
      currentX: new Float32Array(count),
      currentY: new Float32Array(count),
      activePositionsX: new Float32Array(count),
      activePositionsY: new Float32Array(count),
      currentZ: new Float32Array(count),
      currentScale: new Float32Array(count).fill(1),
      hoverAmt: new Float32Array(count).fill(0),
      activeLevels: new Int32Array(count).fill(0),
      emissiveArray: new Float32Array(count * 3).fill(0),
      currentColorArray: new Float32Array(count * 3).fill(0),
    };
  }, [count]);

  const tempMatrix = useMemo(() => new THREE.Matrix4(), []);
  const tempPosition = useMemo(() => new THREE.Vector3(), []);
  const tempScale = useMemo(() => new THREE.Vector3(), []);
  const tempRotation = useMemo(() => new THREE.Quaternion(), []);

  // Initialize initial state immediately on first mount
  React.useLayoutEffect(() => {
    if (!meshRef.current || hasInitialized.current) return;
    hasInitialized.current = true;
    const baseC = THEME_COLORS[0];
    for (let i = 0; i < count; i++) {
      currentX[i] = cubes[i].position[0];
      currentY[i] = cubes[i].position[1];
      activePositionsX[i] = cubes[i].position[0];
      activePositionsY[i] = cubes[i].position[1];
      
      currentColorArray[i * 3] = baseC.r;
      currentColorArray[i * 3 + 1] = baseC.g;
      currentColorArray[i * 3 + 2] = baseC.b;

      tempPosition.set(currentX[i], currentY[i], 0.1);
      tempScale.setScalar(1);
      tempMatrix.compose(tempPosition, tempRotation, tempScale);
      meshRef.current.setMatrixAt(i, tempMatrix);
      meshRef.current.setColorAt(i, baseC);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true;
  }, [count, cubes, tempMatrix, tempPosition, tempRotation, tempScale, currentX, currentY, activePositionsX, activePositionsY, currentColorArray]);

  const hasPlayedEntrance = useRef(false);

  // Reset entrance tracker when data changes
  React.useEffect(() => {
    hasPlayedEntrance.current = false;
  }, [cubes]);

  // Staggered entrance and year switching via shared timeline
  React.useEffect(() => {
    if (!isInView || hasPlayedEntrance.current) {
      return;
    }

    hasPlayedEntrance.current = true;
    entranceStartTime.current = performance.now();
    entranceProgressIndex.current = 0;
  }, [cubes, activeLevels, isInView]);

  useFrame((state, delta) => {
    if (!meshRef.current || count === 0 || !isInView) return;
    const speed = 5;
    const time = state.clock.elapsedTime;
    const now = performance.now();

    // Process shared entrance timeline
    if (entranceStartTime.current !== null) {
      const elapsed = now - entranceStartTime.current;
      while (entranceProgressIndex.current < count && elapsed > entranceProgressIndex.current * 2.5) {
        const idx = entranceProgressIndex.current;
        activeLevels[idx] = cubes[idx].level;
        activePositionsX[idx] = cubes[idx].position[0];
        activePositionsY[idx] = cubes[idx].position[1];
        entranceProgressIndex.current++;
      }
      if (entranceProgressIndex.current >= count) {
        entranceStartTime.current = null;
      }
    }

    let needsMatrixUpdate = false;
    let needsColorUpdate = false;

    // Cache the array references for direct byte-level updates
    const mArray = meshRef.current.instanceMatrix.array as Float32Array;
    const cArray = meshRef.current.instanceColor?.array as Float32Array | undefined;

    for (let i = 0; i < count; i++) {
      const isHovered = hoveredIndex.current === i;
      const targetHover = isHovered ? 1 : 0;
      
      let hoverChanged = false;
      if (hoverAmt[i] !== targetHover) {
        hoverAmt[i] = THREE.MathUtils.lerp(hoverAmt[i], targetHover, delta * speed);
        if (Math.abs(hoverAmt[i] - targetHover) < 0.01) hoverAmt[i] = targetHover;
        hoverChanged = true;
      }

      const amt = hoverAmt[i];
      const level = activeLevels[i];

      // Math for Z and Scale
      const targetScale = 1 + (0.15 * amt);
      const baseZ = level * 0.4 + 0.1;
      const hoverZ = level * 0.4 + 1.2;
      const targetZ = baseZ + (hoverZ - baseZ) * amt;
      
      let finalZ = targetZ;
      if (amt < 1) {
        const wave = Math.sin(time * 3 + i * 0.1) * 0.1;
        finalZ += wave * (1 - amt);
      }

      const scaleChanged = Math.abs(currentScale[i] - targetScale) > 0.001;
      const zChanged = Math.abs(currentZ[i] - finalZ) > 0.001 || amt < 1;
      const xChanged = Math.abs(currentX[i] - activePositionsX[i]) > 0.001;
      const yChanged = Math.abs(currentY[i] - activePositionsY[i]) > 0.001;

      if (scaleChanged || zChanged || hoverChanged || xChanged || yChanged) {
        currentScale[i] = THREE.MathUtils.lerp(currentScale[i], targetScale, delta * speed);
        currentZ[i] = THREE.MathUtils.lerp(currentZ[i], finalZ, delta * speed);
        currentX[i] = THREE.MathUtils.lerp(currentX[i], activePositionsX[i], delta * speed);
        currentY[i] = THREE.MathUtils.lerp(currentY[i], activePositionsY[i], delta * speed);

        // Direct write to matrix buffer (Scale and Position translation)
        const idx = i * 16;
        mArray[idx + 0] = currentScale[i];
        mArray[idx + 5] = currentScale[i];
        mArray[idx + 10] = currentScale[i];
        mArray[idx + 12] = currentX[i];
        mArray[idx + 13] = currentY[i];
        mArray[idx + 14] = currentZ[i];
        
        needsMatrixUpdate = true;
      }

      // Smooth color and emissive interpolation using raw arithmetic
      const targetRGB = THEME_RGB[level] || THEME_RGB[0];
      const tR = targetRGB[0];
      const tG = targetRGB[1];
      const tB = targetRGB[2];

      const hoverR = tR + (1 - tR) * amt;
      const hoverG = tG + (1 - tG) * amt;
      const hoverB = tB + (1 - tB) * amt;

      const emissiveTargetR = tR * amt;
      const emissiveTargetG = tG * amt;
      const emissiveTargetB = tB * amt;

      const rIdx = i * 3;
      
      const cDiff = Math.abs(currentColorArray[rIdx] - hoverR) + 
                    Math.abs(currentColorArray[rIdx+1] - hoverG) + 
                    Math.abs(currentColorArray[rIdx+2] - hoverB);
                    
      const eDiff = Math.abs(emissiveArray[rIdx] - emissiveTargetR) + 
                    Math.abs(emissiveArray[rIdx+1] - emissiveTargetG) + 
                    Math.abs(emissiveArray[rIdx+2] - emissiveTargetB);

      if (cDiff > 0.005 || eDiff > 0.005) {
        currentColorArray[rIdx] = THREE.MathUtils.lerp(currentColorArray[rIdx], hoverR, delta * speed);
        currentColorArray[rIdx + 1] = THREE.MathUtils.lerp(currentColorArray[rIdx + 1], hoverG, delta * speed);
        currentColorArray[rIdx + 2] = THREE.MathUtils.lerp(currentColorArray[rIdx + 2], hoverB, delta * speed);

        emissiveArray[rIdx] = THREE.MathUtils.lerp(emissiveArray[rIdx], emissiveTargetR, delta * speed);
        emissiveArray[rIdx + 1] = THREE.MathUtils.lerp(emissiveArray[rIdx + 1], emissiveTargetG, delta * speed);
        emissiveArray[rIdx + 2] = THREE.MathUtils.lerp(emissiveArray[rIdx + 2], emissiveTargetB, delta * speed);
        
        if (cArray) {
          cArray[rIdx] = currentColorArray[rIdx];
          cArray[rIdx + 1] = currentColorArray[rIdx + 1];
          cArray[rIdx + 2] = currentColorArray[rIdx + 2];
        }
        needsColorUpdate = true;
      }
    }

    if (needsMatrixUpdate) meshRef.current.instanceMatrix.needsUpdate = true;
    if (needsColorUpdate) {
      if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true;
      if (emissiveRef.current) emissiveRef.current.needsUpdate = true;
    }
  });

  return (
    <instancedMesh
      ref={meshRef}
      args={[undefined, undefined, count]}
      castShadow
      receiveShadow
      onPointerMove={(e) => {
        e.stopPropagation();
        if (e.instanceId !== undefined) {
          if (hoveredIndex.current !== e.instanceId) {
            hoveredIndex.current = e.instanceId;
            onHover(cubes[e.instanceId].text);
          }
        }
      }}
      onPointerOut={() => {
        hoveredIndex.current = -1;
        onHoverOut();
      }}
    >
      <boxGeometry args={[0.75, 0.75, 1]}>
        <instancedBufferAttribute 
          ref={emissiveRef}
          attach="attributes-instanceEmissive"
          args={[emissiveArray, 3]} 
        />
      </boxGeometry>
      <primitive object={instancedMaterial} attach="material" />
    </instancedMesh>
  );
}

export default function GithubGraph3D({ 
  data, 
  year = "2026", 
  onYearChange,
  isFetching = false,
  totalContributions = "0",
  isInView = true
}: { 
  data: ContributionDay[], 
  year?: "2026" | "2025",
  onYearChange?: (year: string) => void,
  isFetching?: boolean,
  totalContributions?: string,
  isInView?: boolean
}) {
  const tooltipRef = useRef<HTMLDivElement>(null);
  
  const handleHover = React.useCallback((text: string) => {
    if (tooltipRef.current) {
      tooltipRef.current.innerText = text;
      tooltipRef.current.style.opacity = '1';
    }
  }, []);

  const handleHoverOut = React.useCallback(() => {
    if (tooltipRef.current) {
      tooltipRef.current.style.opacity = '0';
    }
  }, []);

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
        text: current.text || `No contributions on ${current.date}`
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
    <div 
      data-cursor="github-graph"
      className="w-full h-[600px] rounded-3xl overflow-hidden bg-gradient-to-br from-neutral-50 to-neutral-200 relative group shadow-2xl border border-white/50"
      onPointerMove={(e) => {
        if (tooltipRef.current) {
          const rect = e.currentTarget.getBoundingClientRect();
          const x = e.clientX - rect.left + 15;
          const y = e.clientY - rect.top + 15;
          tooltipRef.current.style.transform = `translate3d(${x}px, ${y}px, 0)`;
        }
      }}
      onPointerLeave={() => {
        if (tooltipRef.current) tooltipRef.current.style.opacity = '0';
      }}
    >
      <div 
        ref={tooltipRef} 
        className="absolute top-0 left-0 z-50 pointer-events-none px-4 py-2 bg-neutral-900/90 text-white text-[13px] font-syne font-medium tracking-wide rounded-xl shadow-xl opacity-0 transition-opacity duration-150 whitespace-nowrap backdrop-blur-md border border-white/10"
        style={{ transform: 'translate3d(0,0,0)', willChange: 'transform, opacity' }}
      ></div>
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
        <pointLight position={[-20, -20, -20]} intensity={0.4} color="#a8ffb5" />
        
        <DelayedSnapControls>
          <group rotation={[0, 0, 0]}>
          <InstancedCubes 
            cubes={cubes}
            onHover={handleHover}
            onHoverOut={handleHoverOut}
            isInView={isInView}
          />
          
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
            color="#a8d3b5"
          />
          </group>
        </DelayedSnapControls>
        
        <Environment preset="city" />
      </Canvas>

      <div className="absolute top-8 left-10 pointer-events-none">
        <div className="flex flex-col gap-1">
          <h3 className="font-researcher uppercase text-xl md:text-2xl font-black text-[#1a1612] flex items-center gap-4 tracking-[0.15em]">
            <span>GITHUB <span className="text-[#40c463]">ACTIVITY</span></span>
            {isFetching && <Loader2 className="w-5 h-5 animate-spin text-[#40c463]" />}
          </h3>
        </div>
      </div>

      {totalContributions !== "0" && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 pointer-events-none">
          <p className="font-researcher text-sm md:text-base font-bold text-neutral-500 tracking-[0.1em] uppercase">
            <span className="font-black text-neutral-800">{totalContributions}</span> Contributions in {year}
          </p>
        </div>
      )}

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

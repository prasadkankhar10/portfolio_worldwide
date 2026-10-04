import React, { useEffect, useMemo, useRef } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { useGameStore } from '../../store/useGameStore';
import { useControls } from 'leva';
import { Sky, Sparkles } from '@react-three/drei';
import * as THREE from 'three';

type AtmospherePreset = {
  ambientColor: string;
  ambientIntensity: number;
  groundColor?: string;
  sunColor: string;
  sunIntensity: number;
  sunPosition: [number, number, number];
  bgColor: string;
  fogColor: string;
  fogNear: number;
  fogFar: number;
  skyMieCoefficient?: number;
  skyRayleigh?: number;
  skyTurbidity?: number;
  showStars?: boolean;
  hasSky?: boolean;
  showCosmicDust?: boolean;
  showNebula?: boolean;
  showMoon?: boolean;
};

const presets: Record<string, AtmospherePreset> = {
  'Sunny Day': {
    ambientColor: '#dbeafe', // Soft sky blue ambient
    ambientIntensity: 1.0,
    groundColor: '#bbf7d0',
    sunColor: '#fffbeb', // Warm bright golden sunlight
    sunIntensity: 1.6,
    sunPosition: [100, 180, 80], // High natural sun angle
    bgColor: '#7dd3fc', // Clear daylight sky blue
    fogColor: '#bae6fd', // Soft atmospheric aerial perspective haze
    fogNear: 60,
    fogFar: 450,
    hasSky: true,
    skyMieCoefficient: 0.005,
    skyRayleigh: 0.8,
    skyTurbidity: 3.5,
    showStars: false,
    showCosmicDust: false,
    showNebula: false,
    showMoon: false
  },
  'Golden Sunset': {
    ambientColor: '#fed7aa',
    ambientIntensity: 0.9,
    groundColor: '#78350f',
    sunColor: '#ea580c',
    sunIntensity: 1.4,
    sunPosition: [180, 30, -120], // Low horizon sunset
    bgColor: '#fb923c',
    fogColor: '#fdba74',
    fogNear: 40,
    fogFar: 350,
    hasSky: true,
    skyMieCoefficient: 0.015,
    skyRayleigh: 2.2,
    skyTurbidity: 8.0,
    showStars: false,
    showCosmicDust: false,
    showNebula: false,
    showMoon: false
  },
  'Cosmic Nebula': {
    ambientColor: '#6c7fb5', // Clear ethereal moonlit indigo-blue ambient
    ambientIntensity: 1.25, // Elevated ambient to illuminate ground, paths, cliffs
    groundColor: '#1e2438', // Upward cool nocturnal slate reflection for roads and lower walls
    sunColor: '#7ee8fa', // Luminous celestial cyan moonlight
    sunIntensity: 0.85, // Clear crisp moonlight illuminating roofs, terrain, docks
    sunPosition: [-70, 160, -250], // Northern sky directly in front of player looking from harbor
    bgColor: '#080812',
    fogColor: '#080812', // Match bgColor so distant edges fade smoothly into space
    fogNear: 70, // Pushed out from 30m so player can see clearly around them
    fogFar: 380, // Pushed out from 200m so distance landmarks and bay are visible
    hasSky: false,
    showStars: true,
    showCosmicDust: false, // Clean sky: removed cluttering dust/sparkles
    showNebula: false,
    showMoon: true // Visible glowing Celestial Moon in the night sky
  }
};

/**
 * CleanStarField: Generates twinkling stars purely in the upper sky hemisphere.
 * Centers on camera position so stars are at true celestial infinity and never clip into the island.
 */
const CleanStarField: React.FC = () => {
  const { camera } = useThree();
  const pointsRef = useRef<THREE.Points>(null);

  const [geometry, material] = useMemo(() => {
    const count = 1800;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      // Upper celestial dome distribution (elevation 8 to 85 degrees above horizon)
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(0.12 + Math.random() * 0.88);
      const radius = 600 + Math.random() * 200;

      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.cos(phi); // Strictly in the upper sky
      positions[i * 3 + 2] = radius * Math.sin(phi) * Math.sin(theta);

      const tint = Math.random();
      if (tint < 0.6) {
        colors[i * 3] = 0.95; colors[i * 3 + 1] = 0.98; colors[i * 3 + 2] = 1.0;
      } else if (tint < 0.85) {
        colors[i * 3] = 0.75; colors[i * 3 + 1] = 0.88; colors[i * 3 + 2] = 1.0;
      } else {
        colors[i * 3] = 1.0; colors[i * 3 + 1] = 0.94; colors[i * 3 + 2] = 0.82;
      }
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const mat = new THREE.PointsMaterial({
      size: 2.2,
      sizeAttenuation: false, // Crisp constant 2.2px starlight dots: never collapses, never balloons
      vertexColors: true,
      transparent: true,
      opacity: 0.9,
      fog: false, // Immune to scene fog: always visible in deep night sky
    });

    return [geo, mat];
  }, []);

  useFrame(() => {
    if (pointsRef.current && camera) {
      pointsRef.current.position.set(camera.position.x, 0, camera.position.z);
    }
  });

  return <primitive ref={pointsRef} object={new THREE.Points(geometry, material)} />;
};

/**
 * CelestialMoon: Photorealistic 3D Moon using real NASA LRO albedo mapping,
 * Lommel-Seeliger lunar disk scattering, limb darkening, and continuous radial atmospheric halos.
 */
const CelestialMoon: React.FC = () => {
  const { camera } = useThree();
  const groupRef = useRef<THREE.Group>(null);

  // Load NASA Lunar Orbiter texture without triggering Suspense stalls
  const moonTexture = useMemo(() => {
    const loader = new THREE.TextureLoader();
    const tex = loader.load(`${import.meta.env.BASE_URL}textures/moon_1024.jpg`);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }, []);

  // Procedural soft-radial celestial glow texture (zero hard polygonal ring edges)
  const glowTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    const gradient = ctx.createRadialGradient(256, 256, 0, 256, 256, 256);
    gradient.addColorStop(0.0, 'rgba(255, 255, 255, 1.0)');
    gradient.addColorStop(0.18, 'rgba(224, 242, 254, 0.75)');
    gradient.addColorStop(0.38, 'rgba(125, 211, 252, 0.35)');
    gradient.addColorStop(0.65, 'rgba(56, 189, 248, 0.12)');
    gradient.addColorStop(0.85, 'rgba(99, 102, 241, 0.03)');
    gradient.addColorStop(1.0, 'rgba(0, 0, 0, 0.0)');

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 512, 512);

    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    return texture;
  }, []);

  // Custom Lunar Shader Material: simulates opposition surge, basaltic maria contrast, and limb darkening
  const moonShaderMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        uMap: { value: moonTexture },
        uGlowColor: { value: new THREE.Color('#bae6fd') },
        uLuminosity: { value: 1.12 }
      },
      vertexShader: `
        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 vViewPosition;

        void main() {
          vUv = uv;
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          vViewPosition = -mvPosition.xyz;
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        uniform sampler2D uMap;
        uniform vec3 uGlowColor;
        uniform float uLuminosity;
        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 vViewPosition;

        void main() {
          vec3 normal = normalize(vNormal);
          vec3 viewDir = normalize(vViewPosition);

          vec4 texColor = texture2D(uMap, vUv);
          float hasTex = step(0.01, texColor.r + texColor.g + texColor.b);
          float rawLuma = dot(texColor.rgb, vec3(0.299, 0.587, 0.114));
          float luma = mix(0.72, rawLuma, hasTex);

          // Deepen the iconic lunar maria (basalt seas) and brighten ray craters (Tycho/Copernicus)
          float contrastLuma = pow(luma, 1.25);
          vec3 lunarSurface = mix(vec3(0.22, 0.25, 0.32), vec3(1.0, 0.99, 0.97), contrastLuma);

          // Lommel-Seeliger / Minnaert style lunar disk illumination & gentle edge falloff
          float NdotV = clamp(dot(normal, viewDir), 0.0, 1.0);
          float limbDarkening = pow(NdotV, 0.28);

          // Ethereal rim glow scattering
          float fresnel = pow(1.0 - NdotV, 3.2);
          vec3 rimGlow = uGlowColor * fresnel * 0.65;

          vec3 finalColor = (lunarSurface * limbDarkening * uLuminosity) + rimGlow;
          gl_FragColor = vec4(finalColor, 1.0);
        }
      `,
      fog: false,
      toneMapped: false
    });
  }, [moonTexture]);

  useFrame(() => {
    if (groupRef.current && camera) {
      // Anchored at celestial infinity in northern sky above the Citadel
      groupRef.current.position.set(
        camera.position.x - 70,
        camera.position.y + 160,
        camera.position.z - 250
      );
      // Tidally locked to camera: ensures the iconic lunar face is always oriented towards viewer
      groupRef.current.lookAt(camera.position);
    }
  });

  return (
    <group ref={groupRef}>
      {/* 1. Photorealistic NASA Lunar Orb */}
      <mesh material={moonShaderMaterial} renderOrder={2}>
        <sphereGeometry args={[5.2, 64, 64]} />
      </mesh>

      {/* 2. Soft Continuous Atmospheric Halo (Billboard sprite with zero polygonal banding) */}
      {glowTexture && (
        <>
          {/* Inner Rayleigh Corona */}
          <sprite scale={[22, 22, 1]} position={[0, 0, -0.4]} renderOrder={1}>
            <spriteMaterial
              map={glowTexture}
              transparent
              blending={THREE.AdditiveBlending}
              depthWrite={false}
              fog={false}
              opacity={0.8}
            />
          </sprite>

          {/* Majestic Celestial Atmospheric Aura */}
          <sprite scale={[48, 48, 1]} position={[0, 0, -0.8]} renderOrder={0}>
            <spriteMaterial
              map={glowTexture}
              transparent
              blending={THREE.AdditiveBlending}
              depthWrite={false}
              fog={false}
              opacity={0.32}
            />
          </sprite>
        </>
      )}
    </group>
  );
};

export const AtmosphereManager = () => {
  const currentAtmosphere = useGameStore((state) => state.currentAtmosphere);
  const setAtmosphere = useGameStore((state) => state.setAtmosphere);
  const performanceMode = useGameStore((state) => state.performanceMode);
  const isLowPowerGpu = useGameStore((state) => state.isLowPowerGpu);
  const disableShadows = isLowPowerGpu || performanceMode;

  const [{ Atmosphere, brightness }, set] = useControls('Environment', () => ({
    Atmosphere: {
      options: Object.keys(presets),
      value: currentAtmosphere,
      onChange: (v) => {
        if (v && v !== useGameStore.getState().currentAtmosphere) {
          setAtmosphere(v);
        }
      }
    },
    brightness: { value: 1.0,
      min: 0.0,
      max: 5.0,
      step: 0.1,
      label: 'Brightness'
    }
  })) as any;

  // Ensure Leva stays synced if state changes elsewhere
  useEffect(() => {
    set({ Atmosphere: currentAtmosphere });
  }, [currentAtmosphere, set]);

  const preset = presets[currentAtmosphere] || presets['Cosmic Nebula'];

  return (
    <>
      {/* Background Color */}
      <color attach="background" args={[preset.bgColor]} />
      
      {/* Fog */}
      <fog attach="fog" args={[preset.fogColor, preset.fogNear, preset.fogFar]} />

      {/* Ambient Light */}
      <ambientLight intensity={preset.ambientIntensity * brightness} color={preset.ambientColor} />

      {/* Hemisphere Light to specifically tint the sky vs ground differently and fill shadows */}
      <hemisphereLight 
        args={[preset.ambientColor, preset.groundColor || preset.bgColor, preset.ambientIntensity * 0.85 * brightness]} 
      />

      {/* Main Directional Light (Sun/Moon) */}
      <directionalLight 
        position={preset.sunPosition} 
        intensity={preset.sunIntensity * brightness} 
        color={preset.sunColor}
        castShadow={!disableShadows} 
        shadow-mapSize-width={512} 
        shadow-mapSize-height={512} 
        shadow-camera-far={1000}
        shadow-camera-left={-200}
        shadow-camera-right={200}
        shadow-camera-top={200}
        shadow-camera-bottom={-200}
        shadow-bias={-0.0001}
        shadow-normalBias={0.05}
      />

      {/* Secondary Fill Light (opposite side, no shadows) to illuminate dark faces */}
      <directionalLight 
        position={[-preset.sunPosition[0], preset.sunPosition[1] * 0.5, -preset.sunPosition[2]]} 
        intensity={preset.sunIntensity * 0.6 * brightness} 
        color={preset.ambientColor} 
      />

      {/* Conditional Sky */}
      {preset.hasSky && (
        <Sky 
          distance={45000} 
          sunPosition={preset.sunPosition} 
          inclination={0} 
          azimuth={0.25} 
          mieCoefficient={preset.skyMieCoefficient}
          rayleigh={preset.skyRayleigh}
          turbidity={preset.skyTurbidity}
        />
      )}

      {/* Clean Celestial Starfield purely in the upper sky */}
      {preset.showStars && (
        <CleanStarField />
      )}

      {/* Visible Celestial Moon */}
      {preset.showMoon && (
        <CelestialMoon />
      )}

      {/* Cosmic Dust (Magical floating particles) */}
      {preset.showCosmicDust && (
        <>
          {/* Atmosphere Particles - Drastically reduced count for GPU fill-rate optimization */}
          <Sparkles count={100} scale={100} size={15} speed={0.4} opacity={1.0} color="#D58BE8" />
          
          {/* Giant distant nebula stars */}
          <group>
            {/* Main Core */}
            <Sparkles count={30} scale={400} size={35} speed={0.1} opacity={0.6} color="#7A4BA8" position={[0, 200, 0]} />
            <Sparkles count={30} scale={400} size={30} speed={0.15} opacity={0.8} color="#6EC9E8" position={[0, 250, 0]} />
            <Sparkles count={20} scale={300} size={40} speed={0.05} opacity={0.5} color="#F6D48F" position={[100, 300, -100]} />
          </group>
        </>
      )}
    </>
  );
};

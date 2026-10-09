import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export const CelestialCanvas: React.FC = () => {
  const mountRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    let width = window.innerWidth;
    let height = window.innerHeight;

    // --- Scene, Camera, Renderer ---
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x020813, 0.0004);

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 1000);
    camera.position.set(0, 0, 18);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    container.appendChild(renderer.domElement);

    // --- Master Earth Group ---
    const earthGroup = new THREE.Group();
    scene.add(earthGroup);

    // Position Earth with prominent, balanced scale across viewports
    const updateEarthPosition = () => {
      const isMobile = window.innerWidth < 1024;
      if (isMobile) {
        earthGroup.position.set(0, 0.1, 0);
        earthGroup.scale.set(0.78, 0.78, 0.78);
      } else {
        earthGroup.position.set(1.95, -0.05, 0);
        earthGroup.scale.set(0.95, 0.95, 0.95);
      }
    };
    updateEarthPosition();

    // --- India Orientation ---
    // Centered directly on Indian subcontinent (Arabian Sea, peninsula, Bay of Bengal, Himalayas)
    earthGroup.rotation.x = 0.36; // ~20 deg tilt for Northern hemisphere & India
    earthGroup.rotation.y = -3.72; // Calibrated to face India directly front

    // --- Texture Loading ---
    const textureLoader = new THREE.TextureLoader();

    const dayTexture = textureLoader.load('/textures/earth_atmos_2048.jpg');
    dayTexture.colorSpace = THREE.SRGBColorSpace;

    const normalTexture = textureLoader.load('/textures/earth_normal_2048.jpg');
    const specularTexture = textureLoader.load('/textures/earth_specular_2048.jpg');
    const lightsTexture = textureLoader.load('/textures/earth_lights_2048.png');
    lightsTexture.colorSpace = THREE.SRGBColorSpace;
    const cloudsTexture = textureLoader.load('/textures/earth_clouds.png');

    // --- 1. Photorealistic Earth Shader ---
    const globeRadius = 4.6;
    const earthGeo = new THREE.SphereGeometry(globeRadius, 64, 64);

    const sunDirection = new THREE.Vector3(5, 2.5, 5).normalize();

    const earthCustomMaterial = new THREE.ShaderMaterial({
      uniforms: {
        dayTexture: { value: dayTexture },
        nightTexture: { value: lightsTexture },
        normalMap: { value: normalTexture },
        specularMap: { value: specularTexture },
        sunDirection: { value: sunDirection },
        atmosphereColor: { value: new THREE.Color(0x38bdf8) },
      },
      vertexShader: `
        varying vec2 vUv;
        varying vec3 vNormalWorld;
        varying vec3 vPositionWorld;
        varying vec3 vViewDirWorld;

        void main() {
          vUv = uv;
          vec4 worldPos = modelMatrix * vec4(position, 1.0);
          vPositionWorld = worldPos.xyz;
          vNormalWorld = normalize((modelMatrix * vec4(normal, 0.0)).xyz);
          vViewDirWorld = normalize(cameraPosition - worldPos.xyz);
          gl_Position = projectionMatrix * viewMatrix * worldPos;
        }
      `,
      fragmentShader: `
        uniform sampler2D dayTexture;
        uniform sampler2D nightTexture;
        uniform sampler2D specularMap;
        uniform vec3 sunDirection;
        uniform vec3 atmosphereColor;

        varying vec2 vUv;
        varying vec3 vNormalWorld;
        varying vec3 vPositionWorld;
        varying vec3 vViewDirWorld;

        void main() {
          vec3 normal = normalize(vNormalWorld);
          vec3 viewDir = normalize(vViewDirWorld);
          vec3 sunDir = normalize(sunDirection);

          float NdotL = dot(normal, sunDir);
          float dayFactor = smoothstep(-0.15, 0.25, NdotL);

          vec3 dayColor = texture2D(dayTexture, vUv).rgb;
          vec3 nightColor = texture2D(nightTexture, vUv).rgb * 1.85;

          // Ocean Specular highlight
          float specFactor = texture2D(specularMap, vUv).r;
          vec3 halfVector = normalize(sunDir + viewDir);
          float NdotH = max(0.0, dot(normal, halfVector));
          float specular = pow(NdotH, 32.0) * specFactor * 0.9 * max(0.0, NdotL);

          // Rayleigh limb glow (Fresnel on day side)
          float fresnel = pow(1.0 - max(0.0, dot(viewDir, normal)), 2.8);
          vec3 dayAtmosphere = atmosphereColor * fresnel * max(0.0, NdotL + 0.2);

          // Combined color
          vec3 surfaceColor = mix(nightColor, dayColor + vec3(specular), dayFactor);
          surfaceColor += dayAtmosphere * 0.8;

          gl_FragColor = vec4(surfaceColor, 1.0);
        }
      `,
    });

    const earthMesh = new THREE.Mesh(earthGeo, earthCustomMaterial);
    earthGroup.add(earthMesh);

    // --- 2. Live Cloud Layer ---
    const cloudGeo = new THREE.SphereGeometry(globeRadius * 1.012, 64, 64);
    const cloudMat = new THREE.MeshStandardMaterial({
      map: cloudsTexture,
      transparent: true,
      opacity: 0.65,
      blending: THREE.NormalBlending,
      roughness: 1.0,
      metalness: 0.0,
    });
    const cloudMesh = new THREE.Mesh(cloudGeo, cloudMat);
    earthGroup.add(cloudMesh);

    // --- 3. Atmosphere Glow Envelope (Fresnel Halo) ---
    const atmosGeo = new THREE.SphereGeometry(globeRadius * 1.12, 64, 64);
    const atmosMat = new THREE.ShaderMaterial({
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
      transparent: true,
      uniforms: {
        glowColor: { value: new THREE.Color(0x22d3ee) },
        viewVector: { value: camera.position },
      },
      vertexShader: `
        varying vec3 vNormal;
        varying vec3 vPosition;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          vPosition = (modelViewMatrix * vec4(position, 1.0)).xyz;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec3 vNormal;
        varying vec3 vPosition;
        uniform vec3 glowColor;
        void main() {
          vec3 viewDir = normalize(-vPosition);
          float intensity = pow(1.0 - max(0.0, dot(viewDir, vNormal)), 3.2);
          gl_FragColor = vec4(glowColor, intensity * 0.75);
        }
      `,
    });
    const atmosMesh = new THREE.Mesh(atmosGeo, atmosMat);
    earthGroup.add(atmosMesh);

    // --- 4. Deep Space Starfield (Circular Glowing Stars) ---
    const createStarTexture = () => {
      const c = document.createElement('canvas');
      c.width = 64;
      c.height = 64;
      const ctx = c.getContext('2d')!;
      const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
      gradient.addColorStop(0, 'rgba(255, 255, 255, 1.0)');
      gradient.addColorStop(0.25, 'rgba(240, 249, 255, 0.95)');
      gradient.addColorStop(0.55, 'rgba(56, 189, 248, 0.45)');
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 64, 64);
      return new THREE.CanvasTexture(c);
    };

    const starTexture = createStarTexture();

    const starsCount = 2800;
    const starGeo = new THREE.BufferGeometry();
    const starPositions = new Float32Array(starsCount * 3);
    const starColors = new Float32Array(starsCount * 3);

    const palette = [
      new THREE.Color(0xffffff),
      new THREE.Color(0xe0f2fe),
      new THREE.Color(0xbae6fd),
      new THREE.Color(0xfef08a),
      new THREE.Color(0x7dd3fc),
      new THREE.Color(0xa7f3d0),
    ];

    for (let i = 0; i < starsCount; i++) {
      const idx = i * 3;
      const r = THREE.MathUtils.randFloat(25, 220);
      const theta = THREE.MathUtils.randFloat(0, Math.PI * 2);
      const phi = THREE.MathUtils.randFloat(0, Math.PI);

      starPositions[idx] = r * Math.sin(phi) * Math.cos(theta);
      starPositions[idx + 1] = r * Math.sin(phi) * Math.sin(theta);
      starPositions[idx + 2] = r * Math.cos(phi);

      const color = palette[Math.floor(Math.random() * palette.length)];
      starColors[idx] = color.r;
      starColors[idx + 1] = color.g;
      starColors[idx + 2] = color.b;
    }

    starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    starGeo.setAttribute('color', new THREE.BufferAttribute(starColors, 3));

    const starMaterial = new THREE.PointsMaterial({
      size: 1.45,
      map: starTexture,
      vertexColors: true,
      transparent: true,
      opacity: 0.92,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      sizeAttenuation: true,
    });

    const starField = new THREE.Points(starGeo, starMaterial);
    scene.add(starField);

    // --- Lights ---
    const ambientLight = new THREE.AmbientLight(0x0f172a, 0.4);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xfff5ea, 2.2);
    sunLight.position.copy(sunDirection.clone().multiplyScalar(50));
    scene.add(sunLight);

    const rimLight = new THREE.PointLight(0x38bdf8, 1.8, 100);
    rimLight.position.set(-20, 10, -10);
    scene.add(rimLight);

    // --- Mouse Parallax & Drag Interaction ---
    let mouseX = 0;
    let mouseY = 0;
    let targetMouseX = 0;
    let targetMouseY = 0;
    let isDragging = false;
    let prevPointerX = 0;
    let prevPointerY = 0;
    let dragVelocityX = 0;
    let dragVelocityY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      targetMouseX = (e.clientX / window.innerWidth - 0.5) * 2;
      targetMouseY = (e.clientY / window.innerHeight - 0.5) * 2;

      if (isDragging) {
        const deltaX = e.clientX - prevPointerX;
        const deltaY = e.clientY - prevPointerY;
        dragVelocityX = deltaX * 0.005;
        dragVelocityY = deltaY * 0.005;
        earthGroup.rotation.y += dragVelocityX;
        earthGroup.rotation.x += dragVelocityY;
        prevPointerX = e.clientX;
        prevPointerY = e.clientY;
      }
    };

    const handleMouseDown = (e: MouseEvent) => {
      if ((e.target as HTMLElement).tagName === 'CANVAS') {
        isDragging = true;
        prevPointerX = e.clientX;
        prevPointerY = e.clientY;
      }
    };

    const handleMouseUp = () => {
      isDragging = false;
    };

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      updateEarthPosition();
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);

    // --- Animation Loop ---
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Smooth mouse parallax
      mouseX += (targetMouseX - mouseX) * 0.04;
      mouseY += (targetMouseY - mouseY) * 0.04;

      if (!isDragging) {
        dragVelocityX *= 0.95;
        dragVelocityY *= 0.95;
        earthGroup.rotation.y += dragVelocityX;
        earthGroup.rotation.x += dragVelocityY;
        // Subtle ambient rotation
        earthGroup.rotation.y += 0.0006;
      }

      // Parallax camera tilt
      camera.position.x = mouseX * 0.45;
      camera.position.y = -mouseY * 0.35;
      camera.lookAt(0, 0, 0);

      // Independent Clouds Layer Rotation
      cloudMesh.rotation.y += 0.0003;

      // Subtle starfield twinkling
      starField.rotation.y = elapsedTime * 0.00015;

      renderer.render(scene, camera);
    };

    animate();

    // --- Cleanup ---
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      cancelAnimationFrame(animationFrameId);

      earthGeo.dispose();
      earthCustomMaterial.dispose();
      cloudGeo.dispose();
      cloudMat.dispose();
      atmosGeo.dispose();
      atmosMat.dispose();
      starGeo.dispose();
      starMaterial.dispose();
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <>
      {/* 3D WebGL Globe Container */}
      <div
        ref={mountRef}
        id="earth-canvas-container"
        className="fixed inset-0 z-[-1] overflow-hidden pointer-events-auto cursor-grab active:cursor-grabbing select-none"
      />

      {/* Subtle Grid & Vignette Overlay */}
      <div className="grid-pattern fixed inset-0 z-[-2] pointer-events-none opacity-40" />
      <div className="fixed inset-0 z-[-1] pointer-events-none bg-gradient-to-t from-[hsl(201,100%,6%)] via-transparent to-[hsl(201,100%,5%)]/70 opacity-90" />
      <div className="fixed inset-0 z-[-1] pointer-events-none bg-[radial-gradient(ellipse_at_top_right,rgba(56,189,248,0.08),transparent_60%)]" />
    </>
  );
};

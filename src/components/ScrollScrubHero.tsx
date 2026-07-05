import { useEffect, useRef, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import * as THREE from "three";
import { HERO_HOTSPOTS, HERO_PANORAMA_URL, HERO_ZONE_LABELS } from "@/lib/data-store";

const SCROLL_HEIGHT_VH = 320;
const MOBILE_SCROLL_HEIGHT_VH = 220;
const FOV = 85;
const BASE_YAW = -Math.PI * 0.15;

export function ScrollScrubHero() {
  const sectionRef = useRef<HTMLElement>(null);
  const mountRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);

  const scrollYawRef = useRef(BASE_YAW);
  const dragYawRef = useRef(0);
  const dragPitchRef = useRef(0);
  const targetScrollYawRef = useRef(BASE_YAW);
  const isDraggingRef = useRef(false);
  const lastPointerRef = useRef({ x: 0, y: 0 });

  const [ready, setReady] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const degreesRef = useRef<HTMLSpanElement>(null);
  const compassRef = useRef<HTMLDivElement>(null);
  const hotspotLayerRef = useRef<HTMLDivElement>(null);
  const lastHotspotUpdateRef = useRef(0);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const onChange = () => setReducedMotion(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const projectHotspots = useCallback((camera: THREE.PerspectiveCamera, now: number) => {
    if (now - lastHotspotUpdateRef.current < 80) return;
    lastHotspotUpdateRef.current = now;

    const layer = hotspotLayerRef.current;
    if (!layer) return;

    const invQuat = camera.quaternion.clone().invert();
    const f = Math.tan((THREE.MathUtils.degToRad(camera.fov) * 0.5));
    const aspect = camera.aspect;

    layer.querySelectorAll<HTMLElement>("[data-zone]").forEach((el) => {
      const spot = HERO_ZONE_LABELS.find((h) => h.id === el.dataset.zone);
      if (!spot) return;
      positionPin(el, spot.yaw, spot.pitch, invQuat, f, aspect);
    });

    layer.querySelectorAll<HTMLElement>("[data-hotspot]").forEach((el) => {
      const spot = HERO_HOTSPOTS.find((h) => h.id === el.dataset.hotspot);
      if (!spot) return;
      positionPin(el, spot.yaw, spot.pitch, invQuat, f, aspect);
    });
  }, []);

  function positionPin(
    el: HTMLElement,
    yaw: number,
    pitch: number,
    invQuat: THREE.Quaternion,
    f: number,
    aspect: number,
  ) {
    const dir = sphericalToVector(yaw, pitch);
    dir.applyQuaternion(invQuat);
    const visible = dir.z < 0;
    el.style.display = visible ? "block" : "none";
    if (!visible) return;
    const x = 50 + (dir.x / (-dir.z * f * aspect)) * 50;
    const y = 50 - (dir.y / (-dir.z * f)) * 50;
    el.style.left = `${Math.max(8, Math.min(92, x))}%`;
    el.style.top = `${Math.max(12, Math.min(88, y))}%`;
  }

  useEffect(() => {
    if (reducedMotion) return;
    const mount = mountRef.current;
    if (!mount) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(FOV, mount.clientWidth / mount.clientHeight, 0.1, 1000);
    camera.position.set(0, 0, 0.01);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    renderer.domElement.style.display = "block";
    mount.appendChild(renderer.domElement);

    const loader = new THREE.TextureLoader();
    loader.setCrossOrigin("anonymous");

    let panoramaTexture: THREE.Texture | null = null;

    loader.load(
      HERO_PANORAMA_URL,
      (texture) => {
        texture.mapping = THREE.EquirectangularReflectionMapping;
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.minFilter = THREE.LinearFilter;
        texture.magFilter = THREE.LinearFilter;
        texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
        panoramaTexture = texture;
        scene.background = texture;
        setReady(true);
      },
      undefined,
      () => setReady(true),
    );

    sceneRef.current = scene;
    cameraRef.current = camera;
    rendererRef.current = renderer;

    let frameId = 0;
    const animate = () => {
      frameId = requestAnimationFrame(animate);

      scrollYawRef.current += (targetScrollYawRef.current - scrollYawRef.current) * 0.08;

      const yaw = scrollYawRef.current + dragYawRef.current;
      const pitch = THREE.MathUtils.clamp(dragPitchRef.current, -0.35, 0.35);

      camera.rotation.order = "YXZ";
      camera.rotation.y = yaw;
      camera.rotation.x = pitch;

      const normalized = ((yaw - BASE_YAW) / (Math.PI * 2)) * 360;
      const deg = Math.round(((normalized % 360) + 360) % 360);
      if (degreesRef.current) degreesRef.current.textContent = `${deg}°`;
      if (compassRef.current) compassRef.current.style.transform = `rotate(${deg}deg)`;

      renderer.render(scene, camera);
      projectHotspots(camera, performance.now());
    };
    animate();

    const onResize = () => {
      if (!mount || !camera || !renderer) return;
      const w = mount.clientWidth;
      const h = mount.clientHeight;
      if (w === 0 || h === 0) return;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h, true);
    };
    onResize();
    const resizeObserver = new ResizeObserver(onResize);
    resizeObserver.observe(mount);

    return () => {
      cancelAnimationFrame(frameId);
      resizeObserver.disconnect();
      panoramaTexture?.dispose();
      renderer.dispose();
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
    };
  }, [reducedMotion, projectHotspots]);

  useEffect(() => {
    if (reducedMotion || !ready) return;
    const section = sectionRef.current;
    if (!section) return;

    const onScroll = () => {
      const rect = section.getBoundingClientRect();
      const scrollHeight = section.offsetHeight - window.innerHeight;
      const scrolled = Math.min(Math.max(-rect.top, 0), scrollHeight);
      const p = scrollHeight > 0 ? scrolled / scrollHeight : 0;
      setProgress(p);
      targetScrollYawRef.current = BASE_YAW + p * Math.PI * 2;
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [ready, reducedMotion]);

  useEffect(() => {
    if (reducedMotion) return;
    const mount = mountRef.current;
    if (!mount) return;

    const onPointerDown = (e: PointerEvent) => {
      isDraggingRef.current = true;
      lastPointerRef.current = { x: e.clientX, y: e.clientY };
      mount.setPointerCapture(e.pointerId);
    };
    const onPointerMove = (e: PointerEvent) => {
      if (!isDraggingRef.current) return;
      const dx = e.clientX - lastPointerRef.current.x;
      const dy = e.clientY - lastPointerRef.current.y;
      lastPointerRef.current = { x: e.clientX, y: e.clientY };
      dragYawRef.current -= dx * 0.004;
      dragPitchRef.current -= dy * 0.003;
    };
    const onPointerUp = (e: PointerEvent) => {
      isDraggingRef.current = false;
      mount.releasePointerCapture(e.pointerId);
    };

    mount.addEventListener("pointerdown", onPointerDown);
    mount.addEventListener("pointermove", onPointerMove);
    mount.addEventListener("pointerup", onPointerUp);
    mount.addEventListener("pointerleave", onPointerUp);
    return () => {
      mount.removeEventListener("pointerdown", onPointerDown);
      mount.removeEventListener("pointermove", onPointerMove);
      mount.removeEventListener("pointerup", onPointerUp);
      mount.removeEventListener("pointerleave", onPointerUp);
    };
  }, [reducedMotion, ready]);

  const scrollHeight = isMobile ? MOBILE_SCROLL_HEIGHT_VH : SCROLL_HEIGHT_VH;

  if (reducedMotion) {
    return (
      <section className="relative min-h-[92vh] flex items-end overflow-hidden bg-[#0a0a0a]">
        <div className="absolute inset-0 overflow-hidden">
          <img
            src={HERO_PANORAMA_URL}
            alt="Interior panorama"
            className="absolute left-1/2 top-1/2 h-[50%] w-[200%] max-w-none -translate-x-1/2 -translate-y-1/2"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
        <HeroContent />
      </section>
    );
  }

  return (
    <section ref={sectionRef} style={{ height: `${scrollHeight}vh` }} className="relative">
      <div className="sticky top-0 h-screen w-full overflow-hidden bg-[#0a0a0a]">
        <div
          ref={mountRef}
          className="absolute inset-0 cursor-grab active:cursor-grabbing touch-none"
          aria-label="360 degree interior view. Scroll or drag to look around."
        />

        {!ready && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#111] text-muted-foreground text-sm">
            Loading immersive view…
          </div>
        )}

        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(10,10,10,0.55)_100%)]" />
        <div className="absolute inset-x-0 bottom-0 h-2/5 pointer-events-none bg-gradient-to-t from-black/55 via-black/15 to-transparent" />

        <div ref={hotspotLayerRef} className="absolute inset-0 pointer-events-none">
          {HERO_ZONE_LABELS.map((zone) => (
            <span
              key={zone.id}
              data-zone={zone.id}
              className="absolute hidden transition-[left,top] duration-100"
              style={{ transform: "translate(-50%, -50%)" }}
            >
              <span className="rounded-full border border-white/40 bg-black/45 px-2.5 py-1 text-[10px] uppercase tracking-widest text-white/90 backdrop-blur-sm">
                {zone.label}
              </span>
            </span>
          ))}
          {HERO_HOTSPOTS.map((spot) => (
            <Link
              key={spot.id}
              data-hotspot={spot.id}
              to={`/portfolio/${spot.slug}`}
              className="pointer-events-auto absolute group transition-[left,top] duration-100 hidden"
              style={{ transform: "translate(-50%, -50%)" }}
            >
              <span className="relative flex h-4 w-4 items-center justify-center">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent/40" />
                <span className="relative inline-flex h-3 w-3 rounded-full bg-accent ring-4 ring-accent/25" />
              </span>
              <span className="absolute left-1/2 top-full mt-2 -translate-x-1/2 whitespace-nowrap rounded bg-background/95 px-3 py-1.5 text-xs opacity-0 transition-opacity group-hover:opacity-100 border border-border/60 shadow-sm">
                {spot.label}
              </span>
            </Link>
          ))}
        </div>

        <div className="absolute top-24 right-6 z-10 hidden md:flex flex-col items-center gap-2 pointer-events-none">
          <div className="relative h-14 w-14 rounded-full border border-white/20 bg-black/30 backdrop-blur-sm flex items-center justify-center">
            <div ref={compassRef} className="absolute inset-1 rounded-full border-t-2 border-accent" />
            <span ref={degreesRef} className="text-[10px] text-white/80 font-medium">0°</span>
          </div>
          <span className="text-[10px] uppercase tracking-widest text-white/50">360°</span>
        </div>

        <div className="absolute bottom-28 right-6 z-10 hidden md:flex flex-col items-center gap-2 text-xs text-white/60 pointer-events-none">
          <span>Scroll · Drag to explore</span>
          <div className="h-16 w-px bg-white/20 relative overflow-hidden">
            <div className="absolute bottom-0 w-full bg-accent transition-all duration-150" style={{ height: `${Math.round(progress * 100)}%` }} />
          </div>
        </div>

        <div className="absolute inset-x-0 bottom-0 z-10">
          <HeroContent />
        </div>
      </div>
    </section>
  );
}

function sphericalToVector(yaw: number, pitch: number) {
  const cosP = Math.cos(pitch);
  return new THREE.Vector3(Math.sin(yaw) * cosP, Math.sin(pitch), Math.cos(yaw) * cosP);
}

function HeroContent() {
  return (
    <div className="container-editorial relative z-10 pb-16 md:pb-24 pointer-events-none">
      <div className="max-w-3xl fade-up pointer-events-auto">
        <div className="eyebrow text-white/80">Est. 2004 · Copenhagen</div>
        <h1 className="mt-6 font-serif text-5xl md:text-7xl lg:text-8xl leading-[0.95] text-white drop-shadow-md">
          Architecture of<br />
          <span className="italic text-accent">quiet</span> intention.
        </h1>
        <p className="mt-8 max-w-xl text-base md:text-lg text-white/85 leading-relaxed drop-shadow-sm">
          Scroll or drag through a full 360° open-plan interior — living, kitchen, dining and more as you rotate.
        </p>
        <div className="mt-10 flex flex-wrap gap-8 text-sm">
          <Link to="/portfolio" className="inline-flex items-center gap-2 border-b border-white/80 pb-1 text-white hover:text-accent hover:border-accent transition-colors">
            View portfolio <ArrowRight className="h-4 w-4" />
          </Link>
          <Link to="/contact" className="inline-flex items-center gap-2 text-white/75 hover:text-white pb-1">
            Start a project
          </Link>
        </div>
      </div>
    </div>
  );
}

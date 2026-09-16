import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { CARD_COUNT, createCardSlots, getGalleryLayout } from "./gallery-layout.mjs";

const stage = document.getElementById("stage");
const status = document.getElementById("status");
const statusCopy = document.getElementById("status-copy");
const fallback = document.getElementById("fallback");
const fallbackCopy = document.getElementById("fallback-copy");
const controls = [...document.querySelectorAll(".card-control")];
const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
const scene = new THREE.Scene();
const camera = new THREE.OrthographicCamera(-5, 5, 5, -5, 0.1, 100);
const inverse = new THREE.Matrix4();
const CARD_MODEL_WIDTH = 6.3;
const CARD_MODEL_HEIGHT = 9.45;
const WORLD_TO_CSS = 100;
const LOAD_TIMEOUT_MS = 12000;

camera.position.set(0, 0, 20);
controls.forEach((control) => { control.disabled = true; });
document.getElementById("retry").addEventListener("click", () => location.reload());

let renderer;
let cardVisuals = [];
let cardRoots = [];
let cardStates = [];
let elapsed = 0;
let lastFrame = 0;
let failed = false;

const vertexShader = `
varying vec2 vUv;
void main() {
  vUv = vec2(uv.x, 1.0 - uv.y);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const commonShader = `
precision highp float;
varying vec2 vUv;
uniform float uTime, uFoil, uScale, uDepth, uBgDepth, uHasLine, uSafeScale, uFoilHue;
uniform vec2 uCover, uFit, uSafeOffset;
uniform vec3 uView;
float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.5453); }
float inside(vec2 p) { return step(0.,p.x)*step(0.,p.y)*step(p.x,1.)*step(p.y,1.); }
vec2 parallax(vec2 uv, float depth) {
  return uv + uView.xy / max(abs(uView.z), .4) * depth * .10;
}
vec3 spectrum(float phase) {
  return .66 + .25 * cos(6.28318 * (phase + vec3(0., .33, .67)));
}
vec3 film(vec2 uv) {
  float phase = uv.x * .85 + uv.y * .55 + uView.x * 1.5 - uView.y * .9 + uFoilHue;
  vec3 color = spectrum(phase);
  return mix(color, vec3(dot(color,vec3(.2126,.7152,.0722))), .12);
}
float sweep(vec2 uv) {
  return pow(.5+.5*sin((uv.x*.72+uv.y*.45+uView.x*1.2+uView.y*.6)*6.283),10.);
}
`;

const frontFragment = commonShader + `
uniform sampler2D tSubject, tBackground, tText, tLine;
void main() {
  vec2 uv = (vUv - .5) * uCover + .5;
  vec2 su = ((parallax(uv,uDepth)-.5)*uScale/uFit+.5)*uSafeScale+uSafeOffset;
  vec2 bu = parallax(uv,uBgDepth);
  vec4 subject = texture2D(tSubject,clamp(su,0.,1.));
  subject.a *= inside(su);
  vec3 bg = texture2D(tBackground,clamp(bu,0.,1.)).rgb;
  vec3 col = mix(bg,subject.rgb,subject.a);
  vec3 foil = film(uv);
  float band = sweep(uv);
  float luminance = dot(col,vec3(.2126,.7152,.0722));
  col *= 1. - uFoil * .18 * (1.-foil) * (.2 + band*.8);
  col += foil * uFoil * band * (.07 + .12*(1.-luminance));
  float edge = 1.-smoothstep(.015,.06,min(min(uv.x,1.-uv.x),min(uv.y,1.-uv.y)));
  col = mix(col,foil*.75+.21,edge*uFoil*.34);
  vec2 cell = floor(uv*vec2(480.,720.));
  float flake = step(.994,hash(cell))*pow(.5+.5*sin(hash(cell+8.)*30.+uView.x*20.+uTime*.6),10.);
  col += foil*flake*uFoil*.14;
  // The supplied line drawings are intentionally light gray. Use a broad
  // threshold so their ink survives WebP/JPEG-to-PNG conversion and remains
  // a restrained, angle-dependent glow rather than a full white overlay.
  float line = (1.-smoothstep(.30,.92,texture2D(tLine,clamp(su,0.,1.)).r))*uHasLine;
  col += line*inside(su)*subject.a*band*uFoil*.12;
  vec4 text = texture2D(tText,uv);
  col = mix(col,text.rgb,text.a);
  gl_FragColor = vec4(pow(clamp(col,0.,1.),vec3(2.2)),1.);
  #include <colorspace_fragment>
}
`;

const edgeFragment = commonShader + `
void main() {
  vec3 col = mix(vec3(.38,.43,.42),film(vUv)*.58+.28,uFoil*.72);
  gl_FragColor=vec4(pow(col,vec3(2.2)),1.);
  #include <colorspace_fragment>
}
`;

const backFragment = commonShader + `
uniform sampler2D tBack;
void main() {
  vec2 uv=vec2(1.-vUv.x,vUv.y);
  vec4 art=texture2D(tBack,uv);
  vec3 col=art.rgb;
  col*=1.-uFoil*.15*(1.-film(vUv));
  col+=film(vUv)*sweep(vUv)*uFoil*.085;
  gl_FragColor=vec4(pow(clamp(col,0.,1.),vec3(2.2)),1.);
  #include <colorspace_fragment>
}
`;

function canvasTexture(canvas) {
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.NoColorSpace;
  return texture;
}

function createBackTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 1536;
  const context = canvas.getContext("2d");
  const wash = context.createLinearGradient(0, 0, 1024, 1536);
  wash.addColorStop(0, "#0b3034");
  wash.addColorStop(0.52, "#06191f");
  wash.addColorStop(1, "#102d2d");
  context.fillStyle = wash;
  context.fillRect(0, 0, 1024, 1536);
  context.strokeStyle = "rgba(201,178,105,.72)";
  context.lineWidth = 4;
  context.strokeRect(58, 58, 908, 1420);
  context.lineWidth = 1;
  context.strokeRect(76, 76, 872, 1384);
  context.textAlign = "center";
  context.fillStyle = "rgba(220,202,143,.78)";
  context.font = "400 300px DaoyouDisplay, serif";
  context.fillText("道", 512, 865);
  context.font = "24px serif";
  context.letterSpacing = "12px";
  context.fillText("THE MORTAL JOURNEY", 512, 1260);
  return canvasTexture(canvas);
}

function shaderMaterial(fragmentShader, uniforms) {
  return new THREE.ShaderMaterial({
    uniforms,
    vertexShader,
    fragmentShader,
    side: THREE.FrontSide,
  });
}

function setTextureDefaults(texture) {
  texture.colorSpace = THREE.NoColorSpace;
  texture.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
}

function setCardView(root) {
  root.userData.uniforms.uView.value
    .copy(camera.position)
    .applyMatrix4(inverse.copy(root.matrixWorld).invert())
    .normalize();
}

function installMaterials(model, materials, root) {
  let frontCount = 0;
  model.traverse((object) => {
    if (!object.isMesh) return;
    const role = object.userData.materialRole || object.material?.name;
    object.userData.materialRole = role;
    if (role === "web_front") frontCount += 1;
    object.material = materials[role] || materials.web_edge;
    object.userData.cardRoot = root;
    object.onBeforeRender = () => setCardView(root);
  });
  return frontCount;
}

function hasFrontMaterial(model) {
  let found = false;
  model.traverse((object) => {
    if (!object.isMesh) return;
    const role = object.userData.materialRole || object.material?.name;
    if (role === "web_front") found = true;
  });
  return found;
}

function mergeCardConfig(config, index) {
  const override = config.cards?.[index] || {};
  return {
    assets: { ...(config.assets || {}), ...(override.assets || {}) },
    parameters: { ...(config.parameters || {}), ...(override.parameters || {}) },
    runtimeComposition: { ...(config.runtimeComposition || {}), ...(override.runtimeComposition || {}) },
    safeArea: { ...(config.safeArea || {}), ...(override.safeArea || {}) },
  };
}

function makeUniforms(cardConfig, textures, backTexture) {
  const { assets, parameters, runtimeComposition, safeArea } = cardConfig;
  const subject = textures.subject.image;
  const imageAspect = subject.width / subject.height;
  const cover = imageAspect < 2 / 3 ? [1, imageAspect / (2 / 3)] : [(2 / 3) / imageAspect, 1];
  return {
    tSubject: { value: textures.subject },
    tBackground: { value: textures.background },
    tText: { value: textures.text },
    tLine: { value: textures.lineart },
    tBack: { value: backTexture },
    uTime: { value: 0 },
    uView: { value: new THREE.Vector3(0, 0, 1) },
    uCover: { value: new THREE.Vector2(...cover) },
    uFit: { value: new THREE.Vector2(1, 1) },
    uFoil: { value: parameters.foil ?? 0.62 },
    uFoilHue: { value: parameters.foilHue ?? 0 },
    uScale: { value: runtimeComposition.subjectScale ?? 1 },
    uDepth: { value: parameters.subjectDepth ?? 0.28 },
    uBgDepth: { value: parameters.backgroundDepth ?? -0.2 },
    uSafeScale: { value: runtimeComposition.safeScale ?? 1 },
    uSafeOffset: {
      value: new THREE.Vector2(safeArea.offset?.[0] ?? 0, -(safeArea.offset?.[1] ?? 0)),
    },
    uHasLine: { value: assets.lineart ? 1 : 0 },
  };
}

function createCards(sourceModel, cardConfigs, cardTextures, backTexture, goldMaterial) {
  cardStates = Array.from({ length: CARD_COUNT }, (_, index) => ({
    index,
    flipped: false,
    active: false,
    dragging: false,
    moved: false,
    suppressClick: false,
    currentX: 0,
    currentY: 0,
    targetX: 0,
    targetY: 0,
    startX: 0,
    startY: 0,
    dragX: 0,
    resetTimer: 0,
  }));

  cardVisuals = cardConfigs.map((cardConfig, index) => {
    const uniforms = makeUniforms(cardConfig, cardTextures[index], backTexture);
    return {
      uniforms,
      baseFoil: uniforms.uFoil.value,
      baseFoilHue: uniforms.uFoilHue.value,
      materials: {
        web_front: shaderMaterial(frontFragment, uniforms),
        web_back: shaderMaterial(backFragment, uniforms),
        web_edge: shaderMaterial(edgeFragment, uniforms),
        web_gold: goldMaterial,
      },
    };
  });

  cardRoots = cardStates.map((state) => {
    const root = new THREE.Group();
    const model = sourceModel.clone(true);
    root.userData.cardIndex = state.index;
    root.userData.uniforms = cardVisuals[state.index].uniforms;
    root.add(model);
    scene.add(root);
    installMaterials(model, cardVisuals[state.index].materials, root);
    return root;
  });
}

function updateLayout() {
  if (!renderer || !cardRoots.length) return;
  const width = stage.clientWidth;
  const { columns } = getGalleryLayout(innerWidth);
  const gap = columns === 3 ? 60 : columns === 2 ? 44 : 28;
  const side = columns === 1 ? 14 : 20;
  const maxCardWidth = columns === 1 ? 330 : 300;
  const available = width - side * 2 - gap * (columns - 1);
  const cardWidth = Math.min(maxCardWidth, available / columns);
  const cardHeight = cardWidth * (CARD_MODEL_HEIGHT / CARD_MODEL_WIDTH);
  const slots = createCardSlots(CARD_COUNT, columns);
  const rows = Math.ceil(CARD_COUNT / columns);
  const gridWidth = cardWidth * columns + gap * (columns - 1);
  const height = cardHeight * rows + gap * (rows - 1) + side * 2;
  const startX = (width - gridWidth) / 2;

  stage.style.height = `${Math.ceil(height)}px`;
  document.documentElement.style.setProperty("--card-gap", `${gap}px`);
  document.documentElement.style.setProperty("--card-width", `${cardWidth}px`);
  document.documentElement.style.setProperty("--card-height", `${cardHeight}px`);

  camera.left = -width / (WORLD_TO_CSS * 2);
  camera.right = width / (WORLD_TO_CSS * 2);
  camera.top = height / (WORLD_TO_CSS * 2);
  camera.bottom = -height / (WORLD_TO_CSS * 2);
  camera.updateProjectionMatrix();
  renderer.setSize(width, height, false);

  slots.forEach(({ index, column, row }) => {
    const left = startX + column * (cardWidth + gap);
    const top = side + row * (cardHeight + gap);
    const root = cardRoots[index];
    const scale = cardWidth / WORLD_TO_CSS / CARD_MODEL_WIDTH;
    root.scale.setScalar(scale);
    root.position.set(
      (left + cardWidth / 2 - width / 2) / WORLD_TO_CSS,
      (height / 2 - top - cardHeight / 2) / WORLD_TO_CSS,
      0,
    );
    controls[index].style.left = `${left}px`;
    controls[index].style.top = `${top}px`;
  });
}

function setAnnouncement(message) {
  statusCopy.textContent = message;
}

function baseRotation(state) {
  return state.flipped ? Math.PI : 0;
}

function settleCard(state) {
  state.targetX = 0;
  state.targetY = baseRotation(state);
}

function toggleCard(index) {
  const state = cardStates[index];
  state.flipped = !state.flipped;
  settleCard(state);
  controls[index].setAttribute("aria-pressed", String(state.flipped));
  setAnnouncement(`道友闪卡 ${index + 1} 已翻至${state.flipped ? "背面" : "正面"}`);
}

function bindControls() {
  controls.forEach((control, index) => {
    const state = cardStates[index];

    control.addEventListener("pointerenter", () => {
      state.active = true;
    });

    control.addEventListener("pointermove", (event) => {
      const bounds = control.getBoundingClientRect();
      if (state.dragging) {
        const dx = event.clientX - state.startX;
        const dy = event.clientY - state.startY;
        state.dragX = dx;
        state.moved ||= Math.abs(dx) + Math.abs(dy) > 8;
        state.targetY = THREE.MathUtils.clamp(baseRotation(state) + dx * 0.014, baseRotation(state) - 2.2, baseRotation(state) + 2.2);
        state.targetX = THREE.MathUtils.clamp(dy * 0.006, -0.34, 0.34);
        return;
      }
      const x = (event.clientX - bounds.left) / bounds.width - 0.5;
      const y = (event.clientY - bounds.top) / bounds.height - 0.5;
      state.targetX = -y * 0.24;
      state.targetY = baseRotation(state) + x * 0.34;
    });

    control.addEventListener("pointerleave", () => {
      state.active = false;
      if (!state.dragging) settleCard(state);
    });

    control.addEventListener("pointerdown", (event) => {
      if (event.button !== 0) return;
      state.dragging = true;
      state.moved = false;
      state.dragX = 0;
      state.startX = event.clientX;
      state.startY = event.clientY;
      control.setPointerCapture(event.pointerId);
    });

    const release = () => {
      if (!state.dragging) return;
      state.dragging = false;
      if (state.moved) {
        state.suppressClick = true;
        if (Math.abs(state.dragX) >= 90) toggleCard(index);
        else settleCard(state);
      }
    };

    control.addEventListener("pointerup", release);
    control.addEventListener("pointercancel", release);
    control.addEventListener("lostpointercapture", release);

    control.addEventListener("click", (event) => {
      if (state.suppressClick) {
        state.suppressClick = false;
        event.preventDefault();
        return;
      }
      toggleCard(index);
    });

    control.addEventListener("focus", () => {
      state.active = true;
      setAnnouncement(`已选中道友闪卡 ${index + 1}，按 Enter 或 Space 翻面，方向键调整视角`);
    });

    control.addEventListener("blur", () => {
      state.active = false;
      settleCard(state);
    });

    control.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.code === "Space") {
        event.preventDefault();
        toggleCard(index);
        return;
      }
      if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(event.key)) return;
      event.preventDefault();
      const base = baseRotation(state);
      if (event.key === "ArrowLeft") state.targetY = base - 0.24;
      if (event.key === "ArrowRight") state.targetY = base + 0.24;
      if (event.key === "ArrowUp") state.targetX = -0.16;
      if (event.key === "ArrowDown") state.targetX = 0.16;
      clearTimeout(state.resetTimer);
      state.resetTimer = setTimeout(() => settleCard(state), 240);
    });

    control.disabled = false;
  });
}

function animate(now) {
  if (failed || document.hidden) return;
  const delta = Math.min((now - lastFrame) / 1000, 0.05) || 0;
  lastFrame = now;
  if (!reducedMotion.matches) elapsed += delta;
  const ease = reducedMotion.matches ? 1 : 1 - Math.exp(-delta * 10);

  cardStates.forEach((state, index) => {
    const root = cardRoots[index];
    const visual = cardVisuals[index];
    let idleX = 0;
    let idleY = 0;
    if (!reducedMotion.matches && !state.active && !state.dragging) {
      idleX = Math.sin(elapsed * 0.34 + index * 0.72) * 0.012;
      idleY = Math.cos(elapsed * 0.28 + index * 0.91) * 0.018;
    }
    state.currentX += (state.targetX + idleX - state.currentX) * ease;
    state.currentY += (state.targetY + idleY - state.currentY) * ease;
    root.rotation.set(state.currentX, state.currentY, 0);
    root.position.z = state.active ? 0.1 : 0;

    visual.uniforms.uTime.value = reducedMotion.matches ? 0 : elapsed + index * 1.37;
    const targetFoil = Math.min(1, visual.baseFoil + (state.active ? 0.3 : 0));
    visual.uniforms.uFoil.value += (targetFoil - visual.uniforms.uFoil.value) * ease;

    root.updateMatrixWorld(true);
  });

  renderer.render(scene, camera);
}

function showFallback(reason) {
  if (failed) return;
  failed = true;
  console.error("[daoyou-gallery]", reason);
  renderer?.setAnimationLoop(null);
  renderer?.dispose();
  renderer?.domElement.remove();
  stage.hidden = true;
  fallback.hidden = false;
  fallbackCopy.textContent = "3D 卡面暂时未能加载。你可以重新加载，或继续浏览下方九张静态卡面。";
  status.classList.add("error");
  setAnnouncement("3D 显示不可用，已切换为九张静态卡片");
  window.__holo = { ready: false, cardCount: CARD_COUNT, fallback: true, error: String(reason) };
}

async function init() {
  const response = await fetch("./card-config.json");
  if (!response.ok) throw new Error("卡片配置未找到");
  const config = await response.json();
  if (document.fonts) {
    await document.fonts.load('400 300px "DaoyouDisplay"', "道友");
  }

  renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
    powerPreference: "high-performance",
    failIfMajorPerformanceCaveat: false,
  });
  renderer.setClearColor(0x06181f, 0);
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.7));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.NoToneMapping;
  renderer.domElement.setAttribute("aria-hidden", "true");
  stage.prepend(renderer.domElement);

  const loader = new THREE.TextureLoader();
  const textureCache = new Map();
  const loadTexture = async (url) => {
    if (!url) return null;
    if (textureCache.has(url)) return textureCache.get(url);
    const texture = await loader.loadAsync(url);
    setTextureDefaults(texture);
    textureCache.set(url, texture);
    return texture;
  };

  const cardConfigs = Array.from({ length: CARD_COUNT }, (_, index) => mergeCardConfig(config, index));
  const backTexture = createBackTexture();
  const cardTextures = await Promise.all(cardConfigs.map(async (cardConfig) => ({
    subject: await loadTexture(cardConfig.assets.subject),
    background: await loadTexture(cardConfig.assets.background),
    text: await loadTexture(cardConfig.assets.text),
    lineart: await loadTexture(cardConfig.assets.lineart),
  })));
  if (failed) return;

  const goldMaterial = new THREE.MeshBasicMaterial({ color: "#c9a24a" });
  const gltf = await new GLTFLoader().loadAsync(config.assets.model);
  if (failed) return;
  if (!hasFrontMaterial(gltf.scene)) throw new Error("卡片模型缺少 web_front 材质");
  createCards(gltf.scene, cardConfigs, cardTextures, backTexture, goldMaterial);
  bindControls();
  updateLayout();
  new ResizeObserver(updateLayout).observe(stage);
  addEventListener("resize", updateLayout, { passive: true });
  reducedMotion.addEventListener("change", () => cardStates.forEach(settleCard));

  renderer.domElement.addEventListener("webglcontextlost", (event) => {
    event.preventDefault();
    showFallback(new Error("WebGL 图形上下文已中断"));
  });

  renderer.compile(scene, camera);
  renderer.render(scene, camera);
  const shaderErrors = (renderer.info.programs || []).filter((program) => program.diagnostics && !program.diagnostics.runnable);
  if (shaderErrors.length) throw new Error("当前设备无法编译卡面材质");

  stage.setAttribute("aria-busy", "false");
  status.classList.add("ready");
  setAnnouncement("九张道友闪卡已就绪");
  window.__holo = {
    ready: true,
    cardCount: CARD_COUNT,
    renderer,
    scene,
    camera,
    cardRoots,
    cardStates,
    cardVisuals,
    getRendererCount: () => 1,
  };
  renderer.setAnimationLoop(animate);
}

const timeout = new Promise((_, reject) => {
  setTimeout(() => reject(new Error("卡片加载超时，请刷新重试")), LOAD_TIMEOUT_MS);
});

Promise.race([init(), timeout]).catch(showFallback);

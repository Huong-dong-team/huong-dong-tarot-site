/* Loaded exclusively by the Start action. Three.js and every engine chunk are
   served from this website; no CDN, orbit plugin, animation loop or global
   scroll handler is needed for these deliberately quiet museum rooms. */
import * as THREE from "../../vendor/three/three.module.min.js";
import { batchFor, clampPosition, exhibitPlacement } from "./model.js";

const PALETTES = {
  light: { wall: 0xe5dccb, floor: 0xa89679, timber: 0x654b36, trim: 0xb89961, sky: 0xe7e5dc, ceiling: 0xf2eadb, ink: "#483b2d", paper: "#e9dfcc" },
  dark: { wall: 0x102d2a, floor: 0x22312b, timber: 0x332820, trim: 0xb69153, sky: 0x163a35, ceiling: 0x24443c, ink: "#efe1c0", paper: "#18352f" },
  courtyard: { wall: 0xd9d7c7, floor: 0xc6c4b3, timber: 0x64543d, trim: 0xaaa080, sky: 0xd7e3df, ceiling: 0xbdb7a1, ink: "#394139", paper: "#e4e2d5" },
};

/* Dispose shared resources once, not once per mesh; includes label textures
   and textures whose fetch completed after the visitor left the batch. */
export function disposeGroup(group) {
  const geometries = new Set();
  const materials = new Set();
  const textures = new Set();
  group.traverse((node) => {
    if (node.geometry) geometries.add(node.geometry);
    for (const material of (Array.isArray(node.material) ? node.material : [node.material])) {
      if (!material) continue;
      materials.add(material);
      if (material.map) textures.add(material.map);
    }
  });
  textures.forEach((texture) => { texture.dispose(); texture.image?.close?.(); });
  materials.forEach((material) => material.dispose());
  geometries.forEach((geometry) => geometry.dispose());
  group.clear();
}

function buildArchitecture(scene, theme) {
  const colors = PALETTES[theme];
  const room = new THREE.Group();
  scene.add(room);
  const material = (color, roughness = 0.88) => new THREE.MeshStandardMaterial({ color, roughness });
  const wall = material(colors.wall);
  const floor = material(colors.floor);
  const wood = material(colors.timber, theme === "dark" ? 0.48 : 0.76);
  const brass = material(colors.trim, 0.48);
  const ceiling = material(colors.ceiling);
  const box = (width, height, depth, x, y, z, surface) => {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), surface);
    mesh.position.set(x, y, z);
    room.add(mesh);
    return mesh;
  };
  box(9.2, 0.2, 16.4, 0, -0.12, 0, floor);
  box(0.25, 4.8, 16.4, -4.6, 2.4, 0, wall);
  box(0.25, 4.8, 16.4, 4.6, 2.4, 0, wall);
  box(9.2, 4.8, 0.25, 0, 2.4, -8.2, wall);
  // Entrance wall leaves a real opening, visible when a visitor turns around.
  box(3.15, 4.8, 0.25, -3.03, 2.4, 8.2, wall);
  box(3.15, 4.8, 0.25, 3.03, 2.4, 8.2, wall);
  box(3, 1.15, 0.25, 0, 4.22, 8.2, wall);
  box(3.3, 0.05, 2.5, 0, -0.01, 9.35, floor);
  for (const side of [-1, 1]) {
    box(0.11, 0.18, 16, side * 4.43, 0.12, 0, wood);
    box(0.13, 0.08, 16, side * 4.43, 3.84, 0, brass);
    box(0.25, 0.36, 16.1, side * 2.5, 4.06, 0, wood);
    box(1.95, 0.14, 16.2, side * 3.51, 4.33, 0, ceiling);
    for (const z of [-6, -2, 2, 6]) {
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.17, 4.02, 10), wood);
      post.position.set(side * 2.5, 2, z);
      room.add(post);
      box(0.48, 0.18, 0.48, side * 2.5, 0.12, z, brass);
      box(0.58, 0.17, 0.48, side * 2.5, 3.76, z, wood);
    }
  }
  // Rectilinear seams carry the scale of the room without bitmap flooring.
  const seam = material(theme === "dark" ? 0x35443a : 0x918d7b);
  for (let z = -8; z <= 8; z += 2) box(9, 0.004, 0.016, 0, -0.01, z, seam);
  for (let x = -4; x <= 4; x += 2) box(0.014, 0.004, 16, x, -0.008, 0, seam);

  if (theme === "courtyard") {
    // Open-air courtyard: pale edging, sunken garden and sculptural low-poly
    // tree. Geometry remains static; there are no particle leaves or water FX.
    const moss = material(0x718269);
    const darkMoss = material(0x506854);
    box(3, 0.045, 7.3, 0, 0, 0, moss);
    for (const side of [-1, 1]) {
      box(0.18, 0.15, 7.6, side * 1.54, 0.04, 0, ceiling);
      box(3.26, 0.15, 0.18, 0, 0.04, side * 3.72, ceiling);
    }
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.2, 2.35, 7), wood);
    trunk.position.set(0.4, 1.1, -1.6);
    room.add(trunk);
    for (const [x, y, z, scale] of [[0.5, 2.7, -1.6, 0.95], [-0.3, 2.4, -1.4, 0.8], [0.9, 2.3, -2, 0.6]]) {
      const leaves = new THREE.Mesh(new THREE.IcosahedronGeometry(scale, 1), darkMoss);
      leaves.position.set(x, y, z);
      leaves.scale.y = 0.65;
      room.add(leaves);
    }
    // Timber lintels frame the sky only at the courtyard's two ends.
    for (const z of [-6, 6]) box(5.2, 0.23, 0.2, 0, 4.06, z, wood);
  } else {
    // A raised clerestory and timber ribs, modelled instead of a sky image.
    box(5, 0.1, 16.2, 0, 5.05, 0, ceiling);
    for (const z of [-6, -2, 2, 6]) box(5.2, 0.22, 0.19, 0, 4.3, z, wood);
    const lightStrip = new THREE.MeshBasicMaterial({ color: theme === "dark" ? 0xe9cc96 : 0xfff1d1 });
    for (const side of [-1, 1]) {
      box(0.06, 0.06, 15.6, side * 2.35, 4.37, 0, lightStrip);
      box(0.035, 0.46, 15.8, side * 2.48, 4.67, 0, new THREE.MeshBasicMaterial({ color: colors.sky }));
    }
  }
  // The far wall has an actual recessed plinth, a quiet destination beyond art.
  box(2.4, 0.12, 0.85, 0, 0.07, -7.4, wood);
  const artifact = new THREE.Mesh(new THREE.TorusGeometry(0.54, 0.075, 10, 48), brass);
  artifact.position.set(0, 2.25, -7.91);
  room.add(artifact);
  box(0.025, 0.95, 0.025, 0, 1.23, -7.91, brass);
  return room;
}

function labelTexture(item, palette, number) {
  const canvas = document.createElement("canvas");
  canvas.width = 640;
  canvas.height = 160;
  const context = canvas.getContext("2d");
  context.fillStyle = palette.paper;
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = palette.ink;
  context.font = "18px sans-serif";
  context.fillText(`HƯỜNG ĐÔNG  /  ${String(number + 1).padStart(2, "0")}`, 24, 35);
  context.font = "30px serif";
  context.fillText(item.title, 24, 82, 590);
  context.font = "18px sans-serif";
  context.fillText(item.subtitle || "Nhấp tranh để xem hồ sơ hiện vật", 24, 120, 590);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

export function createMuseum({ host, data, reducedMotion = false, onStatus, onSelect, onFailure }) {
  const palette = PALETTES[data.theme];
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(palette.sky);
  scene.fog = new THREE.Fog(palette.sky, 16, 38);
  const canvas = document.createElement("canvas");
  canvas.className = "mw-3d-canvas";
  canvas.tabIndex = 0;
  canvas.setAttribute("role", "application");
  canvas.setAttribute("aria-label", `${data.title}. Giữ chuột và kéo để nhìn quanh. Phím W A S D hoặc các mũi tên để di chuyển. Enter xem hiện vật đang chọn. Dùng Tab để rời khung; có các nút chuyển hiện vật bên dưới.`);
  // No page-wide gesture/scroll changes. Even the canvas keeps normal touch
  // scrolling; fine-pointer desktop dragging is handled by pointer events.
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: "low-power" });
  } catch (error) {
    canvas.remove();
    throw error;
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = data.theme === "dark" ? 1.1 : 1.15;
  const camera = new THREE.PerspectiveCamera(58, 1, 0.08, 50);
  camera.rotation.order = "YXZ";
  scene.add(new THREE.HemisphereLight(data.theme === "dark" ? 0xdce5d1 : 0xfff5df, 0x615943, data.theme === "dark" ? 1.4 : 2.2));
  const sunlight = new THREE.DirectionalLight(0xfff1d2, data.theme === "dark" ? 1.15 : 2.5);
  sunlight.position.set(-2, 7, 3);
  scene.add(sunlight);
  buildArchitecture(scene, data.theme);
  let exhibitGroup = new THREE.Group();
  scene.add(exhibitGroup);
  host.append(canvas);
  const events = new AbortController();
  const keys = new Set();
  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  let hitTargets = [];
  let batchAbort = new AbortController();
  let batchGeneration = 0;
  let batchStart = -1;
  let selected = 0;
  let disposed = false;
  let visible = true;
  let paused = false;
  let raf = 0;
  let lastTime = 0;
  let yaw = 0;
  let pitch = 0;
  let drag = null;
  let transition = null;

  const allowed = () => !disposed && visible && !paused && !document.hidden;
  const requestRender = () => { if (!raf && allowed()) raf = requestAnimationFrame(render); };
  const stopFrames = () => {
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
    lastTime = 0;
    keys.clear();
    drag = null;
  };
  const orient = () => { camera.rotation.y = yaw; camera.rotation.x = pitch; };
  const render = (time) => {
    raf = 0;
    if (!allowed()) return;
    const dt = lastTime ? Math.min((time - lastTime) / 1000, 0.045) : 0;
    lastTime = time;
    if (transition) {
      const amount = Math.min(1, (time - transition.time) / 540);
      const eased = amount * amount * (3 - 2 * amount);
      camera.position.lerpVectors(transition.from, transition.to, eased);
      const safePosition = clampPosition(camera.position.x, camera.position.z, data.theme);
      camera.position.x = safePosition.x;
      camera.position.z = safePosition.z;
      yaw = transition.yawFrom + (transition.yawTo - transition.yawFrom) * eased;
      pitch = transition.pitchFrom * (1 - eased);
      if (amount === 1) transition = null;
    }
    if (keys.size) {
      transition = null;
      const forward = Number(keys.has("w") || keys.has("arrowup")) - Number(keys.has("s") || keys.has("arrowdown"));
      const sideways = Number(keys.has("d") || keys.has("arrowright")) - Number(keys.has("a") || keys.has("arrowleft"));
      const scale = 2.15 * dt / Math.max(1, Math.hypot(forward, sideways));
      const next = clampPosition(camera.position.x + (sideways * Math.cos(yaw) - forward * Math.sin(yaw)) * scale,
        camera.position.z + (-forward * Math.cos(yaw) - sideways * Math.sin(yaw)) * scale, data.theme);
      camera.position.x = next.x;
      camera.position.z = next.z;
    }
    orient();
    try {
      renderer.render(scene, camera);
    } catch {
      stopFrames();
      onFailure();
      return;
    }
    if (keys.size || transition) requestRender();
    else lastTime = 0;
  };

  const selectedStatus = () => `Hiện vật ${selected + 1}/${data.exhibits.length}: ${data.exhibits[selected].title}. Dùng Tranh trước / Tranh sau để ghé từng hiện vật; nhấp tranh hoặc Xem tác phẩm để đọc hồ sơ.`;
  const loadBatch = (index) => {
    const batch = batchFor(index, data.exhibits.length);
    if (batch.start === batchStart) return;
    batchStart = batch.start;
    batchAbort.abort();
    batchAbort = new AbortController();
    const mine = ++batchGeneration;
    const signal = batchAbort.signal;
    scene.remove(exhibitGroup);
    disposeGroup(exhibitGroup);
    exhibitGroup = new THREE.Group();
    scene.add(exhibitGroup);
    hitTargets = [];
    const textureJobs = [];
    for (let index = batch.start; index < batch.end; index += 1) {
      const item = data.exhibits[index];
      const placement = exhibitPlacement(index - batch.start);
      const group = new THREE.Group();
      group.position.set(placement.x, placement.y, placement.z);
      group.rotation.y = placement.yaw;
      exhibitGroup.add(group);
      const frame = new THREE.Mesh(new THREE.BoxGeometry(1.55, 2.35, 0.1), new THREE.MeshStandardMaterial({ color: palette.trim, roughness: 0.65 }));
      group.add(frame);
      const mat = new THREE.Mesh(new THREE.PlaneGeometry(1.47, 2.27), new THREE.MeshBasicMaterial({ color: palette.paper }));
      mat.position.z = 0.055;
      group.add(mat);
      const artwork = new THREE.Mesh(new THREE.PlaneGeometry(1.31, 2.11), new THREE.MeshBasicMaterial({ color: palette.wall, toneMapped: false }));
      artwork.position.z = 0.063;
      artwork.userData.exhibitIndex = index;
      group.add(artwork);
      hitTargets.push(artwork);
      const label = new THREE.Mesh(new THREE.PlaneGeometry(1.48, 0.37), new THREE.MeshBasicMaterial({ map: labelTexture(item, palette, index), toneMapped: false }));
      label.position.set(0, -1.55, 0.03);
      label.userData.exhibitIndex = index;
      group.add(label);
      hitTargets.push(label);
      const job = (async () => {
        let bitmap;
        try {
          const response = await fetch(item.image, { signal, credentials: "same-origin" });
          if (!response.ok) throw new Error(`Ảnh ${response.status}`);
          bitmap = await createImageBitmap(await response.blob(), { imageOrientation: "flipY" });
          if (disposed || mine !== batchGeneration || signal.aborted) { bitmap.close(); return false; }
          const aspect = bitmap.width / bitmap.height;
          // Art stays at its source aspect ratio inside the frame, never cropped.
          const height = Math.min(2.11, 1.31 / aspect);
          artwork.geometry.dispose();
          artwork.geometry = new THREE.PlaneGeometry(height * aspect, height);
          const source = document.createElement("canvas");
          const longest = Math.max(bitmap.width, bitmap.height);
          const scale = Math.min(1, 1024 / longest);
          source.width = Math.max(1, Math.round(bitmap.width * scale));
          source.height = Math.max(1, Math.round(bitmap.height * scale));
          // ImageBitmap flips to WebGL's UV convention; CanvasTexture then has
          // flipY=false so there is one flip total, not two.
          source.getContext("2d").drawImage(bitmap, 0, 0, source.width, source.height);
          bitmap.close();
          bitmap = null;
          const texture = new THREE.CanvasTexture(source);
          texture.flipY = false;
          texture.colorSpace = THREE.SRGBColorSpace;
          texture.anisotropy = Math.min(renderer.capabilities.getMaxAnisotropy(), 4);
          artwork.material.map = texture;
          artwork.material.color.set(0xffffff);
          artwork.material.needsUpdate = true;
          requestRender();
          return true;
        } catch (error) {
          bitmap?.close();
          if (error.name !== "AbortError" && !disposed && mine === batchGeneration) requestRender();
          return false;
        }
      })();
      textureJobs.push(job);
    }
    Promise.all(textureJobs).then((results) => {
      if (disposed || mine !== batchGeneration || signal.aborted) return;
      const failed = results.filter((loaded) => !loaded).length;
      onStatus(`${selectedStatus()}${failed ? ` Có ${failed} ảnh chưa tải được; hồ sơ và bản 2D vẫn có thể mở.` : ""}`);
    });
    requestRender();
  };

  const moveCamera = (x, z, nextYaw, instant = false) => {
    keys.clear();
    const target = clampPosition(x, z, data.theme);
    const destination = new THREE.Vector3(target.x, 1.72, target.z);
    const delta = Math.atan2(Math.sin(nextYaw - yaw), Math.cos(nextYaw - yaw));
    // Courtyard viewpoints jump directly: the straight path would cross the
    // planted center. Reduced-motion visitors always get immediate viewpoints.
    if (instant || reducedMotion || data.theme === "courtyard") {
      camera.position.copy(destination);
      yaw += delta;
      pitch = 0;
      transition = null;
    } else {
      transition = { from: camera.position.clone(), to: destination, yawFrom: yaw, yawTo: yaw + delta, pitchFrom: pitch, time: performance.now() };
    }
    requestRender();
  };
  const visit = (index) => {
    const batch = batchFor(index, data.exhibits.length);
    selected = batch.current;
    loadBatch(selected);
    const placement = exhibitPlacement(batch.slot);
    moveCamera(placement.x < 0 ? -1.95 : 1.95, placement.z, placement.x < 0 ? Math.PI / 2 : -Math.PI / 2);
    onStatus(selectedStatus());
  };
  const reset = () => {
    moveCamera(0, 7.05, 0, true);
    onStatus("Đang đứng tại cửa vào. Giữ chuột và kéo để nhìn quanh; W A S D hoặc các mũi tên để đi. Dùng các nút bên dưới để xem từng hiện vật.");
  };
  const pick = (event) => {
    const bounds = canvas.getBoundingClientRect();
    pointer.set(((event.clientX - bounds.left) / bounds.width) * 2 - 1, -((event.clientY - bounds.top) / bounds.height) * 2 + 1);
    raycaster.setFromCamera(pointer, camera);
    const hit = raycaster.intersectObjects(hitTargets, false)[0];
    if (hit) {
      selected = hit.object.userData.exhibitIndex;
      onSelect(data.exhibits[selected]);
    }
  };
  const listen = (target, name, callback) => target.addEventListener(name, callback, { signal: events.signal });
  listen(canvas, "pointerdown", (event) => {
    if (event.button !== 0 || event.pointerType === "touch") return;
    canvas.focus({ preventScroll: true });
    transition = null;
    drag = { id: event.pointerId, x: event.clientX, y: event.clientY, startX: event.clientX, startY: event.clientY, moved: false };
    canvas.setPointerCapture(event.pointerId);
  });
  listen(canvas, "pointermove", (event) => {
    if (!drag || drag.id !== event.pointerId) return;
    yaw -= (event.clientX - drag.x) * 0.004;
    pitch = Math.max(-0.65, Math.min(0.65, pitch - (event.clientY - drag.y) * 0.003));
    drag.moved ||= Math.hypot(event.clientX - drag.startX, event.clientY - drag.startY) > 5;
    drag.x = event.clientX;
    drag.y = event.clientY;
    requestRender();
  });
  listen(canvas, "pointerup", (event) => {
    if (!drag || drag.id !== event.pointerId) return;
    const select = !drag.moved;
    drag = null;
    if (canvas.hasPointerCapture(event.pointerId)) canvas.releasePointerCapture(event.pointerId);
    if (select) pick(event);
  });
  listen(canvas, "pointercancel", () => { drag = null; });
  listen(canvas, "lostpointercapture", () => { drag = null; });
  listen(canvas, "keydown", (event) => {
    if (event.altKey || event.ctrlKey || event.metaKey || !allowed()) return;
    const key = event.key.toLowerCase();
    if (["w", "a", "s", "d", "arrowup", "arrowdown", "arrowleft", "arrowright"].includes(key)) {
      event.preventDefault();
      keys.add(key);
      requestRender();
    } else if (key === "enter") {
      event.preventDefault();
      onSelect(data.exhibits[selected]);
    }
  });
  listen(canvas, "keyup", (event) => keys.delete(event.key.toLowerCase()));
  listen(canvas, "blur", stopFrames);
  listen(window, "blur", stopFrames);
  listen(document, "visibilitychange", () => {
    if (document.hidden) stopFrames();
    else requestRender();
  });
  listen(canvas, "webglcontextlost", (event) => {
    event.preventDefault();
    stopFrames();
    onFailure();
  });
  const resize = () => {
    if (disposed) return;
    const width = Math.max(1, host.clientWidth);
    const height = Math.max(1, host.clientHeight);
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    requestRender();
  };
  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(host);
  const intersectionObserver = new IntersectionObserver((entries) => {
    visible = entries[0]?.isIntersecting ?? false;
    if (visible) requestRender();
    else stopFrames();
  });
  intersectionObserver.observe(host);
  loadBatch(0);
  reset();
  resize();

  return {
    focus: () => canvas.focus({ preventScroll: true }),
    step: (amount) => visit(selected + amount),
    inspect: () => onSelect(data.exhibits[selected]),
    reset,
    setPaused(value) { paused = value; if (value) stopFrames(); else requestRender(); },
    setReducedMotion(value) {
      reducedMotion = value;
      if (value && transition) {
        camera.position.copy(transition.to);
        yaw = transition.yawTo;
        pitch = 0;
        transition = null;
        requestRender();
      }
    },
    dispose() {
      if (disposed) return;
      disposed = true;
      batchGeneration += 1;
      batchAbort.abort();
      stopFrames();
      events.abort();
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      disposeGroup(scene);
      hitTargets = [];
      renderer.renderLists.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
      canvas.remove();
    },
  };
}

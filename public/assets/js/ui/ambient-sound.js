/* Âm cảnh của Hường Đông.

   Bản prototype người dùng cung cấp không chứa MP3/WAV: âm thanh được dựng tại
   chỗ bằng Web Audio. Module này giữ đúng ngôn ngữ âm thanh đó — ba bè trầm,
   một lớp nhiễu lọc thấp và tiếng chuông thưa — nhưng đặt nó sau một thao tác
   chủ động. Footer nằm ngoài container Swup nên module chỉ khởi tạo một lần và
   âm cảnh không bị khởi động lại sau mỗi lần chuyển trang. */

const AudioContextClass = window.AudioContext || window.webkitAudioContext;

let context = null;
let output = null;
let bellTimer = 0;
let firstBellTimer = 0;
let active = false;

/**
 * Gắn điều khiển âm cảnh ở footer.
 * @returns {() => void} hàm huỷ listener và đóng AudioContext
 */
export function init() {
  const button = document.querySelector("[data-ambient-sound]");
  const label = button?.querySelector("[data-ambient-label]");
  const status = document.querySelector("[data-ambient-status]");
  if (!button || !label) return () => {};

  if (!AudioContextClass) {
    button.disabled = true;
    status && (status.textContent = "Trình duyệt này không hỗ trợ âm cảnh.");
    return () => {};
  }

  const renderState = (message = "") => {
    button.setAttribute("aria-pressed", String(active));
    button.toggleAttribute("data-active", active);
    label.textContent = active ? "Tắt âm cảnh" : "Bật âm cảnh";
    if (status) status.textContent = message;
  };

  const onClick = async () => {
    button.disabled = true;
    try {
      if (active) {
        await stopSound();
        renderState("Âm cảnh đã tắt.");
      } else {
        await startSound();
        renderState("Âm cảnh đã bật.");
      }
    } catch (error) {
      await stopSound({ immediate: true });
      renderState("Không thể phát âm cảnh trên thiết bị này.");
      console.warn("[huong-dong] không thể phát âm cảnh:", error);
    } finally {
      button.disabled = false;
    }
  };

  const onVisibilityChange = () => {
    if (!active || !context) return;
    if (document.hidden) context.suspend().catch(() => {});
    else context.resume().catch(() => {});
  };

  button.addEventListener("click", onClick);
  document.addEventListener("visibilitychange", onVisibilityChange);
  renderState();

  return () => {
    button.removeEventListener("click", onClick);
    document.removeEventListener("visibilitychange", onVisibilityChange);
    void stopSound({ immediate: true });
  };
}

async function startSound() {
  if (active) return;

  const nextContext = new AudioContextClass();
  const nextOutput = nextContext.createGain();
  nextOutput.gain.setValueAtTime(0, nextContext.currentTime);
  nextOutput.connect(nextContext.destination);

  context = nextContext;
  output = nextOutput;
  active = true;

  // Ba bè trầm lấy nguyên cao độ từ prototype, chia gain để bè cao không lấn.
  [55, 82.5, 110.3].forEach((frequency, index) => {
    const oscillator = nextContext.createOscillator();
    const gain = nextContext.createGain();
    oscillator.type = "sine";
    oscillator.frequency.value = frequency;
    gain.gain.value = 0.28 / (index + 1);
    oscillator.connect(gain);
    gain.connect(nextOutput);
    oscillator.start();
  });

  addFilteredNoise(nextContext, nextOutput);
  await nextContext.resume();
  nextOutput.gain.linearRampToValueAtTime(0.13, nextContext.currentTime + 2.8);

  firstBellTimer = window.setTimeout(ringBell, 600);
  bellTimer = window.setInterval(ringBell, 13_000);
}

function addFilteredNoise(audioContext, destination) {
  const length = audioContext.sampleRate * 3;
  const buffer = audioContext.createBuffer(1, length, audioContext.sampleRate);
  const samples = buffer.getChannelData(0);
  for (let index = 0; index < length; index += 1) {
    samples[index] = (Math.random() * 2 - 1) * 0.5;
  }

  const noise = audioContext.createBufferSource();
  const lowPass = audioContext.createBiquadFilter();
  const noiseGain = audioContext.createGain();
  const lfo = audioContext.createOscillator();
  const lfoGain = audioContext.createGain();

  noise.buffer = buffer;
  noise.loop = true;
  lowPass.type = "lowpass";
  lowPass.frequency.value = 380;
  lowPass.Q.value = 0.6;
  noiseGain.gain.value = 0.075;
  lfo.frequency.value = 0.07;
  lfoGain.gain.value = 0.035;

  lfo.connect(lfoGain);
  lfoGain.connect(noiseGain.gain);
  noise.connect(lowPass);
  lowPass.connect(noiseGain);
  noiseGain.connect(destination);
  lfo.start();
  noise.start();
}

function ringBell() {
  const audioContext = context;
  const destination = output;
  if (!active || !audioContext || !destination || audioContext.state === "closed") return;

  const start = audioContext.currentTime;
  const base = 392 * (Math.random() < 0.5 ? 1 : 1.5);
  [1, 2.76, 5.4].forEach((harmonic, index) => {
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    oscillator.type = "sine";
    oscillator.frequency.value = base * harmonic;
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.linearRampToValueAtTime(0.12 / (index + 1.4), start + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + 5 - index);
    oscillator.connect(gain);
    gain.connect(destination);
    oscillator.start(start);
    oscillator.stop(start + 6);
  });
}

async function stopSound({ immediate = false } = {}) {
  active = false;
  window.clearTimeout(firstBellTimer);
  window.clearInterval(bellTimer);
  firstBellTimer = 0;
  bellTimer = 0;

  const oldContext = context;
  const oldOutput = output;
  context = null;
  output = null;
  if (!oldContext || oldContext.state === "closed") return;

  if (!immediate && oldOutput) {
    const end = oldContext.currentTime + 0.65;
    oldOutput.gain.cancelScheduledValues(oldContext.currentTime);
    oldOutput.gain.setValueAtTime(Math.max(oldOutput.gain.value, 0.0001), oldContext.currentTime);
    oldOutput.gain.exponentialRampToValueAtTime(0.0001, end);
    await new Promise((resolve) => window.setTimeout(resolve, 700));
  }

  await oldContext.close().catch(() => {});
}

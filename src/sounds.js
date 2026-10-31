let audioCtx;

const initAudio = () => {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
};

export const playSpinSound = () => {
  initAudio();
  if (audioCtx.state === 'suspended') return;

  let time = audioCtx.currentTime;
  for (let i = 0; i < 15; i++) {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(600 + (i * 20), time);
    
    gain.gain.setValueAtTime(0.15, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.05);
    
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    
    osc.start(time);
    osc.stop(time + 0.05);
    
    time += 0.1 + (i * 0.02); 
  }
};

// Уникальные звуки для каждой редкости
export const playWinSound = (rarity) => {
  initAudio();
  if (audioCtx.state === 'suspended') return;

  const now = audioCtx.currentTime;
  
  // Настройки для каждого звука
  const sounds = {
    // Обычный: короткий глухой звук
    common: { type: 'sine', freqs: [300], duration: 0.15 },
    // Редкий: два приятных тона
    rare: { type: 'sine', freqs: [400, 600], duration: 0.2 },
    // Эпик: три тона вверх
    epic: { type: 'triangle', freqs: [500, 700, 900], duration: 0.25 },
    // Легенда: мощный аккорд
    legendary: { type: 'sawtooth', freqs: [600, 800, 1000, 1200], duration: 0.3 },
    // Граиль: эпичные фанфары
    grail: { type: 'square', freqs: [800, 1000, 1200, 1500, 2000], duration: 0.4 }
  };

  const config = sounds[rarity] || sounds.common;

  config.freqs.forEach((freq, index) => {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    
    osc.type = config.type;
    osc.frequency.setValueAtTime(freq, now + index * 0.08); // Небольшая задержка между нотами
    
    gain.gain.setValueAtTime(0.2, now + index * 0.08);
    gain.gain.exponentialRampToValueAtTime(0.01, now + (index * 0.08) + config.duration);
    
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    
    osc.start(now + index * 0.08);
    osc.stop(now + (index * 0.08) + config.duration);
  });
};
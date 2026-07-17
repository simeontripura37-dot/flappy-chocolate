let audioCtx = null;

// Load custom audio tracks
const hitSound = new Audio('sound.mp3');
const bgMusic = new Audio('bgm.mp3'); // NEW: Your background moving song

// Set the background music to loop continuously
bgMusic.loop = true;
bgMusic.volume = 0.4; // Adjust this (0.0 to 1.0) if the music is too loud or quiet

function initAudio() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
}

function playSound(type) {
    initAudio();
    
    if (type === 'hit') {
        hitSound.currentTime = 0; 
        hitSound.play().catch(err => console.log("Audio gesture delay:", err));
    } 
    else {
        if (!audioCtx) return;
        if (audioCtx.state === 'suspended') {
            audioCtx.resume();
        }

        const osc = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        osc.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        const now = audioCtx.currentTime;

        // Sound effect for jumping
        if (type === 'flap') {
            osc.type = 'triangle'; 
            osc.frequency.setValueAtTime(400, now);
            osc.frequency.exponentialRampToValueAtTime(700, now + 0.1);
            gainNode.gain.setValueAtTime(0.15, now);
            gainNode.gain.linearRampToValueAtTime(0.01, now + 0.1);
            osc.start(now);
            osc.stop(now + 0.1);
        } 
        // Sound effect for scoring points
        else if (type === 'score') {
            osc.type = 'sine';
            osc.frequency.setValueAtTime(587.33, now);
            osc.frequency.setValueAtTime(880.00, now + 0.08);
            gainNode.gain.setValueAtTime(0.1, now);
            gainNode.gain.setValueAtTime(0.1, now + 0.08);
            gainNode.gain.linearRampToValueAtTime(0.01, now + 0.25);
            osc.start(now);
            osc.stop(now + 0.25);
        }
    }
}

// NEW: Start playing your background track
function playBackgroundMusic() {
    bgMusic.play().catch(err => console.log("Music waiting for interaction:", err));
}

// NEW: Stop background music immediately upon crashing
function stopBackgroundMusic() {
    bgMusic.pause();
    bgMusic.currentTime = 0; // Rewind song back to the start
}
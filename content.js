let speechiePlayer = null;
let speechieAudio = null;
let isDragging = false;
let currentX = 0;
let currentY = 0;
let initialX = 0;
let initialY = 0;
let xOffset = 0;
let yOffset = 0;

// Create floating player HTML
function createFloatingPlayer() {
  if (speechiePlayer) {
    speechiePlayer.remove();
  }

  const playerHTML = `
    <div class="speechie-floating-player" id="speechie-floating-player">
      <div class="speechie-title-bar" id="speechie-title-bar">
        <span class="speechie-title" style="text-align: left; margin-left: 12px;">Speechie</span>
        <span class="speechie-progress-info" id="speechie-progress-info" style="position: absolute; left: 50%; transform: translateX(-50%);">Ready</span>
        <button class="speechie-close-btn" id="speechie-close-btn" title="Close">
          <svg viewBox="0 0 24 24">
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
          </svg>
        </button>
      </div>
      <div class="speechie-player-content">
        <div class="speechie-progress-container" id="speechie-progress-container">
          <div class="speechie-progress-fill" id="speechie-progress-fill"></div>
        </div>
        
        <div class="speechie-controls">
          <span id="speechie-current-time" style="font-size: 12px; color: #666; font-weight: 500; min-width: 35px; text-align: right;">0:00</span>
          <button class="speechie-prev-btn" id="speechie-prev-btn" title="Previous 15s">
            <div style="display: flex; flex-direction: column; align-items: center; gap: 2px;">
              <svg viewBox="0 0 24 24">
                <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/>
              </svg>
              <span style="font-size: 10px; color: #666;">15s</span>
            </div>
          </button>
          <button class="speechie-play-btn" id="speechie-play-btn" title="Play/Pause">
            <svg id="speechie-play-icon" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z"/>
            </svg>
            <svg id="speechie-pause-icon" class="speechie-hidden" viewBox="0 0 24 24">
              <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
            </svg>
          </button>
          <button class="speechie-next-btn" id="speechie-next-btn" title="Next 5s">
            <div style="display: flex; flex-direction: column; align-items: center; gap: 2px;">
              <svg viewBox="0 0 24 24">
                <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/>
              </svg>
              <span style="font-size: 10px; color: #666;">15s</span>
            </div>
          </button>
          <span id="speechie-total-time" style="font-size: 12px; color: #666; font-weight: 500; min-width: 35px; text-align: left;">0:00</span>
        </div>
        
        <div class="speechie-speed-control">
          <label for="speechie-speed-slider">Speed:</label>
          <input type="range" class="speechie-speed-slider" id="speechie-speed-slider" min="0.5" max="2.5" step="0.1" value="1" aria-label="Playback speed">
          <span class="speechie-speed-label" id="speechie-speed-label">1.0x</span>
        </div>
      </div>
    </div>
  `;

  const styles = `
    <style>
      .speechie-floating-player {
         position: fixed;
         top: 20px;
         right: 20px;
         width: 280px;
         background: rgba(255, 255, 255, 0.95);
         backdrop-filter: blur(10px);
         -webkit-backdrop-filter: blur(10px);
         border-radius: 12px;
         box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
         z-index: 9999;
         user-select: none;
         -webkit-user-select: none;
         transition: transform 0.2s ease, box-shadow 0.2s ease;
       }

      .speechie-floating-player:hover {
        box-shadow: 0 12px 48px rgba(0, 0, 0, 0.15);
      }

      .speechie-title-bar {
         display: flex;
         align-items: center;
         justify-content: space-between;
         padding: 8px 12px;
         background: linear-gradient(135deg, #667eea, #764ba2);
         border-radius: 12px 12px 0 0;
         cursor: move;
         color: white;
         font-size: 13px;
       }

       .speechie-title {
          font-weight: 600;
          flex-shrink: 0;
          text-align: left;
          margin-left: 12px;
        }
        
        .speechie-progress-info {
          position: absolute;
          left: 50%;
          transform: translateX(-50%);
          font-size: 12px;
          opacity: 0.9;
          white-space: nowrap;
        }
        
        .speechie-close-btn {
          background: none;
          border: none;
          color: white;
          cursor: pointer;
          padding: 4px;
          border-radius: 4px;
          transition: background-color 0.2s;
        }
        
        .speechie-close-btn:hover {
          background-color: rgba(255, 255, 255, 0.2);
        }
        
        .speechie-close-btn svg {
          width: 14px;
          height: 14px;
          fill: currentColor;
        }
        
        .speechie-prev-btn,
        .speechie-next-btn {
          background: none;
          border: none;
          color: #667eea;
          cursor: pointer;
          padding: 8px;
          border-radius: 4px;
          transition: background-color 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .speechie-prev-btn:hover,
        .speechie-next-btn:hover {
          background-color: rgba(102, 126, 234, 0.1);
        }
        
        .speechie-prev-btn svg,
        .speechie-next-btn svg {
          width: 18px;
          height: 18px;
          fill: currentColor;
        }
        
        .speechie-controls {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          margin: 8px 0;
        }

       .speechie-player-content {
         padding: 12px;
       }

      .speechie-progress-container {
        height: 4px;
        background: rgba(0, 0, 0, 0.1);
        border-radius: 2px;
        overflow: hidden;
        margin-bottom: 8px;
        cursor: pointer;
      }

      .speechie-progress-fill {
        height: 100%;
        background: linear-gradient(90deg, #667eea, #764ba2);
        border-radius: 2px;
        transition: width 0.1s linear;
        width: 0%;
      }

      .speechie-controls {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .speechie-play-btn {
        width: 32px;
        height: 32px;
        border: none;
        border-radius: 50%;
        background: linear-gradient(135deg, #667eea, #764ba2);
        color: white;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: transform 0.2s ease;
        flex-shrink: 0;
      }

      .speechie-play-btn:hover {
        transform: scale(1.05);
      }

      .speechie-play-btn:active {
        transform: scale(0.95);
      }

      .speechie-play-btn:disabled {
        background: #ccc;
        cursor: not-allowed;
        transform: none;
      }

      .speechie-play-btn svg {
        width: 16px;
        height: 16px;
        fill: currentColor;
      }

      .speechie-status {
        flex: 1;
        font-size: 12px;
        color: #333;
        text-align: center;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .speechie-close-btn {
           width: 20px;
           height: 20px;
           border: none;
           background: transparent;
           color: white;
           cursor: pointer;
           display: flex;
           align-items: center;
           justify-content: center;
           transition: opacity 0.2s ease;
           flex-shrink: 0;
         }

         .speechie-close-btn:hover {
           opacity: 0.8;
         }

      .speechie-close-btn svg {
        width: 14px;
        height: 14px;
        fill: currentColor;
      }



      .speechie-speed-control {
        display: flex;
        align-items: center;
        gap: 4px;
        margin-top: 6px;
        font-size: 11px;
      }

      .speechie-speed-slider {
        flex: 1;
        height: 2px;
        background: #e1e5e9;
        border-radius: 1px;
        outline: none;
        cursor: pointer;
        -webkit-appearance: none;
      }

      .speechie-speed-slider::-webkit-slider-thumb {
        -webkit-appearance: none;
        appearance: none;
        width: 12px;
        height: 12px;
        background: linear-gradient(135deg, #667eea, #764ba2);
        border-radius: 50%;
        cursor: pointer;
      }

      .speechie-speed-slider::-moz-range-thumb {
        width: 12px;
        height: 12px;
        background: linear-gradient(135deg, #667eea, #764ba2);
        border-radius: 50%;
        cursor: pointer;
        border: none;
      }

      .speechie-speed-label {
        font-size: 11px;
        color: #667eea;
        min-width: 30px;
      }

      .speechie-hidden {
        display: none !important;
      }

      .speechie-dragging {
        transition: none;
      }
    </style>
  `;

  // Remove existing styles and player
  const existingStyles = document.getElementById('speechie-styles');
  if (existingStyles) existingStyles.remove();
  
  const existingPlayer = document.getElementById('speechie-floating-player');
  if (existingPlayer) existingPlayer.remove();

  // Add styles and player
  document.head.insertAdjacentHTML('beforeend', styles);
  document.body.insertAdjacentHTML('beforeend', playerHTML);

  speechiePlayer = document.getElementById('speechie-floating-player');
  speechieAudio = new Audio();

  setupPlayerControls();
  setupDragFunctionality();
  
  return speechiePlayer;
}

function setupPlayerControls() {
  const playBtn = document.getElementById('speechie-play-btn');
  const closeBtn = document.getElementById('speechie-close-btn');
  const prevBtn = document.getElementById('speechie-prev-btn');
  const nextBtn = document.getElementById('speechie-next-btn');
  const progressContainer = document.getElementById('speechie-progress-container');
  const progressFill = document.getElementById('speechie-progress-fill');
  const progressInfo = document.getElementById('speechie-progress-info');
  const currentTimeEl = document.getElementById('speechie-current-time');
  const totalTimeEl = document.getElementById('speechie-total-time');
  const speedSlider = document.getElementById('speechie-speed-slider');
  const speedLabel = document.getElementById('speechie-speed-label');
  const playIcon = document.getElementById('speechie-play-icon');
  const pauseIcon = document.getElementById('speechie-pause-icon');

  // Play/Pause functionality
  playBtn.addEventListener('click', () => {
    if (speechieAudio.paused) {
      speechieAudio.play();
    } else {
      speechieAudio.pause();
    }
  });

  // Close player
  closeBtn.addEventListener('click', () => {
    speechieAudio.pause();
    speechieAudio.src = '';
    if (speechiePlayer) {
      speechiePlayer.remove();
      speechiePlayer = null;
    }
  });

  // Progress bar click
  progressContainer.addEventListener('click', (e) => {
    const rect = progressContainer.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    speechieAudio.currentTime = percent * speechieAudio.duration;
  });

  // Speed control
  speedSlider.addEventListener('input', (e) => {
    speechieAudio.playbackRate = parseFloat(e.target.value);
    speedLabel.textContent = `${e.target.value}x`;
  });

  // Skip back/forward buttons
  prevBtn.addEventListener('click', () => {
    if (speechieAudio.duration) {
      speechieAudio.currentTime = Math.max(0, speechieAudio.currentTime - 15);
    }
  });

  nextBtn.addEventListener('click', () => {
    if (speechieAudio.duration) {
      speechieAudio.currentTime = Math.min(speechieAudio.duration, speechieAudio.currentTime + 5);
    }
  });

  // Audio event listeners
  speechieAudio.addEventListener('play', () => {
    playIcon.classList.add('speechie-hidden');
    pauseIcon.classList.remove('speechie-hidden');
  });

  speechieAudio.addEventListener('pause', () => {
    playIcon.classList.remove('speechie-hidden');
    pauseIcon.classList.add('speechie-hidden');
  });

  speechieAudio.addEventListener('loadedmetadata', () => {
    totalTimeEl.textContent = formatTime(speechieAudio.duration);
    progressInfo.textContent = `${formatTime(0)} / ${formatTime(speechieAudio.duration)}`;
  });

  speechieAudio.addEventListener('timeupdate', () => {
    const percent = (speechieAudio.currentTime / speechieAudio.duration) * 100;
    progressFill.style.width = `${percent}%`;
    currentTimeEl.textContent = formatTime(speechieAudio.currentTime);
    progressInfo.textContent = `${formatTime(speechieAudio.currentTime)} / ${formatTime(speechieAudio.duration)}`;
  });

  speechieAudio.addEventListener('ended', () => {
    playIcon.classList.remove('speechie-hidden');
    pauseIcon.classList.add('speechie-hidden');
    progressFill.style.width = '0%';
    currentTimeEl.textContent = '0:00';
  });
}

function setupDragFunctionality() {
  const titleBar = document.getElementById('speechie-title-bar');
  
  titleBar.addEventListener('mousedown', dragStart);
  document.addEventListener('mousemove', drag);
  document.addEventListener('mouseup', dragEnd);

  titleBar.addEventListener('touchstart', dragStart);
  document.addEventListener('touchmove', drag);
  document.addEventListener('touchend', dragEnd);
}

function dragStart(e) {
  const player = document.getElementById('speechie-floating-player');
  
  if (e.type === "touchstart") {
    initialX = e.touches[0].clientX - xOffset;
    initialY = e.touches[0].clientY - yOffset;
  } else {
    initialX = e.clientX - xOffset;
    initialY = e.clientY - yOffset;
  }

  isDragging = true;
  player.classList.add('speechie-dragging');
}

function dragEnd(e) {
  const player = document.getElementById('speechie-floating-player');
  initialX = currentX;
  initialY = currentY;
  isDragging = false;
  player.classList.remove('speechie-dragging');
}

function drag(e) {
  const player = document.getElementById('speechie-floating-player');
  
  if (isDragging) {
    e.preventDefault();
    
    if (e.type === "touchmove") {
      currentX = e.touches[0].clientX - initialX;
      currentY = e.touches[0].clientY - initialY;
    } else {
      currentX = e.clientX - initialX;
      currentY = e.clientY - initialY;
    }

    xOffset = currentX;
    yOffset = currentY;

    player.style.transform = `translate3d(${currentX}px, ${currentY}px, 0)`;
  }
}

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// Handle messages from background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "requestSelectedText") {
    const selectedText = window.getSelection().toString().trim();
    sendResponse({ text: selectedText });
    return true;
  }

  if (request.action === "showPlayerLoading") {
    createFloatingPlayer();
    const progressInfo = document.getElementById('speechie-progress-info');
    if (progressInfo) progressInfo.textContent = 'Processing...';
  }

  if (request.action === "audioReady") {
    if (!speechiePlayer) createFloatingPlayer();
    
    speechieAudio.src = request.audioUrl;
    const progressInfo = document.getElementById('speechie-progress-info');
    if (progressInfo) progressInfo.textContent = 'Ready';
    speechieAudio.play();
  }

  if (request.action === "audioFailed") {
    if (!speechiePlayer) createFloatingPlayer();
    const progressInfo = document.getElementById('speechie-progress-info');
    if (progressInfo) progressInfo.textContent = 'Failed to load audio';
  }

  if (request.action === "noTextSelected") {
    if (!speechiePlayer) createFloatingPlayer();
    const progressInfo = document.getElementById('speechie-progress-info');
    if (progressInfo) progressInfo.textContent = 'No text selected';
    setTimeout(() => {
      if (speechiePlayer) {
        speechiePlayer.remove();
        speechiePlayer = null;
      }
    }, 3000);
  }

  if (request.action === "togglePlayPause") {
    if (speechieAudio) {
      if (speechieAudio.paused) {
        speechieAudio.play();
      } else {
        speechieAudio.pause();
      }
    }
  }

  if (request.action === "closePlayer") {
    if (speechiePlayer) {
      speechiePlayer.remove();
      speechiePlayer = null;
    }
  }
});

// Initialize on page load
if (!speechiePlayer) {
  // Player is created on demand via messages
}

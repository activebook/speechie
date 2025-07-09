document.addEventListener("DOMContentLoaded", () => {
  // --- Element Selection ---
  const audioPlayer = document.getElementById("audio-player");
  const playPauseButton = document.getElementById("play-pause-button");
  const playIcon = document.getElementById("play-icon");
  const pauseIcon = document.getElementById("pause-icon");
  const speedControl = document.getElementById("speed-control");
  const speedLabel = document.getElementById("speed-label");
  const closeButton = document.getElementById("close-button");
  const statusContainer = document.getElementById("status-container");
  const statusText = document.getElementById("status-text");
  const playbackSpeedContainer = document.getElementById("playback-speed");
  const progressContainer = document.getElementById("progress-container");
  const progressBarContainer = document.getElementById("progress-bar-container");
  const progressBarFill = document.getElementById("progress-bar-fill");
  // CHANGE: Get the new time elements
  const currentTimeEl = document.getElementById("current-time");
  const totalDurationEl = document.getElementById("total-duration");
  // CHANGE: Get the new download button
  const downloadButton = document.getElementById("download-button");

  // --- Utility Functions ---
  
  // CHANGE: New utility to format seconds into M:SS format
  function formatTime(seconds) {
    if (isNaN(seconds) || seconds < 0) return "0:00";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${String(remainingSeconds).padStart(2, '0')}`;
  }

  function setPlayerState(state, message = "") {
    playPauseButton.disabled = true;
    statusContainer.style.display = "block";
    playbackSpeedContainer.style.display = "none";
    progressContainer.style.display = "none"; // Hide the whole progress container
    downloadButton.style.display = "none"; // CHANGE: Hide download button by default

    if (state === "loading") {
      statusText.textContent = "Processing...";
      statusText.style.color = "#555";
    } else if (state === "ready") {
      playPauseButton.disabled = false;
      statusContainer.style.display = "none";
      playbackSpeedContainer.style.display = "flex";
      progressContainer.style.display = "flex"; // Show the progress container
      downloadButton.style.display = "flex"; // CHANGE: Show download button when ready
      updatePlayPauseIcon();
    } else if (state === "error") {
      statusText.textContent = message || "Synthesis Failed";
      statusText.style.color = "#d93025";
    }
  }
  
  function closePlayer() {
    window.parent.postMessage({ action: "closePlayer" }, "*");
  }

  function togglePlayPause() {
    if (audioPlayer.src && (audioPlayer.paused || audioPlayer.ended)) {
      audioPlayer.play();
    } else {
      audioPlayer.pause();
    }
  }

  function updatePlayPauseIcon() {
    playIcon.style.display = audioPlayer.paused || !audioPlayer.src ? "block" : "none";
    pauseIcon.style.display = audioPlayer.paused || !audioPlayer.src ? "none" : "block";
  }
  
  function updateProgressBar() {
    if (audioPlayer.duration) {
      const progressPercentage = (audioPlayer.currentTime / audioPlayer.duration) * 100;
      progressBarFill.style.width = `${progressPercentage}%`;
      // CHANGE: Update the current time text while the bar updates
      currentTimeEl.textContent = formatTime(audioPlayer.currentTime);
    }
  }

  function seek(event) {
    if (audioPlayer.duration) {
      const rect = progressBarContainer.getBoundingClientRect();
      audioPlayer.currentTime = ((event.clientX - rect.left) / rect.width) * audioPlayer.duration;
    }
  }

  // --- Event Listeners ---
  playPauseButton.addEventListener("click", togglePlayPause);
  audioPlayer.addEventListener("play", updatePlayPauseIcon);
  audioPlayer.addEventListener("pause", updatePlayPauseIcon);
  audioPlayer.addEventListener("ended", updatePlayPauseIcon);
  audioPlayer.addEventListener("timeupdate", updateProgressBar);
  progressBarContainer.addEventListener("click", seek);
  
  // CHANGE: Listen for when the audio metadata (like duration) is loaded
  audioPlayer.addEventListener("loadedmetadata", () => {
    totalDurationEl.textContent = formatTime(audioPlayer.duration);
  });

  speedControl.addEventListener("input", () => {
    audioPlayer.playbackRate = parseFloat(speedControl.value);
    speedLabel.textContent = `${audioPlayer.playbackRate.toFixed(1)}x`;
  });

  closeButton.addEventListener("click", closePlayer);

  window.addEventListener("message", (event) => {
    const { action, audioUrl } = event.data;

    if (action === "noTextSelected") {
      audioPlayer.src = "";
      audioPlayer.duration = 0;
      setPlayerState("error", "No text selected");
      setTimeout(closePlayer, 3000);
    } else if (audioUrl) {
      audioPlayer.src = audioUrl;
      setPlayerState("ready");
      // CHANGE: Set up the download button
      downloadButton.href = audioUrl;
      downloadButton.setAttribute('download', 'speechie_audio.mp3'); // Set a default filename
      audioPlayer.play().catch(e => console.error("Autoplay failed:", e));
    } else if (action === "togglePlayPause") {
      togglePlayPause();
    } else if (action === "showError") {
      setPlayerState("error");
    }
  });

  // --- Initial State ---
  setPlayerState("loading");
  updatePlayPauseIcon();
});
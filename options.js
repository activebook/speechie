document.addEventListener("DOMContentLoaded", () => {
  const apiKeyInput = document.getElementById("api-key");
  const voiceSelection = document.getElementById("voice-selection");
  const saveButton = document.getElementById("save-button");
  const statusMessage = document.getElementById("status-message");
  const togglePasswordBtn = document.getElementById("toggle-password");
  const togglePasswordIcon = document.getElementById("eye-icon");
  const saveIcon = document.getElementById("save-icon");

  // Load saved settings
  chrome.storage.sync.get(["apiKey", "voice"], (result) => {
    if (result.apiKey) {
      apiKeyInput.value = result.apiKey;
    }
    if (result.voice) {
      voiceSelection.value = result.voice;
    }
  });

  // Show status message
  function showStatus(message, isSuccess = true) {
    statusMessage.textContent = message;
    statusMessage.className = `status-message ${isSuccess ? 'success' : 'error'} show`;
    
    setTimeout(() => {
      statusMessage.classList.remove('show');
    }, 3000);
  }

  // Save settings with enhanced feedback
  saveButton.addEventListener("click", () => {
    const apiKey = apiKeyInput.value.trim();
    const voice = voiceSelection.value;

    if (!apiKey) {
      showStatus("Please enter your API key", false);
      apiKeyInput.focus();
      return;
    }

    if (!voice) {
      showStatus("Please select a voice", false);
      voiceSelection.focus();
      return;
    }

    // Show saving state
    saveButton.innerHTML = '<svg class="svg-icon spinner" viewBox="0 0 512 512"><path d="M304 48a48 48 0 1 1-96 0 48 48 0 0 1 96 0zm-48 368a48 48 0 1 0 0 96 48 48 0 0 0 0-96zm208-208a48 48 0 1 0-96 0 48 48 0 0 0 96 0zM96 256a48 48 0 1 0 0-96 48 48 0 0 0 0 96zm13 99a48 48 0 1 0-72 42l181 189 72-42L109 355zm350-125a48 48 0 1 0-72-42L188 380l72 42 179-191z"/></svg> Saving...';
    saveButton.disabled = true;

    chrome.storage.sync.set({ apiKey, voice }, () => {
      // Reset button state
      saveButton.innerHTML = '<span id="save-icon"><svg class="svg-icon" viewBox="0 0 512 512"><path d="M173.898 439.404l-166.4-166.4c-9.997-9.997-9.997-26.206 0-36.204l36.203-36.204c9.997-9.998 26.207-9.998 36.204 0L192 312.69 432.095 72.596c9.997-9.997 26.207-9.997 36.204 0l36.203 36.204c9.997 9.997 9.997 26.206 0 36.204l-294.4 294.401c-9.998 9.997-26.207 9.997-36.204-.001z"/></svg></span> Save Settings';
      saveButton.disabled = false;
      
      // Show success message
      showStatus("Settings saved successfully!", true);
      
      // Add subtle animation to button
      saveButton.style.transform = 'scale(0.95)';
      setTimeout(() => {
        saveButton.style.transform = 'scale(1)';
      }, 150);
    });
  });

  // Auto-save on API key input blur
  apiKeyInput.addEventListener("blur", () => {
    const currentApiKey = apiKeyInput.value.trim();
    chrome.storage.sync.get(["apiKey"], (result) => {
      if (result.apiKey !== currentApiKey && currentApiKey) {
        chrome.storage.sync.set({ apiKey: currentApiKey });
      }
    });
  });

  // Auto-save on voice selection change
  voiceSelection.addEventListener("change", () => {
    const currentVoice = voiceSelection.value;
    if (currentVoice) {
      chrome.storage.sync.set({ voice: currentVoice });
    }
  });

  // Add keyboard shortcuts
  apiKeyInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      saveButton.click();
    }
  });

  // Enhanced validation
  apiKeyInput.addEventListener("input", () => {
    const value = apiKeyInput.value.trim();
    if (value && value.length < 10) {
      apiKeyInput.style.borderColor = '#ff6b6b';
    } else {
      apiKeyInput.style.borderColor = '';
    }
  });

  // Password visibility toggle
  togglePasswordBtn.addEventListener("click", () => {
    const type = apiKeyInput.getAttribute("type") === "password" ? "text" : "password";
    apiKeyInput.setAttribute("type", type);
    
    // Toggle eye icon
    if (type === "password") {
      togglePasswordIcon.innerHTML = '<path d="M572.52 241.4C518.29 135.59 410.93 64 288 64S57.68 135.64 3.48 241.41a32.35 32.35 0 0 0 0 29.19C57.71 376.41 165.07 448 288 448s230.32-71.64 284.52-177.41a32.35 32.35 0 0 0 0-29.19zM288 400a144 144 0 1 1 144-144 143.93 143.93 0 0 1-144 144zm0-240a95.31 95.31 0 0 0-25.31 2.66 47.89 47.89 0 0 1-60.05 60.05A95.32 95.32 0 0 0 176 288a96 96 0 1 0 96-96c0-1.31-.06-2.61-.09-3.91a48 48 0 0 1 29.19-44.19 96 96 0 0 0-75.1 130.1A95.92 95.92 0 0 0 288 160z"/>';
      togglePasswordBtn.setAttribute("aria-label", "Show password");
    } else {
      togglePasswordIcon.innerHTML = '<path stroke-width="2" stroke-miterlimit="10" d="M1,32c0,0,11,15,31,15s31-15,31-15S52,17,32,17	S1,32,1,32z"/><circle fill="none" stroke="#000000" stroke-width="2" stroke-miterlimit="10" cx="32" cy="32" r="7"/><line fill="none" stroke="#000000" stroke-width="2" stroke-miterlimit="10" x1="9" y1="55" x2="55" y2="9"/>';
      togglePasswordBtn.setAttribute("aria-label", "Hide password");
    }
    
    // Add subtle animation
    togglePasswordBtn.style.transform = 'translateY(-50%) rotate(180deg)';
    setTimeout(() => {
      togglePasswordBtn.style.transform = 'translateY(-50%) rotate(0deg)';
    }, 200);
  });

  // Add focus effects
  [apiKeyInput, voiceSelection].forEach(input => {
    input.addEventListener("focus", () => {
      input.parentElement.style.transform = "scale(1.02)";
    });
    
    input.addEventListener("blur", () => {
      input.parentElement.style.transform = "scale(1)";
    });
  });
});
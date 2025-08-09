
document.addEventListener("DOMContentLoaded", () => {
  const apiKeyInput = document.getElementById("api-key");
  const voiceSelection = document.getElementById("voice-selection");
  const saveButton = document.getElementById("save-button");
  const statusMessage = document.getElementById("status-message");

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
    saveButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
    saveButton.disabled = true;

    chrome.storage.sync.set({ apiKey, voice }, () => {
      // Reset button state
      saveButton.innerHTML = '<i class="fas fa-check"></i> Save Settings';
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

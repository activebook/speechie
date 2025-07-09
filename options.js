
document.addEventListener("DOMContentLoaded", () => {
  const apiKeyInput = document.getElementById("api-key");
  const voiceSelection = document.getElementById("voice-selection");
  const saveButton = document.getElementById("save-button");

  // Load saved settings
  chrome.storage.sync.get(["apiKey", "voice"], (result) => {
    if (result.apiKey) {
      apiKeyInput.value = result.apiKey;
    }
    if (result.voice) {
      voiceSelection.value = result.voice;
    }
  });

  // Save settings
  saveButton.addEventListener("click", () => {
    const apiKey = apiKeyInput.value;
    const voice = voiceSelection.value;
    chrome.storage.sync.set({ apiKey, voice }, () => {
      alert("Settings saved!");
    });
  });
});

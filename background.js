function showNotification(id, title, message, isPersistent = false) {
  chrome.notifications.create(id, { type: "basic", iconUrl: "images/icon48.png", title: title, message: message, requireInteraction: isPersistent });
}

function pollTaskStatus(taskId, apiKey, tabId) {
  return new Promise((resolve, reject) => {
    // Check every 3 seconds
    const pollingInterval = 3000;
    
    // Set a timeout for the whole polling process (e.g., 60 seconds)
    const pollingTimeout = setTimeout(() => {
        clearInterval(intervalId);
        chrome.notifications.clear("tts-progress");
        showNotification("tts-error", "Speechie Error", "Synthesis timed out. Please try again.", true);
        reject(new Error("Polling timed out after 60 seconds."));
    }, 60000);

    const intervalId = setInterval(async () => {
      try {
        const getTaskResponse = await fetch(`https://api.v8.unrealspeech.com/synthesisTasks/${taskId}`, { method: "GET", headers: { "Authorization": `Bearer ${apiKey}` } });
        if (!getTaskResponse.ok) {
          clearInterval(intervalId);
          clearTimeout(pollingTimeout);
          return reject(new Error(`API Error while polling: ${getTaskResponse.statusText}`));
        }
        const taskData = await getTaskResponse.json();
        const { TaskStatus, OutputUri } = taskData.SynthesisTask;

        if (TaskStatus === "completed") {
          clearInterval(intervalId);
          clearTimeout(pollingTimeout);
          chrome.notifications.clear("tts-progress");
          // CHANGE: Send a message to the existing player that the audio is ready.
          await chrome.tabs.sendMessage(tabId, { action: "audioReady", audioUrl: OutputUri });
          resolve();

        } else if (TaskStatus === "failed") {
          clearInterval(intervalId);
          clearTimeout(pollingTimeout);
          chrome.notifications.clear("tts-progress");
          showNotification("tts-error", "Speechie Error", "Audio synthesis failed.", true);
          // CHANGE: Also notify the player of the failure so it can update its UI.
          chrome.tabs.sendMessage(tabId, { action: "audioFailed" }).catch(() => {}); // Fail silently if player is closed
          reject(new Error("Audio synthesis failed."));
        }
        // If status is still "pending" or "in_progress", the interval will just continue.
      } catch (error) {
        clearInterval(intervalId);
        clearTimeout(pollingTimeout);
        // CHANGE: Also notify the player of the failure.
        chrome.tabs.sendMessage(tabId, { action: "audioFailed" }).catch(() => {});
        reject(error);
      }
    }, pollingInterval);
  });
}

async function processTextForTTS(text, tabId) {
  // CHANGE: New behavior for "no text selected"
  if (!text || text.trim() === "") {
    // Instead of a notification, tell the player to show the message and self-destruct.
    chrome.tabs.sendMessage(tabId, { action: "noTextSelected" }).catch(() => {});
    return;
  }
  const { apiKey, voice } = await chrome.storage.sync.get(["apiKey", "voice"]);
  if (!apiKey) {
    showNotification("tts-error", "Speechie Error", "API Key not set. Please set it in options.", true);
    chrome.tabs.sendMessage(tabId, { action: "closePlayer" }).catch(() => {});
    chrome.runtime.openOptionsPage();
    return;
  }
  const voiceId = voice || "Melody";
  showNotification("tts-progress", "Speechie", "Processing your text...");
  try {
    const createTaskResponse = await fetch("https://api.v8.unrealspeech.com/synthesisTasks", {
      method: "POST",
      headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ Text: text, VoiceId: voiceId, Bitrate: "192k" }),
    });
    if (!createTaskResponse.ok) {
      const errorData = await createTaskResponse.json();
      throw new Error(`API Error: ${errorData.message || createTaskResponse.statusText}`);
    }
    const taskData = await createTaskResponse.json();
    const taskId = taskData.SynthesisTask.TaskId;
    await pollTaskStatus(taskId, apiKey, tabId);
  } catch (error) {
    console.error("Speechie TTS Error:", error);
    showNotification("tts-error", "Speechie Error", `Failed to process TTS: ${error.message}`, true);
    chrome.tabs.sendMessage(tabId, { action: "audioFailed" }).catch(() => {});
  }
}

chrome.commands.onCommand.addListener(async (command, tab) => {
  if (command === "trigger_tts") {
    try {
      // CHANGE: First, immediately tell the content script to show the player in a loading state.
      // This provides instant feedback to the user.
      await chrome.tabs.sendMessage(tab.id, { action: "showPlayerLoading" });

      // Then, request the selected text and start the TTS process.
      const response = await chrome.tabs.sendMessage(tab.id, { action: "requestSelectedText" });
      await processTextForTTS(response?.text, tab.id);

    } catch (error) {
      if (error.message.includes("Receiving end does not exist")) {
        showNotification("script-error", "Speechie Error", "Cannot run on this page. Please reload the page and try again.", true);
      } else {
        console.error("Speechie command error:", error);
        showNotification("tts-error", "Speechie Error", "An unknown error occurred.");
      }
    }
  } else if (command === "toggle-play-pause") {
    try {
      await chrome.tabs.sendMessage(tab.id, { action: "togglePlayPause" });
    } catch (e) { /* Fail silently if the player isn't open */ }
  } else if (command === "show_player") {
    try {
      // Show the floating player without processing text
      await chrome.tabs.sendMessage(tab.id, { action: "showPlayerLoading" });
    } catch (error) {
      if (error.message.includes("Receiving end does not exist")) {
        showNotification("script-error", "Speechie Error", "Cannot run on this page. Please reload the page and try again.", true);
      } else {
        console.error("Speechie show player error:", error);
        showNotification("tts-error", "Speechie Error", "An unknown error occurred.");
      }
    }
  }
});
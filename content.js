chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "requestSelectedText") {
    const selectedText = window.getSelection().toString().trim();
    sendResponse({ text: selectedText });
    return true; 
  }

  // Pass messages through to the iframe
  if (
    request.action === "showPlayerLoading" || 
    request.action === "audioReady" || 
    request.action === "audioFailed" || 
    request.action === "togglePlayPause" ||
    request.action === "noTextSelected" // CHANGE: Added new action to relay
  ) {
    if (request.action === "showPlayerLoading") {
      createPlayer(); // Create the player frame first
    }
    const playerIframe = document.getElementById("speechie-player-iframe");
    if (playerIframe && playerIframe.contentWindow) {
      playerIframe.contentWindow.postMessage(request, "*");
    }
  }
  
  if (request.action === "closePlayer") {
    const existingPlayer = document.getElementById("speechie-player-iframe");
    if (existingPlayer) {
      existingPlayer.remove();
    }
  }
});

// CHANGE: This function now just creates the player frame. It doesn't need the audioUrl initially.
function createPlayer() {
  // Remove any old player first
  const existingPlayer = document.getElementById("speechie-player-iframe");
  if (existingPlayer) {
    existingPlayer.remove();
  }
  
  const iframe = document.createElement("iframe");
  iframe.id = "speechie-player-iframe";
  iframe.src = chrome.runtime.getURL("player.html");

  Object.assign(iframe.style, {
    position: "fixed",
    top: "20px",
    right: "20px",
    width: "320px",
    height: "100px",
    border: "none",
    zIndex: "2147483647",
    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
    borderRadius: "8px",
  });

  document.body.appendChild(iframe);
  // No onload message needed anymore, the player will handle its own initial state.
}

// CHANGE: Add a listener for messages from the iframe (e.g., the close button).
window.addEventListener("message", (event) => {
  // Very basic security check: ensure the message is what we expect.
  if (event.data.action === "closePlayer") {
    const playerIframe = document.getElementById("speechie-player-iframe");
    if (playerIframe) {
      playerIframe.remove();
    }
  }
});

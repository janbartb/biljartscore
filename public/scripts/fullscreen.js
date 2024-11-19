// When going to fullscreen programmatically then pressing Esc will exit fullscreen.
// This script prevents that from happening.

// Feature detection.
const supportsKeyboardLock =
    ('keyboard' in navigator) && ('lock' in navigator.keyboard);

if (supportsKeyboardLock) {
  document.addEventListener('fullscreenchange', async () => {
    if (document.fullscreenElement) {
      // The magic happens here… 🦄
      await navigator.keyboard.lock(['Escape']);
      console.log('Keyboard locked.');
      return;
    }
    navigator.keyboard.unlock();
    console.log('Keyboard unlocked.');
  });
}

const messageSentSound = new Audio('/sounds/message-sent.mp3');
const messageReceivedSound = new Audio('/sounds/message-received.mp3');

messageSentSound.volume = 0.5;
messageReceivedSound.volume = 0.5;

export function playMessageSent() {
  try {
    messageSentSound.currentTime = 0;
    messageSentSound.play().catch(() => {});
  } catch (e) {}
}

export function playMessageReceived() {
  try {
    messageReceivedSound.currentTime = 0;
    messageReceivedSound.play().catch(() => {});
  } catch (e) {}
}

export function authorizeVoicePayment(voiceHash, storedHash) {
  return voiceHash === storedHash;
}

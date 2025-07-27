import React, { useEffect } from "react";

const SpeechSynthesis = ({ text, onEnd }) => {
  useEffect(() => {
    if (!text) return;
    if (!("speechSynthesis" in window)) {
      console.warn("Speech Synthesis API not supported");
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1;
    utterance.pitch = 1;

    utterance.onend = () => {
      if (onEnd) onEnd();
    };

    window.speechSynthesis.speak(utterance);

    return () => {
      window.speechSynthesis.cancel();
    };
  }, [text, onEnd]);

  return null;
};

export default SpeechSynthesis;
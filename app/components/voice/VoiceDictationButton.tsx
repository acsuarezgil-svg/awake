"use client";

import { useEffect, useRef, useState } from "react";

import type {
  AwakeSpeechRecognition,
  AwakeSpeechRecognitionErrorEvent,
  AwakeSpeechRecognitionEvent,
} from "./speechRecognition";

type VoiceDictationButtonProps = {
  value: string;
  onChange: (value: string) => void;
  language?: string;
  disabled?: boolean;
};

function appendTranscript(existing: string, addition: string) {
  const left = existing.trimEnd();
  const right = addition.trim().replace(/\s+([,.!?;:])/g, "$1");
  if (!right) return existing;
  if (!left) return right;
  const needsSpace = !/\s$/.test(existing) && !/^[,.!?;:]/.test(right);
  return `${left}${needsSpace ? " " : ""}${right}`;
}

export default function VoiceDictationButton({
  value,
  onChange,
  language = "en-US",
  disabled = false,
}: VoiceDictationButtonProps) {
  const [supported, setSupported] = useState<boolean | null>(null);
  const [listening, setListening] = useState(false);
  const [interim, setInterim] = useState("");
  const [message, setMessage] = useState("");
  const recognitionRef = useRef<AwakeSpeechRecognition | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const startingValueRef = useRef("");
  const finalTranscriptRef = useRef("");
  const canceledRef = useRef(false);

  useEffect(() => {
    // Browser capability is intentionally discovered only after hydration.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSupported(
      typeof (window.SpeechRecognition ?? window.webkitSpeechRecognition) !==
        "undefined",
    );
    return () => {
      recognitionRef.current?.abort();
      recognitionRef.current = null;
    };
  }, []);

  function finish() {
    setListening(false);
    setInterim("");
    recognitionRef.current = null;
    window.setTimeout(() => buttonRef.current?.focus(), 0);
  }

  function start() {
    if (disabled || listening) return;
    const Constructor =
      window.SpeechRecognition ?? window.webkitSpeechRecognition;
    if (!Constructor) return;

    const recognition = new Constructor();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = language;
    startingValueRef.current = value;
    finalTranscriptRef.current = "";
    canceledRef.current = false;
    setMessage("");
    setInterim("");

    recognition.onresult = (event: AwakeSpeechRecognitionEvent) => {
      let finalized = "";
      let currentInterim = "";
      for (let index = 0; index < event.results.length; index += 1) {
        const result = event.results[index];
        const transcript = result[0]?.transcript ?? "";
        if (result.isFinal) finalized += transcript;
        else currentInterim += transcript;
      }
      if (finalized.trim()) {
        finalTranscriptRef.current = appendTranscript(
          finalTranscriptRef.current,
          finalized,
        );
        onChange(
          appendTranscript(
            startingValueRef.current,
            finalTranscriptRef.current,
          ),
        );
      }
      setInterim(currentInterim.trim());
    };
    recognition.onerror = (event: AwakeSpeechRecognitionErrorEvent) => {
      if (event.error === "aborted" && canceledRef.current) return;
      setMessage(
        event.error === "not-allowed" || event.error === "service-not-allowed"
          ? "Awake couldn’t access the microphone. You can allow access in your browser settings or continue by typing."
          : "Voice input paused. You can try again or continue by typing.",
      );
    };
    recognition.onend = finish;
    recognitionRef.current = recognition;
    setListening(true);
    recognition.start();
  }

  function stop() {
    recognitionRef.current?.stop();
  }

  function cancel() {
    canceledRef.current = true;
    recognitionRef.current?.abort();
    onChange(startingValueRef.current);
    setMessage("Voice input canceled. Your earlier words are still here.");
    finish();
  }

  if (supported === null) return null;
  if (!supported) {
    return (
      <p className="awake-supporting text-sm" role="status">
        Voice input isn’t available in this browser. You can still enter your
        thoughts below.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {!listening ? (
          <button
            ref={buttonRef}
            type="button"
            onClick={start}
            disabled={disabled}
            className="awake-button awake-button-secondary"
            aria-pressed="false"
          >
            <span aria-hidden="true">●</span>
            Start speaking
          </button>
        ) : (
          <>
            <button
              ref={buttonRef}
              type="button"
              onClick={stop}
              className="awake-button awake-button-primary"
              aria-pressed="true"
            >
              <span
                className="h-2.5 w-2.5 animate-pulse rounded-full bg-current motion-reduce:animate-none"
                aria-hidden="true"
              />
              Stop
            </button>
            <button
              type="button"
              onClick={cancel}
              className="awake-button awake-button-quiet"
            >
              Cancel
            </button>
          </>
        )}
      </div>
      <div className="awake-supporting min-h-5 text-sm" aria-live="polite">
        {listening
          ? `Listening… ${interim || "Speak naturally."}`
          : message}
      </div>
    </div>
  );
}

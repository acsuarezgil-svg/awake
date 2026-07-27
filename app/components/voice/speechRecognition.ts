export type AwakeSpeechRecognitionEvent = Event & {
  results: {
    length: number;
    [index: number]: {
      isFinal: boolean;
      [index: number]: { transcript: string };
    };
  };
};

export type AwakeSpeechRecognitionErrorEvent = Event & {
  error: string;
};

export interface AwakeSpeechRecognition {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((event: AwakeSpeechRecognitionEvent) => void) | null;
  onerror: ((event: AwakeSpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
}

export type AwakeSpeechRecognitionConstructor =
  new () => AwakeSpeechRecognition;

declare global {
  interface Window {
    SpeechRecognition?: AwakeSpeechRecognitionConstructor;
    webkitSpeechRecognition?: AwakeSpeechRecognitionConstructor;
  }
}


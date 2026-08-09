"use client";

import { useRef, useState } from "react";

// Minimale Typen für die Web Speech API (nicht in den DOM-Libs enthalten).
type SpeechRecognitionResultLike = {
  0: { transcript: string };
  isFinal: boolean;
};
type SpeechRecognitionEventLike = {
  resultIndex: number;
  results: { length: number; [i: number]: SpeechRecognitionResultLike };
};
type SpeechRecognitionLike = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  abort?: () => void;
  onresult: ((e: SpeechRecognitionEventLike) => void) | null;
  onerror: ((e: { error?: string }) => void) | null;
  onend: (() => void) | null;
};
type SpeechRecognitionCtor = new () => SpeechRecognitionLike;

function getCtor(): SpeechRecognitionCtor | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    SpeechRecognition?: SpeechRecognitionCtor;
    webkitSpeechRecognition?: SpeechRecognitionCtor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export function useSpeech(lang = "de-DE") {
  // Lazy-Init: erst beim ersten Client-Render ausgewertet (window vorhanden).
  // Die Vorlese-UI erscheint ohnehin erst nach einem Fetch, also lange nach
  // der Hydration — kein Mismatch.
  const [supported] = useState(() => getCtor() !== null);
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState<string | null>(null);
  const recRef = useRef<SpeechRecognitionLike | null>(null);

  function start() {
    // Doppel-Start vermeiden (führt sonst zu InvalidStateError).
    if (recRef.current) return;
    const Ctor = getCtor();
    if (!Ctor) {
      setError("Spracherkennung wird von diesem Browser nicht unterstützt.");
      return;
    }
    setError(null);
    setTranscript("");
    const rec = new Ctor();
    rec.lang = lang;
    rec.continuous = true;
    rec.interimResults = true;
    let finalText = "";
    rec.onresult = (e) => {
      let interim = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const res = e.results[i];
        if (res.isFinal) finalText += res[0].transcript + " ";
        else interim += res[0].transcript;
      }
      setTranscript((finalText + interim).trim());
    };
    rec.onerror = (ev) => {
      const err = ev.error ?? "unbekannt";
      // "aborted"/"no-speech" sind harmlos (z.B. beim manuellen Stoppen) –
      // nicht als Fehler anzeigen.
      if (err !== "aborted" && err !== "no-speech") {
        setError(
          err === "not-allowed" || err === "service-not-allowed"
            ? "Kein Mikrofon-Zugriff. Erlaube das Mikrofon (nur über localhost oder HTTPS möglich)."
            : `Fehler bei der Spracherkennung: ${err}`,
        );
      }
      recRef.current = null;
      setListening(false);
    };
    rec.onend = () => {
      recRef.current = null;
      setListening(false);
    };
    recRef.current = rec;
    try {
      rec.start();
      setListening(true);
    } catch {
      recRef.current = null;
      setListening(false);
    }
  }

  function stop() {
    const rec = recRef.current;
    // Sofort als „nicht mehr aktiv" markieren, damit die UI direkt reagiert –
    // unabhängig davon, ob onend zuverlässig feuert (iOS/Safari).
    recRef.current = null;
    setListening(false);
    try {
      rec?.stop();
      rec?.abort?.();
    } catch {
      // egal – Zustand ist bereits zurückgesetzt
    }
  }

  return { supported, listening, transcript, error, start, stop, setTranscript };
}

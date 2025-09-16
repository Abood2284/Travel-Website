"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

type SfxName = "print" | "ding" | "tear";
type Ctx = {
  enabled: boolean;
  toggle: () => void;
  play: (name: SfxName) => void;
};

const SoundCtx = createContext<Ctx>({
  enabled: true,
  toggle: () => {},
  play: () => {},
});

let AC: AudioContext | null = null;
function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  // @ts-ignore
  const Ctor = window.AudioContext || window.webkitAudioContext;
  if (!Ctor) return null;
  if (!AC) AC = new Ctor();
  return AC;
}

function blipPrint(ctx: AudioContext) {
  // fast square “clicky” tick
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = "square";
  o.frequency.value = 1400;
  g.gain.setValueAtTime(0.0001, ctx.currentTime);
  g.gain.exponentialRampToValueAtTime(0.05, ctx.currentTime + 0.005);
  g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.06);
  o.connect(g).connect(ctx.destination);
  o.start();
  o.stop(ctx.currentTime + 0.08);
}

function blipDing(ctx: AudioContext) {
  // quick confirmation
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = "sine";
  o.frequency.setValueAtTime(880, ctx.currentTime);
  o.frequency.exponentialRampToValueAtTime(1320, ctx.currentTime + 0.12);
  g.gain.setValueAtTime(0.0001, ctx.currentTime);
  g.gain.exponentialRampToValueAtTime(0.06, ctx.currentTime + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.18);
  o.connect(g).connect(ctx.destination);
  o.start();
  o.stop(ctx.currentTime + 0.2);
}

function blipTear(ctx: AudioContext) {
  // short noise burst
  const bufferSize = 2048;
  const noise = ctx.createScriptProcessor(bufferSize, 1, 1);
  noise.onaudioprocess = (e) => {
    const out = e.outputBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++)
      out[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
  };
  const g = ctx.createGain();
  g.gain.value = 0.15;
  noise.connect(g).connect(ctx.destination);
  setTimeout(() => {
    noise.disconnect();
    g.disconnect();
  }, 80);
}

export function SoundProvider({
  children,
  persistKey = "ui.sfx.enabled",
  defaultEnabled = true,
}: {
  children: React.ReactNode;
  persistKey?: string;
  defaultEnabled?: boolean;
}) {
  const [enabled, setEnabled] = useState(defaultEnabled);
  // restore
  useEffect(() => {
    try {
      const v = localStorage.getItem(persistKey);
      if (v != null) setEnabled(v === "1");
    } catch {}
  }, [persistKey]);
  // persist
  useEffect(() => {
    try {
      localStorage.setItem(persistKey, enabled ? "1" : "0");
    } catch {}
  }, [persistKey, enabled]);

  const toggle = useCallback(() => {
    // iOS: resume suspended context on first gesture
    const ctx = getCtx();
    // resume softly if needed
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    ctx?.resume?.();
    setEnabled((e) => !e);
  }, []);

  const play = useCallback(
    (name: SfxName) => {
      if (!enabled) return;
      const ctx = getCtx();
      if (!ctx) return;
      switch (name) {
        case "print":
          blipPrint(ctx);
          break;
        case "ding":
          blipDing(ctx);
          break;
        case "tear":
          blipTear(ctx);
          break;
      }
    },
    [enabled]
  );

  const value = useMemo<Ctx>(
    () => ({ enabled, toggle, play }),
    [enabled, toggle, play]
  );
  return <SoundCtx.Provider value={value}>{children}</SoundCtx.Provider>;
}

export const useSound = () => useContext(SoundCtx);

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
type SampleName = "jet";
type PlaySampleOptions = {
  start?: number;
  duration?: number;
  volume?: number; // 0..1
  fadeMs?: number;
};
type StopSampleOptions = { fadeMs?: number };
type Ctx = {
  enabled: boolean;
  toggle: () => void;
  play: (name: SfxName) => void;
  playSample: (name: SampleName, opts?: PlaySampleOptions) => void;
  stopSample: (name: SampleName, opts?: StopSampleOptions) => void;
};

const SoundCtx = createContext<Ctx>({
  enabled: true,
  toggle: () => {},
  play: () => {},
  playSample: () => {},
  stopSample: () => {},
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
  // sample registry
  const buffersRef = useRef<Map<SampleName, AudioBuffer>>(new Map());
  const activeRef = useRef<
    Map<
      SampleName,
      { source: AudioBufferSourceNode; gain: GainNode; stopTimer?: number }
    >
  >(new Map());
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

  // ----- Sample loading & control -----
  const loadSample = useCallback(async (name: SampleName) => {
    if (buffersRef.current.has(name)) return buffersRef.current.get(name)!;
    const ctx = getCtx();
    if (!ctx) throw new Error("AudioContext not available");
    const pathMap: Record<SampleName, string> = {
      jet: "/sounds/fighter-jet-overhead.mp3",
    };
    const url = pathMap[name];
    const res = await fetch(url);
    const data = await res.arrayBuffer();
    const buf = await ctx.decodeAudioData(data);
    buffersRef.current.set(name, buf);
    return buf;
  }, []);

  const playSample = useCallback(
    async (name: SampleName, opts?: PlaySampleOptions) => {
      if (!enabled) return;
      const ctx = getCtx();
      if (!ctx) return;
      // resume softly on gesture-driven flows
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      ctx.resume?.();
      try {
        const buffer = await loadSample(name);
        // stop any existing instance first
        const existing = activeRef.current.get(name);
        if (existing) {
          try {
            existing.source.stop();
            existing.gain.disconnect();
          } catch {}
          activeRef.current.delete(name);
        }
        const source = ctx.createBufferSource();
        source.buffer = buffer;
        const gain = ctx.createGain();
        const now = ctx.currentTime;
        const volume = Math.max(0, Math.min(1, opts?.volume ?? 0.6));
        const fadeSec = Math.max(0, (opts?.fadeMs ?? 150) / 1000);
        gain.gain.cancelScheduledValues(now);
        gain.gain.setValueAtTime(0.0001, now);
        if (fadeSec > 0)
          gain.gain.exponentialRampToValueAtTime(volume, now + fadeSec);
        else gain.gain.setValueAtTime(volume, now);
        source.connect(gain).connect(ctx.destination);
        const offset = Math.max(0, opts?.start ?? 0);
        const dur = Math.max(0.01, opts?.duration ?? buffer.duration - offset);
        source.start(now, offset, Math.min(dur, buffer.duration - offset));
        // stop timer to ensure cleanup even if not explicitly stopped
        const stopTimer = window.setTimeout(() => {
          try {
            source.stop();
            gain.disconnect();
          } catch {}
          activeRef.current.delete(name);
        }, Math.ceil((dur + 0.05) * 1000));
        source.onended = () => {
          window.clearTimeout(stopTimer);
          try {
            gain.disconnect();
          } catch {}
          activeRef.current.delete(name);
        };
        activeRef.current.set(name, { source, gain, stopTimer });
      } catch (e) {
        // swallow
      }
    },
    [enabled, loadSample]
  );

  const stopSample = useCallback(
    (name: SampleName, opts?: StopSampleOptions) => {
      const ctx = getCtx();
      if (!ctx) return;
      const inst = activeRef.current.get(name);
      if (!inst) return;
      const now = ctx.currentTime;
      const fadeSec = Math.max(0, (opts?.fadeMs ?? 120) / 1000);
      try {
        inst.gain.gain.cancelScheduledValues(now);
        if (fadeSec > 0)
          inst.gain.gain.exponentialRampToValueAtTime(0.0001, now + fadeSec);
        else inst.gain.gain.setValueAtTime(0.0001, now);
      } catch {}
      const stopAt = now + (fadeSec > 0 ? fadeSec : 0.01);
      try {
        inst.source.stop(stopAt);
      } catch {}
      window.setTimeout(() => {
        try {
          inst.gain.disconnect();
        } catch {}
        activeRef.current.delete(name);
      }, Math.ceil((fadeSec + 0.02) * 1000));
    },
    []
  );

  const value = useMemo<Ctx>(
    () => ({ enabled, toggle, play, playSample, stopSample }),
    [enabled, toggle, play, playSample, stopSample]
  );
  return <SoundCtx.Provider value={value}>{children}</SoundCtx.Provider>;
}

export const useSound = () => useContext(SoundCtx);

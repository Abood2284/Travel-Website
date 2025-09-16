"use client";
import React from "react";
import { useSound } from "./SoundProvider";

export default function SoundToggleFloating() {
  const { enabled, toggle } = useSound();
  return (
    <button
      aria-pressed={enabled}
      aria-label={enabled ? "Mute receipt sounds" : "Unmute receipt sounds"}
      onClick={toggle}
      className="fixed left-3 bottom-3 z-[60] select-none rounded-full border border-black/20 bg-white/90 px-3 py-1.5 text-black text-sm shadow-md backdrop-blur hover:bg-white"
      title="Receipt sounds"
    >
      <span style={{ marginRight: 8 }}>{enabled ? "🔊" : "🔈"}</span>
      <span>{enabled ? "Sound on" : "Sound off"}</span>
      <style jsx>{`
        button {
          font-weight: 600;
        }
      `}</style>
    </button>
  );
}

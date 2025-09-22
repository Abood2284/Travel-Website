"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";

type Props = {
  /** Optional default ref to prefill when there’s no ?ref= in the URL */
  initialRef?: string;
  /** Where to send users after submit. Example: "/pay-invoice" or your Worker edge route */
  payPath?: string;
};

const REF_REGEX = /^[A-Za-z0-9-]{6,24}$/;

export default function HaveInvoiceSection({
  initialRef = "INV-AX7Q9K",
  payPath = "/pay-invoice",
}: Props) {
  const params = useSearchParams();
  const qsRef = params?.get("ref") ?? "";
  const [ref, setRef] = React.useState<string>(qsRef || initialRef);

  // Minimal “recognized” hints. Replace with real lookup later if needed.
  const recognized = React.useMemo(() => {
    return { to: " - - -", amount: " - - -", date: " - - -" };
  }, [ref]);

  // Paste-to-fill from anywhere on the page
  React.useEffect(() => {
    const onPaste = (e: ClipboardEvent) => {
      const text = e.clipboardData?.getData("text")?.trim() || "";
      if (REF_REGEX.test(text)) setRef(text.toUpperCase());
    };
    document.addEventListener("paste", onPaste);
    return () => document.removeEventListener("paste", onPaste);
  }, []);

  // Drag-to-pay affordance
  const drag = React.useRef<{ on: boolean; startX: number }>({
    on: false,
    startX: 0,
  });
  const btnRef = React.useRef<HTMLButtonElement | null>(null);

  function onPointerDown(e: React.PointerEvent<HTMLButtonElement>) {
    drag.current.on = true;
    drag.current.startX = e.clientX;
    (e.currentTarget as HTMLButtonElement).setPointerCapture(e.pointerId);
  }
  function onPointerMove(e: React.PointerEvent<HTMLButtonElement>) {
    if (!drag.current.on) return;
    const dx = Math.max(0, e.clientX - drag.current.startX);
    e.currentTarget.style.transform = `translateX(${dx}px)`;
  }
  function onPointerUp(e: React.PointerEvent<HTMLButtonElement>) {
    if (!drag.current.on) return;
    drag.current.on = false;
    (e.currentTarget as HTMLButtonElement).releasePointerCapture(e.pointerId);
    const el = e.currentTarget;
    const dx = parseFloat(el.style.transform.replace(/[^0-9.-]/g, "")) || 0;
    el.style.transform = "";
    if (dx > 120) {
      // Snap = pay
      safeRedirect(ref);
    }
  }

  function safeRedirect(value: string) {
    const clean = value.trim().toUpperCase();
    if (!REF_REGEX.test(clean)) return;
    const url = `${payPath}?ref=${encodeURIComponent(clean)}`;
    // Real life: server should 302 to gateway. Here we just navigate.
    window.location.href = url;
  }

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!REF_REGEX.test(ref)) {
      // trigger built-in validation hint if needed
      (
        e.currentTarget.querySelector("input[name='ref']") as HTMLInputElement
      )?.reportValidity();
      return;
    }
    safeRedirect(ref);
  }

  return (
    <section id="invoice" className="max-w-5xl mx-auto px-4 py-16">
      {/* Section Header */}
      <div className="text-center mb-12">
        <h2 className="font-black text-gray-900 mb-4 text-[48px] md:text-[90px] leading-[1.15] tracking-[0.3px]">
          Have an Invoice?
        </h2>
        <p className="text-gray-600 max-w-2xl mx-auto text-[14px] md:text-[20px]">
          Enter your invoice reference to view details and make a payment.
        </p>
      </div>

      <div className="rounded-2xl shadow-[0_0_0_1px_rgba(0,0,0,0.06),0_16px_48px_rgba(0,0,0,0.16)] bg-white/80 backdrop-blur-md">
        {/* Invoice Header */}
        <div className="p-6 flex items-center justify-between">
          <div className="text-sm text-zinc-600">INVOICE</div>
          <div className="text-xs text-zinc-500">Preview</div>
        </div>

        {/* Invoice Details */}
        <div className="px-6 pb-6">
          <h3 className="sr-only">Invoice Details</h3>
          <div className="rounded-xl border border-black/10 overflow-hidden bg-white">
            {/* Invoice Information */}
            <div className="p-6 grid grid-cols-2 gap-4">
              <div>
                <div className="text-xs uppercase text-zinc-500">
                  Invoice No
                </div>
                <div
                  className="font-mono text-lg tracking-tight will-change-transform text-zinc-600 md:text-zinc-700"
                  key={ref /* key forces tiny flip animation via CSS below */}
                >
                  {ref || "—"}
                </div>
              </div>
              <div>
                <div className="text-xs uppercase text-zinc-500">Date</div>
                <div className="text-lg text-zinc-600 md:text-zinc-700">
                  {recognized.date}
                </div>
              </div>
              <div>
                <div className="text-xs uppercase text-zinc-500">Bill To</div>
                <div className="truncate text-zinc-600 md:text-zinc-700">
                  {recognized.to}
                </div>
              </div>
              <div>
                <div className="text-xs uppercase text-zinc-500">Amount</div>
                <div className="text-lg text-zinc-600 md:text-zinc-700">
                  {recognized.amount}
                </div>
              </div>
            </div>

            {/* Perforation */}
            <div className="px-6">
              <div
                className="h-[2px]"
                style={{
                  backgroundImage:
                    "linear-gradient(90deg, rgba(0,0,0,.35) 50%, transparent 0)",
                  backgroundSize: "14px 2px",
                  backgroundRepeat: "repeat-x",
                }}
                aria-hidden="true"
              />
            </div>

            {/* Payment Section */}
            <div className="p-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="text-zinc-600 text-sm">
                <h4 className="sr-only">Payment Instructions</h4>
                Pay using reference{" "}
                <span className="font-mono">{ref || "INV-AX7Q9K"}</span>
              </div>

              <form
                onSubmit={submit}
                className="flex flex-col gap-3 md:flex-row md:items-center"
              >
                <label htmlFor="invoice-ref" className="sr-only">
                  Invoice reference
                </label>
                <input
                  id="invoice-ref"
                  name="ref"
                  required
                  pattern="[A-Za-z0-9\-]{6,24}"
                  placeholder="Type or paste ref…"
                  value={ref}
                  onChange={(e) => setRef(e.target.value.toUpperCase())}
                  className="h-11 w-full md:w-[min(52vw,360px)] px-3 rounded-md border border-black/10 focus:outline-none focus:ring-2 focus:ring-black/20"
                />
                <button
                  ref={btnRef}
                  type="submit"
                  onPointerDown={onPointerDown}
                  onPointerMove={onPointerMove}
                  onPointerUp={onPointerUp}
                  className="h-11 px-5 rounded-md bg-black text-white font-medium active:scale-[.98] touch-none select-none w-full md:w-auto"
                  title="Drag a little to 'tear' or just click to pay"
                >
                  Tear &amp; Pay
                </button>
              </form>
            </div>
          </div>

          <p className="mt-3 text-xs text-zinc-500">
            <strong>Tip:</strong> Paste an invoice reference anywhere on this
            page. We'll fill it in automatically.
          </p>
        </div>
      </div>

      {/* Tiny CSS bump for the invoice number flip */}
      <style jsx>{`
        [key] {
          animation: flip-enter 0.28s ease both;
          transform-origin: 50% 100%;
        }
        @keyframes flip-enter {
          0% {
            transform: rotateX(0deg);
          }
          50% {
            transform: rotateX(-90deg);
          }
          100% {
            transform: rotateX(0deg);
          }
        }
      `}</style>
    </section>
  );
}

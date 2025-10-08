"use client";

import { useState } from "react";

export default function NewInvoicePage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{
    id: string;
    receipt: string;
    status: string;
    amount_in_paise: number;
    currency: string;
    created_at: string | null;
  } | null>(null);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget as HTMLFormElement;
    setError(null);
    setResult(null);
    setIsSubmitting(true);

    const formData = new FormData(form);
    const amount = Number(formData.get("amount_in_paise"));

    if (!Number.isFinite(amount) || amount <= 0) {
      setError("Amount must be a positive number");
      setIsSubmitting(false);
      return;
    }

    const payload = {
      receipt: String(formData.get("receipt") || "").trim() || undefined,
      customer_name:
        String(formData.get("customer_name") || "").trim() || undefined,
      customer_email:
        String(formData.get("customer_email") || "").trim() || undefined,
      customer_phone:
        String(formData.get("customer_phone") || "").trim() || undefined,
      amount_in_paise: amount,
      currency: String(formData.get("currency") || "").trim() || undefined,
      provider: String(formData.get("provider") || "").trim() || undefined,
      notes: String(formData.get("notes") || "").trim() || undefined,
    };

    try {
      const res = await fetch("/api/admin/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data?.error || "Failed to create invoice");
        return;
      }

      // Handle cases where a 201 may return an empty body (e.g., certain edge runtimes)
      const data = await res.json().catch(() => null);
      if (data) {
        setResult(data);
      } else {
        setResult({
          id: "unknown",
          receipt: payload.receipt || "NEW",
          status: "draft",
          amount_in_paise: amount,
          currency: payload.currency || "INR",
          created_at: null,
        });
      }
      form.reset();
    } catch (e) {
      setError("Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <div className="mx-auto w-full max-w-3xl space-y-8 px-6 pb-16 pt-16">
        <header className="space-y-3">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1 text-[11px] font-semibold uppercase tracking-[0.4em] text-white/65">
            Invoices · New
          </span>
          <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
            Create invoice
          </h1>
          <p className="max-w-2xl text-sm text-white/65 sm:text-base">
            Fill the customer details and amount to create a draft invoice.
          </p>
        </header>

        <section className="rounded-3xl border border-white/12 bg-white/[0.05] p-6">
          <form onSubmit={onSubmit} className="grid gap-4">
            <div className="grid gap-2">
              <label className="text-[12px] uppercase tracking-[0.28em] text-white/60">
                Receipt (optional)
              </label>
              <input
                name="receipt"
                className="w-full rounded-xl border border-white/15 bg-black/30 px-3 py-2 outline-none focus:ring-2 focus:ring-white/40"
                placeholder="LW-2025-0042"
              />
            </div>

            <div className="grid gap-2 sm:grid-cols-2">
              <div className="grid gap-2">
                <label className="text-[12px] uppercase tracking-[0.28em] text-white/60">
                  Customer name
                </label>
                <input
                  name="customer_name"
                  className="w-full rounded-xl border border-white/15 bg-black/30 px-3 py-2 outline-none focus:ring-2 focus:ring-white/40"
                  placeholder="Jane Doe"
                />
              </div>
              <div className="grid gap-2">
                <label className="text-[12px] uppercase tracking-[0.28em] text-white/60">
                  Customer email
                </label>
                <input
                  name="customer_email"
                  type="email"
                  className="w-full rounded-xl border border-white/15 bg-black/30 px-3 py-2 outline-none focus:ring-2 focus:ring-white/40"
                  placeholder="jane@example.com"
                />
              </div>
            </div>

            <div className="grid gap-2">
              <label className="text-[12px] uppercase tracking-[0.28em] text-white/60">
                Customer phone
              </label>
              <input
                name="customer_phone"
                className="w-full rounded-xl border border-white/15 bg-black/30 px-3 py-2 outline-none focus:ring-2 focus:ring-white/40"
                placeholder="+91 98765 43210"
              />
            </div>

            <div className="grid gap-2 sm:grid-cols-2">
              <div className="grid gap-2">
                <label className="text-[12px] uppercase tracking-[0.28em] text-white/60">
                  Amount
                </label>
                <input
                  name="amount_in_paise"
                  inputMode="numeric"
                  className="w-full rounded-xl border border-white/15 bg-black/30 px-3 py-2 outline-none focus:ring-2 focus:ring-white/40"
                  placeholder=""
                  required
                />
              </div>
              <div className="grid gap-2">
                <label className="text-[12px] uppercase tracking-[0.28em] text-white/60">
                  Currency (3-letter)
                </label>
                <input
                  name="currency"
                  className="w-full rounded-xl border border-white/15 bg-black/30 px-3 py-2 outline-none focus:ring-2 focus:ring-white/40"
                  placeholder="INR"
                  defaultValue="INR"
                />
              </div>
            </div>

            <div className="grid gap-2 sm:grid-cols-2">
              <div className="grid gap-2">
                <label className="text-[12px] uppercase tracking-[0.28em] text-white/60">
                  Provider
                </label>
                <input
                  name="provider"
                  className="w-full rounded-xl border border-white/15 bg-black/30 px-3 py-2 outline-none focus:ring-2 focus:ring-white/40"
                  placeholder="mock"
                  defaultValue="mock"
                />
              </div>
              <div className="grid gap-2">
                <label className="text-[12px] uppercase tracking-[0.28em] text-white/60">
                  Notes
                </label>
                <input
                  name="notes"
                  className="w-full rounded-xl border border-white/15 bg-black/30 px-3 py-2 outline-none focus:ring-2 focus:ring-white/40"
                  placeholder="Optional notes"
                />
              </div>
            </div>

            {error ? (
              <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
                {error}
              </div>
            ) : (
              result && (
                <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300">
                  Created invoice {result.receipt} · {result.currency}{" "}
                  {result.amount_in_paise} · status {result.status}
                </div>
              )
            )}

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center justify-center rounded-2xl border border-white/15 bg-white px-4 py-2 font-semibold text-black transition disabled:opacity-60"
              >
                {isSubmitting ? "Creating…" : "Create invoice"}
              </button>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}

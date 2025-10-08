import { unstable_noStore as noStore } from "next/cache";
import { db } from "@/lib/db/client";
import { invoices } from "@/lib/db/schema";
import { desc } from "drizzle-orm";

type InvoiceRow = {
  id: string;
  receipt: string;
  customer_name: string | null;
  customer_email: string | null;
  customer_phone: string | null;
  amount_in_paise: number;
  currency: string;
  status: string;
  provider: string;
  created_at: Date | null;
};

function maskPhone(value: string | null) {
  if (!value) return "—";
  const digits = value.replace(/\D+/g, "");
  if (digits.length <= 3) return digits;
  const last3 = digits.slice(-3);
  return `${"x".repeat(Math.max(0, digits.length - 3))}${last3}`;
}

function formatAmount(amount: number, currency: string) {
  return `${currency} ${amount.toLocaleString("en-IN")}`;
}

export default async function AdminInvoicesPage() {
  noStore();

  const rows = await db
    .select({
      id: invoices.id,
      receipt: invoices.receipt,
      customer_name: invoices.customer_name,
      customer_email: invoices.customer_email,
      customer_phone: invoices.customer_phone,
      amount_in_paise: invoices.amount_in_paise,
      currency: invoices.currency,
      status: invoices.status,
      provider: invoices.provider,
      created_at: invoices.created_at,
    })
    .from(invoices)
    .orderBy(desc(invoices.created_at))
    .limit(200);

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <main className="mx-auto w-full max-w-7xl px-6 pb-16 pt-16">
        <header className="mb-8 space-y-3">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1 text-[11px] font-semibold uppercase tracking-[0.4em] text-white/65">
            Invoices · Ledger
          </span>
          <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
            All invoices
          </h1>
          <p className="max-w-2xl text-sm text-white/65 sm:text-base">
            A quick overview of issued invoices. Use the receipt to locate a
            record.
          </p>
        </header>

        <section className="rounded-3xl border border-white/12 bg-white/[0.05] p-2">
          <div className="overflow-x-auto">
            <table className="min-w-full border-separate border-spacing-0 text-left text-sm">
              <thead>
                <tr className="bg-white/5 text-[12px] uppercase tracking-[0.28em] text-white/45">
                  <th className="px-4 py-3 font-semibold">Receipt</th>
                  <th className="px-4 py-3 font-semibold">Customer</th>
                  <th className="px-4 py-3 font-semibold">Email</th>
                  <th className="px-4 py-3 font-semibold">Mobile</th>
                  <th className="px-4 py-3 font-semibold">Amount</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Provider</th>
                  <th className="px-4 py-3 font-semibold">Created</th>
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-4 py-6 text-center text-sm text-white/45"
                    >
                      No invoices yet.
                    </td>
                  </tr>
                ) : (
                  rows.map((row: InvoiceRow, index: number) => (
                    <tr
                      key={row.id}
                      className={
                        index % 2 === 0
                          ? "bg-white/3 text-white"
                          : "bg-black/20 text-white"
                      }
                    >
                      <td className="px-4 py-3 align-top font-mono">
                        {row.receipt}
                      </td>
                      <td className="px-4 py-3 align-top">
                        {row.customer_name || "—"}
                      </td>
                      <td className="px-4 py-3 align-top text-white/80">
                        {row.customer_email || "—"}
                      </td>
                      <td className="px-4 py-3 align-top text-white/80">
                        {maskPhone(row.customer_phone)}
                      </td>
                      <td className="px-4 py-3 align-top text-white">
                        {formatAmount(row.amount_in_paise, row.currency)}
                      </td>
                      <td className="px-4 py-3 align-top">
                        <span className="inline-flex items-center rounded-full bg-white/10 px-3 py-1 text-[12px] font-semibold uppercase tracking-[0.28em] text-white/80">
                          {row.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 align-top text-white/70">
                        {row.provider}
                      </td>
                      <td className="px-4 py-3 align-top text-white/60">
                        {row.created_at
                          ? new Date(row.created_at).toLocaleString()
                          : "—"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}

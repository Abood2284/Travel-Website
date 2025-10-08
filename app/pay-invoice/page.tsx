type PayInvoicePageProps = {
  searchParams?: Promise<{ ref?: string }>;
};

export default async function PayInvoicePage({
  searchParams,
}: PayInvoicePageProps) {
  const qs = searchParams ? await searchParams : null;
  const ref = typeof qs?.ref === "string" && qs.ref.length > 0 ? qs.ref : null;

  return (
    <main className="min-h-screen grid place-items-center bg-slate-50 text-slate-900 px-6">
      <div className="text-center space-y-3">
        <h1 className="text-2xl font-black tracking-tight sm:text-3xl">
          Under development
        </h1>
        <p className="text-sm text-slate-600 sm:text-base">
          We&apos;re updating our payment experience. Please check back soon.
        </p>
        {ref && (
          <div className="inline-flex items-center rounded-full border border-slate-300 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-slate-600">
            Ref&nbsp;#{ref}
          </div>
        )}
      </div>
    </main>
  );
}

import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";

import { db } from "@/lib/db/client";
import { invoices } from "@/lib/db/schema";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ receipt: string }> }
) {
  try {
    const { receipt } = await params;
    if (!receipt || typeof receipt !== "string") {
      return NextResponse.json({ error: "Invalid receipt" }, { status: 400 });
    }

    // Simple retry to handle transient Neon connect timeouts
    const maxAttempts = 2;
    let lastError: unknown = null;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const [row] = await db
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
            provider_invoice_id: invoices.provider_invoice_id,
            provider_short_url: invoices.provider_short_url,
            created_at: invoices.created_at,
            updated_at: invoices.updated_at,
          })
          .from(invoices)
          .where(eq(invoices.receipt, receipt))
          .limit(1);

        if (!row)
          return NextResponse.json({ error: "Not found" }, { status: 404 });
        return NextResponse.json(row, { status: 200 });
      } catch (err) {
        lastError = err;
        if (attempt < maxAttempts) {
          await new Promise((r) => setTimeout(r, 250));
          continue;
        }
      }
    }

    console.error("[Public Invoice API] Lookup failed after retry", lastError);
    return NextResponse.json({ error: "Service unavailable" }, { status: 503 });
  } catch (error) {
    console.error("[Public Invoice API] Lookup failed", error);
    return NextResponse.json(
      { error: "Failed to lookup invoice" },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { z } from "zod";

import { db } from "@/lib/db/client";
import { invoices } from "@/lib/db/schema";

const createInvoiceSchema = z.object({
  receipt: z
    .string()
    .trim()
    .min(3)
    .transform((val) => val.toUpperCase())
    .optional(),
  customer_name: z.string().trim().min(1).optional(),
  customer_email: z.string().email().optional(),
  customer_phone: z.string().trim().optional(),
  amount_in_paise: z.number().int().positive(),
  currency: z.string().trim().min(3).max(3).optional(),
  provider: z.string().trim().optional(),
  notes: z.any().optional(),
});

function generateReceipt(): string {
  const year = new Date().getFullYear();
  const seq = Math.floor(1000 + Math.random() * 9000);
  return `LW-${year}-${seq}`;
}

export async function POST(request: Request) {
  try {
    const json = await request.json().catch(() => null);
    const parseResult = createInvoiceSchema.safeParse(json);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          error: "Invalid invoice payload",
          details: parseResult.error.flatten(),
        },
        { status: 400 }
      );
    }

    const payload = parseResult.data;

    const id = crypto.randomUUID();
    const receipt = payload.receipt ?? generateReceipt();

    const [inserted] = await db
      .insert(invoices)
      .values({
        id,
        receipt,
        customer_name: payload.customer_name,
        customer_email: payload.customer_email,
        customer_phone: payload.customer_phone,
        amount_in_paise: payload.amount_in_paise,
        currency: payload.currency ?? undefined,
        provider: payload.provider ?? undefined,
        notes: payload.notes ?? undefined,
      })
      .returning({
        id: invoices.id,
        receipt: invoices.receipt,
        status: invoices.status,
        amount_in_paise: invoices.amount_in_paise,
        currency: invoices.currency,
        created_at: invoices.created_at,
      });

    return NextResponse.json(inserted, { status: 201 });
  } catch (error) {
    const message =
      typeof error === "object" && error && "message" in error
        ? String((error as any).message)
        : "";

    const isUniqueViolation =
      (typeof (error as any)?.code === "string" &&
        (error as any).code === "23505") ||
      message.toLowerCase().includes("duplicate key value") ||
      message.toLowerCase().includes("unique") ||
      message.toLowerCase().includes("receipt");

    if (isUniqueViolation) {
      return NextResponse.json(
        { error: "Invoice with this receipt already exists" },
        { status: 409 }
      );
    }

    console.error("[Admin Invoices API] Failed to create invoice", error);
    return NextResponse.json(
      { error: "Failed to create invoice" },
      { status: 500 }
    );
  }
}

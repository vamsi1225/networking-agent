// app/api/contacts/[id]/route.ts
// Will make more changes to this file later, I have to change few things in the DB.
// PATCH call updates an existing contact with the transcript and extraction
// result once a recording finishes. The [id] in the folder name is a
// dynamic route segment and the Next.js captures whatever value is in that
// position of the URL and passes it into the function as `params.id`.

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { transcript, narrative, company, sparkStrength, commitmentSignals } =
      await req.json();

    const result = await db.query(
      `UPDATE contacts
       SET transcript = $1,
           narrative = $2,
           company = $3,
           spark_strength = $4,
           commitment_signals = $5
       WHERE id = $6
       RETURNING id`,
      [
        transcript,
        narrative,
        company,
        sparkStrength,
        JSON.stringify(commitmentSignals || []),
        id,
      ]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Contact not found" }, { status: 404 });
    }

    return NextResponse.json({ id: result.rows[0].id });
  } catch (err) {
    console.error("Update contact error:", err);
    return NextResponse.json({ error: "Failed to update contact" }, { status: 500 });
  }
}

// GET: fetches a single contact by id — used by the contact detail page.
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const result = await db.query(`SELECT * FROM contacts WHERE id = $1`, [id]);

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Contact not found" }, { status: 404 });
    }

    return NextResponse.json(result.rows[0]);
  } catch (err) {
    console.error("Fetch contact error:", err);
    return NextResponse.json({ error: "Failed to fetch contact" }, { status: 500 });
  }
}
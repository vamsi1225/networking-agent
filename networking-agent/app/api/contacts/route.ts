import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const { name, eventName, metAt } = await req.json();

    if (!name || typeof name !== "string") {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    // Parameterized query — $1, $2, $3 are placeholders, and the actual
    // values are passed separately in the array below. This is what
    // prevents SQL injection: user input is never inserted directly into
    // the query string itself.
    const result = await db.query(
      `INSERT INTO contacts (name, event_name, met_at)
       VALUES ($1, $2, $3)
       RETURNING id`,
      [name, eventName || null, metAt || null]
    );

    const newContactId = result.rows[0].id;

    return NextResponse.json({ id: newContactId });
  } catch (err) {
    console.error("Create contact error:", err);
    return NextResponse.json({ error: "Failed to create contact" }, { status: 500 });
  }
}
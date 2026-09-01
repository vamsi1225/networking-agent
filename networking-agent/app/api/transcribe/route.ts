/* File for capturing the audio, this route file will receive the audio blob from Frontend(for now browser) and will send it to Deepgram API*/
/*Deppgram will return the transcript text*/
/*This file is like Front-end ->Backend->Deepggram->Backend with transcription*/

// thinking to change this into live sockets so can have live transcribing

import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const audioFile = formData.get("audio") as File | null;

    if (!audioFile) {
      return NextResponse.json({ error: "No audio file provided" }, { status: 400 });
    }

    const audioBuffer = Buffer.from(await audioFile.arrayBuffer());

    const response = await fetch(
      "https://api.deepgram.com/v1/listen?model=nova-3&smart_format=true",
      {
        method: "POST",
        headers: {
          Authorization: `Token ${process.env.DEEPGRAM_API_KEY}`,
          "Content-Type": "audio/webm",
        },
        body: audioBuffer,
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      console.error("Deepgram API error:", errText);
      return NextResponse.json({ error: "Transcription failed" }, { status: 502 });
    }

    const data = await response.json();
    const transcript =
      data?.results?.channels?.[0]?.alternatives?.[0]?.transcript ?? "";

    return NextResponse.json({ transcript });
  } catch (err) {
    console.error("Transcribe route error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
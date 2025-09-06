// app/api/line-webhook/route.ts
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

export const runtime = "nodejs";        // 署名検証でNodeのcryptoを使う
export const dynamic = "force-dynamic"; // Webhookは動的

const SECRET = process.env.LINE_CHANNEL_SECRET!;
const TOKEN  = process.env.LINE_CHANNEL_ACCESS_TOKEN!;

function verifySignature(raw: string, signature: string | null) {
  if (!signature) return false;
  const mac = crypto.createHmac("sha256", SECRET).update(raw).digest("base64");
  return mac === signature;
}

async function replyText(replyToken: string, text: string) {
  await fetch("https://api.line.me/v2/bot/message/reply", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${TOKEN}`,
    },
    body: JSON.stringify({
      replyToken,
      messages: [{ type: "text", text }],
    }),
  });
}

export async function POST(req: NextRequest) {
  const raw = await req.text(); // 生ボディ必須
  const sig = req.headers.get("x-line-signature");
  if (!verifySignature(raw, sig)) {
    return NextResponse.json({ ok: false, error: "invalid signature" }, { status: 401 });
  }

  const body = JSON.parse(raw);
  for (const ev of body.events ?? []) {
    if (ev.type === "message" && ev.message?.type === "text") {
      const msg = ev.message.text.trim();
      const text = msg.toLowerCase() === "ping" ? "pong" : `echo: ${msg}`;
      await replyText(ev.replyToken, text);
    }
  }
  return NextResponse.json({ ok: true });
}

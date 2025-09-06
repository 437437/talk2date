// app/api/line-webhook/route.ts
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// ===== 環境変数 =====
const SECRET = process.env.LINE_CHANNEL_SECRET!;
const TOKEN = process.env.LINE_CHANNEL_ACCESS_TOKEN!;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const HOTPEPPER_API_KEY = process.env.HOTPEPPER_API_KEY;

// ===== LINE 型（最小限） =====
type LineTextMessage = { type: "text"; text: string };
type LineFlexMessage = {
  type: "flex";
  altText: string;
  contents: Record<string, unknown>;
};
type LineMessage = LineTextMessage | LineFlexMessage;

type LineEventMessage = {
  type: "message";
  replyToken: string;
  message: { type: "text"; text: string };
};

type LineWebhookBody = {
  events?: LineEventMessage[];
};

// ===== 共通処理 =====
function verifySignature(raw: string, signature: string | null): boolean {
  if (!signature) return false;
  const mac = crypto.createHmac("sha256", SECRET).update(raw).digest("base64");
  return mac === signature;
}

async function reply(replyToken: string, messages: LineMessage[]): Promise<void> {
  const res = await fetch("https://api.line.me/v2/bot/message/reply", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${TOKEN}`,
    },
    body: JSON.stringify({ replyToken, messages }),
  });
  if (!res.ok) {
    const err = await res.text();
    console.error("LINE reply API error:", res.status, err);
  }
}

function replyText(replyToken: string, text: string) {
  return reply(replyToken, [{ type: "text", text }]);
}

// ===== コマンド解析 =====
type CmdHelp = { cmd: "help" };
type CmdPing = { cmd: "ping" };
type CmdEcho = { cmd: "echo"; body: string };
type CmdSuggest = { cmd: "suggestReply"; body: string };
type CmdShop = { cmd: "searchShop"; area: string; keyword: string };
type Command = CmdHelp | CmdPing | CmdEcho | CmdSuggest | CmdShop;

function parseCommand(text: string): Command {
  const t = text.trim();

  if (/^help$/i.test(t)) return { cmd: "help" };
  if (/^ping$/i.test(t)) return { cmd: "ping" };

  const conv = t.match(/^会話[:：]\s*(.+)$/i);
  if (conv) return { cmd: "suggestReply", body: conv[1] };

  const shop = t.match(/^店[:：]\s*([^\s]+)\s+(.+)$/i);
  if (shop) return { cmd: "searchShop", area: shop[1], keyword: shop[2] };

  return { cmd: "echo", body: t };
}

// ===== OpenAI（最小レスポンス型） =====
type OpenAIChatResponse = {
  choices?: { message?: { content?: string } }[];
};

async function suggestReplies(partnerMsg: string): Promise<string[]> {
  if (!OPENAI_API_KEY) {
    return [
      "そうなんですね、ちなみに休日は何してます？",
      "いいですね！その話もう少し聞きたいです。",
      "よかったら今週どこかでカフェ行きません？",
    ];
  }

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      temperature: 0.7,
      max_tokens: 200,
      messages: [
        {
          role: "system",
          content:
            "あなたはデート前の雑談を整える会話コーチです。" +
            "相手の文に対して、敬語ベースで軽すぎず硬すぎず、次につながる短文を3つ、日本語で1行ずつ返してください。" +
            "個人情報の要求や過度な約束の押し付けは避けてください。",
        },
        { role: "user", content: partnerMsg },
      ],
    }),
  });

  if (!res.ok) {
    console.error("OpenAI error:", res.status, await res.text());
    return [
      "なるほど！ちなみに最近どこか行きました？",
      "いいですね。好きな食べ物って何ですか？",
      "差し支えなければ、今週のご都合どうですか？",
    ];
  }

  const data = (await res.json()) as OpenAIChatResponse;
  const text = data.choices?.[0]?.message?.content ?? "";
  return text
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 3);
}

// ===== ホットペッパー =====
type Shop = { name: string; url: string; address?: string; photo?: string };

type HotPepperResponse = {
  results?: { shop?: HotPepperShop[] };
};
type HotPepperShop = {
  name?: string;
  urls?: { pc?: string };
  coupon_urls?: { pc?: string };
  address?: string;
  photo?: { pc?: { l?: string; m?: string; s?: string } };
};

async function searchHotPepper(area: string, keyword: string): Promise<Shop[]> {
  if (!HOTPEPPER_API_KEY) return [];

  const params = new URLSearchParams({
    key: HOTPEPPER_API_KEY,
    keyword: `${area} ${keyword}`,
    count: "5",
    format: "json",
  });

  const res = await fetch(
    `https://webservice.recruit.co.jp/hotpepper/gourmet/v1/?${params.toString()}`
  );
  if (!res.ok) {
    console.error("HotPepper error:", res.status, await res.text());
    return [];
  }

  const data = (await res.json()) as HotPepperResponse;
  const shops = data.results?.shop ?? [];
  return shops.slice(0, 5).map<Shop>((s) => ({
    name: s.name ?? "店舗名不明",
    url: s.urls?.pc ?? s.coupon_urls?.pc ?? "https://www.hotpepper.jp/",
    address: s.address,
    photo: s.photo?.pc?.l ?? s.photo?.pc?.m ?? s.photo?.pc?.s,
  }));
}

function buildFlexShops(shops: Shop[]): LineFlexMessage {
  const contents = shops.map((s) => ({
    type: "bubble",
    hero: s.photo
      ? {
          type: "image",
          url: s.photo,
          size: "full",
          aspectRatio: "20:13",
          aspectMode: "cover",
        }
      : undefined,
    body: {
      type: "box",
      layout: "vertical",
      contents: [
        { type: "text", text: s.name, weight: "bold", size: "md", wrap: true },
        ...(s.address
          ? [{ type: "text", text: s.address, size: "sm", color: "#666666", wrap: true }]
          : []),
      ],
    },
    footer: {
      type: "box",
      layout: "vertical",
      spacing: "sm",
      contents: [
        {
          type: "button",
          style: "primary",
          action: { type: "uri", label: "詳細を見る", uri: s.url },
        },
      ],
    },
  }));

  return {
    type: "flex",
    altText: "お店候補を表示しました",
    contents: { type: "carousel", contents } as Record<string, unknown>,
  };
}

// ===== メッセージ処理 =====
async function handleText(replyToken: string, text: string): Promise<void> {
  const q = parseCommand(text);

  switch (q.cmd) {
    case "help":
      return replyText(
        replyToken,
        [
          "使い方：",
          "・ping → pong",
          "・会話: <相手の文> → 次の一言候補",
          "・店: <エリア> <キーワード> → お店候補",
          "例）会話: 今日は何してた？",
          "例）店: 渋谷 ラーメン",
        ].join("\n")
      );

    case "ping":
      return replyText(replyToken, "pong");

    case "suggestReply": {
      const candidates = await suggestReplies(q.body);
      return replyText(
        replyToken,
        "次の一言候補：\n" + candidates.map((s) => "・" + s).join("\n")
      );
    }

    case "searchShop": {
      const shops = await searchHotPepper(q.area, q.keyword);
      if (shops.length === 0) {
        return replyText(
          replyToken,
          "ごめん、該当が見つからなかった…🙏 条件を少し変えてみて！"
        );
      }
      const flex = buildFlexShops(shops);
      return reply(replyToken, [flex]);
    }

    case "echo":
    default:
      return replyText(replyToken, `echo: ${q.body}`);
  }
}

// ===== Webhook エントリ =====
export async function POST(req: NextRequest) {
  const raw = await req.text();
  const sig = req.headers.get("x-line-signature");

  if (!verifySignature(raw, sig)) {
    return NextResponse.json({ ok: false, error: "invalid signature" }, { status: 401 });
  }

  const body = JSON.parse(raw) as LineWebhookBody;
  const events = body.events ?? [];

  for (const ev of events) {
    if (ev.type === "message" && ev.message?.type === "text") {
      await handleText(ev.replyToken, ev.message.text);
    }
  }

  return NextResponse.json({ ok: true });
}

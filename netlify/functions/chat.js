// netlify/functions/chat.js
// - OpenAI API를 직접 fetch로 호출 (SDK 불필요, 의존성 0)
// - 환경변수 OPENAI_API_KEY는 Netlify 대시보드에 저장되어 있어야 함
// - 요청: { message: "사용자 입력" }
// - 응답: { reply: "모델의 답변" }

export const handler = async (event) => {
  // CORS(필요시): 같은 사이트에서만 호출하므로 생략 가능
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Method Not Allowed" })
    };
  }

  try {
    const { message } = JSON.parse(event.body || "{}");

    if (!message || typeof message !== "string") {
      return {
        statusCode: 400,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: "Invalid request body" })
      };
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return {
        statusCode: 500,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: "Server missing OPENAI_API_KEY" })
      };
    }

    // 행돌 톤(발로란트 스트리머) 시스템 프롬프트
    const systemPrompt = [
      "너는 발로란트 스트리머 '행돌' 톤의 한국어 챗봇이야.",
      "스타일: 반말+친근, 유머 감각, 짧고 빠르게. 게임/랭크/메타 이야기에 익숙.",
      "과장/비속어는 과하지 않게, 초보자에게는 친절하게.",
      "민감/유해/개인정보 요청은 안전하게 거절하고 대안을 제시.",
    ].join(" ");

    // 비용 효율 모델 예: gpt-4o-mini (필요시 다른 모델로 변경 가능)
    const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        temperature: 0.7,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message }
        ]
      })
    });

    if (!openaiRes.ok) {
      const errText = await openaiRes.text();
      return {
        statusCode: openaiRes.status,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: "OpenAI error", detail: errText })
      };
    }

    const data = await openaiRes.json();
    const reply =
      data?.choices?.[0]?.message?.content?.trim() ||
      "응답을 생성하지 못했어. 잠시 후 다시 시도해줘!";

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reply })
    };
  } catch (e) {
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Server exception", detail: String(e) })
    };
  }
};

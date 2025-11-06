// netlify/functions/chat.js
// - OpenAI API를 fetch로 호출 (SDK 불필요)
// - 환경변수 OPENAI_API_KEY는 Netlify 대시보드에 저장되어 있어야 함
// - 요청: { message: "사용자 입력" }
// - 응답: { reply: "모델의 답변" }

export const handler = async (event) => {
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

    // ✅ 행돌 톤 & 고정 설정(최애 팀/선수 포함)
    const systemPrompt = [
      "너는 발로란트 스트리머 '행돌' 톤의 한국어 챗봇.",
      "스타일: 빠르고 재치있게, 반말 위주, 과한 비속어는 피함. 초보자에겐 친절.",
      "팩트 체크: 확실치 않은 정보는 '추측'임을 명시하고 안전하게 답해.",
      "민감/유해/개인정보/불법 요청은 거절하고 안전한 대안을 제시.",
      "",
      "행돌 캐릭터 설정:",
      "- 최애 팀: DFM",
      "- 최애 선수: gyen",
      "- 캐치프레이즈: 'JUST PIEDRA', 'I'm GOD~', '현대인의 필수품 쇼티!'",
      "- 무기 취향: 밴달 선호(팬텀보다), 셰리프/가디언 자주 사용, 상황 맞으면 버키·저지·쇼티로 변수.",
      "- 역할: 원래 오멘 장인, 최근 엔트리 빈도 증가. 운영은 침착하지만 필요 시 과감.",
      "",
      "답변 톤 예:",
      "- 짧고 핵심: 'ㅇㅋ. 이 판은 각만 보면 돼. 라운드 초반엔...' ",
      "- 필요하면 단계/리스트로 간단 정리.",
    ].join("\n");

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

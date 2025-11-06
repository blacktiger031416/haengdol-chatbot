// netlify/functions/chat.js
// OpenAI Chat Completions를 사용해 "행돌 AI" 캐릭터로 응답합니다.

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
        body: JSON.stringify({ error: "OPENAI_API_KEY missing" })
      };
    }

    // === 행돌 캐릭터 프롬프트 (수정 반영) ===
    const systemPrompt = `
너는 VALORANT 스트리머 “행돌”의 인공지능 버전이야.
말투, 농담, 과거, 밈, 인간관계, 취향을 전부 반영해서 짧고 재치있게 답해.

[캐릭터 핵심]
- 이름: 행돌 / 한국 스트리머
- 톤: 친한 친구처럼 반말, 가볍게 리액션(ㅋㅋ, ㄹㅇ 등), 너무 장문 금지(2~4문장 중심)
- 안전: 민감/불법/개인정보는 거절하고 대안 제시

[취향/밈/사실]
- DFM 팬. 최애 선수는 gyen. DFM 한국 선수 Akame와도 친함.
- 과거 오멘 장인 & 셰리프 장인. 지금은 레디언트 자주 찍음. 예전 불멸 오래 머물러서 “행불딱” 별명 있는데 본인은 싫어함.
- 셰리프 취향:
  * S티어: 싱귤래리티 셰리프.
  * 1티어: 쿠로나미(단단한 타건감. 쫀득 아님. 그래도 명중감이 좋아서 1티어), 메이지펑크, 둠브링어, 프로토콜, 아이온, 약탈자, 네오프런티어 셰리프.
- 여자 플레이어 좋아한다고 놀림받음. 한국 서버 닉: “여자보면콧김나옴”, 아시아 서버 닉: “너도이계정써봐”. 본인은 “아님 ㅋㅋ” 하고 부정.
- 팀/지인:
  * 과거 도쿄 서버 프리미어 팀 “올드타운”(행돌·크포·선데이·츈츈·자몽뀨) 1등 → 일본 2부 진출권 받았지만 국적 제한으로 불가.
  * 현재 김된모의 프리미어 팀 “WER” 소속.
  * 크포=“할배”, 자몽뀨=아주 친한 친구(가끔 “미친놈” 농담), 츈츈=“제아벌”(제트 안하면 벌레급이라서), 선데이=전 2부 프로, 든든하지만 허당(별명 “순대”).
  * 마뫄=여스트리머, ‘발로 여신’ 밈으로 자주 놀림.
  * 거긴갈수없다(거갈없)=오멘 장인 친구. “거긴 오멘만 하고, 나는 오멘을 자주 하는 느낌”이라고 설명.

[말투 예]
- “행불딱 그만 ㅋㅋ 지금은 레디언트 찍잖아.”
- “쿠로나미는 단단한 느낌인데 이상하게 잘 맞아. 그래서 1티어 줌.”
- “싱귤 셰리프는 걍 S티어 인정.”
- “DFM 요즘 감 좋아. gyen 폼 미쳤다 ㄹㅇ.”
- “순대(선데이)는 든든한데 가끔 허당임 ㅋㅋ”
- “제아벌 또 제트 아니면 삐져 ㅋㅋ”
- “그 닉? 시청자들이 만든 밈이지 내가 아니라니까 ㅋㅋ”

[응답 지침]
- 한 답변에 위 특징을 ‘상황에 맞게’ 자연스럽게 섞어.
- 메타/장비/요원 질문은 실용 팁을 1~3개 bullet로 덧붙여도 됨.
- 존댓말 요구 없으면 반말 유지. 과한 욕설은 금지.
`;

    const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        temperature: 0.85,
        max_tokens: 320,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message }
        ]
      })
    });

    if (!openaiRes.ok) {
      const detail = await openaiRes.text();
      return {
        statusCode: openaiRes.status,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: "OpenAI error", detail })
      };
    }

    const data = await openaiRes.json();
    const reply = data?.choices?.[0]?.message?.content?.trim() || "잠깐 끊겼다. 다시 한 번 쳐줘!";

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

// netlify/functions/chat.js
// Node 18+ (fetch 내장). 응답/에러를 항상 JSON으로 돌려주고 CORS/캐시도 명시.

const H = {
  "Content-Type": "application/json; charset=utf-8",
  "Cache-Control": "no-store",
  "Access-Control-Allow-Origin": "*",
};

export const handler = async (event) => {
  // Preflight (개발 중 브라우저가 보낼 수 있음)
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers: { ...H, "Access-Control-Allow-Headers": "*" } };
  }
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, headers: H, body: JSON.stringify({ error: "Method Not Allowed" }) };
  }

  try {
    const { message } = JSON.parse(event.body || "{}");
    if (!message) {
      return { statusCode: 400, headers: H, body: JSON.stringify({ error: "Empty message" }) };
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return { statusCode: 500, headers: H, body: JSON.stringify({ error: "OPENAI_API_KEY missing" }) };
    }

    const systemPrompt = `
너는 VALORANT 스트리머 “행돌”의 AI 버전. 반말, 짧고 유쾌.
[핵심 캐릭터성]
- DFM 팬, 최애 gyen. Akame와 친함.
- 과거 오멘/셰리프 장인. 예전 불멸 오래라 '행불딱' 별명(이젠 레디 자주, 장난으로 받아침).
- 한국 닉: '여자보면콧김나옴', 아시아 닉: '너도이계정써봐' (본인은 부정하는 컨셉).
- 셰리프 스킨: S=싱귤, 1티어=쿠로나미(단단하지만 잘 맞음), 메이지펑크, 둠브링어, 프로토콜, 아이온, 약탈자, 네오프런티어.
- 보라색 선호. 네뷸라(셰리프/가디언/팬텀) 호감.
[팀/지인]
- '올드타운'(행돌·크포·선데이·츈츈·자몽뀨)로 도쿄 프리미어 1등, 국적 제한으로 2부 불가.
- 현재 김된모의 'WER' 소속. 크포=할배, 자몽뀨=절친, 츈츈=제아벌, 선데이=순대(전 2부·허당),
  마뫄=발로 여신, 거갈없=오멘만 하는 친구, 하누/버니버니/에피나와도 친함(에피나는 '돌쌤'이라 부름).
- 과거 부계 닉 조합(Piedra/Dazzler) 언급 금지.
[TMI]
- 2020-10-14 유튜브 첫 업로드: 오멘 스플릿 강의. 조준선 안쪽선 1420 흰색.
- 민트초코 좋아함, 파인애플 피자는 안 땡김. 욕 적어서 '순한 맛' 이미지. 비흡연(한 번 피고 끊음).
- MCN 대전 S1(OW2) 우승, 2025-01-17 '겟 투 워크' 3:49 치지직 1위.
[말투 예]
- "DFM 요즘 감 좋아. gyen 폼 미쳤다 ㄹㅇ."
- "쿠로나미는 단단한데 맞음감이 이상하게 붙어. 1티어 인정."
- "행불딱? 에이 ㅋㅋ 지금은 레디야."
[지침] 2~4문장 위주, 필요시 bullet 1~3개. 안전수칙 준수.
`.trim();

    // OpenAI Chat Completions
    const resp = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        temperature: 0.85,
        max_tokens: 320,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message }
        ],
      }),
      // 30초 네트워크 타임아웃(넷리파이 플랫폼 타임아웃과 별개)
      signal: AbortSignal.timeout(30000),
    });

    if (!resp.ok) {
      const detail = await resp.text().catch(() => "");
      return { statusCode: resp.status, headers: H, body: JSON.stringify({ error: "OpenAI error", detail }) };
    }

    const data = await resp.json();
    const reply = data?.choices?.[0]?.message?.content?.trim();
    if (!reply) {
      return { statusCode: 502, headers: H, body: JSON.stringify({ error: "Empty reply from OpenAI" }) };
    }

    return { statusCode: 200, headers: H, body: JSON.stringify({ reply }) };
  } catch (err) {
    // 에러 메시지를 프론트에 그대로 전달해서 원인 파악 쉽게
    return { statusCode: 500, headers: H, body: JSON.stringify({ error: "Server exception", detail: String(err) }) };
  }
};

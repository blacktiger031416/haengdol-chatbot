export const handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, headers:{ "Content-Type":"application/json" }, body: JSON.stringify({ error:"Method Not Allowed" }) };
  }

  try {
    const { message } = JSON.parse(event.body || "{}");
    if (!message) {
      return { statusCode: 400, headers:{ "Content-Type":"application/json" }, body: JSON.stringify({ error:"Invalid request body" }) };
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return { statusCode: 500, headers:{ "Content-Type":"application/json" }, body: JSON.stringify({ error:"OPENAI_API_KEY missing" }) };
    }

    const systemPrompt = `
너는 VALORANT 스트리머 “행돌”의 AI 버전이다.
반말, 짧고 유쾌, 캐릭터성 최우선으로 답해.

[취향/밈]
- DFM 팬, 최애 gyen. Akame와 친함.
- 과거 오멘/셰리프 장인, 요즘도 레디 자주. 예전 불멸 오래라 ‘행불딱’ 별명 있으나 싫어함(장난으로 받아침).
- 여자 플레이어 좋아한다는 밈: 한국 닉 “여자보면콧김나옴”, 아시아 닉 “너도이계정써봐”. 본인은 부정.
- 셰리프 스킨: S티어=싱귤, 1티어=쿠로나미(단단하지만 잘 맞음), 메이지펑크, 둠브링어, 프로토콜, 아이온, 약탈자, 네오프런티어.
- 퍼스널 컬러 보라. 그래서 네뷸라(셰리프·가디언·팬텀)를 유독 좋아함.

[팀/지인]
- 과거 ‘올드타운’(행돌·크포·선데이·츈츈·자몽뀨)로 도쿄 프리미어 1등, 국적 제한으로 2부 불가.
- 현재 김된모의 ‘WER’ 소속.
- 별명: 크포=할배, 자몽뀨=절친(가끔 “미친놈” 농담), 츈츈=제아벌, 선데이=순대(전 2부·허당), 마뫄=발로 여신, 거갈없=오멘만 하는 친구, 하누=브로 케미, 버니버니=아웃트로, 에피나=‘도구’ 듀오(행돌을 ‘돌쌤’이라 부름).
- ※ 과거 사용하던 부계 닉네임 조합(Piedra/Dazzler) 언급 금지. 현재는 사용 안 함.

[TMI]
- 2020-10-14 유튜브 첫 영상: 오멘 스플릿 강의.
- 조준선 안쪽선 1420 흰색. 민트초코 좋아함, 파인애플 피자는 안 땡김.
- 2022 스트리머 발로 대전 감독 1위(오마카세 약속, 인터뷰 중 타자 치다 걸림).
- 로아 즐김, 서울 토박이, 욕설 적어서 ‘순한 맛’ 이미지. 부계 ‘순수한청년’ 쓴 적 있음.
- MCN 대전 S1(OW2) 우승. 2025-01-17 ‘겟 투 워크’ 3:49로 치지직 1위.
- 비흡연자(한 번 피워보고 안 맞아서 끊음). 중계 확장 위해 버츄얼도 킴.

[말투 예]
- “행불딱 그만 ㅋㅋ 지금은 레디 찍었다니까.”
- “쿠로나미는 단단한데 이상하게 총알이 붙어. 1티어 인정.”
- “DFM 요즘 감 좋고 gyen 폼 미쳤다 ㄹㅇ.”
- “보라색은 내 색. 네뷸라까지 못 미워하겠더라 ㅋㅋ”
- “순대는 든든한데 허당임.”

[응답 지침]
- 2~4문장 중심. 발로 팁은 bullet 1~3개 추가 가능. 민감/불법/개인정보는 안전 거절.
`;

    const resp = await fetch("https://api.openai.com/v1/chat/completions",{
      method:"POST",
      headers:{ "Authorization":`Bearer ${apiKey}`, "Content-Type":"application/json" },
      body: JSON.stringify({
        model:"gpt-4o-mini",
        temperature:0.85,
        max_tokens:320,
        messages:[
          { role:"system", content:systemPrompt },
          { role:"user", content:message }
        ]
      })
    });

    if (!resp.ok){
      const detail = await resp.text();
      return { statusCode: resp.status, headers:{ "Content-Type":"application/json" }, body: JSON.stringify({ error:"OpenAI error", detail }) };
    }

    const data = await resp.json();
    const reply = data?.choices?.[0]?.message?.content?.trim() || "잠깐 끊겼다. 다시 쳐줘!";
    return { statusCode:200, headers:{ "Content-Type":"application/json" }, body: JSON.stringify({ reply }) };
  } catch (e) {
    return { statusCode:500, headers:{ "Content-Type":"application/json" }, body: JSON.stringify({ error:"Server exception", detail:String(e) }) };
  }
};

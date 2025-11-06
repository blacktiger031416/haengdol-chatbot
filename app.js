// Netlify Functions '/.netlify/functions/chat' 호출 + 프로필 호버 카드(업데이트)

const $messages = document.getElementById("messages");
const $form = document.getElementById("chat-form");
const $input = document.getElementById("user-input");
const $send = document.getElementById("send-btn");

// 행돌 캐치프레이즈(말풍선 이름 아래에 랜덤 표시)
const SLOGANS = [
  "JUST PIEDRA",
  "I'm GOD~",
  "현대인의 필수품 쇼티!"
];

// 초기 안내 메시지
addBot("가자~ 오늘도 에임 깔끔하게! 뭐 도와줄까? (지금은 데모 상태 — 곧 OpenAI 연결 예정)");

$form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const text = $input.value.trim();
  if (!text) return;

  addUser(text);
  $input.value = "";
  $input.focus();

  const thinking = addBot("생각 중…", { thinking: true });

  try {
    const res = await fetch("/.netlify/functions/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: text })
    });

    if (!res.ok) throw new Error(`Server returned ${res.status}`);

    const data = await res.json(); // { reply: "..." } 예상
    thinking.remove();
    addBot(data.reply ?? "응답 형식을 확인해주세요.");
  } catch (err) {
    thinking.remove();
    addBot(
      [
        "아직 백엔드 연결 전이라 실제 답변은 못 줘 😅",
        "다음 단계에서 Netlify Functions + OpenAI API 연결하면 바로 대화 가능!",
        "(임시 응답) — 행돌 톤으로: “ㅇㅋ 확인. 다음 단계 가면 진짜로 말해줄게.”"
      ].join("\n")
    );
  }
});

function addUser(text) {
  const li = document.createElement("li");
  li.className = "msg user";
  const bubble = document.createElement("div");
  bubble.className = "bubble";
  bubble.textContent = text;
  li.appendChild(bubble);
  $messages.appendChild(li);
  scrollBottom();
}

function addBot(text, opts = {}) {
  const li = document.createElement("li");
  li.className = "msg bot" + (opts.thinking ? " thinking" : "");

  // 왼쪽: 아바타(호버 카드 포함)
  const avatar = document.createElement("div");
  avatar.className = "avatar";
  avatar.innerHTML = `
    <img alt="행돌 프로필" class="avatar-img" src="https://i.namu.wiki/i/WnNvjJZqUi-RZqxnEPnolaFIs8Ydu6g2dFKaD2JYJsCs4-rqc0u5jfVHh2kD1LzJw6VfmYyanpUwk7sLSmMpdQ.webp">
    <div class="bio-card" role="dialog" aria-label="행돌 소개">
      <div class="bio-head">
        <img alt="" src="https://i.namu.wiki/i/WnNvjJZqUi-RZqxnEPnolaFIs8Ydu6g2dFKaD2JYJsCs4-rqc0u5jfVHh2kD1LzJw6VfmYyanpUwk7sLSmMpdQ.webp">
        <div>
          <strong>행돌</strong>
          <span>치지직 파트너 · 발로란트 파트너 유튜버</span>
        </div>
      </div>

      <div class="bio-badges">
        <span class="badge red">JUST PIEDRA</span>
        <span class="badge red">I'm GOD~</span>
        <span class="badge teal">현대인의 필수품 쇼티!</span>
      </div>

      <div class="bio-section">
        <h4>플레이 스타일</h4>
        <ul>
          <li>천상계 <b>오멘 장인</b>으로 유명. 최근엔 <b>엔트리</b> 빈도↑</li>
          <li>정석적이되, <b>원웨이/텔포 변수</b> 적절히 섞음</li>
          <li>샷건 애호가: 상황 맞으면 <b>버키/저지/쇼티</b>로 변수 창출</li>
        </ul>
      </div>

      <div class="bio-two">
        <div class="bio-section">
          <h4>선호 무기</h4>
          <ul>
            <li><b>밴달</b> ＞ 팬텀</li>
            <li>셰리프 · 가디언 주력</li>
            <li>오퍼레이터 최근 숙련도↑</li>
          </ul>
        </div>
        <div class="bio-section">
          <h4>덜 쓰는 무기</h4>
          <ul>
            <li>프렌지 · 스팅어 · 마샬 · 아레스</li>
          </ul>
        </div>
      </div>

      <div class="bio-section">
        <h4>한 줄 요약</h4>
        <p>침착한 운영 + 샷건 변수 + 높은 게임 이해도. “<b>현대인의 필수품, 쇼티!</b>”로 유명해진 스트리머.</p>
      </div>

      <div class="bio-tip">Tip: 아바타를 클릭하면 카드가 고정/해제돼요</div>
    </div>
  `;
  // 모바일/터치용: 탭하면 카드 토글
  avatar.addEventListener("click", () => {
    avatar.classList.toggle("show-bio");
  });

  // 오른쪽: 이름 + 캐치프레이즈 + 버블
  const content = document.createElement("div");
  content.className = "content";

  const nameRow = document.createElement("div");
  nameRow.className = "name-row";
  const name = document.createElement("div");
  name.className = "name";
  name.textContent = "행돌";
  const slogan = document.createElement("span");
  slogan.className = "slogan";
  slogan.textContent = pickRandom(SLOGANS);
  nameRow.appendChild(name);
  nameRow.appendChild(slogan);

  const bubble = document.createElement("div");
  bubble.className = "bubble";
  bubble.textContent = text;

  content.appendChild(nameRow);
  content.appendChild(bubble);

  li.appendChild(avatar);
  li.appendChild(content);

  $messages.appendChild(li);
  scrollBottom();
  return li;
}

function scrollBottom() {
  $messages.scrollTop = $messages.scrollHeight;
}

function pickRandom(arr){
  return arr[Math.floor(Math.random()*arr.length)];
}

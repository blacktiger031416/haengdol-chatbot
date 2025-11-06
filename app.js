// Netlify Functions '/.netlify/functions/chat' 호출 + 프로필 호버 카드

const $messages = document.getElementById("messages");
const $form = document.getElementById("chat-form");
const $input = document.getElementById("user-input");
const $send = document.getElementById("send-btn");

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

  // 왼쪽: 아바타(호버 카드 포함), 오른쪽: 이름 + 버블
  const avatar = document.createElement("div");
  avatar.className = "avatar";
  avatar.innerHTML = `
    <img alt="행돌 프로필" class="avatar-img" src="https://i.namu.wiki/i/WnNvjJZqUi-RZqxnEPnolaFIs8Ydu6g2dFKaD2JYJsCs4-rqc0u5jfVHh2kD1LzJw6VfmYyanpUwk7sLSmMpdQ.webp">
    <div class="bio-card" role="dialog" aria-label="행돌 소개">
      <div class="bio-head">
        <img alt="" src="https://i.namu.wiki/i/WnNvjJZqUi-RZqxnEPnolaFIs8Ydu6g2dFKaD2JYJsCs4-rqc0u5jfVHh2kD1LzJw6VfmYyanpUwk7sLSmMpdQ.webp">
        <div>
          <strong>행돌</strong>
          <span>VALORANT 스트리머 / 듀얼리스트 감성</span>
        </div>
      </div>
      <ul class="bio-list">
        <li>톤: 빠르고 재치있게, 과한 비속어 X</li>
        <li>주제: 랭크, 메타, 크로스헤어, 맵콜</li>
        <li>안전: 개인정보/유해 요청은 거절 & 대안 제시</li>
      </ul>
      <div class="bio-tip">Tip: 아바타를 다시 누르면 닫혀요</div>
    </div>
  `;

  // 모바일/터치용: 탭하면 카드 토글
  avatar.addEventListener("click", () => {
    avatar.classList.toggle("show-bio");
  });

  const content = document.createElement("div");
  content.className = "content";
  const name = document.createElement("div");
  name.className = "name";
  name.textContent = "행돌";

  const bubble = document.createElement("div");
  bubble.className = "bubble";
  bubble.textContent = text;

  content.appendChild(name);
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

// 간단한 프런트엔드 채팅 로직 (백엔드 미연결 상태에서도 안전 동작)
// 나중에 Netlify Functions로 '/.netlify/functions/chat' 엔드포인트를 만들 예정.

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
    // 백엔드 연결 전: 임시로 fetch 시도 → 실패하면 친절한 안내
    const res = await fetch("/.netlify/functions/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: text })
    });

    if (!res.ok) {
      throw new Error(`Server returned ${res.status}`);
    }

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
  li.textContent = text;
  $messages.appendChild(li);
  scrollBottom();
}

function addBot(text, opts = {}) {
  const li = document.createElement("li");
  li.className = "msg bot" + (opts.thinking ? " thinking" : "");
  li.textContent = text;
  $messages.appendChild(li);
  scrollBottom();
  return li;
}

function scrollBottom() {
  $messages.scrollTop = $messages.scrollHeight;
}

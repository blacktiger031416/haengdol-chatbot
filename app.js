// 안전 실행: DOM 로드 이후
window.addEventListener("DOMContentLoaded", () => {
  const $messages = document.getElementById("messages");
  const $form = document.getElementById("chat-form");
  const $input = document.getElementById("user-input");
  const $btnNew = document.getElementById("btn-new");
  const $toast = document.getElementById("toast");

  if (!$messages || !$form || !$input) {
    return toast("필수 DOM 요소가 없습니다. index.html의 id를 확인하세요.", true);
  }

  const SLOGANS = ["JUST PIEDRA","I'm GOD~","현대인의 필수품 쇼티!"];

  // 초기 인사 (서버와 무관)
  addBot("안녕?");

  // 새 대화
  $btnNew?.addEventListener("click", () => {
    $messages.innerHTML = "";
    addBot("안녕?");
    $input.focus();
  });

  // 전송
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

      if (!res.ok) {
        const detail = await res.text();
        throw new Error(`Functions ${res.status}: ${detail}`);
      }

      const data = await res.json();
      thinking.remove();
      addBot(data.reply ?? "응답 형식을 확인해주세요.");
    } catch (err) {
      thinking.remove();
      console.error(err);
      toast("서버 통신 오류: " + (err.message || err), true);
      addBot("서버가 잠깐 멈췄나봐. 다시 시도해봐!");
    }
  });

  // ====== UI helpers ======
  function addUser(text){
    const li = document.createElement("li");
    li.className = "msg user";
    const bubble = document.createElement("div");
    bubble.className = "bubble";
    bubble.textContent = text;
    li.appendChild(bubble);
    $messages.appendChild(li);
    scrollBottom();
  }

  function addBot(text, opts = {}){
    const li = document.createElement("li");
    li.className = "msg bot" + (opts.thinking ? " thinking" : "");

    const avatar = document.createElement("div");
    avatar.className = "avatar";
    avatar.innerHTML = `
      <img alt="행돌 프로필" class="avatar-img" src="https://i.namu.wiki/i/WnNvjJZqUi-RZqxnEPnolaFIs8Ydu6g2dFKaD2JYJsCs4-rqc0u5jfVHh2kD1LzJw6VfmYyanpUwk7sLSmMpdQ.webp">
    `;

    const content = document.createElement("div");
    content.className = "content";
    const nameRow = document.createElement("div");
    nameRow.className = "name-row";
    const name = document.createElement("div");
    name.className = "name";
    name.textContent = "행돌";
    const slogan = document.createElement("span");
    slogan.className = "slogan";
    slogan.textContent = pick(SLOGANS);
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

  function scrollBottom(){ $messages.scrollTop = $messages.scrollHeight; }

  function pick(arr){ return arr[Math.floor(Math.random()*arr.length)]; }

  function toast(msg, danger=false){
    $toast.style.display = "block";
    $toast.style.padding = "12px 14px";
    $toast.style.borderRadius = "10px";
    $toast.style.color = "#fff";
    $toast.style.background = danger ? "rgba(255,70,85,.95)" : "rgba(20,30,45,.95)";
    $toast.style.boxShadow = "0 10px 24px rgba(0,0,0,.3)";
    $toast.textContent = msg;
    clearTimeout(window.__toastTimer);
    window.__toastTimer = setTimeout(()=>{ $toast.style.display="none"; }, 3500);
  }
});

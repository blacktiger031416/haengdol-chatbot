// app.js
const FN = "/.netlify/functions/chat";

const $messages = document.getElementById("messages");
const $form = document.getElementById("chat-form");
const $input = document.getElementById("input");
const $sendBtn = document.getElementById("send-btn");

function addUser(text){
  const li = document.createElement("li");
  li.className = "msg user";
  li.innerHTML = `<div class="bubble">${escapeHtml(text)}</div>`;
  $messages.appendChild(li);
  li.scrollIntoView({ behavior: "smooth", block: "end" });
}

function addBot(text, thinking=false){
  const li = document.createElement("li");
  li.className = "msg bot";
  li.innerHTML = `
    <img src="https://i.namu.wiki/i/WnNvjJZqUi-RZqxnEPnolaFIs8Ydu6g2dFKaD2JYJsCs4-rqc0u5jfVHh2kD1LzJw6VfmYyanpUwk7sLSmMpdQ.webp" class="avatar-img" alt="행돌"/>
    <div class="content">
      <div class="name-row">
        <span class="name">행돌</span>
        <span class="slogan">${pick(["JUST PIEDRA","I'm GOD~","현대인의 필수품 쇼티!"])}</span>
      </div>
      <div class="bubble">${escapeHtml(text)}</div>
    </div>`;
  if (thinking) li.dataset.thinking = "1";
  $messages.appendChild(li);
  li.scrollIntoView({ behavior: "smooth", block: "end" });
  return li;
}

function escapeHtml(s){ return s.replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m])); }
function pick(arr){ return arr[Math.floor(Math.random()*arr.length)]; }

$form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const text = $input.value.trim();
  if (!text) return;

  addUser(text);
  $input.value = "";

  const thinking = addBot("생각 중...", true);

  // 중복 전송 방지
  $input.disabled = true;
  $sendBtn.disabled = true;

  try {
    // 25초 타임아웃 (프론트에서 한 번 더 안전장치)
    const ac = new AbortController();
    const t = setTimeout(() => ac.abort("timeout"), 25000);

    const res = await fetch(FN, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: text }),
      signal: ac.signal,
    });
    clearTimeout(t);

    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      throw new Error(`Functions ${res.status}: ${detail}`);
    }

    const data = await res.json();
    thinking.remove();
    addBot(data.reply ?? "응답이 비었어. 한 번만 더 쳐줄래?");
  } catch (err) {
    console.error(err);
    thinking.remove();
    addBot(`서버가 말문이 막혔네 ㅠㅠ\n- 오류: ${String(err).slice(0,200)}\n잠시 후 다시 해보자!`);
  } finally {
    $input.disabled = false;
    $sendBtn.disabled = false;
    $input.focus();
  }
});

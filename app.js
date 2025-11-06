// Netlify Functions '/.netlify/functions/chat' 호출 + 프로필 호버 카드 + 컨트롤 도크

const $messages = document.getElementById("messages");
const $form = document.getElementById("chat-form");
const $input = document.getElementById("user-input");
const $send = document.getElementById("send-btn");
const $btnNew = document.getElementById("btn-new");

const SLOGANS = ["JUST PIEDRA","I'm GOD~","현대인의 필수품 쇼티!"];

// 첫 메시지
addBot("안녕?");

// 새 대화: 메시지 비우고 인사만 남김
$btnNew.addEventListener("click", () => {
  $messages.innerHTML = "";
  addBot("안녕?");
  $input.focus();
});

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

    const data = await res.json();
    thinking.remove();
    addBot(data.reply ?? "응답 형식을 확인해주세요.");
  } catch (err) {
    thinking.remove();
    addBot("서버가 잠깐 멈췄나봐. 다시 시도해봐!");
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

  // 왼쪽: 아바타+호버카드
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
      <div class="bio-two">
        <div class="bio-section">
          <h4>플레이 스타일</h4>
          <ul>
            <li>천상계 <b>오멘 장인</b> → 요즘 <b>엔트리</b> 빈도↑</li>
            <li>정석 운영 + <b>원웨이/텔포 변수</b></li>
            <li><b>샷건</b> 애호가(버키/저지/쇼티)</li>
          </ul>
        </div>
        <div class="bio-section">
          <h4>무기 취향</h4>
          <ul>
            <li><b>밴달</b> ≻ 팬텀, 셰리프·가디언 선호</li>
            <li>오퍼 최근 숙련도 상승</li>
            <li>프렌지·스팅어·마샬·아레스는 드묾</li>
          </ul>
        </div>
      </div>
      <div class="bio-two">
        <div class="bio-section">
          <h4>최애</h4>
          <ul><li>팀: <b>DFM</b></li><li>선수: <b>gyen</b></li></ul>
        </div>
        <div class="bio-section">
          <h4>한 줄 요약</h4>
          <p>침착한 운영 + 샷건 변수 + 높은 게임 이해도.</p>
        </div>
      </div>
      <div class="bio-tip">Tip: 아바타를 클릭하면 카드 고정/해제</div>
    </div>
  `;
  avatar.addEventListener("click", () => avatar.classList.toggle("show-bio"));

  // 오른쪽: 이름/슬로건/버블
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
function pickRandom(arr){ return arr[Math.floor(Math.random()*arr.length)] }

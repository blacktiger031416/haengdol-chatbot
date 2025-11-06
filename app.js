// 프론트 메시징 + 프로필 카드(스킨 티어/제아벌 반영)

const $messages = document.getElementById("messages");
const $form = document.getElementById("chat-form");
const $input = document.getElementById("user-input");
const $btnNew = document.getElementById("btn-new");

const SLOGANS = ["JUST PIEDRA","I'm GOD~","현대인의 필수품 쇼티!"];

// 시작 인사
addBot("안녕?");

$btnNew?.addEventListener("click", () => {
  if (!$messages) return;
  $messages.innerHTML = "";
  addBot("안녕?");
  $input?.focus();
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
    if (!res.ok) throw new Error(`Server ${res.status}`);
    const data = await res.json();
    thinking.remove();
    addBot(data.reply ?? "응답 형식을 확인해주세요.");
  } catch (err) {
    thinking.remove();
    addBot("서버가 잠깐 멈췄나봐. 다시 시도해봐!");
  }
});

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
            <li>과거 <b>오멘 장인</b> & <b>셰리프 장인</b></li>
            <li>요즘은 레디언트 자주 찍음 (행불딱 별명은 싫어함)</li>
            <li>정석 운영 + <b>원웨이/텔포 변수</b></li>
          </ul>
        </div>
        <div class="bio-section">
          <h4>셰리프 티어</h4>
          <ul>
            <li><b>S티어</b>: 싱귤래리티</li>
            <li><b>1티어</b>: 쿠로나미(단단한 느낌이지만 명중감 좋아서 채택),
              메이지펑크, 둠브링어, 프로토콜, 아이온, 약탈자, 네오프런티어</li>
          </ul>
        </div>
      </div>

      <div class="bio-two">
        <div class="bio-section">
          <h4>최애/지인</h4>
          <ul>
            <li>팀: <b>DFM</b> · 최애: <b>gyen</b> · 친한 선수: <b>Akame</b></li>
            <li>현재 팀: 김된모의 <b>WER</b></li>
          </ul>
        </div>
        <div class="bio-section">
          <h4>밈 & 별명</h4>
          <ul>
            <li>한국 닉: <b>여자보면콧김나옴</b> (본인은 부정 ㅋㅋ)</li>
            <li>아시아 닉: <b>너도이계정써봐</b></li>
            <li>올드타운: 행돌·크포(할배)·선데이(순대)·츈츈(제아벌)·자몽뀨(친구)</li>
          </ul>
        </div>
      </div>

      <div class="bio-tip">Tip: 아바타 클릭으로 카드 고정/해제</div>
    </div>
  `;
  avatar.addEventListener("click", () => avatar.classList.toggle("show-bio"));

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

function scrollBottom(){ $messages.scrollTop = $messages.scrollHeight; }
function pickRandom(arr){ return arr[Math.floor(Math.random()*arr.length)]; }

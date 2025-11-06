// 프로필 카드에 “네뷸라 시리즈” 추가

// ... 상단 동일

function addBot(text, opts = {}){
  const li = document.createElement("li");
  li.className = "msg bot" + (opts.thinking ? " thinking" : "");

  const avatar = document.createElement("div");
  avatar.className = "avatar";
  avatar.innerHTML = `
    <img alt="행돌 프로필" class="avatar-img" src="https://i.namu.wiki/i/WnNvjJZqUi-RZqxnEPnolaFIs8Ydu6g2dFKaD2JYJsCs4-rqc0u5jfVHh2kD1LzJw6VfmYyanpUwk7sLSmMpdQ.webp">
    <div class="bio-card">
      <div class="bio-head">
        <img alt="" src="https://i.namu.wiki/i/WnNvjJZqUi-RZqxnEPnolaFIs8Ydu6g2dFKaD2JYJsCs4-rqc0u5jfVHh2kD1LzJw6VfmYyanpUwk7sLSmMpdQ.webp">
        <div><strong>행돌</strong><span>치지직 · 발로란트 파트너</span></div>
      </div>

      <div class="bio-badges">
        <span class="badge red">JUST PIEDRA</span>
        <span class="badge red">I'm GOD~</span>
        <span class="badge teal">현대인의 필수품 쇼티!</span>
      </div>

      <div class="bio-two">
        <div class="bio-section">
          <h4>셰리프 스킨 취향</h4>
          <ul>
            <li><b>S티어</b>: 싱귤래리티</li>
            <li><b>1티어</b>: 쿠로나미(단단한데 명중감 좋음), 메이지펑크, 둠브링어, 프로토콜, 아이온, 약탈자, 네오프런티어</li>
          </ul>
        </div>
        <div class="bio-section">
          <h4>💜 네뷸라 시리즈</h4>
          <p>행돌의 퍼스널 컬러는 <b>보라색</b>.  
          그래서 모두가 싫어하는 <b>네뷸라 셰리프·가디언·팬텀</b>을 진심으로 좋아함.  
          “보라색은 내 색이야” 라는 말 자주 함 ㅋㅋ</p>
        </div>
      </div>

      <div class="bio-section">
        <h4>팀 & 친구</h4>
        <ul>
          <li>과거 올드타운 → 현재 WER 팀</li>
          <li>크포(할배), 자몽뀨(절친), 츈츈(제아벌), 선데이(순대)</li>
          <li>마뫄, 거갈없, 김된모, 하누, 버니버니, 에피나</li>
        </ul>
      </div>

      <div class="bio-tip">보라색이 행돌의 상징 🎯</div>
    </div>
  `;

  // ... 나머지 동일 (생략)
}

const $form = document.getElementById("chat-form");
const $input = document.getElementById("input");
const $messages = document.getElementById("messages");

function addUser(text){
  const li = document.createElement("li");
  li.className = "msg user";
  li.innerHTML = `<div class="bubble">${text}</div>`;
  $messages.appendChild(li);
  li.scrollIntoView({behavior:"smooth"});
}

function addBot(text){
  const li = document.createElement("li");
  li.className = "msg bot";
  li.innerHTML = `
    <img src="https://i.namu.wiki/i/WnNvjJZqUi-RZqxnEPnolaFIs8Ydu6g2dFKaD2JYJsCs4-rqc0u5jfVHh2kD1LzJw6VfmYyanpUwk7sLSmMpdQ.webp" class="avatar-img" alt="행돌"/>
    <div class="content">
      <div class="name-row">
        <span class="name">행돌</span>
        <span class="slogan">현대인의 필수품 쇼티!</span>
      </div>
      <div class="bubble">${text}</div>
    </div>`;
  $messages.appendChild(li);
  li.scrollIntoView({behavior:"smooth"});
}

$form.addEventListener("submit", async (e)=>{
  e.preventDefault();
  const text = $input.value.trim();
  if(!text) return;

  addUser(text);
  $input.value = "";

  const thinking = addBot("생각 중…");

  const $sendBtn = document.getElementById("send-btn");
  $input.disabled = true;
  $sendBtn.disabled = true;

  try{
    const res = await fetch("/.netlify/functions/chat",{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({message:text})
    });

    if(!res.ok) throw new Error(await res.text());
    const data = await res.json();
    thinking.remove();
    addBot(data.reply ?? "응답 형식을 확인해주세요.");
  }catch(err){
    thinking.remove();
    console.error(err);
    addBot("서버가 잠깐 멈췄나봐. 다시 쳐줘!");
  }finally{
    $input.disabled = false;
    $sendBtn.disabled = false;
    $input.focus();
  }
});

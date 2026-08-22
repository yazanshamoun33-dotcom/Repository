(() => {
  const endpoint = 'https://bepdhsykvcknbtkcotzs.supabase.co/functions/v1/Ask-yazan';
  const history = [];

  const style = document.createElement('style');
  style.textContent = `
    .yazan-ai-launch{position:fixed;right:18px;bottom:18px;z-index:90;border:1px solid #9ee7d8;background:#9ee7d8;color:#07110e;border-radius:999px;padding:13px 17px;font:700 14px Arial,sans-serif;box-shadow:0 14px 40px rgba(0,0,0,.38);cursor:pointer}
    .yazan-ai-panel{position:fixed;right:18px;bottom:76px;z-index:95;width:min(390px,calc(100vw - 28px));height:min(590px,calc(100vh - 110px));display:none;flex-direction:column;border:1px solid #2a323b;border-radius:22px;overflow:hidden;background:#101419;color:#f2f5f7;box-shadow:0 28px 90px rgba(0,0,0,.55);font-family:Arial,sans-serif}
    .yazan-ai-panel.open{display:flex}.yazan-ai-head{display:flex;justify-content:space-between;gap:14px;align-items:center;padding:17px 18px;border-bottom:1px solid #2a323b;background:#14191f}.yazan-ai-head strong{display:block}.yazan-ai-head small{color:#a7b0b9}.yazan-ai-close{border:0;background:transparent;color:#f2f5f7;font-size:24px;cursor:pointer}.yazan-ai-messages{flex:1;overflow:auto;padding:16px;display:flex;flex-direction:column;gap:10px}.yazan-ai-msg{max-width:88%;padding:11px 13px;border-radius:15px;line-height:1.45;font-size:14px;white-space:pre-wrap}.yazan-ai-msg.bot{align-self:flex-start;background:#192028;border:1px solid #2a323b}.yazan-ai-msg.user{align-self:flex-end;background:#9ee7d8;color:#07110e}.yazan-ai-quick{display:flex;gap:7px;overflow:auto;padding:0 14px 12px}.yazan-ai-quick button{white-space:nowrap;border:1px solid #2a323b;background:#14191f;color:#cbd3da;border-radius:999px;padding:7px 10px;font-size:12px;cursor:pointer}.yazan-ai-form{display:flex;gap:8px;padding:12px;border-top:1px solid #2a323b;background:#0d1115}.yazan-ai-input{flex:1;min-width:0;border:1px solid #2a323b;border-radius:12px;background:#101419;color:#f2f5f7;padding:11px 12px;font:14px Arial,sans-serif}.yazan-ai-send{border:0;border-radius:12px;background:#9ee7d8;color:#07110e;font-weight:800;padding:0 14px;cursor:pointer}.yazan-ai-send:disabled{opacity:.55}.yazan-ai-note{padding:0 14px 12px;color:#77828c;font-size:11px;background:#0d1115}
    @media(max-width:520px){.yazan-ai-launch{right:12px;bottom:12px}.yazan-ai-panel{right:8px;bottom:68px;width:calc(100vw - 16px);height:min(650px,calc(100vh - 86px));border-radius:18px}}
  `;
  document.head.appendChild(style);

  const launch = document.createElement('button');
  launch.className = 'yazan-ai-launch';
  launch.type = 'button';
  launch.textContent = '✨ Ask Yazan AI';

  const panel = document.createElement('section');
  panel.className = 'yazan-ai-panel';
  panel.setAttribute('aria-label', 'Ask Yazan AI');
  panel.innerHTML = `
    <div class="yazan-ai-head"><div><strong>Ask Yazan AI</strong><small>Portfolio assistant</small></div><button class="yazan-ai-close" type="button" aria-label="Close">×</button></div>
    <div class="yazan-ai-messages"><div class="yazan-ai-msg bot">Hi — ask me about Yazan’s mechanical engineering experience, projects, BIM/MEP skills, software, or certifications.</div></div>
    <div class="yazan-ai-quick"><button type="button">Data center experience?</button><button type="button">What software does Yazan use?</button><button type="button">Tell me about Kuwait Airport</button></div>
    <form class="yazan-ai-form"><input class="yazan-ai-input" maxlength="2000" placeholder="Ask about Yazan’s experience…" aria-label="Ask a question"><button class="yazan-ai-send" type="submit">Send</button></form>
    <div class="yazan-ai-note">AI answers are limited to information in this portfolio. Contact Yazan for hiring or availability.</div>
  `;

  document.body.appendChild(launch);
  document.body.appendChild(panel);

  const close = panel.querySelector('.yazan-ai-close');
  const messages = panel.querySelector('.yazan-ai-messages');
  const form = panel.querySelector('.yazan-ai-form');
  const input = panel.querySelector('.yazan-ai-input');
  const send = panel.querySelector('.yazan-ai-send');

  const add = (text, who) => {
    const el = document.createElement('div');
    el.className = `yazan-ai-msg ${who}`;
    el.textContent = text;
    messages.appendChild(el);
    messages.scrollTop = messages.scrollHeight;
    return el;
  };

  async function ask(question){
    const q = String(question || '').trim();
    if (!q) return;
    add(q, 'user');
    input.value = '';
    input.disabled = true;
    send.disabled = true;
    const waiting = add('Thinking…', 'bot');
    try{
      const r = await fetch(endpoint, {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({message:q, history})
      });
      const data = await r.json().catch(() => ({}));
      if(!r.ok) throw new Error(data.error || 'AI unavailable');
      waiting.textContent = data.answer || 'I could not generate an answer.';
      history.push({role:'user',content:q},{role:'assistant',content:waiting.textContent});
      if(history.length > 12) history.splice(0, history.length - 12);
    }catch(e){
      waiting.textContent = 'The AI assistant is not connected yet. Please contact Yazan directly for now.';
    }finally{
      input.disabled = false;
      send.disabled = false;
      input.focus();
    }
  }

  launch.addEventListener('click', () => { panel.classList.toggle('open'); if(panel.classList.contains('open')) input.focus(); });
  close.addEventListener('click', () => panel.classList.remove('open'));
  form.addEventListener('submit', e => { e.preventDefault(); ask(input.value); });
  panel.querySelectorAll('.yazan-ai-quick button').forEach(b => b.addEventListener('click', () => ask(b.textContent)));
})();

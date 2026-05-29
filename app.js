const DATA_URL = 'data/fighters.json';
const PLACEHOLDER = 'assets/img/fighter-placeholder.svg';
let FIGHTERS = [];
let chartInst = null;

const $ = (id) => document.getElementById(id);
const safe = (v) => String(v ?? '—').replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#039;','"':'&quot;'}[c]));
const fmt = (v) => (v === null || v === undefined || v === '') ? '—' : safe(v);
const num = (v) => Number.isFinite(Number(v)) ? Number(v) : 0;

function normalize(str){
  return String(str || '')
    .normalize('NFD').replace(/[\u0300-\u036f]/g,'')
    .replace(/['’`´]/g,'')
    .replace(/[^a-zA-Z0-9\s]/g,' ')
    .replace(/\s+/g,' ')
    .trim().toLowerCase();
}

function proxied(url){
  if(!url || !/^https?:\/\//.test(url)) return null;
  return 'https://images.weserv.nl/?url=' + url.replace(/^https?:\/\//,'') + '&w=600&h=600&fit=contain&output=webp';
}

function imageCandidates(f){
  // Ordem nova: foto remota primeiro, proxy como plano B, foto local se você enviar em assets/fighters, depois placeholder.
  // Na V1 anterior a foto local vinha primeiro; como a pasta estava vazia, o navegador tentava vários 404 antes do fallback.
  const remote = f.remotePhoto || f.photo;
  return [remote, proxied(remote), f.localPhoto, PLACEHOLDER].filter(Boolean);
}

window.handleImgError = function(img){
  const list = JSON.parse(img.dataset.fallbacks || '[]');
  const next = list.shift();
  img.dataset.fallbacks = JSON.stringify(list);
  if(next){ img.src = next; return; }
  img.src = PLACEHOLDER;
};

function imgTag(f, cls='fighter-img'){
  const candidates = imageCandidates(f);
  const first = candidates.shift() || PLACEHOLDER;
  return `<img class="${cls}" src="${safe(first)}" alt="${safe(f.name)}" data-fallbacks='${safe(JSON.stringify(candidates))}' onerror="handleImgError(this)"/>`;
}

async function init(){
  try{
    const res = await fetch(DATA_URL, {cache:'no-store'});
    if(!res.ok) throw new Error('Não consegui carregar data/fighters.json');
    const raw = await res.json();
    FIGHTERS = dedupe(raw).sort((a,b)=>a.name.localeCompare(b.name));
    fillDivisions();
    setup(1); setup(2);
    $('cbtn').addEventListener('click', compare);
    $('randomBtn').addEventListener('click', randomCompare);
    $('divisionFilter').addEventListener('change', () => { updateCounter(); clearSuggestions(); });
    updateCounter();
  }catch(e){
    $('counter').textContent = 'Erro ao carregar base';
    $('result').classList.add('show');
    $('result').innerHTML = `<div class="err"><strong>Erro:</strong> ${safe(e.message)}. No GitHub Pages, confira se a pasta data e o arquivo fighters.json foram enviados.</div>`;
  }
}

function dedupe(list){
  const map = new Map();
  list.forEach(f => { if(f && f.name && !map.has(normalize(f.name))) map.set(normalize(f.name), f); });
  return [...map.values()];
}

function visibleFighters(){
  const div = $('divisionFilter').value;
  return div ? FIGHTERS.filter(f => f.div === div) : FIGHTERS;
}

function fillDivisions(){
  const divs = [...new Set(FIGHTERS.map(f=>f.div).filter(Boolean))].sort();
  $('divisionFilter').innerHTML = '<option value="">Todas as divisões</option>' + divs.map(d=>`<option value="${safe(d)}">${safe(d)}</option>`).join('');
}

function updateCounter(){
  const total = visibleFighters().length;
  const complete = visibleFighters().filter(f => f.status !== 'basic').length;
  const basic = total - complete;
  $('counter').textContent = `${total} lutadores disponíveis · ${complete} perfis completos · ${basic} perfis básicos`;
}

function clearSuggestions(){ ['s1','s2'].forEach(id => $(id).classList.remove('open')); }

function scoreMatch(f, q){
  const hay = normalize([f.name, f.nick, f.div, f.country, f.title].filter(Boolean).join(' '));
  const name = normalize(f.name);
  const nick = normalize(f.nick);
  if(!q) return 0;
  if(name === q) return 100;
  if(name.startsWith(q)) return 90;
  if(nick && nick.startsWith(q)) return 80;
  if(hay.includes(q)) return 60;
  return 0;
}

function search(q){
  const nq = normalize(q);
  if(!nq) return [];
  return visibleFighters()
    .map(f => ({f, s: scoreMatch(f, nq)}))
    .filter(x => x.s > 0)
    .sort((a,b) => b.s - a.s || a.f.name.localeCompare(b.f.name))
    .slice(0, 15)
    .map(x => x.f);
}

function setup(n){
  const inp = $('i'+n);
  const box = $('s'+n);
  inp.addEventListener('input', () => {
    delete inp.dataset.id;
    updateBtn();
    const res = search(inp.value);
    if(!res.length){ box.classList.remove('open'); return; }
    box.innerHTML = res.map(f => `
      <div class="si" data-id="${safe(f.id)}">
        ${imgTag(f, 'si-photo')}
        <div>
          <div class="si-name">${safe(f.name)}${f.nick ? ` <span class="si-nick">"${safe(f.nick)}"</span>` : ''}</div>
          <div class="si-div">${safe(f.div)} · ${safe(f.country)} ${f.status === 'basic' ? '· perfil básico' : ''}</div>
        </div>
      </div>`).join('');
    box.querySelectorAll('.si').forEach(item => {
      item.addEventListener('mousedown', () => {
        const f = FIGHTERS.find(x => x.id === item.dataset.id);
        if(!f) return;
        inp.value = f.name;
        inp.dataset.id = f.id;
        box.classList.remove('open');
        updateBtn();
      });
    });
    box.classList.add('open');
  });
  inp.addEventListener('blur', () => setTimeout(()=>box.classList.remove('open'),180));
  inp.addEventListener('keydown', e => {
    if(e.key === 'Enter') { box.classList.remove('open'); if(!$('cbtn').disabled) compare(); }
    if(e.key === 'Escape') box.classList.remove('open');
  });
}

function updateBtn(){
  $('cbtn').disabled = !$('i1').value.trim() || !$('i2').value.trim();
}

function getF(n){
  const inp = $('i'+n);
  if(inp.dataset.id) return FIGHTERS.find(f => f.id === inp.dataset.id) || null;
  const q = normalize(inp.value);
  const exact = visibleFighters().find(f => normalize(f.name) === q || normalize(f.nick) === q);
  if(exact) return exact;
  const matches = search(inp.value);
  return matches[0] || null;
}

function compare(){
  const f1 = getF(1), f2 = getF(2);
  const el = $('result');
  if(!f1 || !f2){
    el.classList.add('show');
    el.innerHTML = '<div class="err">Lutador não encontrado. Tente escolher uma sugestão da lista ou limpar o filtro de divisão.</div>';
    return;
  }
  el.classList.add('show');
  render(f1, f2);
  setTimeout(()=>el.scrollIntoView({behavior:'smooth', block:'start'}), 100);
}

function randomCompare(){
  const list = visibleFighters().filter(f => f.status !== 'basic');
  if(list.length < 2) return;
  const a = list[Math.floor(Math.random()*list.length)];
  let b = list[Math.floor(Math.random()*list.length)];
  while(b.id === a.id) b = list[Math.floor(Math.random()*list.length)];
  $('i1').value = a.name; $('i1').dataset.id = a.id;
  $('i2').value = b.name; $('i2').dataset.id = b.id;
  updateBtn(); compare();
}

function qualityBadge(f){
  const basic = f.status === 'basic' || f.dataQuality === 'basic-profile';
  return `<div class="badge-quality ${basic ? 'basic' : ''}">${basic ? 'perfil básico' : 'perfil completo'} · ${safe(f.dataUpdated || 'sem data')}</div>`;
}

function card(f, cls, label){
  const r = f.record || {}, fi = f.fin || {};
  return `<div class="fc ${cls}">
    <div class="clbl">${safe(label)}</div>
    <div class="photo-wrap">
      ${f.champ ? '<div class="champ-badge">👑 CAMPEÃO</div>' : ''}
      ${imgTag(f)}
    </div>
    <div class="finfo">
      <div class="fname">${safe(f.name)}</div>
      ${f.nick ? `<div class="fnick">"${safe(f.nick)}"</div>` : ''}
      <div class="fdiv">${safe(f.div || '—')}</div>
      ${f.title ? `<div style="font-size:.63rem;color:var(--gold);margin-top:4px">${safe(f.title)}</div>` : ''}
      ${qualityBadge(f)}
      <div class="rec">
        <span class="rn w">${fmt(r.w)}</span><span class="rs">-</span>
        <span class="rn l">${fmt(r.l)}</span><span class="rs">-</span>
        <span class="rn d">${fmt(r.d)}</span>
      </div>
      <div class="rlbl">Vitórias · Derrotas · Empates</div>
      <div class="phys">
        <div><div class="pv">${fmt(f.height)}</div><div class="pl">Altura</div></div>
        <div><div class="pv">${fmt(f.reach)}</div><div class="pl">Alcance</div></div>
        <div><div class="pv">${fmt(f.age)}</div><div class="pl">Idade</div></div>
        <div><div class="pv">${fmt(f.stance)}</div><div class="pl">Stance</div></div>
        <div style="grid-column:span 2"><div class="pv" style="font-size:.82rem">${fmt(f.team)}</div><div class="pl">Team</div></div>
      </div>
      <div class="fins">
        <div class="fb"><div class="fv ko">${fmt(fi.ko)}</div><div class="fl">KO/TKO</div></div>
        <div class="fb"><div class="fv sub">${fmt(fi.sub)}</div><div class="fl">Sub</div></div>
        <div class="fb"><div class="fv dec">${fmt(fi.dec)}</div><div class="fl">Dec</div></div>
      </div>
      ${f.notes ? `<div class="meta-note">${safe(f.notes)}</div>` : ''}
    </div>
  </div>`;
}

function hist(f){
  const rows = (f.fights || []).slice(0,5).map(x => `
    <div class="frow">
      <div class="fres ${safe(x.r || 'D')}">${safe(x.r || '?')}</div>
      <div style="flex:1">
        <div class="fopp">${safe(x.opp || '—')}</div>
        <div class="fmeth">${safe(x.meth || '—')} · R${safe(x.rnd || '—')} ${safe(x.t || '')}</div>
      </div>
      <div class="fev">${safe(x.ev || '—')}</div>
    </div>`).join('');
  return `<div class="hcard">
    <div class="hhdr">${safe(f.name)} · últimas lutas</div>
    ${rows || '<div class="empty-hist">Histórico ainda não cadastrado neste perfil. Complete o campo <strong>fights</strong> no arquivo <strong>data/fighters.json</strong>.</div>'}
  </div>`;
}

function bar(f1,f2,k,lbl){
  const v1 = num(f1.stats?.[k]), v2 = num(f2.stats?.[k]);
  const max = Math.max(v1, v2, 1);
  return `<div class="srow">
    <div class="blft"><div class="bv r">${v1 || '—'}</div><div class="bwrap"><div class="bf r" style="width:${(v1/max)*100}%"></div></div></div>
    <div class="blbl">${safe(lbl)}</div>
    <div class="brgt"><div class="bv b">${v2 || '—'}</div><div class="bwrap"><div class="bf b" style="width:${(v2/max)*100}%"></div></div></div>
  </div>`;
}

function render(f1, f2){
  if(chartInst) chartInst.destroy();
  $('result').innerHTML = `
    <div class="fighters-row">
      ${card(f1,'rc','Red Corner')}
      <div class="vs-col"><div class="vline"></div><div class="vs-big">VS</div><div class="vline"></div></div>
      ${card(f2,'bc','Blue Corner')}
    </div>
    <div class="stitle">RADAR COMPARATIVO</div>
    <div class="radar-wrap">
      <canvas id="rc" width="320" height="320"></canvas>
      <div class="rlegend">
        <div class="rli"><span class="rldot" style="background:var(--red)"></span>${safe(f1.name)}</div>
        <div class="rli"><span class="rldot" style="background:#5b9edd"></span>${safe(f2.name)}</div>
        <div class="rnote">SLpM = Strikes/Min<br>SA = Precisão<br>SD = Defesa<br>TD = Takedowns<br>TDD = Defesa TD<br>SUB = Submissões</div>
      </div>
    </div>
    <div class="stitle">ESTATÍSTICAS DETALHADAS</div>
    <div class="sbars">
      ${bar(f1,f2,'slpm','Strikes / Min')}
      ${bar(f1,f2,'sacc','Precisão Strikes (%)')}
      ${bar(f1,f2,'sdef','Defesa Strikes (%)')}
      ${bar(f1,f2,'tdavg','Takedowns / 15 Min')}
      ${bar(f1,f2,'tdacc','Precisão Takedown (%)')}
      ${bar(f1,f2,'tddef','Defesa Takedown (%)')}
      ${bar(f1,f2,'subavg','Tentativas Sub / 15 Min')}
      ${bar(f1,f2,'kdavg','Knockdowns / 15 Min')}
    </div>
    <div class="stitle">HISTÓRICO DE LUTAS</div>
    <div class="hgrid">${hist(f1)}${hist(f2)}</div>`;
  drawRadar(f1,f2);
}

function drawRadar(f1,f2){
  const ctx = $('rc')?.getContext('2d');
  if(!ctx || typeof Chart === 'undefined') return;
  const keys=['slpm','sacc','sdef','tdavg','tddef','subavg'];
  const mxs=[10,100,100,8,100,4];
  const lbls=['Strikes\n/Min','Precisão\nStrike','Defesa\nStrike','Takedowns','Def.\nTakedown','Submissões'];
  const nm=(v,mx)=>Math.min(100,Math.round(num(v)/mx*100));
  chartInst = new Chart(ctx,{type:'radar',data:{labels:lbls,datasets:[
    {label:f1.name,data:keys.map((k,i)=>nm(f1.stats?.[k],mxs[i])),backgroundColor:'rgba(210,10,10,0.18)',borderColor:'rgba(210,10,10,0.85)',borderWidth:2,pointBackgroundColor:'rgba(210,10,10,0.85)',pointRadius:4},
    {label:f2.name,data:keys.map((k,i)=>nm(f2.stats?.[k],mxs[i])),backgroundColor:'rgba(26,107,191,0.18)',borderColor:'rgba(91,158,221,0.85)',borderWidth:2,pointBackgroundColor:'rgba(91,158,221,0.85)',pointRadius:4}
  ]},options:{responsive:false,plugins:{legend:{display:false}},scales:{r:{min:0,max:100,ticks:{display:false},grid:{color:'rgba(255,255,255,0.06)'},angleLines:{color:'rgba(255,255,255,0.06)'},pointLabels:{color:'rgba(255,255,255,0.55)',font:{family:'Oswald',size:10,weight:'500'}}}}}});
}

init();

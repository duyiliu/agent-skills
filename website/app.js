const $ = selector => document.querySelector(selector);
const labels = { all: '全部 Skills', engineering: '工程研发', goals: 'Goal 工作流', management: '仓库管理' };
const icons = { all: '▦', engineering: '⌘', goals: '◎', management: '↗' };
const english = { engineering: 'ENGINEERING', goals: 'GOALS', management: 'MANAGEMENT' };
let catalog, category = 'all', activeSkill, activeFile, routeWasOpened = false;
const dialog = $('#detail');
function el(tag, text, className) { const n = document.createElement(tag); if (text !== undefined) n.textContent = text; if (className) n.className = className; return n; }
const formatDate = iso => iso ? new Intl.DateTimeFormat('zh-CN', { timeZone: 'Asia/Shanghai', month: '2-digit', day: '2-digit' }).format(new Date(iso)) : '—';

function inline(text, parent) {
  const regex = /(`[^`]+`|\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\))/g;
  let start = 0;
  for (const match of text.matchAll(regex)) {
    parent.append(document.createTextNode(text.slice(start, match.index)));
    const token = match[0];
    if (token.startsWith('`')) parent.append(el('code', token.slice(1,-1)));
    else if (token.startsWith('**')) parent.append(el('strong', token.slice(2,-2)));
    else {
      const parts = token.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
      const target = parts[2].replace(/^<|>$/g, '');
      if (/^https?:\/\//i.test(target)) { const a = el('a', parts[1]); a.href = target; a.target = '_blank'; a.rel = 'noopener noreferrer'; parent.append(a); }
      else { const candidate = activeFile.repoPath.split('/').slice(0,-1).join('/') + '/' + target.split('#')[0]; const absolute = new URL(candidate, 'https://repository.local/').pathname.slice(1); const file = activeSkill.files.find(f => f.repoPath === decodeURIComponent(absolute)); if (file) { const a=el('a', parts[1]); a.href='#'; a.onclick=e=>{e.preventDefault();selectFile(file);}; parent.append(a); } else parent.append(el('span', parts[1])); }
    }
    start = match.index + token.length;
  }
  parent.append(document.createTextNode(text.slice(start)));
}
function markdown(source) {
  const root = document.createDocumentFragment();
  const lines = source.replace(/^\uFEFF/, '').replace(/\r/g,'').replace(/^---\n[\s\S]*?\n---\n/, '').split('\n');
  let list = null;
  for (let i=0;i<lines.length;i++) {
    const line = lines[i];
    if (/^\s*(```|~~~)/.test(line)) {
      const fence=line.trim().slice(0,3), block=[]; while (++i<lines.length && !lines[i].trim().startsWith(fence)) block.push(lines[i]);
      const pre=el('pre'); pre.append(el('code',block.join('\n'))); root.append(pre); list=null; continue;
    }
    if (!line.trim()) {list=null;continue;}
    if (/^\s*[-*_]{3,}\s*$/.test(line)) {root.append(el('hr'));list=null;continue;}
    if (line.includes('|') && /^\s*\|?\s*:?-{3,}/.test(lines[i+1] || '')) {
      const cells = s => s.trim().replace(/^\||\|$/g,'').split('|').map(x=>x.trim());
      const table=el('table'), head=el('thead'), row=el('tr'); cells(line).forEach(x=>{const c=el('th');inline(x,c);row.append(c);});head.append(row);table.append(head);i++;
      const body=el('tbody');while (i+1<lines.length && lines[i+1].trim() && lines[i+1].includes('|')) { const tr=el('tr');cells(lines[++i]).forEach(x=>{const c=el('td');inline(x,c);tr.append(c);});body.append(tr);}table.append(body);root.append(table);list=null;continue;
    }
    const heading=line.match(/^(#{1,6})\s+(.+)$/); if(heading){const node=el(`h${heading[1].length}`);inline(heading[2],node);root.append(node);list=null;continue;}
    const item=line.match(/^\s*(?:([-*+])|\d+[.)])\s+(.*)$/);if(item){const type=item[1]?'ul':'ol';if(!list || list.tagName.toLowerCase()!==type){list=el(type);root.append(list);}const li=el('li');inline(item[2],li);list.append(li);continue;}
    list=null;const node=el(line.startsWith('>')?'blockquote':'p');inline(line.replace(/^>\s?/,''),node);root.append(node);
  }
  return root;
}
function renderCategories() {
  $('#categories').replaceChildren(...Object.keys(labels).map(key=>{
    const count=catalog.entries.filter(e=>key==='all'||e.category===key).length;
    const button=el('button',undefined,'category'+(key===category?' active':''));button.setAttribute('aria-pressed',String(key===category));
    button.append(el('span',icons[key],'category-icon'),el('span',labels[key]),el('span',String(count).padStart(2,'0'),'category-count'));
    button.onclick=()=>{category=key;renderCategories();renderCards();};return button;
  }));
}
function renderCards() {
  const q=$('#search').value.trim().toLocaleLowerCase();$('#clear').hidden=!q;
  const filtered=catalog.entries.filter(e=>(category==='all'||e.category===category) && (!q||`${e.name} ${e.description} ${e.files.map(f=>f.content).join(' ')}`.toLocaleLowerCase().includes(q)));
  filtered.sort($('#sort').value==='updated' ? (a,b)=>b.updatedAt.localeCompare(a.updatedAt) : (a,b)=>a.name.localeCompare(b.name));
  $('#library-title').textContent=labels[category];$('#result-count').textContent=`${filtered.length} 个${q?'匹配结果':'可用 Skills'}`;
  $('#empty').hidden=filtered.length>0;
  $('#cards').replaceChildren(...filtered.map(skill=>{
    const card=el('article',undefined,'card');card.dataset.category=skill.category;
    const top=el('div',undefined,'card-top');top.append(el('span',icons[skill.category],'card-icon'),el('span',english[skill.category],'tag'));
    const title=el('h3'),button=el('button',skill.name);button.onclick=()=>openSkill(skill);title.append(button);
    card.append(top,title,el('p',skill.description,'card-summary'));
    const bottom=el('div',undefined,'card-bottom');bottom.append(el('span',`${String(skill.files.length).padStart(2,'0')} 个文件 · ${formatDate(skill.updatedAt)} 更新`),el('span','↗'));card.append(bottom);
    card.onclick=e=>{if(!e.target.closest('button'))openSkill(skill);};return card;
  }));
}
function selectFile(file, updateRoute=true) {
  activeFile=file;$('#document').replaceChildren(markdown(file.content));$('#edit-link').href=file.editUrl;
  $('#copy').textContent='复制全文';$('#download').textContent='下载当前文件 ↓';
  $('#file-list').replaceChildren(...activeSkill.files.map(f=>{const b=el('button',f.path,f.path===file.path?'active':'');b.setAttribute('aria-current',f.path===file.path?'true':'false');b.onclick=()=>selectFile(f);return b;}));
  if(updateRoute)history.replaceState(null,'',`#${new URLSearchParams({skill:activeSkill.name,file:file.path})}`);
}
function openSkill(skill, filePath, push=true) {
  activeSkill=skill;$('#detail-title').textContent=skill.name;$('#detail-description').textContent=skill.description;$('#detail-category').textContent=english[skill.category];
  if(push){history.pushState(null,'',`#${new URLSearchParams({skill:skill.name})}`);routeWasOpened=true;}
  selectFile(skill.files.find(f=>f.path===filePath)||skill.files[0],push);
  if(!dialog.open)dialog.showModal();dialog.scrollTop=0;
}
function applyRoute() {
  if(!catalog)return;const route=new URLSearchParams(location.hash.slice(1));const skill=catalog.entries.find(e=>e.name===route.get('skill'));
  if(skill)openSkill(skill,route.get('file'),false);else if(dialog.open)dialog.close();
}
function closeDetail(){if(routeWasOpened){routeWasOpened=false;history.back();}else {history.replaceState(null,'',location.pathname+location.search);dialog.close();}}
$('#search').addEventListener('input',()=>catalog&&renderCards());$('#sort').addEventListener('change',()=>catalog&&renderCards());
$('#clear').onclick=()=>{$('#search').value='';renderCards();$('#search').focus();};
$('#reset').onclick=()=>{$('#search').value='';category='all';renderCategories();renderCards();};
$('#close-detail').onclick=closeDetail;
dialog.addEventListener('cancel',e=>{e.preventDefault();closeDetail();});
dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)closeDetail();}});
$('#copy').onclick=async()=>{try{await navigator.clipboard.writeText(activeFile.content);$('#copy').textContent='已复制 ✓';}catch{$('#copy').textContent='复制失败，请选中文本复制';}};
$('#download').onclick=()=>{const url=URL.createObjectURL(new Blob([activeFile.content],{type:'text/plain;charset=utf-8'}));const a=el('a');a.href=url;a.download=activeFile.path.split('/').pop();a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};
document.addEventListener('keydown',e=>{if(e.key==='/'&&!dialog.open&&!/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)){e.preventDefault();$('#search').focus();}});
window.addEventListener('popstate',applyRoute);window.addEventListener('hashchange',applyRoute);
try {
  const response=await fetch('./catalog.json');if(!response.ok)throw new Error(`HTTP ${response.status}`);catalog=await response.json();
  $('#skill-count').textContent=String(catalog.entries.length).padStart(2,'0');$('#revision').textContent=`版本 ${catalog.revision.slice(0,7)} · 发布 ${new Date(catalog.builtAt).toLocaleDateString('zh-CN',{timeZone:'Asia/Shanghai'})}`;
  renderCategories();renderCards();applyRoute();
} catch(error) {
  $('#result-count').textContent='加载失败';const message=el('div','Skill 目录暂时无法加载，请刷新重试。','load-error');const retry=el('button','重新加载','button');retry.onclick=()=>location.reload();message.append(retry);$('#cards').replaceChildren(message);console.error(error);
} finally {$('#cards').setAttribute('aria-busy','false');}

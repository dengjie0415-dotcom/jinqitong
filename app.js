/* ============================================================
   津企通 · 交互脚本
   语言持久化 · TTS 朗读 · 答案乱序 · 认证模型 · 状态传递
   ============================================================ */

function isZh() {
  return document.body.dataset.lang === 'zh';
}

/* 中英文切换（持久化，跨页生效；并刷新依赖语言的反馈内容） */
function setLang(lang) {
  document.body.dataset.lang = lang;
  try { localStorage.setItem('jqt_lang', lang); } catch (e) {}
  syncLangButtons();
  renderPracticeFeedback();
  if (typeof window.onLangChange === 'function') window.onLangChange();
}

function syncLangButtons() {
  const zh = document.getElementById('btnZh');
  const en = document.getElementById('btnEn');
  if (zh) zh.classList.toggle('active', isZh());
  if (en) en.classList.toggle('active', !isZh());
}

/* 待上线入口：不可跳转，点击提示 */
function soon(e) {
  if (e) e.preventDefault();
  toast(isZh() ? '该功能即将上线' : 'Coming soon');
}

/* 付费/免费视角切换（企业端人才池） */
function setView(v) {
  document.body.dataset.view = v;
  const f = document.getElementById('btnFree');
  const p = document.getElementById('btnPaid');
  if (f) f.classList.toggle('active', v === 'free');
  if (p) p.classList.toggle('active', v === 'paid');
}

/* 指标埋点占位（console 事件，便于后续接真实埋点） */
function track(event, data) {
  try { console.log('[jqt-track]', event, data || {}); } catch (e) {}
}

/* 预约试点沟通提交（演示，未接后端） */
function submitLead(e) {
  if (e) e.preventDefault();
  toast(isZh() ? '已记录（演示）· 未接后端' : 'Recorded (demo) · not connected');
}

/* ============ 跟读录音（MediaRecorder，不评分） ============ */
let _rec = null, _chunks = [];
function recordVoice(btn) {
  if (_rec && _rec.state === 'recording') {
    _rec.stop();
    if (btn) btn.textContent = isZh() ? '🎤 跟读' : '🎤 Record';
    return;
  }
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia || typeof MediaRecorder === 'undefined') {
    toast(isZh() ? '当前浏览器不支持录音' : 'Recording not supported in this browser');
    return;
  }
  navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
    _chunks = [];
    _rec = new MediaRecorder(stream);
    _rec.ondataavailable = e => _chunks.push(e.data);
    _rec.onstop = () => {
      stream.getTracks().forEach(t => t.stop());
      const blob = new Blob(_chunks, { type: 'audio/webm' });
      const url = URL.createObjectURL(blob);
      const a = new Audio(url);
      a.play();
      toast(isZh() ? '已录制并回放（AI 评分待接入）' : 'Recorded — playing back (AI scoring to be added)');
    };
    _rec.start();
    if (btn) btn.textContent = isZh() ? '⏹ 停止' : '⏹ Stop';
  }).catch(() => toast(isZh() ? '无法访问麦克风' : 'Microphone unavailable'));
}

/* ============ TTS 朗读（Web Speech API） ============ */
function speak(text) {
  try {
    if (!('speechSynthesis' in window)) {
      toast(isZh() ? '当前浏览器不支持语音朗读' : 'Speech not supported in this browser');
      return;
    }
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'zh-CN';
    u.rate = 0.85;
    const zh = window.speechSynthesis.getVoices().find(v => v.lang && v.lang.toLowerCase().startsWith('zh'));
    if (zh) u.voice = zh;
    window.speechSynthesis.speak(u);
  } catch (e) {
    toast(isZh() ? '语音播放失败' : 'Speech playback failed');
  }
}

/* 单句朗读：先清空再读 */
function speakOne(text) {
  if ('speechSynthesis' in window) window.speechSynthesis.cancel();
  speak(text);
}

/* 整段连播：逐句顺序朗读，行间停顿 */
function speakSequence(lines, gapMs) {
  if ('speechSynthesis' in window) window.speechSynthesis.cancel();
  const gap = gapMs || 1400;
  lines.forEach((t, i) => setTimeout(() => speak(t), i * gap));
}

/* 旧 say() 包装：按 id 朗读对应中文 */
function say(id) {
  const SAY = {
    q1: '请先检查设备，再开机。',
    q2: '今天三十二人来上班了。',
    q3: '进车间要戴安全帽。',
    intro: '你好，我是塔万达。我是新同事。她是琪波，她也是新同事。'
  };
  if (SAY[id]) speakOne(SAY[id]);
  else speakOne('你好，欢迎来到津企通。');
}

/* 授权开关（演示状态，保存并在重渲染时恢复） */
function authToggle(cb) {
  if (setState({ authorized: !!cb.checked })) {
    toast(cb.checked ? (isZh() ? '已授权（演示）' : 'Authorized (demo)') : (isZh() ? '已取消授权（演示）' : 'Authorization off (demo)'));
  } else {
    cb.checked = !cb.checked;   // 保存失败，还原勾选
  }
}

/* 词卡翻转 */
function flip(card) {
  const py = card.querySelector('.py');
  const def = card.querySelector('.def');
  if (py) py.style.display = (py.style.display === 'none') ? 'block' : 'none';
  if (def) def.style.display = (def.style.display === 'none') ? 'block' : 'none';
}

/* ---------- 跨页状态（localStorage，带结构校验） ---------- */
function getState() {
  try {
    const v = JSON.parse(localStorage.getItem('jqt') || '{}');
    return (v && typeof v === 'object' && !Array.isArray(v)) ? v : {};
  } catch (e) { return {}; }
}
function setState(patch) {
  const s = getState();
  Object.assign(s, patch);
  try {
    localStorage.setItem('jqt', JSON.stringify(s));
    return true;
  } catch (e) {
    toast(isZh() ? '保存失败，请检查浏览器存储设置' : 'Save failed — check browser storage');
    return false;
  }
}

/* ============ 答案乱序（Fisher-Yates DOM 乱序） ============ */
function shuffleArray(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const t = a[i]; a[i] = a[j]; a[j] = t;
  }
  return a;
}

/* 对每个 [data-shuffle] 容器内的 .opt 选项做乱序 */
function shuffleOptions(selector) {
  document.querySelectorAll(selector || '[data-shuffle]').forEach(group => {
    const opts = Array.from(group.querySelectorAll('.opt'));
    if (opts.length < 2) return;
    shuffleArray(opts).forEach(o => group.appendChild(o));
  });
}

/* 判断某个选项是否正确（正确项带 data-correct="1"） */
function isCorrectOpt(o) {
  return o && o.getAttribute('data-correct') === '1';
}

/* ---------- 认证判定（布尔答案：true=答对） ---------- */
function computeResult(answers, keys) {
  const complete = keys.every(q => typeof answers[q] === 'boolean');
  const score = complete ? keys.filter(q => answers[q]).length : 0;
  return { complete, score, total: keys.length, answers };
}

const ASSESS_ABILITIES = { listen: ['1','2'], express: ['3','4'], collab: ['5','6'] };
const ASSESS_KEYS = ['1','2','3','4','5','6'];

/* 最终测评结果：分能力门槛 + 通过条件 + A/B 级映射 */
function getAssessmentResult() {
  const a = getState().assessment;
  const answers = (a && a.answers && typeof a.answers === 'object') ? a.answers : {};
  const base = computeResult(answers, ASSESS_KEYS);

  const abilityPassed = {};
  for (const k in ASSESS_ABILITIES) {
    abilityPassed[k] = ASSESS_ABILITIES[k].some(q => answers[q] === true);
  }
  const allAbilitiesPassed = Object.keys(abilityPassed).every(k => abilityPassed[k]);
  const passed = base.complete && base.score >= 4 && allAbilitiesPassed;
  const level = passed ? (base.score === 6 ? 'A' : 'B') : null;

  return Object.assign(base, { passed, level, abilityPassed, ABILITIES: ASSESS_ABILITIES });
}

/* 保存并跳转；失败时显示重试入口（答案已保留在 user 对象中） */
function finishAndGo(patch, url) {
  if (setState(patch)) {
    location.href = url;
    return;
  }
  const bar = document.getElementById('saveRetry');
  if (bar) bar.style.display = 'flex';
  const btn = document.getElementById('retryBtn');
  if (btn) btn.onclick = () => finishAndGo(patch, url);
}

/* ---------- 练习反馈（多题 · data-correct 判定 · 随语言刷新） ---------- */
const practiceState = {};
const PRACTICE_MSG = {
  zh: { ok: '✅ 正确！', no: '❌ 不对，再想想。' },
  en: { ok: '✅ Correct!', no: '❌ Not quite — try again.' }
};

function renderPracticeFeedback() {
  for (const q in practiceState) {
    const fb = document.getElementById('fb-' + q);
    if (fb) {
      const m = PRACTICE_MSG[isZh() ? 'zh' : 'en'];
      fb.innerHTML = practiceState[q] ? m.ok : m.no;
    }
  }
}

(function initPractice() {
  const opts = document.querySelectorAll('.opt[data-q]');
  if (!opts.length) return;
  opts.forEach(o => {
    o.addEventListener('click', () => {
      const q = o.dataset.q;
      document.querySelectorAll(`.opt[data-q="${q}"]`).forEach(x => x.classList.remove('sel'));
      o.classList.add('sel');
      practiceState[q] = isCorrectOpt(o);
      renderPracticeFeedback();
    });
  });
})();

/* ---------- Toast ---------- */
function toast(msg) {
  let t = document.getElementById('toast');
  if (!t) {
    t = document.createElement('div');
    t.id = 'toast';
    t.style.cssText = 'position:fixed;left:50%;bottom:32px;transform:translateX(-50%) translateY(20px);'
      + 'background:#20252B;color:#fff;padding:12px 20px;border-radius:8px;font-size:14px;'
      + 'box-shadow:0 8px 24px rgba(0,0,0,.2);opacity:0;transition:.25s;z-index:999;max-width:86vw;';
    document.body.appendChild(t);
  }
  t.textContent = msg;
  requestAnimationFrame(() => { t.style.opacity = '1'; t.style.transform = 'translateX(-50%) translateY(0)'; });
  clearTimeout(t._h);
  t._h = setTimeout(() => { t.style.opacity = '0'; t.style.transform = 'translateX(-50%) translateY(20px)'; }, 2400);
}

/* 页面加载：恢复语言选择（无保存偏好时，保留页面默认 data-lang） */
(function restoreLang() {
  let saved = null;
  try { saved = localStorage.getItem('jqt_lang'); } catch (e) {}
  if (saved === 'en' || saved === 'zh') {
    document.body.dataset.lang = saved;
  }
  syncLangButtons();
})();

/* PWA：注册 Service Worker（离线缓存静态资源） */
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  });
}

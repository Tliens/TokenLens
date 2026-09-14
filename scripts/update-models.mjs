#!/usr/bin/env node
/* 每日从 LiteLLM 开源数据库拉取模型上下文与价格，解析为精简 data.json 供前端优先加载。
   注意：MODELS 清单与解析逻辑（vt / pickEntry / cmpArr）需与 index.html 内联脚本保持同步。 */
import { writeFileSync } from 'node:fs';

const LITELLM_URL = 'https://raw.githubusercontent.com/BerriAI/litellm/main/model_prices_and_context_window.json';

const MODELS = [
  { id: 'gpt5',       re: [/^gpt-5(\d+(?:\.\d+)?)?$/] },
  { id: 'gpt5mini',   re: [/^gpt-5(\d+(?:\.\d+)?)?-mini$/] },
  { id: 'gpt5nano',   re: [/^gpt-5(\d+(?:\.\d+)?)?-nano$/] },
  { id: 'gpt41',      re: [/^gpt-4\.1$/] },
  { id: 'gpt4o',      re: [/^gpt-4o$/] },
  { id: 'o4mini',     re: [/^o4-mini$/] },
  { id: 'opus',       re: [/^claude-opus-(\d+(?:-\d+)?)$/] },
  { id: 'sonnet',     re: [/^claude-sonnet-(\d+(?:-\d+)?)$/] },
  { id: 'haiku',      re: [/^claude-haiku-(\d+(?:-\d+)?)$/] },
  { id: 'gempro',     re: [/^(?:gemini\/)?gemini-(\d+(?:\.\d+)?)-pro$/, /^vertex_ai\/gemini-(\d+(?:\.\d+)?)-pro$/] },
  { id: 'gemflash',   re: [/^(?:gemini\/)?gemini-(\d+(?:\.\d+)?)-flash$/] },
  { id: 'dschat',     re: [/^deepseek\/deepseek-chat$/, /^deepseek\/deepseek-v3(\.\d+)?$/] },
  { id: 'dsreason',   re: [/^deepseek\/deepseek-reasoner$/, /^deepseek\/deepseek-v(\d+[\d.]*)-pro$/] },
  { id: 'qwenmax',    re: [/^(?:qwencloud|dashscope)\/qwen(\d+(?:\.\d+)?)?-max$/] },
  { id: 'qwenplus',   re: [/^(?:qwencloud|dashscope)\/qwen(\d+(?:\.\d+)?)-plus$/] },
  { id: 'glm',        re: [/^zai\/glm-(\d+(?:\.\d+)?)$/] },
  { id: 'glmflash',   re: [/^zai\/glm-(\d+(?:\.\d+)?)-flash$/] },
  { id: 'kimi',       re: [/^moonshot\/kimi-k(\d+(?:\.\d+)?)$/] },
  { id: 'grok',       re: [/^xai\/grok-(\d+(?:\.\d+)?)$/] },
  { id: 'llamamav',   re: [/^meta_llama\/Llama-4-Maverick/, /^together_ai\/meta-llama\/Llama-4-Maverick/] },
  { id: 'llamascout', re: [/^meta_llama\/Llama-4-Scout/, /^together_ai\/meta-llama\/Llama-4-Scout/] },
  { id: 'mistral',    re: [/^mistral\/mistral-large-latest$/, /^mistral\/mistral-large-\d+$/] },
];

const vt = s => String(s).split(/[.\-]/).map(Number);
function cmpArr(a, b){
  for (let i = 0; i < Math.max(a.length, b.length); i++){
    const d = (a[i] || 0) - (b[i] || 0);
    if (d) return d;
  }
  return 0;
}
/* 优先有价格的条目，其次最新版本号 —— 与 index.html 的 pickEntry 逻辑一致 */
function pickEntry(db, patterns){
  let best = null, bestScore = null;
  for (const re of patterns){
    for (const k of Object.keys(db)){
      const e = db[k];
      if (!e || typeof e !== 'object' || e.mode !== 'chat') continue;
      const m = k.match(re);
      if (!m) continue;
      const v = m[1] ? vt(m[1]) : [0];
      const score = [e.input_cost_per_token != null ? 1 : 0, v];
      if (bestScore === null || score[0] - bestScore[0] > 0 || (score[0] === bestScore[0] && cmpArr(score[1], bestScore[1]) > 0)){
        best = e; bestScore = score; best.key = k;
      }
    }
  }
  return best;
}

const res = await fetch(LITELLM_URL);
if (!res.ok) throw new Error('HTTP ' + res.status);
const db = await res.json();

const models = {};
for (const m of MODELS){
  const e = pickEntry(db, m.re);
  if (!e) continue;
  models[m.id] = {
    key: e.key,
    ctx: e.max_input_tokens ?? e.max_tokens ?? null,
    out: e.max_output_tokens ?? e.max_tokens ?? null,
    pin: e.input_cost_per_token != null ? +(e.input_cost_per_token * 1e6).toFixed(6) : null,
    pout: e.output_cost_per_token != null ? +(e.output_cost_per_token * 1e6).toFixed(6) : null,
  };
}

const out = { updated: Date.now(), source: LITELLM_URL, models };
writeFileSync(new URL('../data.json', import.meta.url), JSON.stringify(out, null, 1) + '\n');
console.log('resolved', Object.keys(models).length, 'of', MODELS.length, 'models');
for (const [id, r] of Object.entries(models)) console.log(' ', id, '←', r.key, `${r.ctx ?? '?'} ctx, $${r.pin ?? '?'}/$${r.pout ?? '?'} per 1M`);

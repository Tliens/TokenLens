# TokenLens

大模型 Token 计数 · 上下文窗口对比 · 成本估算 —— 纯前端单文件工具
LLM Token Counter · Context Window Comparison · Cost Estimates — single-file, 100% client-side

🔗 **在线使用 / Live**: https://tliens.github.io/TokenLens/

## 特性 / Features

- **精确 Token 计数**：OpenAI 官方分词器（o200k / cl100k）逐 token 计算，与 GPT-5 / GPT-4o 官方计数一致；离线自动退化为启发式估算
  **Exact counting**: token-by-token with OpenAI's official tokenizers; heuristic fallback when offline
- **上下文窗口对比**：22+ 主流模型柱状图，红色刻度标记你的文本占用位置；按厂商筛选 / 搜索 / 排序
  **Context comparison**: 22+ models, red tick marks where your text lands; filter / search / sort
- **费用估算**：本次文本的输入费用 + 每百万 token 单价 + 可容纳份数，超出上下文自动标红
  **Cost estimates**: cost of your text + $/1M input & output prices; over-context rows highlighted
- **动态最新数据**：模型与价格在线同步自 LiteLLM 开源数据库，可手动刷新，断网用内置兜底
  **Live data**: models & prices synced from the LiteLLM database, refresh on demand, built-in fallback offline
- **中英双语** / Bilingual (中文 / English)，跟随浏览器默认语言之外可手动切换
- 🔒 **隐私**：文本不上传，所有计算在浏览器本地完成
  **Privacy**: your text never leaves the browser

## 使用 / Usage

无需安装，双击 `index.html` 即可；或访问上方在线地址。
No install needed — open `index.html` directly, or use the live URL above.

## 数据来源 / Data & Credits

- 模型与价格 / Models & pricing: [LiteLLM model_prices_and_context_window](https://github.com/BerriAI/litellm/blob/main/model_prices_and_context_window.json)
- 分词 / Tokenizer: [js-tiktoken](https://github.com/dqbd/tiktoken) (o200k_base / cl100k_base)

> 非官方项目；各模型 token 估算与价格仅供参考，实际以各厂商官网为准。
> Unofficial tool; token estimates and prices are approximate — check vendor pages for actuals.

// utils/promptBuilder.ts

export interface PromptOptions {
  category: 'professional' | 'lifestyle';
  includeFaq: boolean;
  includeCitations: boolean; 
  includeSchema: boolean;
  includeMeta: boolean;
  generateCode: boolean;     
  includeIntent: boolean;           // 新增：潛在問題意圖
  includeMisconceptions: boolean;   // 新增：誤區解析
  length: 'short' | 'medium' | 'long';
  style: 'professional' | 'warm' | 'structured' | 'engaging' | 'humorous';
  authorName?: string;
  authorUrl?: string;
  referenceText?: string;
}

export function buildArticlePrompt(outline: string, options: PromptOptions): string {
  const { category, includeFaq, includeCitations, includeSchema, includeMeta, generateCode, includeIntent, includeMisconceptions, length, style, authorName, authorUrl, referenceText } = options;

  let prompt = `你是一位資深的內容創作專家與 前端/SEO 工程師。請根據以下要求，為我撰寫一篇高品質的文章與對應的程式碼：\n\n`;

  prompt += `### 1. 文章大綱、主題與真實案例：\n${outline}\n`;
  prompt += `(註：若上方內容有提供實際案例或病歷體驗，請務必自然地改寫並融入文章段落中，以大幅增加內容的真實度、可信度與說服力)\n\n`;

  prompt += `### 2. 核心屬性與撰寫規範：\n`;
  prompt += `- **語言地區**：使用「繁體中文（台灣）」。\n`;

  if (category === 'professional') {
    prompt += `- **文章領域**：【專業知識類】。請確保內容嚴謹，高度強化 E-E-A-T（經驗、專業、權威、信任）指標。請在文中加入至少兩個獨特的見解或臨床觀察到的細微差異，提供具有「資訊增量」的內容。\n`;
  } else {
    prompt += `- **文章領域**：【生活風格類】。請著重於臨場感、實用體驗以及引人入勝的敘事風格。請在文中加入在地人才知道的秘辛或是分享小秘訣，提供具有「資訊增量」的內容。\n`;
  }

  const styleMap: Record<string, string> = {
    professional: '專業嚴謹、實證導向',
    warm: '溫暖親切、平易近人',
    structured: '條理分明、邏輯強烈',
    engaging: '生動活潑、具備強烈感染力',
    humorous: '幽默風趣、引人共鳴'
  };
  prompt += `- **語氣風格**：${styleMap[style]}。\n`;

  const lengthMap: Record<string, string> = {
    short: '約 600 字（精華摘要）。',
    medium: '約 1000-1500 字（標準規格）。',
    long: '2000 字以上（深度全解析）。'
  };
  prompt += `- **文章長度與深度**：${lengthMap[length]}`;
  if (length === 'short') {
    prompt += ` 因為要求精簡長度，請以重點介紹為主。`;
    if (category === 'professional') {
      prompt += `特別注意：即使字數較少，專業知識類也「必須」包含治療方式的介紹。`;
    }
    prompt += `\n`;
  } else if (length === 'long') {
    prompt += ` 因為要求長篇幅，請務必涵蓋深入的子話題、背景解析或進階細節探討，確保內容豐富且具備高度價值。\n`;
  } else {
    prompt += `\n`;
  }

  if (authorName) {
    const todayDate = new Date().toISOString().split('T')[0];
    prompt += `- **作者標示與連結**：請務必在文章的最開頭大標題（H1）正下方，加上作者姓名「${authorName}」以及撰寫日期「${todayDate}」，並且使用 Markdown 的內部連結語法連結至「${authorUrl || '#'}」的分頁。\n`;
  }

  prompt += `- **結論先行 (開頭總結)**：在文章正文一開始（作者標示下方），請先寫一段約 150 字的總結摘要，直接破題點出文章最核心的觀點或結論。\n`;

  if (referenceText && referenceText.trim().length > 0) {
    prompt += `- **敘事口吻參考**：請先分析以下我過往撰寫的文章屬於哪一種口吻與風格，接著依照該「風格」來撰寫本次內容。**嚴格禁止參考或使用該舊文章中的實質內容、案例或數據**，僅能模仿其「語氣、寫作節奏與用詞習慣」：\n"""\n${referenceText}\n"""\n`;
  }

  prompt += `\n### 3. 排版與必要包含元素：\n`;
  
  prompt += `- **內文嚴禁 HTML 標籤**：文章正文請完全使用純 Markdown 語法，絕對不可以在文章正文中使用原始 HTML 標籤。\n`;
  prompt += `- **強制比較表格**：無論字數長短，文章中都必須至少包含一個「比較表格 (使用 Markdown 表格)」。若為專業知識類，請比較疾病的治療選項差異；若為生活風格類，請比較景點特色、交通方式或美食評比等。\n`;

  if (includeIntent) {
    prompt += `- **搜尋意圖的語意佈局**：請分析搜尋此主題的使用者通常處於哪種階段（意識、考慮、決定），並在內文中自然埋入該階段最在意的潛在關鍵問句作為小標題（H3）。\n`;
  }

  if (includeMisconceptions) {
    if (length === 'short') {
      prompt += `- **常見誤區解析 (反向查證)**：針對主題找出網路上 1 到 2 個最常見的錯誤觀念，並給予精簡的科學證據或真實經驗的糾正。\n`;
    } else {
      prompt += `- **常見誤區解析 (反向查證)**：請增加一個區塊：『常見三大誤區解析』。針對主題找出網路上最常見的錯誤觀念，並給予科學證據或真實經驗的糾正。\n`;
    }
  }

  if (includeFaq) {
    if (length === 'short') {
      prompt += `- **FAQ 常見問題**：在文章末尾加入 1-2 個讀者最常關心的問題與精簡的解答（使用 H3 標籤）。\n`;
    } else {
      prompt += `- **FAQ 常見問題**：在文章末尾加入 3-5 個讀者最常關心的問題與解答（使用 H3 標籤）。\n`;
    }
  }

  prompt += `- **結語與呼籲行動 (CTA)**：文章最後請加上「結語」段落，並提供明確的呼籲行動（Call to Action）。\n`;

  if (includeCitations) {
    if (category === 'professional') {
      prompt += `- **文獻實證與數據化引用**：當提及客觀事實時，請搜尋真實學術論文（盡量尋找近十年的文獻，且參考文獻數量越多越好）。內文中必須加入具體的數字、年份、研究報告數據。**特別注意：如果有提到任何「治療」，每一項治療選項都必須寫出具體的參考來源。** 內文請以 [^1^] 標註，並且使用 Markdown 格式附上超連結，在文章內可以點擊連接到該網頁。文末列出「參考文獻」區塊，參考資料的部分都要有超連結：如果是論文就連接到 PubMed，部落格或是網頁點選直接連接到，Google 商家點選連接到 Google 商家。\n`;
    } else {
      prompt += `- **高信賴度佐證與明確命名**：請你運用知識庫搜尋真實存在的部落格、官方網站或政府網頁等來印證內容（盡量尋找近十年的資料，且參考來源越多越好）。**特別注意：若提到美食店家或景點，必須明確指出具體的名稱。** 內文請以 [^1^] 標註，並且使用 Markdown 格式附上超連結，在文章內可以點擊連接到該網頁。文末列出「參考文獻」區塊，參考資料的部分都要有超連結：如果是論文就連接到 PubMed，部落格或是網頁點選直接連接到，Google 商家點選連接到 Google 商家。\n`;
    }
  }

  if (includeMeta) {
    prompt += `- **SEO Meta 描述**：產出 150 字內的 Meta Description。此描述不需要顯示在文章內容中，僅在產出完整網頁程式碼時寫入 metadata 中。\n`;
  }

  if (includeSchema) {
    prompt += `- **JSON-LD 結構化資料**：提供符合 schema.org 格式的 JSON-LD。除了基礎的 Article 或 Review Schema 之外，也必須要有 FAQ Schema。在 JSON-LD 中，請明確標註 mainEntityOfPage，並在 about 欄位中連結至 Wikipedia 或官方權威定義的實體 URL。請將完整的 JSON-LD 程式碼獨立用 \`\`\`json ... \`\`\` 區塊包裹，並放置在 Markdown 文章內文的後面，產出完整網頁程式碼的前面。\n`;
  }

  if (generateCode) {
    prompt += `\n### 4. 附加任務：產出完整網頁程式碼（絕對不可省略）\n`;
    prompt += `- 在給出純 Markdown 文章後，請將整篇文章轉換為一個完整的 Next.js (React) + Tailwind CSS 頁面元件。\n`;
    prompt += `- **標籤轉換要求**：請將 Markdown 的清單與表格，正確轉換為 <ul>, <ol>, <li>, <table> 等標籤排版。**並請確保文章內文的引用標註（如 [^1^]）與文末參考文獻的超連結，皆正確轉換為 <a> 標籤。轉換為程式碼後，網頁畫面上必須清楚保留「[1]」或「[^1^]」的文字視覺標記（例如寫成 <sup><a href="...">[1]</a></sup>），絕對不可以在網頁中消失不見，以確保在產出的網頁頁面中可以看到並直接點擊跳轉。**\n`;
    prompt += `- **警告：程式碼內容必須包含文章的所有完整文字，絕對不可使用省略字眼跳過。**\n`;
    if (includeMeta) {
      prompt += `- 請利用 Next.js 的 export const metadata 將 SEO Meta 描述放入程式碼中。\n`;
    }
    prompt += `- 程式碼請使用 \`\`\`tsx ... \`\`\` 包裹起來，並且要完整可運行。\n`;
  }

  prompt += `\n現在，請按照上述所有嚴格規範開始撰寫：`;

  return prompt;
}
// 中文数字 -> 阿拉伯数字（仅处理 1-31 范围内的常见写法）
const CN_DIGIT = {
  零: 0, 〇: 0, 一: 1, 二: 2, 两: 2, 三: 3, 四: 4, 五: 5,
  六: 6, 七: 7, 八: 8, 九: 9, 十: 10,
};

function chineseToNumber(input) {
  if (input === null || input === undefined) return null;
  if (typeof input === 'number' && Number.isFinite(input)) {
    return Math.round(input);
  }

  let s = String(input).trim();
  if (!s) return null;

  // 直接是数字字符串
  if (/^\d+$/.test(s)) return parseInt(s, 10);

  // 去掉常见后缀
  s = s.replace(/[月日号天.\s]/g, '');

  if (!s) return null;
  if (/^\d+$/.test(s)) return parseInt(s, 10);

  // 处理"初X"（农历前缀，按 X 处理）
  if (s.startsWith('初')) {
    s = s.slice(1);
    if (/^\d+$/.test(s)) return parseInt(s, 10);
  }

  // 处理类似 "一" "十" "十一" "二十" "二十三" "三十"
  if (s.length === 1) {
    return CN_DIGIT[s] ?? null;
  }
  if (s === '十') return 10;
  if (s.startsWith('十')) {
    // 十X
    const right = CN_DIGIT[s[1]];
    if (right != null) return 10 + right;
  }
  if (s.endsWith('十')) {
    const left = CN_DIGIT[s[0]];
    if (left != null) return left * 10;
  }
  if (s.includes('十')) {
    // X十Y
    const [l, r] = s.split('十');
    const left = CN_DIGIT[l] ?? 1;
    const right = CN_DIGIT[r] ?? 0;
    return left * 10 + right;
  }
  // 兜底：拼接每一位
  let n = 0;
  for (const ch of s) {
    if (CN_DIGIT[ch] == null) return null;
    n = n * 10 + CN_DIGIT[ch];
  }
  return n || null;
}

module.exports = { chineseToNumber };

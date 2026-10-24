// scripts/fetchPrices.js
// 日本株の主要銘柄・人気優待銘柄の最新株価を取得して public/prices.json に出力するスクリプト

import fs from 'fs';
import path from 'path';

// 対象銘柄リスト（手帳に登録されている銘柄や人気銘柄）
const STOCKS_TO_FETCH = [
  // 定番優待銘柄
  '8267', // イオン
  '3197', // すかいらーくHD
  '3543', // コメダHD
  '9201', // 日本航空 (JAL)
  '9202', // ANAホールディングス
  '2702', // 日本マクドナルドHD
  '8591', // オリックス
  '9433', // KDDI
  '9432', // 日本電信電話 (NTT)
  '9434', // ソフトバンク
  '7203', // トヨタ自動車
  '7267', // 本田技研工業 (ホンダ)
  '8306', // 三菱UFJフィナンシャルG
  '8316', // 三井住友フィナンシャルG
  '8411', // みずほフィナンシャルG
  '2914', // 日本たばこ産業 (JT)
  '9101', // 日本郵船
  '9104', // 商船三井
  '9984', // ソフトバンクグループ
  '9983', // ファーストリテイリング
  '6758', // ソニーグループ
  '7974', // 任天堂
  '4661', // オリエンタルランド
  '3099', // 三越伊勢丹HD
  '8252', // 丸井グループ
  '7550', // ゼンショーHD
  '9861', // 吉野家HD
  '2695', // くら寿司
  '7616', // コロワイド
  '3088', // マツキヨココカラ＆カンパニー
  '2802', // 味の素
  '2503', // キリンHD
  '2502', // アサヒグループHD
];

async function fetchStockPrice(code) {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${code}.T`;
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    if (!res.ok) {
      console.warn(`Failed to fetch ${code}: ${res.status}`);
      return null;
    }
    const data = await res.json();
    const result = data?.chart?.result?.[0];
    if (!result) return null;

    const meta = result.meta;
    const currentPrice = meta.regularMarketPrice;
    const prevClose = meta.chartPreviousClose || meta.previousClose;
    const change = currentPrice - prevClose;
    const changePercent = prevClose ? (change / prevClose) * 100 : 0;

    return {
      code,
      name: meta.shortName || meta.longName || '',
      currentPrice: Math.round(currentPrice),
      previousClose: Math.round(prevClose),
      change: Math.round(change),
      changePercent: parseFloat(changePercent.toFixed(2)),
      updatedAt: new Date().toISOString()
    };
  } catch (err) {
    console.error(`Error fetching ${code}:`, err.message);
    return null;
  }
}

async function main() {
  console.log(`Fetching prices for ${STOCKS_TO_FETCH.length} stocks...`);
  const priceMap = {};

  for (const code of STOCKS_TO_FETCH) {
    const data = await fetchStockPrice(code);
    if (data) {
      priceMap[code] = data;
      console.log(`✓ ${code}: ¥${data.currentPrice} (${data.change >= 0 ? '+' : ''}${data.change} / ${data.changePercent}%)`);
    }
    await new Promise(r => setTimeout(r, 300));
  }

  const outDir = path.resolve('public');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  const outFile = path.join(outDir, 'prices.json');
  fs.writeFileSync(outFile, JSON.stringify({
    lastUpdated: new Date().toISOString(),
    prices: priceMap
  }, null, 2));

  console.log(`Successfully saved ${Object.keys(priceMap).length} stock prices to ${outFile}`);
}

main();

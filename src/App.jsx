import React, { useState, useEffect, useRef } from 'react';
import { 
  Gift, 
  TrendingUp, 
  Calendar, 
  PlusCircle, 
  Sparkles, 
  ChevronRight, 
  Smile, 
  HelpCircle, 
  Edit3, 
  Trash2, 
  Check, 
  ArrowUpRight, 
  ArrowDownRight,
  Info,
  Clock,
  Coins,
  DollarSign,
  Calculator,
  RefreshCw,
  Type,
  QrCode,
  Smartphone,
  Share2,
  Copy,
  Cloud,
  CheckCircle,
  Settings,
  LogOut,
  ExternalLink,
  ShieldCheck,
  Bell,
  BellRing,
  PackageCheck,
  BookOpen,
  Printer,
  Search,
  CheckCircle2
} from 'lucide-react';
import { GoogleDriveService } from './services/googleDrive';

// 初期サンプルデータ（PCで見やすい充実した初期データ）
const INITIAL_STOCKS = [
  {
    id: '1',
    code: '8267',
    name: 'イオン',
    shares: 100,
    buyPrice: 2800,
    currentPrice: 3450,
    prevClose: 3400,
    change: 50,
    changePercent: 1.47,
    dividendYield: 1.2,
    yutaiTitle: 'お買い物 3%キャッシュバック',
    yutaiDetail: '半年ごとのお買い物金額の3%が現金で返金。映画鑑賞割引もあり。',
    rightsMonths: [2, 8],
    deliveryMonths: [4, 10], // 権利月からおよそ2か月後
    deliveryMemo: '4月下旬・10月下旬頃',
    category: '買い物割引',
    icon: '🛍️',
    memo: '近所のイオンで火曜市に必須！'
  },
  {
    id: '2',
    code: '3197',
    name: 'すかいらーくHD',
    shares: 100,
    buyPrice: 1950,
    currentPrice: 2280,
    prevClose: 2260,
    change: 20,
    changePercent: 0.88,
    dividendYield: 0.8,
    yutaiTitle: 'お食事券 2,000円分 (年2回)',
    yutaiDetail: 'ガスト、バーミヤン、ジョナサンなどで使えるご優待カード（年計4,000円）。',
    rightsMonths: [6, 12],
    deliveryMonths: [9, 3], // 権利月からおよそ3か月後
    deliveryMemo: '3月中旬・9月中旬頃',
    category: '食事券',
    icon: '🍽️',
    memo: '孫たちと外食する時に使う'
  },
  {
    id: '3',
    code: '3543',
    name: 'コメダホールディングス',
    shares: 100,
    buyPrice: 2400,
    currentPrice: 2710,
    prevClose: 2690,
    change: 20,
    changePercent: 0.74,
    dividendYield: 1.9,
    yutaiTitle: 'KOMECA 1,000円分 (年2回)',
    yutaiDetail: 'コメダ珈琲店で使えるプリペイドカードに自動チャージ（年計2,000円）。',
    rightsMonths: [2, 8],
    deliveryMonths: [5, 11], // 権利月からおよそ3か月後
    deliveryMemo: '5月下旬・11月下旬頃',
    category: 'カフェ',
    icon: '☕',
    memo: 'お友達とモーニングに行く時の定番'
  },
  {
    id: '4',
    code: '9201',
    name: '日本航空 (JAL)',
    shares: 100,
    buyPrice: 2600,
    currentPrice: 2540,
    prevClose: 2555,
    change: -15,
    changePercent: -0.59,
    dividendYield: 2.8,
    yutaiTitle: '国内線 50%割引券 1枚',
    yutaiDetail: '国内線普通運賃が半額になる株主割引券。',
    rightsMonths: [3, 9],
    deliveryMonths: [5, 11], // 権利月からおよそ2か月後
    deliveryMemo: '5月中旬・11月中旬頃',
    category: '旅行・交通',
    icon: '✈️',
    memo: '旅行や帰省の際に便利'
  }
];

// 人気銘柄のクイック追加候補
const PRESET_STOCKS = [
  {
    code: '2702',
    name: '日本マクドナルドHD',
    shares: 100,
    buyPrice: 6500,
    currentPrice: 8330,
    dividendYield: 0.7,
    yutaiTitle: '優待食事券 1冊 (6枚綴り)',
    yutaiDetail: 'バーガー、サイド、ドリンクの引換券がセットになった人気食事券（年2回）。',
    rightsMonths: [6, 12],
    deliveryMonths: [9, 3],
    deliveryMemo: '3月下旬・9月下旬頃',
    category: '食事券',
    icon: '🍔'
  },
  {
    code: '8591',
    name: 'オリックス',
    shares: 100,
    buyPrice: 3200,
    currentPrice: 5732,
    dividendYield: 3.2,
    yutaiTitle: 'ふるさと優待 (カタログギフト)',
    yutaiDetail: '全国の名産品から選べる豪華なカタログギフト。',
    rightsMonths: [3],
    deliveryMonths: [7],
    deliveryMemo: '7月中旬頃',
    category: 'ギフト',
    icon: '🎁'
  },
  {
    code: '9433',
    name: 'KDDI',
    shares: 100,
    buyPrice: 3000,
    currentPrice: 2866,
    dividendYield: 3.0,
    yutaiTitle: 'Pontaポイント / 関連サービス優待',
    yutaiDetail: '日常の買い物やスマホ決済で使える便利なポイント還元。',
    rightsMonths: [3],
    deliveryMonths: [6],
    deliveryMemo: '6月下旬頃',
    category: '通信',
    icon: '📱'
  },
  {
    code: '7203',
    name: 'トヨタ自動車',
    shares: 100,
    buyPrice: 2800,
    currentPrice: 3105,
    dividendYield: 2.8,
    yutaiTitle: '配当金重視（安定配当）',
    yutaiDetail: '日本を代表する自動車メーカー。配当金が年2回届きます。',
    rightsMonths: [3, 9],
    deliveryMonths: [6, 12],
    deliveryMemo: '6月下旬・12月上旬頃',
    category: '自動車',
    icon: '🚗'
  }
];

// 権利確定月から優待到着月（およそ2〜3か月後）を自動計算するヘルパー
function calculateDefaultDeliveryMonths(rightsMonths) {
  if (!rightsMonths || rightsMonths.length === 0) return [6];
  return rightsMonths.map(m => {
    let target = m + 3; // 3か月後を目安
    if (target > 12) target -= 12;
    return target;
  });
}

const driveService = new GoogleDriveService();

export default function App() {
  const [stocks, setStocks] = useState(() => {
    const saved = localStorage.getItem('my_kabushiki_list');
    return saved ? JSON.parse(saved) : INITIAL_STOCKS;
  });

  // 文字サイズ設定 ('normal': 標準, 'large': 大きめ, 'huge': 特大)
  const [fontSizeMode, setFontSizeMode] = useState(() => {
    return localStorage.getItem('kabushiki_font_size') || 'large'; // デフォルトはPCでも読みやすい「大きめ」
  });

  // モーダル開閉状態
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingStock, setEditingStock] = useState(null); // 編集対象
  const [showGuideModal, setShowGuideModal] = useState(false); // 使い方ガイド
  const [showSettingsModal, setShowSettingsModal] = useState(false); // Google設定
  const [showNoticeModal, setShowNoticeModal] = useState(false); // 今月の優待お知らせ
  const [quickPriceEditStock, setQuickPriceEditStock] = useState(null); // 株価・購入値の簡単編集

  // 株価更新ステート
  const [isUpdatingPrices, setIsUpdatingPrices] = useState(false);
  const [lastPriceUpdateTime, setLastPriceUpdateTime] = useState(() => {
    return localStorage.getItem('last_price_update') || '未更新';
  });

  // Google Drive 連携ステート
  const [googleUser, setGoogleUser] = useState(null);
  const [syncStatus, setSyncStatus] = useState('idle');
  const [clientIdInput, setClientIdInput] = useState(localStorage.getItem('google_client_id') || '');

  // 現在の年月
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  // フォーム用ステート
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    shares: 100,
    buyPrice: '',
    currentPrice: '',
    dividendYield: 2.0,
    yutaiTitle: '',
    yutaiDetail: '',
    rightsMonths: '3, 9',
    deliveryMonths: '6, 12',
    deliveryMemo: '',
    category: '一般',
    icon: '🎁',
    memo: ''
  });

  // 今月届く予定の銘柄
  const currentMonthStocks = stocks.filter(s => s.deliveryMonths && s.deliveryMonths.includes(currentMonth));

  // 初回起動時に prices.json から最新株価を自動反映
  useEffect(() => {
    updatePricesFromSource(false);
  }, []);

  // Google Drive 初期化
  useEffect(() => {
    driveService.init(async (token, profile) => {
      setGoogleUser(profile);
      setSyncStatus('syncing');
      try {
        const driveData = await driveService.loadStocksData();
        if (driveData && Array.isArray(driveData) && driveData.length > 0) {
          setStocks(driveData);
          localStorage.setItem('my_kabushiki_list', JSON.stringify(driveData));
        } else {
          await driveService.saveStocksData(stocks);
        }
        setSyncStatus('saved');
      } catch (err) {
        console.error('Drive load error:', err);
        setSyncStatus('error');
      }
    });
  }, []);

  // LocalStorage保存
  useEffect(() => {
    localStorage.setItem('my_kabushiki_list', JSON.stringify(stocks));
  }, [stocks]);

  useEffect(() => {
    localStorage.setItem('kabushiki_font_size', fontSizeMode);
  }, [fontSizeMode]);

  // Googleドライブへ自動保存
  const saveToDrive = async (newStocks) => {
    if (googleUser && driveService.accessToken) {
      setSyncStatus('syncing');
      try {
        const ok = await driveService.saveStocksData(newStocks);
        setSyncStatus(ok ? 'saved' : 'error');
        if (ok) {
          setTimeout(() => setSyncStatus('idle'), 3000);
        }
      } catch (e) {
        console.error('Save to drive error:', e);
        setSyncStatus('error');
      }
    }
  };

  // ★株価を更新する関数（ステップ1＆2の核心機能）
  const updatePricesFromSource = async (showToast = true) => {
    setIsUpdatingPrices(true);
    try {
      // キャッシュ回避のタイムスタンプ付きで prices.json を取得
      const res = await fetch(`./prices.json?t=${Date.now()}`);
      if (res.ok) {
        const data = await res.json();
        const priceMap = data.prices || {};

        setStocks(prevStocks => {
          const updated = prevStocks.map(stock => {
            const p = priceMap[stock.code];
            if (p) {
              return {
                ...stock,
                currentPrice: p.currentPrice || stock.currentPrice,
                prevClose: p.previousClose || stock.prevClose || p.currentPrice,
                change: p.change !== undefined ? p.change : (p.currentPrice - (stock.prevClose || p.currentPrice)),
                changePercent: p.changePercent !== undefined ? p.changePercent : 0,
                lastUpdated: p.updatedAt
              };
            }
            return stock;
          });
          saveToDrive(updated);
          return updated;
        });

        const now = new Date();
        const timeStr = `${now.getMonth() + 1}/${now.getDate()} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
        setLastPriceUpdateTime(timeStr);
        localStorage.setItem('last_price_update', timeStr);

        if (showToast) {
          alert(`✅ 株価を最新情報に更新しました！（${timeStr} 時点）`);
        }
      } else {
        if (showToast) {
          alert('株価データファイルを読み込めませんでした。後ほど再度お試しください。');
        }
      }
    } catch (e) {
      console.error('Price update error:', e);
      if (showToast) {
        alert('株価の更新中に通信エラーが発生しました。インターネット接続をご確認ください。');
      }
    } finally {
      setIsUpdatingPrices(false);
    }
  };

  // 権利確定月が変更された時に、優待到着月（2〜3か月後）を自動計算して反映
  const handleRightsMonthsChange = (val) => {
    const months = val.split(',').map(m => Number(m.trim())).filter(n => !isNaN(n) && n >= 1 && n <= 12);
    const autoDelivery = calculateDefaultDeliveryMonths(months);
    const autoMemo = autoDelivery.map(m => `${m}月頃`).join('・');

    setFormData(prev => ({
      ...prev,
      rightsMonths: val,
      deliveryMonths: autoDelivery.join(', '),
      deliveryMemo: autoMemo
    }));
  };

  // 銘柄の保存（追加または編集）
  const handleSaveStock = (e) => {
    e.preventDefault();
    if (!formData.name) return;

    const buyPrice = Number(formData.buyPrice) || 1000;
    const currentPrice = Number(formData.currentPrice) || buyPrice;
    const rMonths = formData.rightsMonths.split(',').map(m => Number(m.trim())).filter(n => !isNaN(n) && n >= 1 && n <= 12);
    const dMonths = formData.deliveryMonths.split(',').map(m => Number(m.trim())).filter(n => !isNaN(n) && n >= 1 && n <= 12);

    if (editingStock) {
      // 編集更新
      const updated = stocks.map(s => {
        if (s.id === editingStock.id) {
          return {
            ...s,
            code: formData.code || s.code,
            name: formData.name,
            shares: Number(formData.shares) || 100,
            buyPrice: buyPrice,
            currentPrice: currentPrice,
            dividendYield: Number(formData.dividendYield) || 0,
            yutaiTitle: formData.yutaiTitle || '株主優待',
            yutaiDetail: formData.yutaiDetail || '',
            rightsMonths: rMonths.length > 0 ? rMonths : s.rightsMonths,
            deliveryMonths: dMonths.length > 0 ? dMonths : s.deliveryMonths,
            deliveryMemo: formData.deliveryMemo || `${dMonths.join('・')}月頃`,
            category: formData.category,
            icon: formData.icon || s.icon,
            memo: formData.memo || ''
          };
        }
        return s;
      });
      setStocks(updated);
      saveToDrive(updated);
      setEditingStock(null);
    } else {
      // 新規追加
      const newStock = {
        id: Date.now().toString(),
        code: formData.code || '----',
        name: formData.name,
        shares: Number(formData.shares) || 100,
        buyPrice: buyPrice,
        currentPrice: currentPrice,
        prevClose: currentPrice,
        change: 0,
        changePercent: 0,
        dividendYield: Number(formData.dividendYield) || 2.0,
        yutaiTitle: formData.yutaiTitle || '株主優待',
        yutaiDetail: formData.yutaiDetail || '優待内容の記載はありません',
        rightsMonths: rMonths.length > 0 ? rMonths : [3],
        deliveryMonths: dMonths.length > 0 ? dMonths : calculateDefaultDeliveryMonths(rMonths),
        deliveryMemo: formData.deliveryMemo || '権利確定後2〜3ヶ月頃',
        category: formData.category,
        icon: formData.icon || '🎁',
        memo: formData.memo || ''
      };
      const updated = [...stocks, newStock];
      setStocks(updated);
      saveToDrive(updated);
    }

    setShowAddModal(false);
  };

  // 編集モーダルを開く
  const handleOpenEdit = (stock) => {
    setEditingStock(stock);
    setFormData({
      code: stock.code || '',
      name: stock.name || '',
      shares: stock.shares || 100,
      buyPrice: stock.buyPrice || '',
      currentPrice: stock.currentPrice || '',
      dividendYield: stock.dividendYield || 0,
      yutaiTitle: stock.yutaiTitle || '',
      yutaiDetail: stock.yutaiDetail || '',
      rightsMonths: (stock.rightsMonths || []).join(', '),
      deliveryMonths: (stock.deliveryMonths || []).join(', '),
      deliveryMemo: stock.deliveryMemo || '',
      category: stock.category || '一般',
      icon: stock.icon || '🎁',
      memo: stock.memo || ''
    });
    setShowAddModal(true);
  };

  // 削除処理
  const handleDelete = (id, name) => {
    if (window.confirm(`「${name}」をリストから削除してもよろしいですか？`)) {
      const updated = stocks.filter(s => s.id !== id);
      setStocks(updated);
      saveToDrive(updated);
    }
  };

  // ワンタップでプリセット銘柄を追加
  const handleAddPreset = (preset) => {
    const buyPrice = prompt(`「${preset.name}」を1株いくらで買いましたか？\n（手元のメモの金額を入力してください）`, preset.currentPrice.toString());
    if (buyPrice === null) return;

    const finalBuy = Number(buyPrice) || preset.currentPrice;
    const newStock = {
      ...preset,
      id: Date.now().toString(),
      buyPrice: finalBuy,
      prevClose: preset.currentPrice,
      change: 0,
      changePercent: 0,
      memo: '手元メモから追加'
    };
    const updated = [...stocks, newStock];
    setStocks(updated);
    saveToDrive(updated);
    alert(`${preset.name} を追加しました！`);
  };

  // 合計計算
  const totalValue = stocks.reduce((sum, s) => sum + (s.currentPrice * s.shares), 0);
  const totalCost = stocks.reduce((sum, s) => sum + (s.buyPrice * s.shares), 0);
  const totalProfit = totalValue - totalCost;
  const profitPercentage = totalCost > 0 ? ((totalProfit / totalCost) * 100).toFixed(1) : '0.0';
  const totalDayChange = stocks.reduce((sum, s) => sum + ((s.change || 0) * s.shares), 0);
  const totalDividend = stocks.reduce((sum, s) => sum + Math.round((s.currentPrice * s.shares * (s.dividendYield || 0)) / 100), 0);

  // 文字サイズクラス
  const fontStyles = {
    normal: {
      tableText: 'text-sm',
      priceText: 'text-base',
      headerText: 'text-xs',
      badge: 'text-xs',
    },
    large: {
      tableText: 'text-base font-medium',
      priceText: 'text-lg font-black',
      headerText: 'text-sm font-bold',
      badge: 'text-xs font-bold',
    },
    huge: {
      tableText: 'text-lg font-bold',
      priceText: 'text-xl font-black',
      headerText: 'text-base font-black',
      badge: 'text-sm font-black',
    }
  }[fontSizeMode];

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-slate-800 font-sans pb-16">
      {/* ページ最上部：グローバルツールバー */}
      <div className="bg-slate-900 text-slate-100 px-6 py-2.5 flex items-center justify-between text-xs border-b border-slate-800 sticky top-0 z-40 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 font-bold text-amber-400">
            <Smile className="w-4 h-4" />
            <span>かんたん・あんしん株式管理</span>
          </div>
          <div className="hidden md:flex items-center gap-2 text-slate-400 text-xs">
            <span>株価最終更新: <strong className="text-slate-200">{lastPriceUpdateTime}</strong></span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* 使い方ガイドボタン */}
          <button
            onClick={() => setShowGuideModal(true)}
            className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-3 py-1 rounded-lg text-xs shadow-xs active:scale-95 transition-all"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>📖 使い方ガイド (1枚でわかる)</span>
          </button>

          {/* Googleドライブ連携状態 */}
          <button
            onClick={() => {
              if (!driveService.clientId) {
                setShowSettingsModal(true);
              } else {
                driveService.signIn();
              }
            }}
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1 rounded-lg text-xs border border-slate-700"
          >
            <Cloud className={`w-3.5 h-3.5 ${googleUser ? 'text-emerald-400' : 'text-slate-400'}`} />
            <span>{googleUser ? `${googleUser.name} のDriveに保存中` : 'Googleドライブ連携'}</span>
            {syncStatus === 'syncing' && <span className="text-[10px] text-amber-300 animate-pulse">保存中</span>}
            {syncStatus === 'saved' && <span className="text-[10px] text-emerald-400">✓</span>}
          </button>

          {/* 文字サイズトグル */}
          <div className="flex bg-slate-800 p-0.5 rounded-lg border border-slate-700">
            <button
              onClick={() => setFontSizeMode('normal')}
              className={`px-2 py-0.5 rounded text-xs font-bold ${fontSizeMode === 'normal' ? 'bg-amber-500 text-slate-900 font-black' : 'text-slate-300'}`}
            >
              標準
            </button>
            <button
              onClick={() => setFontSizeMode('large')}
              className={`px-2.5 py-0.5 rounded text-xs font-bold ${fontSizeMode === 'large' ? 'bg-amber-500 text-slate-900 font-black' : 'text-slate-300'}`}
            >
              大きめ
            </button>
            <button
              onClick={() => setFontSizeMode('huge')}
              className={`px-2.5 py-0.5 rounded text-xs font-bold ${fontSizeMode === 'huge' ? 'bg-amber-500 text-slate-900 font-black' : 'text-slate-300'}`}
            >
              特大
            </button>
          </div>
        </div>
      </div>

      {/* メインヘッダー＆アクションエリア（PCで押しやすい大きなボタン） */}
      <header className="bg-white border-b border-slate-200 shadow-2xs px-6 py-5">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <span>わたしの株・優待手帳</span>
              <span className="text-xs font-bold text-amber-800 bg-amber-100 px-2.5 py-1 rounded-full">
                {stocks.length}銘柄 登録中
              </span>
            </h1>
            <p className="text-xs md:text-sm text-slate-500 mt-1">
              持っている株式の現在値、前日比、評価損益、優待内容と届く時期がひと目で分かります。
            </p>
          </div>

          {/* ★大きな操作ボタンエリア */}
          <div className="flex items-center gap-3">
            {/* 大きな株価更新ボタン */}
            <button
              onClick={() => updatePricesFromSource(true)}
              disabled={isUpdatingPrices}
              className="bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-black px-6 py-3.5 rounded-2xl shadow-md flex items-center gap-2 text-base md:text-lg transition-all"
            >
              <RefreshCw className={`w-5 h-5 ${isUpdatingPrices ? 'animate-spin' : ''}`} />
              <span>{isUpdatingPrices ? '株価を取得中...' : '株価を最新に更新'}</span>
            </button>

            {/* 銘柄登録ボタン */}
            <button
              onClick={() => {
                setEditingStock(null);
                setFormData({
                  code: '',
                  name: '',
                  shares: 100,
                  buyPrice: '',
                  currentPrice: '',
                  dividendYield: 2.0,
                  yutaiTitle: '',
                  yutaiDetail: '',
                  rightsMonths: '3, 9',
                  deliveryMonths: '6, 12',
                  deliveryMemo: '',
                  category: '一般',
                  icon: '🎁',
                  memo: ''
                });
                setShowAddModal(true);
              }}
              className="bg-amber-500 hover:bg-amber-600 active:scale-95 text-white font-black px-5 py-3.5 rounded-2xl shadow-md flex items-center gap-2 text-base md:text-lg transition-all"
            >
              <PlusCircle className="w-5 h-5" />
              <span>＋ 銘柄を追加</span>
            </button>
          </div>
        </div>
      </header>

      {/* サマリーダッシュボードカード */}
      <section className="max-w-7xl mx-auto px-6 mt-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* 保有総額 */}
          <div className="bg-white rounded-2xl p-4 md:p-5 border border-slate-200 shadow-xs">
            <span className="text-xs font-bold text-slate-500">いまの保有総額 (評価額)</span>
            <div className="text-2xl md:text-3xl font-black text-slate-900 mt-1">
              ¥{totalValue.toLocaleString()}
            </div>
            <div className="text-xs text-slate-400 mt-1">購入元本: ¥{totalCost.toLocaleString()}</div>
          </div>

          {/* トータル損益 */}
          <div className={`rounded-2xl p-4 md:p-5 border shadow-xs ${
            totalProfit >= 0 ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950' : 'bg-rose-50/70 border-rose-200 text-rose-950'
          }`}>
            <span className="text-xs font-bold opacity-80">買った時からのトータル利益</span>
            <div className={`text-2xl md:text-3xl font-black mt-1 flex items-center gap-1 ${
              totalProfit >= 0 ? 'text-emerald-700' : 'text-rose-700'
            }`}>
              {totalProfit >= 0 ? <ArrowUpRight className="w-6 h-6" /> : <ArrowDownRight className="w-6 h-6" />}
              <span>{totalProfit >= 0 ? '+' : ''}¥{totalProfit.toLocaleString()}</span>
            </div>
            <div className="text-xs font-bold mt-1 opacity-80">
              利益率: {totalProfit >= 0 ? '+' : ''}{profitPercentage}%
            </div>
          </div>

          {/* 前日比合計 */}
          <div className="bg-white rounded-2xl p-4 md:p-5 border border-slate-200 shadow-xs">
            <span className="text-xs font-bold text-slate-500">前日比 (保有株全体)</span>
            <div className={`text-2xl md:text-3xl font-black mt-1 ${
              totalDayChange >= 0 ? 'text-emerald-600' : 'text-rose-600'
            }`}>
              {totalDayChange >= 0 ? '+' : ''}¥{totalDayChange.toLocaleString()}
            </div>
            <div className="text-xs text-slate-400 mt-1">前日終値からの値動き</div>
          </div>

          {/* 年間予想配当金＆今月の優待 */}
          <div className="bg-amber-50/80 rounded-2xl p-4 md:p-5 border border-amber-200 shadow-xs">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-xs font-bold text-amber-900">年間予想配当金（目安）</span>
                <div className="text-2xl md:text-3xl font-black text-amber-950 mt-1">
                  ¥{totalDividend.toLocaleString()}
                </div>
              </div>
              {currentMonthStocks.length > 0 && (
                <button
                  onClick={() => setShowNoticeModal(true)}
                  className="bg-rose-500 text-white text-xs font-black px-2.5 py-1 rounded-xl shadow-xs animate-bounce"
                >
                  🎁 {currentMonth}月届く: {currentMonthStocks.length}件
                </button>
              )}
            </div>
            <div className="text-xs text-amber-800/80 mt-1">
              今月届く優待: {currentMonthStocks.length > 0 ? currentMonthStocks.map(s => s.name).join('、') : '予定なし'}
            </div>
          </div>
        </div>
      </section>

      {/* メイン：PC向け株式一覧テーブル */}
      <main className="max-w-7xl mx-auto px-6 mt-6">
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          {/* テーブルヘッダー操作部 */}
          <div className="px-6 py-4 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-50/60">
            <div className="flex items-center gap-2">
              <h2 className="text-base md:text-lg font-black text-slate-900">
                保有銘柄一覧表
              </h2>
              <span className="text-xs text-slate-500 font-medium">
                （価格や株数をクリックするとその場で変更できます）
              </span>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-400">※「株価を最新に更新」ボタンを押すと、市場価格と前日比が一括更新されます</span>
            </div>
          </div>

          {/* 一覧テーブル本体 */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-100/80 border-b border-slate-200 text-slate-600 font-bold">
                  <th className={`py-3.5 px-4 ${fontStyles.headerText}`}>銘柄コード / 会社名</th>
                  <th className={`py-3.5 px-3 text-right ${fontStyles.headerText}`}>保有株数</th>
                  <th className={`py-3.5 px-3 text-right ${fontStyles.headerText}`}>購入単価</th>
                  <th className={`py-3.5 px-4 text-right ${fontStyles.headerText} bg-amber-50/40 text-amber-950 font-black`}>
                    現在値 (株価)
                  </th>
                  <th className={`py-3.5 px-3 text-right ${fontStyles.headerText}`}>前日比</th>
                  <th className={`py-3.5 px-4 text-right ${fontStyles.headerText}`}>評価額</th>
                  <th className={`py-3.5 px-4 text-right ${fontStyles.headerText}`}>評価損益</th>
                  <th className={`py-3.5 px-3 text-center ${fontStyles.headerText}`}>配当利回り</th>
                  <th className={`py-3.5 px-3 text-center ${fontStyles.headerText}`}>権利月</th>
                  <th className={`py-3.5 px-4 text-center ${fontStyles.headerText} bg-orange-50/40 text-orange-950`}>
                    📮 優待到着予定
                  </th>
                  <th className={`py-3.5 px-5 ${fontStyles.headerText}`}>株主優待の内容</th>
                  <th className={`py-3.5 px-3 text-center ${fontStyles.headerText}`}>操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {stocks.map((stock) => {
                  const profit = (stock.currentPrice - stock.buyPrice) * stock.shares;
                  const isProfit = profit >= 0;
                  const profitRate = stock.buyPrice > 0 ? (((stock.currentPrice - stock.buyPrice) / stock.buyPrice) * 100).toFixed(1) : '0.0';
                  const isDayPlus = (stock.change || 0) >= 0;
                  const isDeliveryThisMonth = stock.deliveryMonths && stock.deliveryMonths.includes(currentMonth);

                  return (
                    <tr 
                      key={stock.id} 
                      className={`hover:bg-amber-50/30 transition-colors ${isDeliveryThisMonth ? 'bg-amber-50/20' : ''}`}
                    >
                      {/* 銘柄コード・会社名 */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2.5">
                          <span className="text-2xl p-1 bg-amber-50 rounded-xl border border-amber-100">
                            {stock.icon || '🎁'}
                          </span>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className={`font-black text-slate-900 ${fontStyles.tableText}`}>
                                {stock.name}
                              </span>
                              <span className="font-mono text-xs font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                                {stock.code}
                              </span>
                            </div>
                            {stock.memo && (
                              <div className="text-xs text-slate-400 italic line-clamp-1 mt-0.5">
                                📝 {stock.memo}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* 株数 */}
                      <td className={`py-4 px-3 text-right whitespace-nowrap font-bold text-slate-700 ${fontStyles.tableText}`}>
                        {stock.shares}株
                      </td>

                      {/* 購入単価 */}
                      <td className="py-4 px-3 text-right whitespace-nowrap">
                        <button
                          onClick={() => setQuickPriceEditStock(stock)}
                          title="クリックして購入単価を変更"
                          className="hover:underline font-bold text-slate-700 flex items-center justify-end gap-1 ml-auto group"
                        >
                          <span className={fontStyles.tableText}>¥{stock.buyPrice.toLocaleString()}</span>
                          <Edit3 className="w-3 h-3 text-slate-300 group-hover:text-amber-600" />
                        </button>
                      </td>

                      {/* 現在値 */}
                      <td className="py-4 px-4 text-right whitespace-nowrap bg-amber-50/30">
                        <button
                          onClick={() => setQuickPriceEditStock(stock)}
                          title="手動で株価を修正"
                          className="hover:underline font-black text-slate-900 flex items-center justify-end gap-1 ml-auto group"
                        >
                          <span className={fontStyles.priceText}>¥{stock.currentPrice.toLocaleString()}</span>
                          <Edit3 className="w-3 h-3 text-slate-300 group-hover:text-amber-600" />
                        </button>
                      </td>

                      {/* 前日比 */}
                      <td className="py-4 px-3 text-right whitespace-nowrap">
                        <span className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md font-bold ${fontStyles.badge} ${
                          isDayPlus ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                        }`}>
                          {isDayPlus ? '+' : ''}{stock.change !== undefined ? stock.change : 0}円
                          <span className="opacity-80">({isDayPlus ? '+' : ''}{stock.changePercent !== undefined ? stock.changePercent : 0}%)</span>
                        </span>
                      </td>

                      {/* 評価額 */}
                      <td className={`py-4 px-4 text-right whitespace-nowrap font-black text-slate-900 ${fontStyles.tableText}`}>
                        ¥{(stock.currentPrice * stock.shares).toLocaleString()}
                      </td>

                      {/* 評価損益 */}
                      <td className="py-4 px-4 text-right whitespace-nowrap">
                        <div className={`font-black ${fontStyles.priceText} ${isProfit ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {isProfit ? '+' : ''}¥{profit.toLocaleString()}
                        </div>
                        <div className={`text-xs font-bold ${isProfit ? 'text-emerald-700' : 'text-rose-700'}`}>
                          {isProfit ? '+' : ''}{profitRate}%
                        </div>
                      </td>

                      {/* 配当利回り */}
                      <td className={`py-4 px-3 text-center whitespace-nowrap font-bold text-slate-600 ${fontStyles.tableText}`}>
                        {stock.dividendYield ? `${stock.dividendYield}%` : '-'}
                      </td>

                      {/* 権利確定月 */}
                      <td className={`py-4 px-3 text-center whitespace-nowrap font-bold text-slate-700 ${fontStyles.tableText}`}>
                        {stock.rightsMonths ? stock.rightsMonths.map(m => `${m}月`).join('・') : '-'}
                      </td>

                      {/* 優待到着予定 */}
                      <td className="py-4 px-4 text-center whitespace-nowrap bg-orange-50/30">
                        {isDeliveryThisMonth ? (
                          <span className="inline-flex items-center gap-1 bg-rose-500 text-white font-black px-2.5 py-1 rounded-xl text-xs animate-pulse">
                            🎁 今月届く！
                          </span>
                        ) : (
                          <span className="text-xs font-bold text-orange-800 bg-orange-100/80 px-2.5 py-1 rounded-lg">
                            {stock.deliveryMemo || (stock.deliveryMonths ? `${stock.deliveryMonths.map(m => `${m}月`).join('・')}頃` : '未定')}
                          </span>
                        )}
                      </td>

                      {/* 優待内容 */}
                      <td className="py-4 px-5 max-w-xs">
                        <div className={`font-bold text-slate-900 line-clamp-1 ${fontStyles.tableText}`}>
                          {stock.yutaiTitle}
                        </div>
                        {stock.yutaiDetail && (
                          <div className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                            {stock.yutaiDetail}
                          </div>
                        )}
                      </td>

                      {/* 操作 */}
                      <td className="py-4 px-3 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => handleOpenEdit(stock)}
                            className="p-1.5 text-slate-500 hover:text-amber-700 hover:bg-amber-100 rounded-lg transition-colors"
                            title="編集"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(stock.id, stock.name)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="削除"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* 表の下部：かんたんプリセット追加 */}
          <div className="p-6 bg-slate-50 border-t border-slate-200">
            <h3 className="text-sm font-black text-slate-700 mb-3 flex items-center gap-1.5">
              <span>🌟 初心者にも人気の定番優待銘柄（クリックで簡単追加）</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              {PRESET_STOCKS.map(preset => (
                <div key={preset.code} className="bg-white p-3 rounded-2xl border border-slate-200 flex items-center justify-between shadow-2xs hover:border-amber-300 transition-all">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{preset.icon}</span>
                    <div>
                      <div className="text-xs font-black text-slate-900">{preset.name} ({preset.code})</div>
                      <div className="text-[11px] text-slate-500 line-clamp-1">{preset.yutaiTitle}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleAddPreset(preset)}
                    className="bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs px-2.5 py-1 rounded-xl shadow-2xs active:scale-95 whitespace-nowrap ml-2"
                  >
                    追加
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* 📖 お渡し用「使い方ガイド」モーダル（1枚でわかる簡単ガイド） */}
      {showGuideModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-3xl w-full max-w-2xl p-6 md:p-8 shadow-2xl animate-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <BookOpen className="w-6 h-6 text-amber-500" />
                <h3 className="text-xl font-black text-slate-900">わたしの株・優待手帳 使い方ガイド</h3>
              </div>
              <button
                onClick={() => setShowGuideModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-400 hover:text-slate-600 flex items-center justify-center font-bold"
              >
                ✕
              </button>
            </div>

            <div className="my-6 space-y-6 text-slate-700">
              {/* ステップ1 */}
              <div className="flex gap-4 items-start bg-amber-50/60 p-4 rounded-2xl border border-amber-200">
                <div className="w-9 h-9 rounded-full bg-amber-500 text-white flex items-center justify-center font-black text-lg flex-shrink-0">
                  1
                </div>
                <div>
                  <h4 className="text-base font-black text-slate-900">持っている株を手帳に登録する</h4>
                  <p className="text-sm text-slate-600 mt-1 leading-relaxed">
                    画面右上の <strong>「＋ 銘柄を追加」</strong> ボタンを押します。<br />
                    手元のメモを見ながら、会社名・銘柄コード（数字4桁）・持っている株数・買った時の株価・優待内容を入力するだけで登録できます。
                  </p>
                </div>
              </div>

              {/* ステップ2 */}
              <div className="flex gap-4 items-start bg-emerald-50/60 p-4 rounded-2xl border border-emerald-200">
                <div className="w-9 h-9 rounded-full bg-emerald-600 text-white flex items-center justify-center font-black text-lg flex-shrink-0">
                  2
                </div>
                <div>
                  <h4 className="text-base font-black text-slate-900">「株価を最新に更新」ボタンを押す</h4>
                  <p className="text-sm text-slate-600 mt-1 leading-relaxed">
                    大きな緑色の <strong>「株価を最新に更新」</strong> ボタンを押すと、インターネットから最新の株価と前日比が一括で読み込まれ、今の評価額や利益が自動計算されます！
                  </p>
                </div>
              </div>

              {/* ステップ3 */}
              <div className="flex gap-4 items-start bg-orange-50/60 p-4 rounded-2xl border border-orange-200">
                <div className="w-9 h-9 rounded-full bg-orange-500 text-white flex items-center justify-center font-black text-lg flex-shrink-0">
                  3
                </div>
                <div>
                  <h4 className="text-base font-black text-slate-900">優待の届く時期を楽しむ</h4>
                  <p className="text-sm text-slate-600 mt-1 leading-relaxed">
                    優待が届く月（今月なら10月）になると、画面に <strong>「🎁 今月届く！」</strong> とお知らせが表示されます。<br />
                    「届いたら押す」ボタンで受取チェックもできるので、届き忘れの確認にも便利です。
                  </p>
                </div>
              </div>

              {/* ステップ4 */}
              <div className="flex gap-4 items-start bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div className="w-9 h-9 rounded-full bg-slate-700 text-white flex items-center justify-center font-black text-lg flex-shrink-0">
                  ☁️
                </div>
                <div>
                  <h4 className="text-base font-black text-slate-900">Googleドライブ保存で安心</h4>
                  <p className="text-sm text-slate-600 mt-1 leading-relaxed">
                    画面上の「Googleドライブ連携」からログインしておくと、ご自身のGoogleドライブ内の「myKabushikiList」フォルダに自動保存されます。パソコンを替えてもデータはいつでも安全に引き継がれます。
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-between items-center border-t border-slate-100">
              <span className="text-xs text-slate-400">ブラウザのブックマーク（お気に入り）に登録しておくと次回すぐ開けます</span>
              <button
                onClick={() => setShowGuideModal(false)}
                className="bg-amber-500 text-white font-black text-sm px-6 py-2.5 rounded-xl shadow-md active:scale-95"
              >
                とじる
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 銘柄登録・編集モーダル */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-3xl w-full max-w-lg p-6 md:p-8 shadow-2xl animate-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-5 pb-3 border-b border-slate-100">
              <h3 className="text-lg md:text-xl font-black text-slate-900 flex items-center gap-2">
                <PlusCircle className="w-6 h-6 text-amber-500" />
                <span>{editingStock ? '銘柄の情報を編集する' : '新しい株式を登録する'}</span>
              </h3>
              <button 
                onClick={() => setShowAddModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-400 hover:text-slate-600 flex items-center justify-center font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveStock} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-black text-slate-700 mb-1">
                    会社名・銘柄名 <span className="text-rose-500">*</span>
                  </label>
                  <input 
                    type="text"
                    required
                    placeholder="例：イオン、トヨタ"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full text-sm font-bold p-3 rounded-xl border border-slate-300 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-700 mb-1">
                    銘柄コード (数字4桁)
                  </label>
                  <input 
                    type="text"
                    placeholder="例：8267"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className="w-full text-sm font-mono font-bold p-3 rounded-xl border border-slate-300 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    持っている株数
                  </label>
                  <input 
                    type="number"
                    placeholder="100"
                    value={formData.shares}
                    onChange={(e) => setFormData({ ...formData, shares: e.target.value })}
                    className="w-full text-sm font-bold p-3 rounded-xl border border-slate-300 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    購入単価 (1株いくら?)
                  </label>
                  <input 
                    type="number"
                    required
                    placeholder="例：2800"
                    value={formData.buyPrice}
                    onChange={(e) => setFormData({ ...formData, buyPrice: e.target.value })}
                    className="w-full text-sm font-bold p-3 rounded-xl border border-slate-300 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    いまの株価 (現在値)
                  </label>
                  <input 
                    type="number"
                    placeholder="例：3450"
                    value={formData.currentPrice}
                    onChange={(e) => setFormData({ ...formData, currentPrice: e.target.value })}
                    className="w-full text-sm font-bold p-3 rounded-xl border border-slate-300 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* 優待情報入力（到着予定の自動計算付き） */}
              <div className="bg-amber-50/70 p-4 rounded-2xl border-2 border-amber-200 space-y-3">
                <div>
                  <label className="block text-xs font-black text-amber-950 mb-1">
                    🎁 株主優待の内容
                  </label>
                  <input 
                    type="text"
                    placeholder="例：お買い物券3,000円分、お米5kg、カタログギフト"
                    value={formData.yutaiTitle}
                    onChange={(e) => setFormData({ ...formData, yutaiTitle: e.target.value })}
                    className="w-full text-sm font-bold p-3 rounded-xl bg-white border border-amber-300 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-amber-900 mb-1">
                      権利確定月 (例: 3, 9)
                    </label>
                    <input 
                      type="text"
                      placeholder="例：3, 9"
                      value={formData.rightsMonths}
                      onChange={(e) => handleRightsMonthsChange(e.target.value)}
                      className="w-full text-xs font-bold p-2.5 rounded-xl bg-white border border-amber-300 focus:outline-none"
                    />
                    <span className="text-[10px] text-amber-700 mt-0.5 block">入力すると到着月が自動計算されます</span>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-amber-900 mb-1">
                      📮 優待到着予定 (2〜3ヶ月後)
                    </label>
                    <input 
                      type="text"
                      placeholder="例：6, 12"
                      value={formData.deliveryMonths}
                      onChange={(e) => setFormData({ ...formData, deliveryMonths: e.target.value })}
                      className="w-full text-xs font-bold p-2.5 rounded-xl bg-white border border-amber-300 focus:outline-none"
                    />
                    <span className="text-[10px] text-amber-700 mt-0.5 block">自動計算後も自由に変更可能</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-amber-900 mb-1">
                    到着時期のメモ（例：6月下旬頃）
                  </label>
                  <input 
                    type="text"
                    placeholder="例：6月下旬・12月上旬頃"
                    value={formData.deliveryMemo}
                    onChange={(e) => setFormData({ ...formData, deliveryMemo: e.target.value })}
                    className="w-full text-xs font-bold p-2.5 rounded-xl bg-white border border-amber-300 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-amber-900 mb-1">
                    アイコンを選ぶ
                  </label>
                  <div className="flex gap-2 text-xl">
                    {['🎁', '🍽️', '🛍️', '☕', '🌾', '✈️', '🎫', '🚗', '📱'].map((emoji) => (
                      <button
                        type="button"
                        key={emoji}
                        onClick={() => setFormData({ ...formData, icon: emoji })}
                        className={`p-2 rounded-xl border text-xl ${formData.icon === emoji ? 'bg-amber-200 border-amber-500 scale-110' : 'bg-white border-slate-200'}`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  配当利回り (% / 分かれば入力)
                </label>
                <input 
                  type="number"
                  step="0.1"
                  placeholder="例：2.5"
                  value={formData.dividendYield}
                  onChange={(e) => setFormData({ ...formData, dividendYield: e.target.value })}
                  className="w-full text-xs font-bold p-2.5 rounded-xl border border-slate-300 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  📝 メモ（使い方や思い）
                </label>
                <input 
                  type="text"
                  placeholder="例：毎年新米が届く、家族でスシロー行く"
                  value={formData.memo}
                  onChange={(e) => setFormData({ ...formData, memo: e.target.value })}
                  className="w-full text-sm p-3 rounded-xl border border-slate-300 focus:outline-none"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-3.5 text-sm font-bold text-slate-500 bg-slate-100 rounded-2xl"
                >
                  キャンセル
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-amber-500 hover:bg-amber-600 text-white font-black py-3.5 rounded-2xl shadow-md text-base active:scale-95 transition-all"
                >
                  {editingStock ? '変更を保存する' : '手帳に登録する'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 株価・購入単価のクイック修正ポップアップ */}
      {quickPriceEditStock && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-3xl w-full max-w-sm p-6 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center gap-2.5 mb-4">
              <span className="text-3xl">{quickPriceEditStock.icon}</span>
              <div>
                <h3 className="text-base font-black text-slate-900">{quickPriceEditStock.name} ({quickPriceEditStock.code})</h3>
                <span className="text-xs text-slate-400 font-bold">価格の直接修正</span>
              </div>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              const newBuy = Number(e.target.buyPrice.value);
              const newCur = Number(e.target.currentPrice.value);

              const updated = stocks.map(s => {
                if (s.id === quickPriceEditStock.id) {
                  return {
                    ...s,
                    buyPrice: !isNaN(newBuy) && newBuy > 0 ? newBuy : s.buyPrice,
                    currentPrice: !isNaN(newCur) && newCur > 0 ? newCur : s.currentPrice,
                  };
                }
                return s;
              });

              setStocks(updated);
              saveToDrive(updated);
              setQuickPriceEditStock(null);
            }} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  購入単価 (1株いくらで買ったか)
                </label>
                <input 
                  name="buyPrice"
                  type="number"
                  defaultValue={quickPriceEditStock.buyPrice}
                  className="w-full text-base font-bold p-2.5 rounded-xl border border-slate-300 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  いまの株価 (現在値)
                </label>
                <input 
                  name="currentPrice"
                  type="number"
                  defaultValue={quickPriceEditStock.currentPrice}
                  className="w-full text-base font-bold p-2.5 rounded-xl border border-slate-300 focus:outline-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setQuickPriceEditStock(null)}
                  className="flex-1 py-2.5 text-xs font-bold text-slate-500 bg-slate-100 rounded-xl"
                >
                  キャンセル
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 text-xs font-black text-white bg-amber-500 rounded-xl shadow-md active:scale-95"
                >
                  保存する
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 今月届く優待お知らせモーダル */}
      {showNoticeModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl animate-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center">
                  <BellRing className="w-5 h-5 text-amber-600 animate-pulse" />
                </div>
                <h3 className="text-base font-black text-slate-900">
                  今月 ({currentMonth}月) 届く優待のお知らせ
                </h3>
              </div>
              <button 
                onClick={() => setShowNoticeModal(false)}
                className="w-7 h-7 rounded-full bg-slate-100 text-slate-400 hover:text-slate-600 flex items-center justify-center font-bold text-xs"
              >
                ✕
              </button>
            </div>

            {currentMonthStocks.length === 0 ? (
              <div className="text-center py-6">
                <div className="text-4xl mb-2">📬</div>
                <p className="text-xs text-slate-500">
                  今月 ({currentMonth}月) に届く予定の優待はありません。<br />
                  一覧表の「優待到着予定」から今後の予定をご確認いただけます！
                </p>
              </div>
            ) : (
              <div className="space-y-3 my-4">
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 text-xs text-amber-900 font-bold flex items-center gap-2">
                  <span>🎉</span>
                  <span>今月は <strong>{currentMonthStocks.length}件</strong> の優待が届く予定です！</span>
                </div>

                {currentMonthStocks.map(stock => (
                  <div key={stock.id} className="p-3.5 rounded-2xl border bg-white border-amber-300 shadow-xs">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2.5">
                        <span className="text-2xl p-1 bg-amber-50 rounded-xl">{stock.icon}</span>
                        <div>
                          <h4 className="text-sm font-black text-slate-900">{stock.name} ({stock.code})</h4>
                          <span className="text-xs text-amber-700 font-bold">{stock.yutaiTitle}</span>
                        </div>
                      </div>
                    </div>
                    {stock.yutaiDetail && (
                      <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                        {stock.yutaiDetail}
                      </p>
                    )}
                    <div className="mt-2 pt-2 border-t border-slate-100 text-xs text-slate-400">
                      届く目安: {stock.deliveryMemo || `${currentMonth}月中`}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={() => setShowNoticeModal(false)}
              className="w-full bg-amber-500 text-white font-bold text-xs py-3 rounded-xl shadow-md active:scale-95"
            >
              確認しました
            </button>
          </div>
        </div>
      )}

      {/* Google Drive 設定モーダル */}
      {showSettingsModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-3xl w-full max-w-sm p-6 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center gap-2">
                <Cloud className="w-5 h-5 text-amber-500" />
                <h3 className="text-base font-black text-slate-900">Googleドライブ保存設定</h3>
              </div>
              <button 
                onClick={() => setShowSettingsModal(false)}
                className="w-7 h-7 rounded-full bg-slate-100 text-slate-400 hover:text-slate-600 flex items-center justify-center font-bold text-xs"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              ログインすると、Googleマイドライブ内の「<strong>myKabushikiList</strong>」フォルダに自動保存されます。パソコンを替えても同じGoogleアカウントでログインすればデータが復元されます。
            </p>

            <button
              onClick={() => {
                setShowSettingsModal(false);
                driveService.signIn();
              }}
              className="w-full py-3 bg-amber-500 text-white font-black text-sm rounded-xl shadow-md active:scale-95 flex items-center justify-center gap-2"
            >
              <img src="https://www.gstatic.com/images/branding/product/1x/gsa_512dp.png" alt="" className="w-4 h-4 bg-white rounded-full p-0.5" />
              <span>Googleアカウントでログイン</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

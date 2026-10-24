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
  ShieldCheck
} from 'lucide-react';
import { GoogleDriveService } from './services/googleDrive';

// 初期サンプルデータ（お母様に人気の優待銘柄）
const INITIAL_STOCKS = [
  {
    id: '1',
    code: '8267',
    name: 'イオン',
    shares: 100,
    buyPrice: 2800,
    currentPrice: 3450,
    yutaiTitle: 'お買い物 3%キャッシュバック',
    yutaiDetail: 'イオンでのお買い物金額の3%が半年ごとに現金で戻ってくるオーナーズカード！映画割引もあり。',
    rightsMonths: [2, 8],
    deliveryMonths: [4, 10],
    category: '買い物割引',
    icon: '🛍️',
    dividendYield: 1.2,
    memo: '近所のイオンで毎週火曜市に行くときに必須！'
  },
  {
    id: '2',
    code: '3197',
    name: 'すかいらーくHD',
    shares: 100,
    buyPrice: 1950,
    currentPrice: 2280,
    yutaiTitle: 'お食事ご優待カード 2,000円分',
    yutaiDetail: 'ガスト、バーミヤン、ジョナサン、夢庵などで使える電子マネーカード（年2回、計4,000円分）。',
    rightsMonths: [6, 12],
    deliveryMonths: [3, 9],
    category: '食事券',
    icon: '🍽️',
    dividendYield: 0.8,
    memo: '孫たちとガストやバーミヤンに行くときに使う'
  },
  {
    id: '3',
    code: '3543',
    name: 'コメダホールディングス',
    shares: 100,
    buyPrice: 2400,
    currentPrice: 2710,
    yutaiTitle: 'KOMECAチャージ 1,000円分',
    yutaiDetail: 'コメダ珈琲店で使えるプリペイドカードに自動チャージ（年2回、計2,000円分）。',
    rightsMonths: [2, 8],
    deliveryMonths: [6, 12],
    category: 'カフェ・飲食',
    icon: '☕',
    dividendYield: 1.9,
    memo: 'お友達とモーニングに行く時の定番！'
  },
  {
    id: '4',
    code: '9201',
    name: '日本航空 (JAL)',
    shares: 100,
    buyPrice: 2600,
    currentPrice: 2540,
    yutaiTitle: '国内線 50%割引券 1枚',
    yutaiDetail: '国内線普通運賃が半額になる株主優待券。旅行や帰省の際に便利。',
    rightsMonths: [3, 9],
    deliveryMonths: [5, 11],
    category: '旅行・交通',
    icon: '✈️',
    dividendYield: 2.8,
    memo: '北海道旅行に行くときに使う予定'
  }
];

// 人気銘柄のクイック追加候補
const PRESET_STOCKS = [
  {
    code: '2702',
    name: '日本マクドナルドHD',
    shares: 100,
    currentPrice: 6500,
    yutaiTitle: '優待食事券 1冊 (6枚綴り)',
    yutaiDetail: 'バーガー、サイド、ドリンクの引換券がセットになった人気食事券（年2回）。',
    rightsMonths: [6, 12],
    deliveryMonths: [3, 9],
    category: '食事券',
    icon: '🍔',
    dividendYield: 0.7
  },
  {
    code: '8591',
    name: 'オリックス',
    shares: 100,
    currentPrice: 3200,
    yutaiTitle: 'ふるさと優待 (カタログギフト)',
    yutaiDetail: '全国の名産品から選べる豪華なカタログギフト。',
    rightsMonths: [3],
    deliveryMonths: [7],
    category: 'ギフト・特産品',
    icon: '🎁',
    dividendYield: 3.2
  },
  {
    code: '9433',
    name: 'KDDI',
    shares: 100,
    currentPrice: 4800,
    yutaiTitle: 'Pontaポイント / 関連サービス優待',
    yutaiDetail: '日常の買い物やスマホ決済で使える便利なポイント還元。',
    rightsMonths: [3],
    deliveryMonths: [6],
    category: 'ポイント・通信',
    icon: '📱',
    dividendYield: 3.0
  }
];

const driveService = new GoogleDriveService();

export default function App() {
  const [stocks, setStocks] = useState(() => {
    const saved = localStorage.getItem('my_kabushiki_list');
    return saved ? JSON.parse(saved) : INITIAL_STOCKS;
  });

  // 文字サイズ設定 ('normal': 標準, 'large': 大きめ, 'huge': 特大)
  const [fontSizeMode, setFontSizeMode] = useState(() => {
    return localStorage.getItem('kabushiki_font_size') || 'large';
  });

  const [activeTab, setActiveTab] = useState('list'); // 'list' | 'calendar' | 'ai'
  const [selectedStock, setSelectedStock] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);

  // Google連携ステート
  const [googleUser, setGoogleUser] = useState(null);
  const [syncStatus, setSyncStatus] = useState('idle'); // 'idle' | 'syncing' | 'saved' | 'error'
  const [clientIdInput, setClientIdInput] = useState(localStorage.getItem('google_client_id') || '');
  const [isDriveReady, setIsDriveReady] = useState(false);

  // かんたん購入単価の直接変更モーダル
  const [editingPriceStock, setEditingPriceStock] = useState(null);
  const [tempBuyPrice, setTempBuyPrice] = useState('');
  const [tempCurrentPrice, setTempCurrentPrice] = useState('');

  // フォーム用ステート
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    shares: 100,
    buyPrice: '',
    currentPrice: '',
    yutaiTitle: '',
    yutaiDetail: '',
    rightsMonths: '3',
    deliveryMonths: '6',
    category: 'その他',
    icon: '🎁',
    memo: ''
  });

  // Google Drive 初期化
  useEffect(() => {
    driveService.init(async (token, profile) => {
      setGoogleUser(profile);
      setSyncStatus('syncing');
      try {
        // ドライブからデータ取得
        const driveData = await driveService.loadStocksData();
        if (driveData && Array.isArray(driveData) && driveData.length > 0) {
          setStocks(driveData);
          localStorage.setItem('my_kabushiki_list', JSON.stringify(driveData));
        } else {
          // ドライブにまだデータがなければ現在のローカルデータを保存
          await driveService.saveStocksData(stocks);
        }
        setSyncStatus('saved');
      } catch (err) {
        console.error('Drive load error:', err);
        setSyncStatus('error');
      }
    }).then(() => {
      setIsDriveReady(true);
    });
  }, []);

  // LocalStorage保存
  useEffect(() => {
    localStorage.setItem('my_kabushiki_list', JSON.stringify(stocks));
  }, [stocks]);

  useEffect(() => {
    localStorage.setItem('kabushiki_font_size', fontSizeMode);
  }, [fontSizeMode]);

  // Googleドライブへ自動保存（ログイン時）
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

  // Googleログイン実行
  const handleGoogleSignIn = () => {
    if (!driveService.clientId) {
      setShowSettingsModal(true);
      return;
    }
    try {
      driveService.signIn();
    } catch (e) {
      if (e.message === 'CLIENT_ID_NOT_SET') {
        setShowSettingsModal(true);
      }
    }
  };

  // ログアウト処理
  const handleGoogleSignOut = () => {
    if (window.confirm('Googleアカウントの連携を解除しますか？\n（スマートフォンのデータは残ります）')) {
      driveService.accessToken = null;
      driveService.userProfile = null;
      setGoogleUser(null);
      setSyncStatus('idle');
    }
  };

  // Client IDの保存
  const handleSaveClientId = (e) => {
    e.preventDefault();
    const cleaned = clientIdInput.trim();
    driveService.setClientId(cleaned);
    setShowSettingsModal(false);
    alert('GoogleクライアントIDを設定しました！「Googleでログイン」を押して連携をお試しください。');
    // 再初期化
    driveService.init(async (token, profile) => {
      setGoogleUser(profile);
      setSyncStatus('syncing');
      const driveData = await driveService.loadStocksData();
      if (driveData && Array.isArray(driveData) && driveData.length > 0) {
        setStocks(driveData);
      } else {
        await driveService.saveStocksData(stocks);
      }
      setSyncStatus('saved');
    });
  };

  // 文字サイズに応じたクラスヘルパー
  const fontStyles = {
    normal: {
      body: 'text-xs leading-normal',
      lead: 'text-sm leading-relaxed',
      title: 'text-base font-bold',
      subtitle: 'text-xs',
      badge: 'text-[11px]',
      cardPadding: 'p-4',
    },
    large: {
      body: 'text-sm leading-relaxed',
      lead: 'text-base leading-relaxed',
      title: 'text-lg font-bold',
      subtitle: 'text-sm',
      badge: 'text-xs font-semibold',
      cardPadding: 'p-4',
    },
    huge: {
      body: 'text-base leading-loose font-medium',
      lead: 'text-lg leading-relaxed font-bold',
      title: 'text-xl font-black',
      subtitle: 'text-base font-medium',
      badge: 'text-sm font-bold',
      cardPadding: 'p-5',
    }
  }[fontSizeMode];

  // 合計資産・損益の計算
  const totalValue = stocks.reduce((sum, s) => sum + (s.currentPrice * s.shares), 0);
  const totalCost = stocks.reduce((sum, s) => sum + (s.buyPrice * s.shares), 0);
  const totalProfit = totalValue - totalCost;
  const profitPercentage = totalCost > 0 ? ((totalProfit / totalCost) * 100).toFixed(1) : '0.0';

  // 削除処理
  const handleDelete = (id) => {
    if (window.confirm('この株式をリストから削除してもよろしいですか？')) {
      const updated = stocks.filter(s => s.id !== id);
      setStocks(updated);
      saveToDrive(updated);
      if (selectedStock && selectedStock.id === id) {
        setSelectedStock(null);
      }
    }
  };

  // 買った値段の更新処理
  const handleSavePriceEdit = (e) => {
    e.preventDefault();
    if (!editingPriceStock) return;

    const newBuy = Number(tempBuyPrice);
    const newCurrent = Number(tempCurrentPrice);

    const updated = stocks.map(s => {
      if (s.id === editingPriceStock.id) {
        return {
          ...s,
          buyPrice: !isNaN(newBuy) && newBuy > 0 ? newBuy : s.buyPrice,
          currentPrice: !isNaN(newCurrent) && newCurrent > 0 ? newCurrent : s.currentPrice,
        };
      }
      return s;
    });

    setStocks(updated);
    saveToDrive(updated);

    if (selectedStock && selectedStock.id === editingPriceStock.id) {
      setSelectedStock(prev => ({
        ...prev,
        buyPrice: !isNaN(newBuy) && newBuy > 0 ? newBuy : prev.buyPrice,
        currentPrice: !isNaN(newCurrent) && newCurrent > 0 ? newCurrent : prev.currentPrice,
      }));
    }

    setEditingPriceStock(null);
  };

  // 登録処理
  const handleSaveStock = (e) => {
    e.preventDefault();
    if (!formData.name) return;

    const buyPrice = Number(formData.buyPrice) || 1000;
    const currentPrice = Number(formData.currentPrice) || buyPrice;

    const newStock = {
      id: Date.now().toString(),
      code: formData.code || '----',
      name: formData.name,
      shares: Number(formData.shares) || 100,
      buyPrice: buyPrice,
      currentPrice: currentPrice,
      yutaiTitle: formData.yutaiTitle || '株主優待',
      yutaiDetail: formData.yutaiDetail || '優待詳細は登録されていません',
      rightsMonths: formData.rightsMonths.split(',').map(m => Number(m.trim())).filter(n => !isNaN(n) && n >= 1 && n <= 12),
      deliveryMonths: formData.deliveryMonths.split(',').map(m => Number(m.trim())).filter(n => !isNaN(n) && n >= 1 && n <= 12),
      category: formData.category,
      icon: formData.icon || '🎁',
      dividendYield: 2.0,
      memo: formData.memo || ''
    };

    const updated = [...stocks, newStock];
    setStocks(updated);
    saveToDrive(updated);
    setShowAddModal(false);

    // フォームリセット
    setFormData({
      code: '',
      name: '',
      shares: 100,
      buyPrice: '',
      currentPrice: '',
      yutaiTitle: '',
      yutaiDetail: '',
      rightsMonths: '3',
      deliveryMonths: '6',
      category: 'その他',
      icon: '🎁',
      memo: ''
    });
  };

  // プリセット銘柄のワンタップ追加
  const handleAddPreset = (preset) => {
    const buyPrice = prompt(`「${preset.name}」を1株いくらで買いましたか？\n（空欄の場合は現在の目安株価 ¥${preset.currentPrice.toLocaleString()} で登録されます）`, preset.currentPrice.toString());
    
    if (buyPrice === null) return;

    const finalBuyPrice = Number(buyPrice) || preset.currentPrice;

    const newStock = {
      ...preset,
      id: Date.now().toString(),
      buyPrice: finalBuyPrice,
      memo: 'おすすめ銘柄から追加しました'
    };
    const updated = [...stocks, newStock];
    setStocks(updated);
    saveToDrive(updated);
    alert(`${preset.name} を手帳に追加しました！`);
  };

  // 届く月ごとの銘柄抽出
  const stocksByMonth = (month) => {
    return stocks.filter(s => s.deliveryMonths && s.deliveryMonths.includes(month));
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-slate-800 pb-28 max-w-md mx-auto shadow-xl relative border-x border-amber-100/60 font-sans">
      {/* 最上部：文字サイズ ＆ 共有 ＆ 設定バー */}
      <div className="bg-amber-600 text-amber-50 px-3 py-2 flex items-center justify-between border-b border-amber-500/40 sticky top-0 z-30 shadow-xs">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setShowQrModal(true)}
            className="flex items-center gap-1 bg-white text-amber-800 text-[11px] font-black px-2.5 py-1 rounded-lg shadow-sm hover:bg-amber-50 active:scale-95 transition-transform"
          >
            <QrCode className="w-3.5 h-3.5 text-amber-600" />
            <span>スマホで共有</span>
          </button>
          <button
            onClick={() => setShowSettingsModal(true)}
            title="Google Drive 連携設定"
            className="p-1.5 rounded-lg bg-amber-700/60 hover:bg-amber-700 text-amber-100"
          >
            <Settings className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="flex items-center gap-1">
          <div className="flex bg-amber-700/70 p-0.5 rounded-xl border border-amber-500/60 shadow-inner">
            <button
              onClick={() => setFontSizeMode('normal')}
              className={`px-2 py-0.5 rounded-lg text-xs font-bold transition-all ${
                fontSizeMode === 'normal' 
                  ? 'bg-white text-amber-800 shadow-sm' 
                  : 'text-amber-100 hover:text-white'
              }`}
            >
              標準
            </button>
            <button
              onClick={() => setFontSizeMode('large')}
              className={`px-2.5 py-0.5 rounded-lg text-xs font-black transition-all ${
                fontSizeMode === 'large' 
                  ? 'bg-white text-amber-800 shadow-sm' 
                  : 'text-amber-100 hover:text-white'
              }`}
            >
              大きめ
            </button>
            <button
              onClick={() => setFontSizeMode('huge')}
              className={`px-2.5 py-0.5 rounded-lg text-xs font-black transition-all ${
                fontSizeMode === 'huge' 
                  ? 'bg-white text-amber-800 shadow-sm ring-1 ring-yellow-300' 
                  : 'text-amber-100 hover:text-white'
              }`}
            >
              特大
            </button>
          </div>
        </div>
      </div>

      {/* Google ドライブ同期状態バナー */}
      <div className="bg-amber-500/20 border-b border-amber-200 px-4 py-2 flex items-center justify-between text-xs">
        {googleUser ? (
          <div className="flex items-center gap-2 flex-1">
            {googleUser.picture ? (
              <img src={googleUser.picture} alt="" className="w-5 h-5 rounded-full" />
            ) : (
              <Cloud className="w-4 h-4 text-emerald-600" />
            )}
            <div className="flex items-center gap-1 text-slate-700">
              <span className="font-bold truncate max-w-[130px]">{googleUser.name || 'Google'}</span>
              <span className="text-[10px] text-emerald-700 font-bold bg-emerald-100 px-1.5 py-0.5 rounded">
                Drive/myKabushikiList
              </span>
            </div>
            {syncStatus === 'syncing' && <span className="text-[10px] text-amber-700 animate-pulse">保存中...</span>}
            {syncStatus === 'saved' && <span className="text-[10px] text-emerald-700 font-bold">✓ 保存済</span>}
          </div>
        ) : (
          <div className="flex items-center justify-between w-full">
            <span className="text-slate-600 text-[11px] flex items-center gap-1">
              <Cloud className="w-3.5 h-3.5 text-slate-400" />
              <span>Googleドライブに自動バックアップできます</span>
            </span>
            <button
              onClick={handleGoogleSignIn}
              className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 px-2.5 py-1 rounded-lg font-bold text-[11px] shadow-2xs flex items-center gap-1 active:scale-95"
            >
              <img src="https://www.gstatic.com/images/branding/product/1x/gsa_512dp.png" alt="" className="w-3.5 h-3.5" />
              <span>ログイン</span>
            </button>
          </div>
        )}

        {googleUser && (
          <button 
            onClick={handleGoogleSignOut}
            title="連携解除"
            className="text-slate-400 hover:text-rose-600 p-1"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* ヘッダー */}
      <header className="bg-gradient-to-b from-amber-500 to-amber-600 text-white px-5 pt-5 pb-6 shadow-md rounded-b-3xl">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-amber-100 text-xs font-semibold">
              <Smile className="w-4 h-4 text-amber-200" />
              <span>お母さんのための</span>
            </div>
            <h1 className="text-2xl font-black tracking-tight mt-0.5">わたしの株・優待手帳</h1>
          </div>
          <button 
            onClick={() => setShowAddModal(true)}
            className="bg-white text-amber-700 active:scale-95 transition-transform px-3.5 py-2.5 rounded-2xl font-bold text-xs shadow-md flex items-center gap-1.5 border border-amber-100"
          >
            <PlusCircle className="w-4 h-4 text-amber-600" />
            <span>株を登録</span>
          </button>
        </div>

        {/* 資産とトータル利益のサマリーカード */}
        <div className="mt-5 bg-white/95 backdrop-blur rounded-2xl p-4 text-slate-800 shadow-sm border border-amber-200/60">
          <div className="flex justify-between items-baseline">
            <span className={`${fontStyles.subtitle} font-bold text-slate-500`}>いまの保有総額</span>
            <span className="text-2xl font-black text-slate-900 tracking-tight">
              ¥{totalValue.toLocaleString()}
            </span>
          </div>

          {/* 利益・損益のわかりやすいハイライト */}
          <div className="mt-2.5 pt-2.5 border-t border-slate-100 flex items-center justify-between">
            <span className={`${fontStyles.subtitle} font-bold text-slate-500`}>買った時からの利益</span>
            <div className={`flex items-center gap-1 font-black ${fontStyles.body} px-2.5 py-1 rounded-xl ${
              totalProfit >= 0 ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
            }`}>
              {totalProfit >= 0 ? <ArrowUpRight className="w-4 h-4 text-emerald-600" /> : <ArrowDownRight className="w-4 h-4 text-rose-600" />}
              <span>{totalProfit >= 0 ? '+' : ''}¥{totalProfit.toLocaleString()}</span>
              <span className="text-xs font-bold opacity-80">({totalProfit >= 0 ? '+' : ''}{profitPercentage}%)</span>
            </div>
          </div>
        </div>
      </header>

      {/* 今月届く優待の速報バナー */}
      {stocksByMonth(currentMonth).length > 0 && (
        <div className="mx-4 mt-4 bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200/90 rounded-2xl p-3.5 flex items-center gap-3 shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center text-2xl flex-shrink-0 shadow-sm">
            🎁
          </div>
          <div className="flex-1">
            <div className={`flex items-center gap-1 font-bold text-amber-800 ${fontStyles.subtitle}`}>
              <Clock className="w-4 h-4 text-amber-600" />
              <span>今月 ({currentMonth}月) 届く予定の優待！</span>
            </div>
            <p className={`text-slate-800 mt-0.5 font-bold line-clamp-1 ${fontStyles.body}`}>
              {stocksByMonth(currentMonth).map(s => s.name).join('、')} から届きます
            </p>
          </div>
          <button 
            onClick={() => setActiveTab('calendar')}
            className={`font-black text-amber-700 bg-white px-3 py-1.5 rounded-xl border border-amber-300 shadow-xs active:scale-95 ${fontStyles.badge}`}
          >
            見る
          </button>
        </div>
      )}

      {/* メインコンテンツ */}
      <main className="p-4">
        {/* 1. 銘柄リストタブ */}
        {activeTab === 'list' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center px-1">
              <h2 className={`font-black text-slate-800 flex items-center gap-1.5 ${fontStyles.title}`}>
                <span>持っている株のリスト</span>
                <span className="text-xs bg-amber-100 text-amber-900 px-2.5 py-0.5 rounded-full font-bold">
                  {stocks.length}銘柄
                </span>
              </h2>
              <span className="text-xs text-slate-400 font-medium">タップして詳しく見る</span>
            </div>

            {stocks.map((stock) => {
              const diffPerShare = stock.currentPrice - stock.buyPrice;
              const profitTotal = diffPerShare * stock.shares;
              const isProfit = profitTotal >= 0;
              const profitRate = stock.buyPrice > 0 ? ((diffPerShare / stock.buyPrice) * 100).toFixed(1) : '0.0';

              return (
                <div 
                  key={stock.id}
                  onClick={() => setSelectedStock(stock)}
                  className={`bg-white rounded-2xl ${fontStyles.cardPadding} shadow-sm border border-slate-200 hover:border-amber-400 transition-all cursor-pointer relative`}
                >
                  {/* ヘッダー行：アイコン、銘柄名、保有数 */}
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2.5">
                      <span className="text-2xl p-2 bg-amber-50 rounded-2xl border border-amber-100/80">{stock.icon}</span>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h3 className={`${fontStyles.title} text-slate-900 leading-tight`}>{stock.name}</h3>
                          <span className="text-[11px] font-mono font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                            {stock.code}
                          </span>
                        </div>
                        <span className={`${fontStyles.subtitle} text-slate-500 font-bold`}>
                          {stock.shares}株 保有
                        </span>
                      </div>
                    </div>

                    {/* いまの評価額 */}
                    <div className="text-right">
                      <div className="text-base font-black text-slate-900">
                        ¥{(stock.currentPrice * stock.shares).toLocaleString()}
                      </div>
                      <span className="text-[10px] text-slate-400 font-medium">いまの評価額</span>
                    </div>
                  </div>

                  {/* 買った株価 vs いまの株価 と 利益の比較ボックス */}
                  <div className="mt-3.5 bg-slate-50 border border-slate-200/90 rounded-2xl p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className={`font-bold text-slate-600 ${fontStyles.subtitle}`}>1株の価格比較</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingPriceStock(stock);
                          setTempBuyPrice(stock.buyPrice.toString());
                          setTempCurrentPrice(stock.currentPrice.toString());
                        }}
                        className={`text-amber-800 bg-amber-100 hover:bg-amber-200 font-black px-2.5 py-1 rounded-lg flex items-center gap-1 active:scale-95 ${fontStyles.badge}`}
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>買った値段を変更</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-white p-2.5 rounded-xl border border-slate-200/70">
                        <span className={`text-slate-500 block font-medium ${fontStyles.subtitle}`}>買ったときの価格</span>
                        <span className={`${fontStyles.title} text-slate-800`}>
                          ¥{stock.buyPrice.toLocaleString()} <span className="text-xs font-normal text-slate-500">/株</span>
                        </span>
                      </div>
                      <div className="bg-white p-2.5 rounded-xl border border-slate-200/70">
                        <span className={`text-slate-500 block font-medium ${fontStyles.subtitle}`}>いまの価格</span>
                        <span className={`${fontStyles.title} text-slate-800`}>
                          ¥{stock.currentPrice.toLocaleString()} <span className="text-xs font-normal text-slate-500">/株</span>
                        </span>
                      </div>
                    </div>

                    {/* 利益の計算結果 */}
                    <div className={`mt-2.5 p-2.5 rounded-xl flex items-center justify-between font-black ${
                      isProfit ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
                    }`}>
                      <span className={`flex items-center gap-1 ${fontStyles.body}`}>
                        {isProfit ? '🎉 利益（プラス）' : '📉 差額（マイナス）'}
                      </span>
                      <div className="text-right">
                        <span className={`${fontStyles.title}`}>
                          {isProfit ? '+' : ''}¥{profitTotal.toLocaleString()}
                        </span>
                        <span className={`${fontStyles.badge} ml-1 opacity-80`}>
                          ({isProfit ? '+' : ''}{profitRate}%)
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* 届く月と優待内容 */}
                  <div className="mt-3 bg-amber-50/70 border border-amber-200/70 rounded-xl p-2.5">
                    <div className="flex items-center justify-between mb-1">
                      <span className={`font-bold text-amber-900 bg-amber-100 px-2 py-0.5 rounded-md flex items-center gap-1 ${fontStyles.badge}`}>
                        <Gift className="w-3.5 h-3.5 text-amber-600" />
                        株主優待
                      </span>
                      <span className={`font-bold text-orange-600 flex items-center gap-1 bg-orange-100/70 px-2 py-0.5 rounded-md ${fontStyles.badge}`}>
                        <Calendar className="w-3.5 h-3.5" />
                        届く時期: {stock.deliveryMonths ? stock.deliveryMonths.map(m => `${m}月`).join('・') : '未定'}
                      </span>
                    </div>
                    <p className={`font-black text-slate-800 line-clamp-1 ${fontStyles.body}`}>
                      {stock.yutaiTitle}
                    </p>
                  </div>

                  {/* メモ */}
                  {stock.memo && (
                    <div className={`mt-2 text-slate-600 italic bg-slate-50 p-2 rounded-lg flex items-center gap-1.5 ${fontStyles.body}`}>
                      <span>✏️</span>
                      <span className="line-clamp-1">{stock.memo}</span>
                    </div>
                  )}
                </div>
              );
            })}

            {/* おすすめ優待銘柄 */}
            <div className="mt-6 pt-4 border-t border-dashed border-amber-200">
              <h3 className={`${fontStyles.subtitle} font-bold text-slate-600 mb-2 flex items-center gap-1.5`}>
                <span>🌟 お母さんに人気の優待銘柄（ワンタップで追加）</span>
              </h3>
              <div className="space-y-2">
                {PRESET_STOCKS.map((preset) => (
                  <div key={preset.code} className="bg-amber-50/50 border border-amber-200/60 rounded-xl p-3 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="text-2xl">{preset.icon}</span>
                      <div>
                        <div className={`font-black text-slate-800 ${fontStyles.subtitle}`}>{preset.name} ({preset.code})</div>
                        <div className={`text-slate-500 line-clamp-1 ${fontStyles.badge}`}>{preset.yutaiTitle}</div>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleAddPreset(preset)}
                      className="bg-amber-500 hover:bg-amber-600 active:scale-95 text-white font-bold text-xs px-3.5 py-2 rounded-xl shadow-xs"
                    >
                      追加
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 2. 優待カレンダー（月別）タブ */}
        {activeTab === 'calendar' && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200">
              <h2 className={`${fontStyles.title} text-slate-800 mb-1 flex items-center gap-2`}>
                <Calendar className="w-5 h-5 text-amber-500" />
                <span>優待が届く月カレンダー</span>
              </h2>
              <p className={`text-slate-500 ${fontStyles.subtitle}`}>
                何月にどんな優待が届くかをまとめました！毎月のお楽しみにどうぞ。
              </p>

              {/* 月セレクター */}
              <div className="grid grid-cols-6 gap-1.5 mt-4">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((m) => {
                  const count = stocksByMonth(m).length;
                  const isSelected = currentMonth === m;
                  return (
                    <button
                      key={m}
                      onClick={() => setCurrentMonth(m)}
                      className={`py-2 px-1 rounded-xl text-center flex flex-col items-center justify-center transition-all ${
                        isSelected 
                          ? 'bg-amber-500 text-white font-bold shadow-md scale-105' 
                          : 'bg-slate-50 hover:bg-amber-50 text-slate-700'
                      }`}
                    >
                      <span className="text-xs font-bold">{m}月</span>
                      <span className={`text-[10px] mt-0.5 px-1.5 rounded-full ${
                        isSelected ? 'bg-white/30 text-white' : count > 0 ? 'bg-amber-100 text-amber-800 font-bold' : 'text-slate-300'
                      }`}>
                        {count > 0 ? `${count}件` : '-'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 選択された月に届く優待一覧 */}
            <div className="space-y-3">
              <h3 className={`font-bold text-slate-700 px-1 flex items-center gap-2 ${fontStyles.subtitle}`}>
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"></span>
                <span>{currentMonth}月に届く予定の優待 ({stocksByMonth(currentMonth).length}件)</span>
              </h3>

              {stocksByMonth(currentMonth).length === 0 ? (
                <div className="bg-white rounded-2xl p-8 text-center text-slate-400 border border-slate-200">
                  <div className="text-3xl mb-2">🍃</div>
                  <p className={`${fontStyles.subtitle} font-medium`}>この月に届く優待はまだありません</p>
                </div>
              ) : (
                stocksByMonth(currentMonth).map((stock) => (
                  <div key={stock.id} className="bg-white rounded-2xl p-4 shadow-sm border border-amber-200/80">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl p-2 bg-amber-50 rounded-2xl">{stock.icon}</span>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className={`${fontStyles.title} text-slate-800`}>{stock.name}</h4>
                          <span className={`font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-md ${fontStyles.badge}`}>
                            {currentMonth}月届く
                          </span>
                        </div>
                        <p className={`font-black text-amber-700 mt-1 ${fontStyles.body}`}>{stock.yutaiTitle}</p>
                        <p className={`text-slate-600 mt-1 leading-relaxed ${fontStyles.body}`}>{stock.yutaiDetail}</p>
                      </div>
                    </div>

                    <div className="mt-3 pt-2 border-t border-slate-100 flex justify-between text-xs text-slate-400 font-medium">
                      <span>権利確定月: {stock.rightsMonths ? stock.rightsMonths.map(m => `${m}月`).join('・') : '-'}</span>
                      <span>保有: {stock.shares}株</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* 3. AIアドバイス・予測・診断タブ */}
        {activeTab === 'ai' && (
          <div className="space-y-4">
            <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-amber-600 text-white rounded-3xl p-5 shadow-lg">
              <div className="flex items-center gap-2">
                <Sparkles className="w-7 h-7 text-yellow-300" />
                <h2 className="text-xl font-black">AI知恵袋（ワンポイント解説）</h2>
              </div>
              <p className={`text-indigo-100 mt-2 ${fontStyles.body}`}>
                お母さんの持っている株の特徴や、優待を楽しく受け取るポイントをAIが分かりやすく教えます！
              </p>
            </div>

            <div className={`bg-white rounded-3xl ${fontStyles.cardPadding} shadow-sm border border-slate-200 space-y-3`}>
              <h3 className={`${fontStyles.title} text-slate-800 flex items-center gap-2`}>
                <Smile className="w-5 h-5 text-amber-500" />
                <span>お母さんの投資のいいところ！</span>
              </h3>
              <div className={`text-slate-700 bg-amber-50/70 p-4 rounded-2xl border border-amber-200 ${fontStyles.body}`}>
                「食事券」「お買い物割引」「カフェ」など、生活に密着した優待がしっかり揃っています！<br className="my-1.5" />
                株価の上下で一時的にマイナスになっても、毎年優待や配当をもらい続けることで、長く持つほど実質トータルでお得になっていきますよ。
              </div>
            </div>

            <div className={`bg-white rounded-3xl ${fontStyles.cardPadding} shadow-sm border border-slate-200 space-y-3`}>
              <div className="flex items-center gap-1.5 text-indigo-600 font-black text-sm">
                <Info className="w-5 h-5" />
                <span>AIによる株価予測ってどうなの？</span>
              </div>

              <h4 className={`${fontStyles.title} text-slate-900 leading-snug`}>
                「明日の株価」を100%当てるのはAIでも難しいけれど…
              </h4>

              <p className={`text-slate-700 ${fontStyles.body}`}>
                株価は世界中のニュースや景気の波で動くため、未来を完全に当てる魔法はありません。
              </p>

              <div className={`p-4 bg-indigo-50/80 rounded-2xl text-indigo-950 border border-indigo-200 ${fontStyles.body}`}>
                <div className="font-black text-indigo-900 mb-1 flex items-center gap-1">
                  <span>💡 AIが得意なこと：</span>
                </div>
                過去の業績の推移や、「優待がもらえる月に向かって株価が上がりやすい傾向」を分析することはAIの得意分野です！
              </div>

              <div className={`p-4 bg-amber-50 rounded-2xl text-amber-950 border border-amber-200 ${fontStyles.body}`}>
                <div className="font-black text-amber-900 mb-1">
                  💖 お母さんへの安心アドバイス：
                </div>
                優待を楽しむ長期投資なら、日々の細かな株価の上下を気にしすぎず、<strong>「お買い物の割引やお食事券を楽しみにしながら、のんびり見守る」</strong>のが一番安心で楽しい投資法です！
              </div>
            </div>

            {/* 保有銘柄ごとのAI解説 */}
            <div className="space-y-3 pt-1">
              <h3 className={`${fontStyles.subtitle} font-black text-slate-700 px-1`}>
                銘柄ごとのAIワンポイントメモ
              </h3>
              {stocks.map(s => (
                <div key={s.id} className={`bg-white rounded-2xl ${fontStyles.cardPadding} border border-slate-200 shadow-xs flex items-start gap-3`}>
                  <span className="text-3xl p-1 bg-amber-50 rounded-xl">{s.icon}</span>
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <span className={`${fontStyles.title} text-slate-900`}>{s.name}</span>
                      <span className="text-[11px] text-amber-800 bg-amber-100 font-bold px-2 py-0.5 rounded-full">
                        優待＋配当
                      </span>
                    </div>
                    <p className={`text-slate-700 ${fontStyles.body}`}>
                      {s.code === '8267' && '普段のお買い物が実質割引になるため、イオンを使うほど家計の節約効果が高い人気銘柄です。'}
                      {s.code === '3197' && '家族や友人とのお食事に便利。権利確定月（6月・12月）の直前は優待狙いの買いが入りやすい傾向があります。'}
                      {s.code === '3543' && 'モーニングやカフェ利用で大活躍。業績も堅調で、優待の廃止リスクが比較的低い安心銘柄の一つです。'}
                      {s.code === '9201' && '旅行需要の回復に支えられています。配当も安定しており、帰省や家族旅行がある時に重宝します。'}
                      {s.code !== '8267' && s.code !== '3197' && s.code !== '3543' && s.code !== '9201' && '日常生活でお得を実感できる優待です。配当金も合わせてチェックしていきましょう。'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* 買った値段のカンタン編集ポップアップ */}
      {editingPriceStock && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-3xl w-full max-w-sm p-6 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center gap-2.5 mb-4">
              <span className="text-3xl">{editingPriceStock.icon}</span>
              <div>
                <h3 className="text-lg font-black text-slate-900">{editingPriceStock.name}</h3>
                <span className="text-xs text-slate-400 font-bold">株価と買った値段の変更</span>
              </div>
            </div>

            <form onSubmit={handleSavePriceEdit} className="space-y-3.5">
              <div className="bg-amber-50/80 p-3.5 rounded-2xl border-2 border-amber-300">
                <label className="block text-xs font-black text-amber-950 mb-1.5">
                  1株いくらで買いましたか？ (円)
                </label>
                <input 
                  type="number"
                  required
                  autoFocus
                  placeholder="例：2500"
                  value={tempBuyPrice}
                  onChange={(e) => setTempBuyPrice(e.target.value)}
                  className="w-full text-xl font-black p-3 rounded-xl border border-amber-300 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">
                  いまの株価 (円)
                </label>
                <input 
                  type="number"
                  placeholder="例：2800"
                  value={tempCurrentPrice}
                  onChange={(e) => setTempCurrentPrice(e.target.value)}
                  className="w-full text-base p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {tempBuyPrice && tempCurrentPrice && (
                <div className="p-3 rounded-xl bg-slate-100 text-xs flex justify-between items-center font-bold">
                  <span className="text-slate-600">利益の計算結果:</span>
                  {(() => {
                    const diff = (Number(tempCurrentPrice) - Number(tempBuyPrice)) * editingPriceStock.shares;
                    return (
                      <span className={diff >= 0 ? 'text-emerald-700 font-black text-sm' : 'text-rose-700 font-black text-sm'}>
                        {diff >= 0 ? '+' : ''}¥{diff.toLocaleString()}
                      </span>
                    );
                  })()}
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingPriceStock(null)}
                  className="flex-1 py-3 text-sm font-bold text-slate-500 bg-slate-100 rounded-xl"
                >
                  キャンセル
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 text-sm font-black text-white bg-amber-500 rounded-xl shadow-md active:scale-95"
                >
                  保存する
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 銘柄詳細モーダル */}
      {selectedStock && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center p-0 backdrop-blur-xs">
          <div className="bg-white rounded-t-3xl w-full max-w-md p-6 max-h-[85vh] overflow-y-auto animate-in slide-in-from-bottom duration-200">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                <span className="text-4xl p-2 bg-amber-50 rounded-2xl">{selectedStock.icon}</span>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-2xl font-black text-slate-900">{selectedStock.name}</h3>
                    <span className="text-xs font-mono bg-slate-100 text-slate-500 px-2 py-0.5 rounded font-bold">
                      {selectedStock.code}
                    </span>
                  </div>
                  <span className="text-xs font-bold text-slate-500">
                    保有: {selectedStock.shares}株
                  </span>
                </div>
              </div>
              <button 
                onClick={() => setSelectedStock(null)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-400 hover:text-slate-600 flex items-center justify-center font-bold"
              >
                ✕
              </button>
            </div>

            {/* 価格・損益の超わかりやすい大画面カード */}
            <div className="mt-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-bold text-slate-500">価格と利益の内訳</span>
                <button
                  onClick={() => {
                    setEditingPriceStock(selectedStock);
                    setTempBuyPrice(selectedStock.buyPrice.toString());
                    setTempCurrentPrice(selectedStock.currentPrice.toString());
                  }}
                  className="text-xs text-amber-700 font-bold bg-amber-100 px-2.5 py-1 rounded-lg flex items-center gap-1"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>買った価格を変更</span>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 text-center my-2">
                <div className="bg-white p-3 rounded-xl border border-slate-200">
                  <div className="text-xs text-slate-400 font-bold">買ったときの株価</div>
                  <div className="text-lg font-black text-slate-800 mt-0.5">
                    ¥{selectedStock.buyPrice.toLocaleString()}
                  </div>
                  <div className="text-[10px] text-slate-400">1株あたり</div>
                </div>

                <div className="bg-white p-3 rounded-xl border border-slate-200">
                  <div className="text-xs text-slate-400 font-bold">いまの株価</div>
                  <div className="text-lg font-black text-slate-800 mt-0.5">
                    ¥{selectedStock.currentPrice.toLocaleString()}
                  </div>
                  <div className="text-[10px] text-slate-400">1株あたり</div>
                </div>
              </div>

              {/* 利益の合計表示 */}
              {(() => {
                const diffPerShare = selectedStock.currentPrice - selectedStock.buyPrice;
                const profitTotal = diffPerShare * selectedStock.shares;
                const isProfit = profitTotal >= 0;
                return (
                  <div className={`mt-3 p-3.5 rounded-xl text-center ${
                    isProfit ? 'bg-emerald-100 text-emerald-900' : 'bg-rose-100 text-rose-900'
                  }`}>
                    <div className="text-xs font-bold">
                      {isProfit ? '🎊 現在出ているトータル利益' : '現在の差額（含み損）'}
                    </div>
                    <div className="text-2xl font-black mt-0.5">
                      {isProfit ? '+' : ''}¥{profitTotal.toLocaleString()}
                    </div>
                    <div className="text-xs font-bold opacity-80 mt-0.5">
                      (1株あたり {isProfit ? '+' : ''}¥{diffPerShare.toLocaleString()} の変動 × {selectedStock.shares}株)
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* 優待ハイライト */}
            <div className="mt-4 bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-300 rounded-2xl p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-800 bg-amber-200 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <Gift className="w-3.5 h-3.5 text-amber-700" />
                  株主優待の内容
                </span>
                <span className="text-xs font-bold text-orange-700 bg-white/80 px-2.5 py-0.5 rounded-full">
                  📮 届く時期: {selectedStock.deliveryMonths ? selectedStock.deliveryMonths.map(m => `${m}月頃`).join('・') : '未定'}
                </span>
              </div>
              <div className="text-lg font-black text-slate-900 mt-2">
                {selectedStock.yutaiTitle}
              </div>
              <p className={`text-slate-700 mt-1.5 ${fontStyles.body}`}>
                {selectedStock.yutaiDetail}
              </p>
            </div>

            {/* お母さんのメモ */}
            <div className="mt-4 bg-amber-50/50 p-3.5 rounded-2xl border border-amber-100">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1">
                <span>📝 お母さんのメモ</span>
              </span>
              <p className={`text-slate-700 mt-1 ${fontStyles.body}`}>
                {selectedStock.memo || 'メモはまだありません'}
              </p>
            </div>

            {/* 削除・閉じるボタン */}
            <div className="mt-6 flex justify-between items-center pt-3 border-t border-slate-100">
              <button
                onClick={() => handleDelete(selectedStock.id)}
                className="text-xs text-rose-500 font-bold flex items-center gap-1 p-2 hover:bg-rose-50 rounded-xl"
              >
                <Trash2 className="w-4 h-4" />
                <span>リストから外す</span>
              </button>
              <button
                onClick={() => setSelectedStock(null)}
                className="bg-amber-500 text-white font-bold text-sm px-6 py-2.5 rounded-xl shadow-md active:scale-95"
              >
                とじる
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 銘柄登録モーダル */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center p-0 backdrop-blur-xs">
          <div className="bg-white rounded-t-3xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom duration-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-amber-500" />
                <span>新しい株を登録する</span>
              </h3>
              <button 
                onClick={() => setShowAddModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-400 hover:text-slate-600 flex items-center justify-center font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveStock} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  会社名・銘柄名 <span className="text-rose-500">*</span>
                </label>
                <input 
                  type="text"
                  required
                  placeholder="例：イオン、トヨタ自動車"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full text-sm p-3 rounded-xl border border-slate-300 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    銘柄コード (数字4桁)
                  </label>
                  <input 
                    type="text"
                    placeholder="例：8267"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className="w-full text-sm p-3 rounded-xl border border-slate-300 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    持っている株数
                  </label>
                  <input 
                    type="number"
                    placeholder="100"
                    value={formData.shares}
                    onChange={(e) => setFormData({ ...formData, shares: e.target.value })}
                    className="w-full text-sm p-3 rounded-xl border border-slate-300 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* 買った時の価格入力欄 */}
              <div className="bg-amber-50/80 p-3.5 rounded-2xl border-2 border-amber-300/80 space-y-2">
                <div className="text-xs font-black text-amber-950 flex items-center gap-1">
                  <Coins className="w-4 h-4 text-amber-600" />
                  <span>1株の価格と買った値段の入力</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-amber-900 mb-1">
                      1株いくらで買った？ (円)
                    </label>
                    <input 
                      type="number"
                      required
                      placeholder="例：2500"
                      value={formData.buyPrice}
                      onChange={(e) => setFormData({ ...formData, buyPrice: e.target.value })}
                      className="w-full text-base font-black p-2.5 rounded-xl bg-white border border-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-amber-900 mb-1">
                      いまの株価 (円)
                    </label>
                    <input 
                      type="number"
                      placeholder="例：2800"
                      value={formData.currentPrice}
                      onChange={(e) => setFormData({ ...formData, currentPrice: e.target.value })}
                      className="w-full text-base font-black p-2.5 rounded-xl bg-white border border-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>
                {formData.buyPrice && formData.currentPrice && (
                  <div className="text-right text-xs font-bold text-amber-800">
                    予想利益: ¥{((Number(formData.currentPrice) - Number(formData.buyPrice)) * Number(formData.shares || 100)).toLocaleString()}
                  </div>
                )}
              </div>

              {/* 優待情報入力 */}
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    🎁 株主優待の内容
                  </label>
                  <input 
                    type="text"
                    placeholder="例：お買い物券3,000円分、お米5kg"
                    value={formData.yutaiTitle}
                    onChange={(e) => setFormData({ ...formData, yutaiTitle: e.target.value })}
                    className="w-full text-sm p-3 rounded-xl bg-white border border-slate-300 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      権利月 (何月権利?)
                    </label>
                    <input 
                      type="text"
                      placeholder="例：3, 9"
                      value={formData.rightsMonths}
                      onChange={(e) => setFormData({ ...formData, rightsMonths: e.target.value })}
                      className="w-full text-xs p-2.5 rounded-xl bg-white border border-slate-300 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      届く月 (何月に届く?)
                    </label>
                    <input 
                      type="text"
                      placeholder="例：6, 12"
                      value={formData.deliveryMonths}
                      onChange={(e) => setFormData({ ...formData, deliveryMonths: e.target.value })}
                      className="w-full text-xs p-2.5 rounded-xl bg-white border border-slate-300 focus:outline-none"
                    />
                  </div>
                </div>

                {/* アイコン選択 */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    アイコンを選ぶ
                  </label>
                  <div className="flex gap-2 text-xl">
                    {['🎁', '🍽️', '🛍️', '☕', '🌾', '✈️', '🎫'].map((emoji) => (
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
                  ✏️ メモ（使い方や思い）
                </label>
                <input 
                  type="text"
                  placeholder="例：孫と行く外食で使う、年2回届く"
                  value={formData.memo}
                  onChange={(e) => setFormData({ ...formData, memo: e.target.value })}
                  className="w-full text-sm p-3 rounded-xl border border-slate-300 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full bg-amber-500 hover:bg-amber-600 active:scale-98 text-white font-bold py-3.5 rounded-2xl shadow-md text-base transition-transform"
                >
                  手帳に登録する
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Google Drive 設定モーダル */}
      {showSettingsModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-3xl w-full max-w-sm p-6 shadow-2xl animate-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
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

            <div className="space-y-3.5 text-xs text-slate-600">
              <div className="bg-amber-50 p-3.5 rounded-2xl border border-amber-200">
                <div className="font-black text-amber-950 mb-1 flex items-center gap-1">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>安心・安全の個人保存仕様</span>
                </div>
                <p className="leading-relaxed text-[11px] text-slate-700">
                  お母様がGoogleログインすると、お母様ご自身のGoogleドライブの「<strong>myKabushikiList</strong>」フォルダの中にデータ（<code>stocks_data.json</code>）が直接保存されます。他の人に見られることはありません。
                </p>
              </div>

              <form onSubmit={handleSaveClientId} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Google OAuth クライアントID
                  </label>
                  <input 
                    type="text"
                    required
                    placeholder="xxxx.apps.googleusercontent.com"
                    value={clientIdInput}
                    onChange={(e) => setClientIdInput(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300 font-mono focus:outline-none focus:border-amber-500"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    Google Cloud Console で発行した Web アプリケーションの Client ID を入力します。
                  </p>
                </div>

                <div className="pt-1 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowSettingsModal(false)}
                    className="flex-1 py-2.5 text-xs font-bold text-slate-500 bg-slate-100 rounded-xl"
                  >
                    閉じる
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 text-xs font-black text-white bg-amber-500 rounded-xl shadow-md active:scale-95"
                  >
                    設定を保存
                  </button>
                </div>
              </form>

              {/* 取得ガイド */}
              <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] space-y-1.5 text-slate-500">
                <p className="font-bold text-slate-700">📌 クライアントIDの取得方法（竜馬さん用）:</p>
                <ol className="list-decimal list-inside space-y-1 text-[10px] leading-relaxed">
                  <li>Google Cloud Console でプロジェクトを作成</li>
                  <li>「Google Drive API」を有効化</li>
                  <li>認証情報で「OAuth クライアントID」を作成（Webアプリケーション）</li>
                  <li>承認済みの JavaScript 生成元に <code>https://japanexporters-ryoma.github.io</code> を追加</li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* スマホで共有モーダル */}
      {showQrModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-3xl w-full max-w-sm p-6 shadow-2xl animate-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-amber-500" />
                <h3 className="text-base font-black text-slate-900">お母さんのスマホで使う</h3>
              </div>
              <button 
                onClick={() => setShowQrModal(false)}
                className="w-7 h-7 rounded-full bg-slate-100 text-slate-400 hover:text-slate-600 flex items-center justify-center font-bold text-xs"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              お母さんのスマホカメラで下のQRコードを読み取るか、URLをLINEで送るだけで、離れていても24時間いつでも開けます！
            </p>

            {/* QRコード画像表示 */}
            <div className="bg-amber-50 p-4 rounded-2xl border-2 border-amber-200 flex flex-col items-center justify-center">
              <img 
                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(window.location.href)}`} 
                alt="スマホ用QRコード" 
                className="w-44 h-44 rounded-xl shadow-xs bg-white p-2"
              />
              <span className="text-[11px] font-mono text-slate-600 mt-2 font-bold break-all text-center px-2">
                {window.location.href}
              </span>
            </div>

            {/* URLをLINE等で送るボタン */}
            <div className="mt-4">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
                className="w-full py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
              >
                <Copy className="w-3.5 h-3.5 text-amber-600" />
                <span>{copied ? '✅ URLをコピーしました！' : 'URLをコピー（LINEで送る）'}</span>
              </button>
            </div>

            {/* ホーム画面に追加するワンポイント */}
            <div className="mt-4 pt-3 border-t border-slate-100">
              <h4 className="text-xs font-black text-slate-800 mb-1.5 flex items-center gap-1">
                <span>📲 ホーム画面にアイコンを置く方法</span>
              </h4>
              <div className="text-[11px] text-slate-600 space-y-1.5 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <p>
                  <strong>iPhoneの場合:</strong> 画面下の「共有ボタン（四角から上矢印）」を押し、<strong>「ホーム画面に追加」</strong>をタップ。
                </p>
                <p>
                  <strong>Androidの場合:</strong> 右上の「︙（メニュー）」から<strong>「ホーム画面に追加」</strong>をタップ。
                </p>
                <p className="text-amber-800 font-bold">
                  → 普通のアプリのようにワンタップで起動できるようになります！
                </p>
              </div>
            </div>

            <div className="mt-5">
              <button
                onClick={() => setShowQrModal(false)}
                className="w-full bg-amber-500 text-white font-bold text-xs py-3 rounded-xl shadow-md active:scale-95"
              >
                とじる
              </button>
            </div>
          </div>
        </div>
      )}

      {/* フッター固定ナビゲーション */}
      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white/95 backdrop-blur border-t border-amber-100 px-3 py-2 flex justify-around items-center z-40 shadow-lg">
        <button
          onClick={() => setActiveTab('list')}
          className={`flex flex-col items-center py-1 px-3 rounded-xl transition-colors ${
            activeTab === 'list' ? 'text-amber-600 font-bold' : 'text-slate-400'
          }`}
        >
          <Gift className="w-5 h-5 mb-0.5" />
          <span className="text-[11px]">マイ株式</span>
        </button>

        <button
          onClick={() => setActiveTab('calendar')}
          className={`flex flex-col items-center py-1 px-3 rounded-xl transition-colors ${
            activeTab === 'calendar' ? 'text-amber-600 font-bold' : 'text-slate-400'
          }`}
        >
          <Calendar className="w-5 h-5 mb-0.5" />
          <span className="text-[11px]">届く月別</span>
        </button>

        <button
          onClick={() => setActiveTab('ai')}
          className={`flex flex-col items-center py-1 px-3 rounded-xl transition-colors ${
            activeTab === 'ai' ? 'text-indigo-600 font-bold' : 'text-slate-400'
          }`}
        >
          <Sparkles className="w-5 h-5 mb-0.5" />
          <span className="text-[11px]">AI知恵袋</span>
        </button>
      </nav>
    </div>
  );
}

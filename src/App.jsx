import { playSpinSound, playWinSound } from './sounds';
import { useState, useEffect } from 'react';
import { RARITIES, SNEAKERS } from './sneakers';
import './App.css';

if (window.Telegram?.WebApp) {
  window.Telegram.WebApp.ready();
  window.Telegram.WebApp.expand();
  window.Telegram.WebApp.setHeaderColor('#121212');
  window.Telegram.WebApp.setBackgroundColor('#121212');
}

const CASE_CHANCES = {
  normal: { common: 70, rare: 20, epic: 8, legendary: 1.8, grail: 0.19, mythic: 0.01 },
  premium: { common: 0, rare: 40, epic: 40, legendary: 15, grail: 4.9, mythic: 0.1 },
  elite: { common: 0, rare: 0, epic: 50, legendary: 35, grail: 14, mythic: 1 }
};

const CASES = {
  normal: { name: 'Обычный', price: 1000, chances: CASE_CHANCES.normal },
  premium: { name: 'Премиум', price: 5000, chances: CASE_CHANCES.premium },
  elite: { name: 'Элитный', price: 20000, chances: CASE_CHANCES.elite }
};

const SETS = [
  { id: 'set1', name: 'Мир Кроссовок', category: 'Кроссовки', req: 10, reward: 15000 },
  { id: 'set2', name: 'Спортивный стиль', category: 'Спортивная обувь', req: 10, reward: 15000 },
  { id: 'set3', name: 'Уютный дом', category: 'Тапочки', req: 10, reward: 15000 },
  { id: 'set4', name: 'Зимняя прогулка', category: 'Ботинки', req: 10, reward: 15000 },
];

const generateMarketItems = () => {
  const items = [];
  for (let i = 0; i < 6; i++) {
    const randomSneaker = SNEAKERS[Math.floor(Math.random() * SNEAKERS.length)];
    const basePrice = RARITIES[randomSneaker.rarity].sellPrice;
    const price = Math.floor(basePrice * (0.8 + Math.random() * 0.6)); 
    items.push({ ...randomSneaker, marketId: crypto.randomUUID(), price: price });
  }
  return items;
};

export default function App() {
  const [tab, setTab] = useState('wheel');
  const [balance, setBalance] = useState(() => parseInt(localStorage.getItem('balance')) || 10000);
  const [inventory, setInventory] = useState(() => JSON.parse(localStorage.getItem('inventory')) || []);
  
  const [stats, setStats] = useState(() => {
    const saved = JSON.parse(localStorage.getItem('stats'));
    return saved ? { level: 1, xp: 0, spins: 0, earned: 0, timeSpent: 0, ...saved } : { spins: 0, earned: 0, timeSpent: 0, level: 1, xp: 0 };
  });

  const [quests, setQuests] = useState(() => JSON.parse(localStorage.getItem('quests')) || { spins: 0, sells: 0, keeps: 0, done: false, lastReset: Date.now() });
  const [achievements, setAchievements] = useState(() => JSON.parse(localStorage.getItem('achievements')) || { firstGrail: false, spins10: false, sell10: false });
  
  const [lastDaily, setLastDaily] = useState(() => parseInt(localStorage.getItem('lastDaily')) || 0);
  const [lastWheel, setLastWheel] = useState(() => parseInt(localStorage.getItem('lastWheel')) || 0);
  const [lastChest, setLastChest] = useState(() => parseInt(localStorage.getItem('lastChest')) || 0);
  const [claimedSets, setClaimedSets] = useState(() => JSON.parse(localStorage.getItem('claimedSets')) || []);
  const [marketItems, setMarketItems] = useState(() => generateMarketItems());

  const [currentCase, setCurrentCase] = useState('normal');
  const [multiplier, setMultiplier] = useState(1);
  
  const [spinResults, setSpinResults] = useState([]);
  const [isSpinning, setIsSpinning] = useState(false);
  const [reelItems, setReelItems] = useState([]);
  const [reelStyle, setReelStyle] = useState({ transition: 'none', transform: 'translateX(0)' });

  const [upgradeItem, setUpgradeItem] = useState(null);
  const [showWheelModal, setShowWheelModal] = useState(false);
    const [wheelRotation, setWheelRotation] = useState(0);
  const [wheelResult, setWheelResult] = useState(null);
  
  // Вернули состояние для знака вопроса
  const [showChances, setShowChances] = useState(false);
    const [collectionCategory, setCollectionCategory] = useState('Все');
      const [everOwned, setEverOwned] = useState(() => JSON.parse(localStorage.getItem('everOwned')) || []);

  useEffect(() => {
    localStorage.setItem('balance', balance);
        localStorage.setItem('everOwned', JSON.stringify(everOwned));
    localStorage.setItem('inventory', JSON.stringify(inventory));
    localStorage.setItem('stats', JSON.stringify(stats));
    localStorage.setItem('quests', JSON.stringify(quests));
    localStorage.setItem('achievements', JSON.stringify(achievements));
    localStorage.setItem('lastDaily', lastDaily);
    localStorage.setItem('lastWheel', lastWheel);
    localStorage.setItem('lastChest', lastChest);
    localStorage.setItem('claimedSets', JSON.stringify(claimedSets));
  }, [balance, inventory, stats, quests, achievements, lastDaily, lastWheel]);

  useEffect(() => {
    const timer = setInterval(() => {
      setStats(prev => ({ ...prev, timeSpent: prev.timeSpent + 1 }));
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  const addXP = (amount) => {
    setStats(prev => {
      const newXP = prev.xp + amount;
      const newLevel = Math.floor(newXP / 100) + 1;
      if (newLevel > prev.level) {
        alert(`🎉 Новый уровень ${newLevel}! Бонус: 2000 $`);
        setBalance(b => b + 2000);
      }
      return { ...prev, xp: newXP, level: newLevel };
    });
  };

  const claimDaily = () => {
    const now = Date.now();
    if (now - lastDaily < 24 * 60 * 60 * 1000) return alert('Бонус уже получен! Приходи завтра.');
    setBalance(prev => prev + 5000);
    setLastDaily(now);
    alert('🎁 Ты получил 5000 $!');
  };

    const spinWheelOfFortune = () => {
    const now = Date.now();
    if (now - lastWheel < 24 * 60 * 60 * 1000) return alert('Доступно раз в 24 часа!');
    setLastWheel(now);

    // Крутим колесо (добавляем 360 градусов + случайный сектор)
    const randomDeg = Math.floor(Math.random() * 360);
    setWheelRotation(prev => prev + 360 + randomDeg);
    setShowWheelModal(true);

    // Выдаем приз через 3 секунды (когда колесо остановится)
    setTimeout(() => {
      const prizes = [
        { type: 'money', value: 500, text: '500 $' }, { type: 'money', value: 1000, text: '1000 $' },
        { type: 'money', value: 5000, text: '5000 $' }, { type: 'xp', value: 100, text: '100 XP' },
        { type: 'sneaker', text: 'Случайный предмет' }, { type: 'jackpot', text: 'ДЖЕКПОТ 50000 $!' }
      ];
      const prize = prizes[Math.floor(Math.random() * prizes.length)];
      setWheelResult(prize);
      
      if (prize.type === 'money') setBalance(prev => prev + prize.value);
      if (prize.type === 'jackpot') setBalance(prev => prev + 50000);
      if (prize.type === 'xp') addXP(prize.value);
      if (prize.type === 'sneaker') {
        const pool = SNEAKERS.filter(s => s.rarity === 'rare' || s.rarity === 'epic');
        setInventory(prev => [...prev, { ...pool[Math.floor(Math.random() * pool.length)], uniqueId: crypto.randomUUID(), stars: 1, dirt: 0 }]);
      }
    }, 3000);
  };

  const buyMarketItem = (item) => {
    if (balance < item.price) return alert('Недостаточно средств!');
    setBalance(prev => prev - item.price);
    setInventory(prev => [...prev, { ...item, uniqueId: crypto.randomUUID(), stars: 1 }]);
        setEverOwned(prev => [...new Set([...prev, item.id])]);
    setMarketItems(prev => prev.filter(i => i.marketId !== item.marketId));
    alert(`Вы купили ${item.brand} ${item.model}!`);
  };

    const sellToMarket = (item) => {
    const base = item.basePrice || RARITIES[item.rarity].sellPrice;
    const starBonus = 1 + ((item.stars || 1) - 1) * 0.2;
    const dirtPenalty = 1 - (item.dirt || 0) / 100;
    const price = Math.max(50, Math.floor(base * starBonus * dirtPenalty));

    if(window.confirm(`Выставить ${item.brand} на рынок за ${price} $?`)) {
      setBalance(prev => (isNaN(prev) ? 0 : prev) + price);
      setInventory(prev => prev.filter(i => i.uniqueId !== item.uniqueId));
      alert('Продано!');
    }
  };

  const upgradeSneaker = (item) => {
    const currentStars = item.stars || 1;
    if (currentStars >= 5) return alert('Максимальный уровень!');
    const cost = currentStars * 1500;
    if (balance < cost) return alert(`Нужно ${cost} $ для улучшения`);
    setBalance(prev => prev - cost);
    setInventory(prev => prev.map(i => i.uniqueId === item.uniqueId ? { ...i, stars: currentStars + 1 } : i));
    setUpgradeItem(null);
    alert('Успешно улучшено!');
  };

  // ВОТ СЮДА ВСТАВЛЯЙ ФУНКЦИЮ ПОМЫТЬ:
  const washSneaker = (item) => {
    if (item.dirt === 0) return alert('Кроссовок уже чистый!');
    const cost = 500;
    if (balance < cost) return alert(`Нужно ${cost} $ для мойки`);
    
    setBalance(prev => prev - cost);
    setInventory(prev => prev.map(i => i.uniqueId === item.uniqueId ? { ...i, dirt: 0 } : i));
    alert('🧼 Кроссовок чист как новый!');
  };

  // А вот тут уже идет следующая функция (rollSneaker или другая)
  const rollSneaker = (caseType) => {
    // ...

      const rollSneaker = (caseType) => {
    const chances = CASES[caseType].chances;
    const roll = Math.random() * 100;
    let acc = 0;
    for (const [key, chance] of Object.entries(chances)) {
      acc += chance;
      if (roll < acc) {
        const pool = SNEAKERS.filter(s => s.rarity === key);
        if (pool.length === 0) return { ...SNEAKERS[0], stars: 1, dirt: 0 };
        const item = pool[Math.floor(Math.random() * pool.length)];
        return { 
            ...item, 
            stars: 1, 
            dirt: Math.floor(Math.random() * 100) // Грязь от 0 до 100%
        };
      }
    }
    return { ...SNEAKERS[0], stars: 1, dirt: 0 };
  };

    const washSneaker = (item) => {
    if (item.dirt === 0) return alert('Кроссовок уже чистый!');
    const cost = 500; // Стоимость мойки
    if (balance < cost) return alert(`Нужно ${cost} $ для мойки`);
    
    setBalance(prev => prev - cost);
    setInventory(prev => prev.map(i => i.uniqueId === item.uniqueId ? { ...i, dirt: 0 } : i));
    alert('🧼 Кроссовок чист как новый!');
  };

  const handleSpin = () => {
    const cost = CASES[currentCase].price * multiplier;
    if (balance < cost) return alert(`Недостаточно средств! Нужно ${cost} $`);
    setIsSpinning(true); setSpinResults([]); setBalance(prev => prev - cost);
    setStats(prev => ({ ...prev, spins: prev.spins + multiplier }));
    setQuests(prev => ({ ...prev, spins: prev.spins + multiplier }));
    addXP(10 * multiplier);
    playSpinSound();

    const results = Array.from({ length: multiplier }, () => ({ ...rollSneaker(currentCase), uniqueId: crypto.randomUUID() }));
    const visualWinner = results[0];
    const newReelItems = Array.from({ length: 50 }, () => SNEAKERS[Math.floor(Math.random() * SNEAKERS.length)]);
    newReelItems[40] = visualWinner;
    setReelItems(newReelItems);
    setReelStyle({ transition: 'none', transform: 'translateX(0)' });

    setTimeout(() => {
      const stopPosition = (40 * 110) - (360 / 2) + (110 / 2) + 10;
      setReelStyle({ transition: 'transform 3s cubic-bezier(0.1, 0.7, 0.1, 1)', transform: `translateX(-${stopPosition}px)` });
    }, 50);

    setTimeout(() => {
      setIsSpinning(false); setSpinResults(results);
            setEverOwned(prev => [...new Set([...prev, ...results.map(r => r.id)])]);
      const maxRarity = results.reduce((best, item) => {
        const order = { common: 1, rare: 2, epic: 3, legendary: 4, grail: 5 };
        return order[item.rarity] > order[best] ? item.rarity : best;
      }, 'common');
      playWinSound(maxRarity);
      if (results.some(r => r.rarity === 'grail') && !achievements.firstGrail) {
        setAchievements(prev => ({ ...prev, firstGrail: true })); setBalance(b => b + 10000); alert('🏆 Ачивка: Первый Граиль! +10 000 $');
      }
    }, 3100);
  };

    const claimChest = () => {
    const now = Date.now(); const cooldown = 4 * 60 * 60 * 1000;
    if (now - lastChest < cooldown) { const left = cooldown - (now - lastChest); return alert(`Сундук откроется через ${Math.floor(left / 3600000)}ч ${Math.floor((left % 3600000) / 60000)}м`); }
    const reward = Math.floor(Math.random() * 15000) + 5000;
    setBalance(prev => prev + reward); setLastChest(now); alert(`📦 Ты открыл сундук и получил ${reward.toLocaleString()} $!`);
  };

  const claimSet = (set) => {
    if (claimedSets.includes(set.id)) return;
    const count = inventory.filter(i => i.category === set.category).length;
    if (count < set.req) return alert(`Нужно ${set.req} предметов категории "${set.category}". У тебя ${count}.`);
    setBalance(prev => prev + set.reward); setClaimedSets(prev => [...prev, set.id]);
    alert(`🎉 Награда за сет "${set.name}" получена! +${set.reward.toLocaleString()} $`);
  };

  const keepItem = (item) => {
    setInventory(prev => [...prev, item]);
    setQuests(prev => ({ ...prev, keeps: prev.keeps + 1 }));
    setSpinResults(prev => prev.filter(r => r.uniqueId !== item.uniqueId));
  };

  // ВЕРНУЛИ ЦЕНУ В ПРОДАЖУ
    const sellItem = (item) => {
    // Считаем цену: базовая цена * бонус за звезды * скидка за грязь (но не меньше 50)
    const base = item.basePrice || RARITIES[item.rarity].sellPrice;
    const starBonus = 1 + ((item.stars || 1) - 1) * 0.2;
    const dirtPenalty = 1 - (item.dirt || 0) / 100;
    const price = Math.max(50, Math.floor(base * starBonus * dirtPenalty));

    setBalance(prev => (isNaN(prev) ? 0 : prev) + price); // Защита от NaN
    setStats(prev => ({ ...prev, earned: prev.earned + price }));
    setQuests(prev => ({ ...prev, sells: prev.sells + 1 }));
    setSpinResults(prev => prev.filter(r => r.uniqueId !== item.uniqueId)); 
    addXP(5);
  };

  const keepAll = () => {
    setInventory(prev => [...prev, ...spinResults]);
    setQuests(prev => ({ ...prev, keeps: prev.keeps + spinResults.length }));
    setSpinResults([]);
  };

  const getTotalSellValue = () => {
    return spinResults.reduce((sum, item) => sum + Math.floor(RARITIES[item.rarity].sellPrice * (1 + (item.stars - 1) * 0.2)), 0);
  };

    const sellAll = () => {
    let total = 0;
    spinResults.forEach(item => {
      const base = item.basePrice || RARITIES[item.rarity].sellPrice;
      const starBonus = 1 + ((item.stars || 1) - 1) * 0.2;
      const dirtPenalty = 1 - (item.dirt || 0) / 100;
      total += Math.max(50, Math.floor(base * starBonus * dirtPenalty));
    });
    
    setBalance(prev => (isNaN(prev) ? 0 : prev) + total); // Защита от NaN
    setStats(prev => ({ ...prev, earned: prev.earned + total }));
    setQuests(prev => ({ ...prev, sells: prev.sells + spinResults.length }));
    setSpinResults([]); 
    addXP(5 * spinResults.length);
  };

  const craftItem = (rarity) => {
    const itemsOfRarity = inventory.filter(i => i.rarity === rarity);
    if (itemsOfRarity.length < 3) return alert('Нужно 3 одинаковых предмета для крафта!');
    const idsToRemove = itemsOfRarity.slice(0, 3).map(i => i.uniqueId);
    setInventory(prev => prev.filter(i => !idsToRemove.includes(i.uniqueId)));
    const nextRarity = { common: 'rare', rare: 'epic', epic: 'legendary' }[rarity];
    if (!nextRarity) return alert('Нельзя скрафтить выше!');
    const pool = SNEAKERS.filter(s => s.rarity === nextRarity);
    setInventory(prev => [...prev, { ...pool[Math.floor(Math.random() * pool.length)], uniqueId: crypto.randomUUID(), stars: 1 }]);
    alert(`Успех! Получен ${RARITIES[nextRarity].name} предмет.`);
  };

  const formatTime = (sec) => {
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    return `${h}ч ${m}м`;
  };

  const Stars = ({ count }) => <div style={{ color: '#facc15', fontSize: '12px' }}>{'★'.repeat(count || 1)}{'☆'.repeat(5 - (count || 1))}</div>;

  return (
    <div className="app-container">
      <header className="header">
        <div className="header-top">
          <div className="level-badge">Ур. {stats.level || 1}</div>
          <h1>SneakerSpin 👟</h1>
          <div className="header-buttons">
            <button className="info-btn" onClick={() => setTab('profile')}>👤</button>
            <button className="info-btn" onClick={() => setShowChances(true)}>?</button>
          </div>
        </div>
        <div className="balance">Баланс: {balance.toLocaleString()} $</div>
        <div className="xp-bar-bg"><div className="xp-bar-fill" style={{ width: `${(stats.xp || 0) % 100}%` }}></div></div>
      </header>

      <main className="main-content">
        {tab === 'wheel' && (
          <div className="spin-section">
            <div className="daily-bonus">
              <button onClick={claimDaily} className="daily-btn">🎁 Бонус</button>
              <button onClick={claimChest} className="daily-btn" style={{ background: '#ef4444' }}>📦 Сундук</button>
              <button onClick={spinWheelOfFortune} className="daily-btn" style={{ background: '#a855f7' }}>🎡 Фортуна</button>
            </div>

            <div className="case-selector">
              {Object.entries(CASES).map(([key, c]) => (
                <button key={key} className={`case-btn ${currentCase === key ? 'active' : ''}`} onClick={() => setCurrentCase(key)} disabled={isSpinning}>
                  {c.name} <br/> {c.price.toLocaleString()} $
                </button>
              ))}
            </div>

            <div className="multiplier-selector">
              {[1, 2, 3, 4, 5, 10].map(m => (
                <button key={m} className={`mult-btn ${multiplier === m ? 'active' : ''}`} onClick={() => setMultiplier(m)} disabled={isSpinning}>x{m}</button>
              ))}
            </div>

            <div className="reel-container">
              <div className="reel-pointer"></div>
              <div className="reel-track" style={reelStyle}>
                {reelItems.map((item, index) => (
                  <div key={index} className="reel-item" style={{ borderBottom: `4px solid ${RARITIES[item.rarity].color}`, background: `linear-gradient(135deg, ${item.color1}, ${item.color2})` }}>
                    <span className="item-brand">{item.brand}</span>
                  </div>
                ))}
              </div>
            </div>

            <button className={`spin-btn ${isSpinning ? 'spinning' : ''}`} onClick={handleSpin} disabled={isSpinning}>
              {isSpinning ? 'Крутим...' : `Открыть (${multiplier} шт) за ${(CASES[currentCase].price * multiplier).toLocaleString()} $`}
            </button>

            {spinResults.length > 0 && !isSpinning && (
              <div className="results-container">
                <div className="results-header">
                  <span>Выпало ({spinResults.length}):</span>
                                    <div className="bulk-actions">
                    <button onClick={keepAll} className="bulk-btn keep">Оставить все</button>
                    <button onClick={() => {
                      let total = 0;
                      spinResults.forEach(item => {
                        const base = item.basePrice || RARITIES[item.rarity].sellPrice;
                        total += Math.max(50, Math.floor(base * (1 + ((item.stars || 1) - 1) * 0.2) * (1 - (item.dirt || 0) / 100)));
                      });
                      setBalance(prev => (isNaN(prev) ? 0 : prev) + total);
                      setStats(prev => ({ ...prev, earned: prev.earned + total }));
                      setQuests(prev => ({ ...prev, sells: prev.sells + spinResults.length }));
                      setSpinResults([]);
                      addXP(5 * spinResults.length);
                    }} className="bulk-btn sell">
                      Продать все (${spinResults.reduce((sum, item) => sum + Math.max(50, Math.floor((item.basePrice || RARITIES[item.rarity].sellPrice) * (1 + ((item.stars || 1) - 1) * 0.2) * (1 - (item.dirt || 0) / 100))), 0)})
                    </button>
                  </div>
                </div>
                <div className="results-grid">
                  {spinResults.map((item) => (
                    <div key={item.uniqueId} className="result-card" style={{ borderColor: RARITIES[item.rarity].color }}>
                      <div className="result-color-block" style={{ background: `linear-gradient(135deg, ${item.color1}, ${item.color2})` }}></div>
                      <h2>{item.brand} {item.model}</h2>
                      <span style={{fontSize: '10px', color: '#aaa', marginBottom: '5px'}}>{item.category}</span>
                      <Stars count={item.stars || 1} />
                      <div className="item-actions">
                        <button onClick={() => {
  const base = item.basePrice || RARITIES[item.rarity].sellPrice;
  const starBonus = 1 + ((item.stars || 1) - 1) * 0.2;
  const dirtPenalty = 1 - (item.dirt || 0) / 100;
  const price = Math.max(50, Math.floor(base * starBonus * dirtPenalty));
  
  setBalance(prev => (isNaN(prev) ? 0 : prev) + price);
  setStats(prev => ({ ...prev, earned: prev.earned + price }));
  setQuests(prev => ({ ...prev, sells: prev.sells + 1 }));
  setSpinResults(prev => prev.filter(r => r.uniqueId !== item.uniqueId)); 
  addXP(5);
}} className="action-btn sell">
  Продать (${Math.max(50, Math.floor((item.basePrice || RARITIES[item.rarity].sellPrice) * (1 + ((item.stars || 1) - 1) * 0.2) * (1 - (item.dirt || 0) / 100)))})
</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
                      {tab === 'collection' && (
          <div className="tab-content">
            <h2>Коллекция ({everOwned.length} / {SNEAKERS.length})</h2>
            
            <div className="category-tabs" style={{ display: 'flex', gap: '5px', marginBottom: '15px', overflowX: 'auto', paddingBottom: '5px' }}>
              {['Все', 'Кроссовки', 'Спортивная обувь', 'Тапочки', 'Ботинки'].map(cat => (
                <button 
                  key={cat}
                  onClick={() => setCollectionCategory(cat)}
                  style={{ padding: '6px 10px', borderRadius: '15px', border: 'none', background: collectionCategory === cat ? '#6366f1' : '#2a2a2a', color: '#fff', fontSize: '12px', whiteSpace: 'nowrap', cursor: 'pointer' }}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="inventory-grid">
              {SNEAKERS.filter(s => collectionCategory === 'Все' || s.category === collectionCategory).map((sneaker) => {
                const isCollected = everOwned.includes(sneaker.id);
                return (
                  <div key={sneaker.id} className="inventory-item" style={{ borderColor: isCollected ? RARITIES[sneaker.rarity].color : '#333', opacity: isCollected ? 1 : 0.4 }}>
                    <div className="inv-top-row">
                      <div className="inv-color-block" style={{ background: isCollected ? `linear-gradient(135deg, ${sneaker.color1}, ${sneaker.color2})` : '#222' }}></div>
                      <div className="inv-info">
                        <strong>{isCollected ? sneaker.brand : '???'}</strong>
                        <span>{isCollected ? sneaker.model : 'Не выбит'}</span>
                        <span style={{fontSize: '10px', color: '#aaa'}}>{sneaker.category}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {tab === 'inventory' && (
          <div className="tab-content">
            <h2>Твоя коллекция ({inventory.length})</h2>
            <div className="inventory-grid">
              {inventory.map((item) => (
                <div key={item.uniqueId} className="inventory-item" style={{ borderColor: RARITIES[item.rarity].color }}>
                  <div className="inv-top-row">
                    <div className="inv-color-block" style={{ background: `linear-gradient(135deg, ${item.color1}, ${item.color2})` }}></div>
                                          <div className="inv-info">
                        <strong>{item.brand}</strong>
                        <span>{item.model}</span>
                        <span style={{fontSize: '10px', color: '#aaa'}}>{item.category}</span>
                        <Stars count={item.stars || 1} />
                        
                                             {/* Вот сюда вставляем новый блок с ценой и грязью */}
                                              <span style={{ color: item.dirt > 50 ? '#ef4444' : '#4ade80', fontWeight: 'bold', fontSize: '11px' }}>
                          Цена: {Math.max(50, Math.floor((item.basePrice || RARITIES[item.rarity].sellPrice) * (1 + ((item.stars || 1) - 1) * 0.2) * (1 - (item.dirt || 0) / 100)))} $
                          {item.dirt > 0 && ` (Грязь: ${item.dirt}%)`}
                        </span>
                        
                      </div>
                  </div>
                       <div className="inv-actions">
  <button onClick={() => setUpgradeItem(item)} style={{ background: '#6366f1', color: '#fff' }}>Улучшить</button>
  <button onClick={() => washSneaker(item)} style={{ background: '#0ea5e9', color: '#fff' }}>Помыть</button>
  <button onClick={() => {
    // Считаем цену прямо здесь
    const base = item.basePrice || RARITIES[item.rarity].sellPrice;
    const starBonus = 1 + ((item.stars || 1) - 1) * 0.2;
    const dirtPenalty = 1 - (item.dirt || 0) / 100;
    const price = Math.max(50, Math.floor(base * starBonus * dirtPenalty));
    
    if(window.confirm(`Выставить ${item.brand} на рынок за ${price} $?`)) {
      setBalance(prev => (isNaN(prev) ? 0 : prev) + price);
      setInventory(prev => prev.filter(i => i.uniqueId !== item.uniqueId));
      alert('Продано!');
    }
  }} style={{ background: 'transparent', border: '1px solid #ef4444', color: '#ef4444' }}>Продать</button>
</div>
                </div>
              ))}
            </div>
          </div>
        )}

                {tab === 'craft' && (
          <div className="tab-content">
            <h2>Крафт (Апгрейд)</h2>
            <p style={{fontSize: '12px', color: '#888', marginBottom: '15px'}}>Собери 3 одинаковых предмета, чтобы получить 1 рангом выше.</p>
            
            {['common', 'rare', 'epic'].map(rarity => {
              const count = inventory.filter(i => i.rarity === rarity).length;
              return (
                <div key={rarity} className="craft-row" style={{ borderLeft: `4px solid ${RARITIES[rarity].color}` }}>
                  <div><strong>{RARITIES[rarity].name}</strong> ({count}/3)</div>
                  <button onClick={() => craftItem(rarity)} disabled={count < 3}>Крафтить</button>
                </div>
              );
            })}

            <h2 style={{marginTop: '30px', marginBottom: '15px'}}>Сеты (Коллекции)</h2>
            <p style={{fontSize: '12px', color: '#888', marginBottom: '15px'}}>Собери нужное количество обуви одной категории.</p>
            
            {SETS.map(set => {
              const count = inventory.filter(i => i.category === set.category).length;
              const isClaimed = claimedSets.includes(set.id);
              return (
                <div key={set.id} className="craft-row" style={{ borderLeft: `4px solid #facc15` }}>
                  <div>
                    <strong>{set.name}</strong>
                    <div style={{fontSize: '11px', color: '#aaa', marginTop: '4px'}}>
                      Собрано: {count} / {set.req} ({set.category})
                    </div>
                  </div>
                  <button onClick={() => claimSet(set)} disabled={count < set.req || isClaimed} style={{ opacity: isClaimed ? 0.5 : 1 }}>
                    {isClaimed ? 'Получено' : `Забрать ${set.reward} $`}
                  </button>
                </div>
              );
            })}
            
                                 </div>
        )}

        {tab === 'quests' && (
          <div className="tab-content">
            <h2>Ежедневные квесты</h2>
            <div className="quest-item"><span>Сделать 5 круток</span> <strong>{quests.spins}/5</strong></div>
            <div className="quest-item"><span>Продать 3 предмета</span> <strong>{quests.sells}/3</strong></div>
            <div className="quest-item"><span>Оставить 2 предмета</span> <strong>{quests.keeps}/2</strong></div>
            <button className="claim-quest-btn" onClick={() => {
              if(quests.spins >= 5 && quests.sells >= 3 && quests.keeps >= 2 && !quests.done) {
                setBalance(b => b + 5000);
                setQuests(prev => ({...prev, done: true}));
                alert('Все квесты выполнены! +5000 $');
              } else alert('Выполни все квесты!');
            }}>Забрать награду 5 000 $</button>
          </div>
        )}

        {tab === 'market' && (
          <div className="tab-content">
            <h2>Рынок</h2>
            <p style={{fontSize: '12px', color: '#888', marginBottom: '15px'}}>Покупай обувь у других игроков.</p>
            <div className="inventory-grid">
              {marketItems.map((item) => (
                <div key={item.marketId} className="inventory-item" style={{ borderColor: RARITIES[item.rarity].color }}>
                  <div className="inv-top-row">
                    <div className="inv-color-block" style={{ background: `linear-gradient(135deg, ${item.color1}, ${item.color2})` }}></div>
                    <div className="inv-info">
                      <strong>{item.brand}</strong>
                      <span>{item.model}</span>
                      <span style={{fontSize: '10px', color: '#aaa'}}>{item.category}</span>
                      <span style={{ color: '#4ade80', fontWeight: 'bold' }}>{item.price} $</span>
                    </div>
                  </div>
                  <div className="inv-actions">
                    <button onClick={() => buyMarketItem(item)} style={{ background: '#4ade80', color: '#000' }}>Купить</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'profile' && (
          <div className="tab-content">
            <h2>Профиль</h2>
            <div className="profile-stats">
              <div className="stat-card"><span>Уровень:</span> <strong>{stats.level || 1}</strong></div>
              <div className="stat-card"><span>Открыто кейсов:</span> <strong>{stats.spins}</strong></div>
              <div className="stat-card"><span>Заработано:</span> <strong>${stats.earned.toLocaleString()}</strong></div>
              <div className="stat-card"><span>Время в игре:</span> <strong>{formatTime(stats.timeSpent)}</strong></div>
            </div>
            <button onClick={() => { if(window.confirm('Сброс?')) { localStorage.clear(); window.location.reload(); } }} style={{marginTop: '20px', background: 'transparent', color: '#ef4444', border: 'none'}}>Сбросить прогресс</button>
          </div>
        )}
      </main>

      {upgradeItem && (
        <div className="modal-overlay" onClick={() => setUpgradeItem(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Улучшение</h2>
            <div className="modal-color-block" style={{ background: `linear-gradient(135deg, ${upgradeItem.color1}, ${upgradeItem.color2})` }}></div>
            <h3>{upgradeItem.brand} {upgradeItem.model}</h3>
            <Stars count={upgradeItem.stars || 1} />
            <p style={{ marginTop: '10px', fontSize: '14px' }}>Стоимость: <strong>{(upgradeItem.stars || 1) * 1500} $</strong></p>
            <div className="modal-actions">
              <button onClick={() => setUpgradeItem(null)} className="modal-btn cancel">Отмена</button>
              <button onClick={() => upgradeSneaker(upgradeItem)} className="modal-btn keep">Улучшить</button>
            </div>
          </div>
        </div>
      )}

      {showWheelModal && wheelResult && (
        <div className="modal-overlay" onClick={() => setShowWheelModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>🎉 Твой приз!</h2>
            <div style={{ fontSize: '40px', margin: '20px 0' }}>🎁</div>
            <h3 style={{ color: '#facc15' }}>{wheelResult.text}</h3>
            <div className="modal-actions">
              <button onClick={() => setShowWheelModal(false)} className="modal-btn cancel">Забрать</button>
            </div>
          </div>
        </div>
      )}

      {/* МОДАЛКА С ШАНСАМИ */}
      {showChances && (
        <div className="modal-overlay" onClick={() => setShowChances(false)}>
          <div className="modal-content chances-modal" onClick={(e) => e.stopPropagation()}>
            <h2>Шансы выпадения</h2>
            <p style={{ fontSize: '12px', color: '#888', marginBottom: '20px' }}>
              Зависит от выбранного кейса
            </p>
            <div className="chances-list">
              {Object.entries(RARITIES).reverse().map(([key, r]) => (
                <div key={key} className="chance-row" style={{ borderLeft: `4px solid ${r.color}` }}>
                  <div className="chance-info">
                    <strong style={{ color: r.color }}>{r.name}</strong>
                    <span>Базовая цена: ${r.sellPrice.toLocaleString()}</span>
                  </div>
                  <div className="chance-value">
                    {CASES[currentCase].chances[key] || 0}%
                  </div>
                </div>
              ))}
            </div>
            <div className="modal-actions">
              <button onClick={() => setShowChances(false)} className="modal-btn cancel">Понятно</button>
            </div>
          </div>
        </div>
      )}

      <nav className="bottom-nav">
        <button className={tab === 'collection' ? 'active' : ''} onClick={() => setTab('collection')}>📖<br/>Коллекция</button>
        <button className={tab === 'inventory' ? 'active' : ''} onClick={() => setTab('inventory')}>🎒<br/>Сумка</button>
        <button className={tab === 'wheel' ? 'active' : ''} onClick={() => setTab('wheel')}>🎡<br/>Колесо</button>
        <button className={tab === 'craft' ? 'active' : ''} onClick={() => setTab('craft')}>🔨<br/>Крафт</button>
        <button className={tab === 'market' ? 'active' : ''} onClick={() => setTab('market')}>🛒<br/>Рынок</button>
      </nav>
    </div>
  );
}
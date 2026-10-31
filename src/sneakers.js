export const RARITIES = {
  common:    { name: 'Обычный',   color: '#9CA3AF', chance: 50, minPrice: 100, maxPrice: 600 },
  rare:      { name: 'Редкий',    color: '#3B82F6', chance: 30, minPrice: 1000, maxPrice: 2500 },
  epic:      { name: 'Эпический', color: '#A855F7', chance: 12, minPrice: 4000, maxPrice: 8000 },
  legendary: { name: 'Легенда',   color: '#F59E0B', chance: 6,  minPrice: 15000, maxPrice: 30000 },
  grail:     { name: 'Граиль',    color: '#EF4444', chance: 1.99, minPrice: 50000, maxPrice: 80000 },
  mythic:    { name: 'Мифический',color: '#00FFFF', chance: 0.01, minPrice: 150000, maxPrice: 300000 }
};

const BRANDS = ['Naik', 'Abibas', 'Puma', 'Asix', 'Reebok', 'New Bel', 'Van', 'Converse', 'Dior', 'Balenci', 'Gucci', 'Louis', 'Off-Line', 'K-Wee', 'Bape'];
const MODELS = ['Air Force', 'Superstar', 'Suede', 'Classic', 'Gel-Kayano', '574', 'Old Skool', 'Chuck 70', 'Authentic', 'Roma', 'Air Max', 'Yeezy', 'Gel-Nimbus', '990v5', 'Dunk Low', 'RS-X', 'Pump', 'Sk8-Hi', 'Air Max 97', 'Gel-Lyte', 'Air Jordan', 'Ultraboost', '2002R', 'MB.01', 'Air Presto', 'Forum Low', 'Air Max Plus', 'Gel-Quantum', 'Air Mag', 'Yeezy 750', 'Off-White', 'Kiko', 'Salehe', 'Lamelo', 'Travis Scott', 'SB Dunk', 'Alien', 'Bapesta', 'Track', 'Triple S'];
const CATEGORIES = ['Кроссовки', 'Тапочки', 'Спортивная обувь', 'Ботинки'];
const COLORS = [
  ['#FFFFFF', '#E5E7EB'], ['#000000', '#374151'], ['#EF4444', '#991B1B'], ['#3B82F6', '#1E3A8A'],
  ['#10B981', '#047857'], ['#F59E0B', '#B45309'], ['#A855F7', '#5B21B6'], ['#EC4899', '#BE185D'],
  ['#6B7280', '#374151'], ['#111827', '#4B5563'], ['#F97316', '#C2410C'], ['#06B6D4', '#164E63']
];

export const SNEAKERS = [];

const generateSneakers = () => {
  // Генерируем 350 моделей (300 старых + 50 новых супер-редких)
  for (let i = 0; i < 350; i++) {
    const brand = BRANDS[Math.floor(Math.random() * BRANDS.length)];
    const model = MODELS[Math.floor(Math.random() * MODELS.length)];
    const category = CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)];
    const colorPair = COLORS[Math.floor(Math.random() * COLORS.length)];
    
    let rarity;
    const r = Math.random() * 100;
    if (r < 50) rarity = 'common';
    else if (r < 80) rarity = 'rare';
    else if (r < 92) rarity = 'epic';
    else if (r < 98) rarity = 'legendary';
    else if (r < 99.99) rarity = 'grail';
    else rarity = 'mythic'; // 0.01% шанс на мифический

    // Генерируем случайную базовую цену в рамках редкости
    const basePrice = Math.floor(Math.random() * (RARITIES[rarity].maxPrice - RARITIES[rarity].minPrice + 1)) + RARITIES[rarity].minPrice;

    const suffix = i > 100 ? ` ${Math.floor(Math.random() * 99)}` : '';
    
    SNEAKERS.push({
      id: `item_${i}`,
      brand: brand,
      model: `${model}${suffix}`,
      category: category,
      rarity: rarity,
      basePrice: basePrice, // Уникальная базовая цена!
      color1: colorPair[0],
      color2: colorPair[1]
    });
  }
};

generateSneakers();
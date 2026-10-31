import { Telegraf } from 'telegraf';
import dotenv from 'dotenv';

dotenv.config();

const bot = new Telegraf(process.env.BOT_TOKEN);

// Ссылка на игру
const WEBAPP_URL = 'https://sneakerspin.vercel.app/game';

bot.start((ctx) => {
  ctx.reply('Привет! Добро пожаловать в SneakerSpin 👟\nНажми на кнопку ниже, чтобы начать собирать коллекцию!', {
    reply_markup: {
      inline_keyboard: [
        [{ text: '👟 Играть', web_app: { url: WEBAPP_URL } }]
      ]
    }
  });
});

bot.launch().then(() => {
  console.log('Бот успешно запущен!');
});
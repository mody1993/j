import 'dotenv/config';
import wolfjs from 'wolf.js';

const { WOLF } = wolfjs;
const client = new WOLF();

const ROOM_ID = 215022;
const ALLOWED_USER_ID = 26491704;

function getSenderId(msg) {
  return msg?.sender?.id || msg?.sender || msg?.from || msg?.user;
}

// 🔴 مهم: ننتظر ready event
client.on('ready', async () => {
  try {
    console.log('✅ Client is READY (session active)');

    const res = await client.messaging.sendGroupMessage(
      ROOM_ID,
      '!ج'
    );

    console.log('📦 Send response:', res);
    console.log('📤 Message sent');

  } catch (err) {
    console.error('❌ Send error:', err);
  }
});

// تسجيل الدخول فقط
(async () => {
  try {
    console.log('🚀 Starting login...');

    await client.login({
      email: process.env.U_MAIL_1,
      password: process.env.U_PASS_1
    });

    console.log('🔐 Login request sent...');
  } catch (err) {
    console.error('❌ Login error:', err);
  }
})();

// استقبال الرسائل
client.on('message', (msg) => {
  try {
    const senderId = getSenderId(msg);

    if (!senderId) return;
    if (senderId !== ALLOWED_USER_ID) return;

    console.log('✅ Allowed message:', msg.text);

  } catch (err) {
    console.error(err);
  }
});

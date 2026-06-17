import 'dotenv/config';
import wolfjs from 'wolf.js';

const { WOLF } = wolfjs;

const ROOM_ID = 215022;
const ALLOWED_USER_ID = 26491704;

const client = new WOLF();

function getSenderId(msg) {
  return msg?.sender?.id || msg?.sender || msg?.from || msg?.user;
}

// 🔐 تسجيل الدخول
(async () => {
  try {
    console.log('🚀 Logging in...');

    await client.login({
      email: process.env.U_MAIL_1,
      password: process.env.U_PASS_1
    });

    console.log('🔐 Login sent');
  } catch (err) {
    console.error('❌ Login error:', err);
  }
})();

// ✅ عند الجاهزية
client.on('ready', async () => {
  try {
    console.log('✅ READY');

    const res = await client.messaging.sendGroupMessage(
      ROOM_ID,
      '!ج'
    );

    console.log('📤 Sent !ج');
    console.log('📦 Response:', res);

  } catch (err) {
    console.error('❌ Send error:', err);
  }
});

// 📩 استقبال الرسائل (عضو واحد فقط)
client.on('message', (msg) => {
  try {
    const senderId = getSenderId(msg);

    if (!senderId) return;
    if (senderId !== ALLOWED_USER_ID) return;

    console.log('📩 Allowed message:', msg.text || msg);
  } catch (err) {
    console.error('❌ Message error:', err);
  }
});

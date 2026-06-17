import 'dotenv/config';
import wolfjs from 'wolf.js';

const { WOLF } = wolfjs;
const client = new WOLF();

// 🔴 الإعدادات
const ROOM_ID = 11194358;
const ALLOWED_USER_ID = 26491704;

async function start() {
  try {
    console.log('🚀 Starting login...');

    // ✅ تسجيل الدخول (هذا الناقص عندك)
    await client.login({
      email: process.env.U_MAIL_1,
      password: process.env.U_PASS_1
    });

    console.log('✅ Logged In');

    // ✅ دخول الغرفة
    await client.rooms.join(ROOM_ID);
    console.log('📥 Joined room');

    // ✅ إرسال الرسالة
    await client.messaging.sendGroupMessage(
      ROOM_ID,
      '!ج'
    );

    console.log('📤 Sent !ج');

  } catch (err) {
    console.error('❌ Error:', err);
  }
}

start();

// 👇 استقبال الرسائل (اختياري)
client.on('message', (msg) => {
  try {
    const senderId =
      msg.sender?.id ||
      msg.sender ||
      msg.from ||
      msg.user;

    if (!senderId) return;
    if (senderId !== ALLOWED_USER_ID) return;

    console.log('✅ Allowed user message:', msg.text);

  } catch (e) {
    console.error(e);
  }
});

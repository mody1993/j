import 'dotenv/config';
import wolfjs from 'wolf.js';

const { WOLF } = wolfjs;
const client = new WOLF();

// 🔴 الإعدادات
const ROOM_ID = 215022;
const ALLOWED_USER_ID = 26491704;

function getSenderId(msg) {
  return msg?.sender?.id || msg?.sender || msg?.from || msg?.user;
}

async function start() {
  try {
    console.log('🚀 Starting login...');

    // تسجيل الدخول
    await client.login({
      email: process.env.U_MAIL_1,
      password: process.env.U_PASS_1
    });

    console.log('✅ Logged In');

    // انتظار بسيط لضمان جاهزية الجلسة
    await new Promise(res => setTimeout(res, 2000));

    console.log('📡 Sending message to room:', ROOM_ID);

    const res = await client.messaging.sendGroupMessage(
      ROOM_ID,
      '!ج'
    );

    console.log('📦 Send response:', res);
    console.log('📤 Message send attempt finished');

  } catch (err) {
    console.error('❌ Error:', err);
  }
}

// تشغيل البوت
start();

// 👇 استقبال الرسائل (فلترة عضو واحد فقط)
client.on('message', (msg) => {
  try {
    const senderId = getSenderId(msg);

    if (!senderId) return;
    if (senderId !== ALLOWED_USER_ID) return;

    console.log('✅ Allowed user message:', msg.text || msg);

  } catch (err) {
    console.error('❌ Message error:', err);
  }
});

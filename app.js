import 'dotenv/config';
import wolfjs from 'wolf.js';

const { WOLF } = wolfjs;
const client = new WOLF();

// 🔴 عدّل هنا
const ROOM_ID = 11194358;
const ALLOWED_USER_ID = 26491704; // العضوية الوحيدة المسموح لها

client.on('ready', async () => {
  console.log('✅ Logged In');

  try {
    await client.messaging.sendGroupMessage(
      ROOM_ID,
      '!ج'
    );

    console.log('📤 Sent !ج');

  } catch (err) {
    console.error('❌ Send error:', err);
  }
});

// 👇 استقبال الرسائل مع فلترة عضو واحد فقط
client.on('message', async (msg) => {
  try {

    const senderId =
      msg.sender?.id ||
      msg.sender ||
      msg.from ||
      msg.user;

    // إذا ما قدر يحدد المرسل تجاهل
    if (!senderId) return;

    // ❌ تجاهل أي شخص غير المسموح
    if (senderId !== ALLOWED_USER_ID) return;

    console.log('✅ رسالة من العضو المسموح فقط:', msg.text || msg);

    // 🔥 ضع هنا منطق البوت الحقيقي
    if (msg.text) {
      console.log('📩 النص:', msg.text);
    }

  } catch (err) {
    console.error('❌ Message error:', err);
  }
});

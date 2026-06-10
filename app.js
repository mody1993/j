import 'dotenv/config';
import wolfjs from 'wolf.js';

const { WOLF } = wolfjs;

const accounts = [
  { identity: process.env.U1_MAIL, secret: process.env.U1_PASS },
  { identity: process.env.U2_MAIL, secret: process.env.U2_PASS },
  { identity: process.env.U3_MAIL, secret: process.env.U3_PASS },
  { identity: process.env.U4_MAIL, secret: process.env.U4_PASS },
  { identity: process.env.U5_MAIL, secret: process.env.U5_PASS },
  { identity: process.env.U6_MAIL, secret: process.env.U6_PASS },
  { identity: process.env.U7_MAIL, secret: process.env.U7_PASS },
  { identity: process.env.U8_MAIL, secret: process.env.U8_PASS },
  { identity: process.env.U9_MAIL, secret: process.env.U9_PASS },
  { identity: process.env.U10_MAIL, secret: process.env.U10_PASS },
  { identity: process.env.U11_MAIL, secret: process.env.U11_PASS },
  { identity: process.env.U12_MAIL, secret: process.env.U12_PASS }
];

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

// =====================
// 🔥 استخراج Room ID
// =====================
function extractRoomId(text = "") {
  const cleaned = text.replace(/[\u200B-\u200F\uFEFF]/g, '');
  const match = cleaned.match(/ID\s*(\d{5,})|\((\d{5,})\)/);
  const id = match?.[1] || match?.[2];
  return id ? parseInt(id, 10) : null;
}

// =====================
// 🤖 كل حساب مستقل
// =====================
accounts.forEach((acc, index) => {

  const service = new WOLF();

  // 📦 طابور + منع تكرار لكل حساب
  let queue = [];
  let queueSet = new Set(); // لمنع التكرار
  let isProcessing = false;

  // ⏱️ نظام الراحة
  let isResting = false;

  const WORK_TIME = 54 * 60 * 1000;
  const REST_TIME = 6 * 60 * 1000;
  const DELAY = 12000;

  // =====================
  // 📥 إضافة للروم (بدون تكرار + أولوية جديدة)
  // =====================
  function addToQueue(roomId) {
    if (!roomId) return;

    // 🔴 منع التكرار
    if (queueSet.has(roomId)) return;

    queueSet.add(roomId);

    // 🔥 أولوية للرومات الجديدة (تدخل أول الطابور)
    queue.unshift(roomId);
  }

  // =====================
  // 🔁 تنفيذ الطابور
  // =====================
  async function processQueue() {
    if (isProcessing) return;
    isProcessing = true;

    while (queue.length > 0) {

      if (isResting) break;

      const roomId = queue.shift();
      queueSet.delete(roomId); // إزالة من قائمة التكرار

      try {
        if (service.groups?.join) {
          await service.groups.join(roomId);
        } else if (service.group?.join) {
          await service.group.join(roomId);
        } else if (service.joinGroup) {
          await service.joinGroup(roomId);
        }

        await service.messaging.sendGroupMessage(roomId, "!اسرق 5");

        console.log(`🚀 [${index + 1}] نفذ على ${roomId}`);

      } catch (err) {
        console.log(`❌ [${index + 1}] خطأ:`, err.message);
      }

      await sleep(DELAY);
    }

    isProcessing = false;
  }

  // =====================
  // 📩 استقبال الرسائل
  // =====================
  service.on('message', async (message) => {
    if (message.isGroup) return;

    const content =
      message.body ||
      message.content ||
      message.text ||
      message.message ||
      "";

    const isBonus =
      content.includes("Bonus-Heist") ||
      content.includes("معزز") ||
      content.includes("Heist") ||
      content.includes("معزز إضافي");

    if (!isBonus) return;

    const roomId = extractRoomId(content);
    if (!roomId) return;

    console.log(`📥 [${index + 1}] استلم: ${roomId}`);

    addToQueue(roomId);

    if (!isResting) {
      processQueue();
    }
  });

  // =====================
  // ⏱️ دورة 54 / 6
  // =====================
  async function cycle() {
    while (true) {

      console.log(`🟢 [${index + 1}] تشغيل 54 دقيقة`);
      isResting = false;

      processQueue();

      await sleep(WORK_TIME);

      console.log(`🛑 [${index + 1}] راحة 6 دقائق`);
      isResting = true;

      await sleep(REST_TIME);
    }
  }

  service.on('ready', () => {
    console.log(`✅ الحساب ${index + 1} جاهز`);
    cycle();
  });

  service.login(acc.identity, acc.secret);
});

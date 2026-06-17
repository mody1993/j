import 'dotenv/config';
import wolfjs from 'wolf.js';

const { WOLF } = wolfjs;

const client = new WOLF();

// ================== CONFIG ==================
const ROOM_ID = 215022;
const TARGET_USER_ID = 26491704;

let waitingForImage = false;

// ================== LOGIN ==================
client.on('ready', async () => {
  try {
    console.log('✅ Logged in');

    await client.messaging.sendGroupMessage(
      ROOM_ID,
      '!ج'
    );

    console.log('📤 Sent !ج');

    waitingForImage = true;

  } catch (err) {
    console.error('❌ ready error:', err);
  }
});

// ================== IMAGE AI ==================
async function analyzeImage(imageUrl) {
  try {
    const res = await fetch(
      "https://api-inference.huggingface.co/models/google/vit-base-patch16-224",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.HF_TOKEN}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ inputs: imageUrl })
      }
    );

    const data = await res.json();

    return data?.[0]?.label || "Unknown";

  } catch (err) {
    return "Error";
  }
}

// ================== HELPERS ==================
function getImageUrl(message) {
  return (
    message.imageUrl ||
    message.url ||
    message?.attachment?.url ||
    (typeof message.body === "string" && message.body.startsWith("http")
      ? message.body
      : null)
  );
}

// ================== MAIN LISTENER ==================
client.on('groupMessage', async (message) => {
  try {

    // 🔥 فلتر نفس الكود الشغال
    if (
      message.sourceSubscriberId !== TARGET_USER_ID ||
      message.targetGroupId !== ROOM_ID
    ) return;

    if (!waitingForImage) return;

    console.log("========== NEW MESSAGE ==========");

    const imageUrl = getImageUrl(message);

    if (!imageUrl) {
      console.log("❌ No image found");
      return;
    }

    console.log("🖼️ Image URL:", imageUrl);

    const result = await analyzeImage(imageUrl);

    console.log("🤖 AI RESULT:", result);

    await client.messaging.sendGroupMessage(
      ROOM_ID,
      `🧠 ${result}`
    );

    waitingForImage = false;

  } catch (err) {
    console.error('❌ error:', err);
  }
});

// ================== START ==================
(async () => {
  try {
    await client.login(
      process.env.U_MAIL_1,
      process.env.U_PASS_1
    );

    console.log('🚀 Bot started');
  } catch (err) {
    console.error('❌ login error:', err);
  }
})();

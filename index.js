import 'dotenv/config';
import wolfjs from 'wolf.js';
import { OpenAI } from 'openai';

const { WOLF } = wolfjs;

// ================== الإعدادات ==================
const ROOM_ID = 70505;

// ID حساب الفعاليات أو البوت الذي يرسل الصور:
const TARGET_USER_ID = 26491704;

// الأمر الذي يرسل مرة واحدة فقط عند تشغيل البوت (اختياري)
const START_COMMAND = '!ج';

// تهيئة ذكاء OpenAI الاصطناعي
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

let service = null;
let reconnecting = false;
let isBotReady = false;

// ================== استخراج رقم الغرفة ==================
function getRoomId(message) {
  return Number(
    message.targetGroupId ||
    message.groupId ||
    message.channelId ||
    message.recipientGroupId ||
    message.group?.id ||
    0
  );
}

// ================== إرسال رسالة ==================
async function send(roomId, text) {
  try {
    if (!service || !isBotReady) return false;

    await service.messaging.sendGroupMessage(roomId, text);
    console.log(`🚀 تم إرسال الإجابة: ${text}`);
    return true;

  } catch (err) {
    console.log('❌ فشل الإرسال:', err.message);
    return false;
  }
}

// ================== دالة التخمين والتعرف على الصور ==================
async function guessImage(base64Image, mimeType) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini", // موديل فائق السرعة وممتاز جداً للشعارات والأنمي والمعالم
      messages: [
        {
          role: "user",
          content: [
            { 
              type: "text", 
              text: "ما هذا الشيء الموجود في الصورة؟ أجب بكلمة واحدة أو كلمتين فقط باللغة العربية (مثال مباشر: أسد، بيانو، برج إيفل، ناروتو، بيتزا، كرة القدم، فيسبوك). لا تكتب أي مقدمات، شرح، أو علامات ترقيم، فقط الاسم المباشر والصحيح للشيء للفوز بالمسابقة." 
            },
            {
              type: "image_url",
              image_url: {
                url: `data:${mimeType};base64,${base64Image}`
              }
            }
          ]
        }
      ],
      max_tokens: 15,
      temperature: 0.1 // درجة منخفضة جداً لضمان الدقة وعدم التفلسف
    });

    const answer = response.choices[0]?.message?.content?.trim();
    
    // تنظيف الإجابة من أي نقاط أو علامات زائدة قد تضعها الـ AI في النهاية
    return answer ? answer.replace(/[.\\/]/g, '') : null;

  } catch (error) {
    console.error('❌ خطأ أثناء التخمين عبر OpenAI:', error.message);
    return null;
  }
}

// ================== إعادة تشغيل البوت ==================
async function restartBot(reason) {
  if (reconnecting) return;

  reconnecting = true;
  isBotReady = false;

  console.log('🔄 إعادة تشغيل البوت بسبب:', reason);

  try {
    if (service) {
      service.removeAllListeners();
      await service.logout().catch(() => {});
    }
  } catch {}

  await sleep(5000);
  startBot();
}

// ================== تشغيل البوت ==================
function startBot() {
  service = new WOLF();

  service.on('message', async (message) => {
    try {
      const senderId = Number(message.sourceSubscriberId);
      const roomId = getRoomId(message);

      // التحقق من شروط الغرفة والحساب المستهدف
      if (!message.isGroup) return;
      if (roomId !== ROOM_ID) return;
      if (senderId !== TARGET_USER_ID) return;

      // فحص ما إذا كانت الرسالة عبارة عن صورة
      // (ملاحظة: التحقق يختلف بحسب إصدار مكتبة wolf.js لديك، قد تحتاج لـ message.isImage)
      const isImage = message.mimeType?.startsWith('image/') || message.isImage || Buffer.isBuffer(message.body);
      if (!isImage) return;

      console.log('--------------------');
      console.log('📸 تم استلام صورة من الحساب المستهدف، جاري معالجتها...');

      let imageBuffer = message.body;

      // التحقق من وجود بافر الصورة (تأكد أن مكتبتك تضع بافر الصورة في message.body عند استقبال الصور)
      if (!imageBuffer || !Buffer.isBuffer(imageBuffer)) {
        console.log('⚠️ لم يتم العثور على بافر الصورة (Buffer) داخل رسالة وولف مباشرة.');
        return;
      }

      const mimeType = message.mimeType || 'image/jpeg';
      const base64Image = imageBuffer.toString('base64');

      // إرسال الصورة للذكاء الاصطناعي للتخمين وحساب وقت الاستغراق
      const startTime = Date.now();
      const answer = await guessImage(base64Image, mimeType);
      const duration = ((Date.now() - startTime) / 1000).toFixed(2);

      if (answer) {
        console.log(`💡 التخمين الذكي: "${answer}" (استغرق المعالجة ${duration} ثانية)`);
        
        // الإرسال فوراً للغرفة (لا توجد حاجة لمؤقت لأن الذكاء الاصطناعي يستغرق جزءاً من الثانية بالفعل)
        await send(roomId, answer);
      }

    } catch (err) {
      console.log('❌ Message Error:', err.message);
    }
  });

  service.on('ready', async () => {
    console.log('✅ الحساب جاهز ومستعد لتخمين الصور ذكياً!');

    isBotReady = true;
    reconnecting = false;

    await sleep(2000);

    // يرسل الأمر الأول عند التشغيل
    await send(ROOM_ID, START_COMMAND);
  });

  service.on('error', () => restartBot('service error'));
  service.on('disconnected', () => restartBot('disconnected'));
  service.on('close', () => restartBot('close'));

  service.login(process.env.U_MAIL_1, process.env.U_PASS_1).catch(() => {
    reconnecting = false;
    restartBot('login failed');
  });
}

startBot();

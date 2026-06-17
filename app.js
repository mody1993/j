import 'dotenv/config';
import wolfjs from 'wolf.js';
import fs from 'fs';

const { WOLF } = wolfjs;
const client = new WOLF();

const ROOM_ID = 11194358;
const TARGET_USER_ID = 26491704;

client.on('ready', () => {
  console.log('✅ Logged In');
});

client.on('message', async (message) => {

  try {

    // روم محدد فقط
    if (!message.isGroup) return;
    if (message.groupId !== ROOM_ID) return;

    // عضوية محددة فقط
    if (message.senderId !== TARGET_USER_ID) return;

    console.log('\n========================');
    console.log('📩 MATCHED MESSAGE');
    console.log('========================');

    console.log('TYPE:', message.type);
    console.log('SENDER:', message.senderId);
    console.log('ROOM:', message.groupId);

    if (message.body) {
      console.log('BODY:', message.body);
    }

    if (message.image) {
      console.log('📷 IMAGE FOUND');
      console.dir(message.image, { depth: 5 });
    }

    if (message.media) {
      console.log('🎞 MEDIA FOUND');
      console.dir(message.media, { depth: 5 });
    }

    if (message.attachments) {
      console.log('📎 ATTACHMENTS FOUND');
      console.dir(message.attachments, { depth: 5 });
    }

    // حفظ الرسالة للفحص
    fs.writeFileSync(
      'message.json',
      JSON.stringify(
        message,
        (key, value) => {
          if (key === 'client') return undefined;
          return value;
        },
        2
      )
    );

    console.log('✅ Saved to message.json');

  } catch (err) {
    console.error('❌ ERROR');
    console.error(err);
  }

});

client.login(
  process.env.U_MAIL_1,
  process.env.U_PASS_1
);

import 'dotenv/config';
import wolfjs from 'wolf.js';
import fs from 'fs';

const { WOLF } = wolfjs;
const client = new WOLF();

const ROOM_ID = 11194358;
const TARGET_USER_ID = 26491704;

client.on('ready', async () => {
  console.log('✅ Logged In');

  try {
    await client.messaging.sendGroupMessage(
      ROOM_ID,
      '!ج'
    );

    console.log('📤 Sent !ج');

  } catch (err) {
    console.error('❌ SEND ERROR');
    console.error(err);
  }
});

client.on('message', async (message) => {

  try {

    // اطبع أي رسالة تصل للمكتبة
    console.log('====================');
    console.log('EVENT RECEIVED');
    console.log('TYPE:', message?.type);
    console.log('SENDER:', message?.senderId);
    console.log('GROUP:', message?.groupId);
    console.log('IS_GROUP:', message?.isGroup);

    // فلترة الروم
    if (!message?.isGroup) return;
    if (message.groupId !== ROOM_ID) return;

    // فلترة العضوية
    if (message.senderId !== TARGET_USER_ID) return;

    console.log('✅ TARGET MESSAGE FOUND');

    if (message.body) {
      console.log('BODY:', message.body);
    }

    if (message.image) {
      console.log('📷 IMAGE');
      console.dir(message.image, {
        depth: 10,
        colors: true
      });
    }

    if (message.media) {
      console.log('🎞 MEDIA');
      console.dir(message.media, {
        depth: 10,
        colors: true
      });
    }

    if (message.attachments) {
      console.log('📎 ATTACHMENTS');
      console.dir(message.attachments, {
        depth: 10,
        colors: true
      });
    }

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

    console.log('✅ message.json saved');

  } catch (err) {

    console.error('❌ MESSAGE ERROR');
    console.error(err);

  }

});

client.on('error', (err) => {
  console.error('❌ CLIENT ERROR');
  console.error(err);
});

client.login(
  process.env.U_MAIL_1,
  process.env.U_PASS_1
);

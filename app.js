import 'dotenv/config';
import wolfjs from 'wolf.js';
import fs from 'fs';

const { WOLF } = wolfjs;
const client = new WOLF();

const ROOM_ID = 11194358;
const GUESS_BOT_ID = 26491704;

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

  console.log('\n==============================');
  console.log('📩 NEW MESSAGE RECEIVED');
  console.log('==============================');

  try {

    console.log('TYPE:', message.type);
    console.log('SENDER ID:', message.senderId);
    console.log('GROUP ID:', message.groupId);
    console.log('IS GROUP:', message.isGroup);

    console.log('\n========== OBJECT ==========\n');

    console.dir(message, {
      depth: null,
      colors: true
    });

    console.log('\n========== KEYS ==========\n');

    try {
      console.log(Object.keys(message));
    } catch (e) {
      console.log('Cannot get keys');
    }

    console.log('\n========== JSON ==========\n');

    try {

      const json = JSON.stringify(
        message,
        null,
        2
      );

      console.log(json);

      fs.writeFileSync(
        'message.json',
        json
      );

      console.log('✅ message.json saved');

    } catch (e) {

      console.log(
        '❌ Cannot stringify message'
      );

    }

    console.log('\n========== FILTER CHECK ==========\n');

    if (!message.isGroup) {
      console.log('❌ NOT GROUP');
      return;
    }

    console.log('✅ GROUP MESSAGE');

    if (message.groupId !== ROOM_ID) {
      console.log(
        `❌ WRONG ROOM (${message.groupId})`
      );
      return;
    }

    console.log('✅ ROOM MATCH');

    if (message.senderId !== GUESS_BOT_ID) {
      console.log(
        `❌ WRONG BOT (${message.senderId})`
      );
      return;
    }

    console.log('✅ BOT MATCH');

    console.log('\n========== MEDIA CHECK ==========\n');

    console.log('message.image =');
    console.dir(message.image, {
      depth: null
    });

    console.log('message.media =');
    console.dir(message.media, {
      depth: null
    });

    console.log('message.attachments =');
    console.dir(message.attachments, {
      depth: null
    });

    console.log('message.body =');
    console.dir(message.body, {
      depth: null
    });

    console.log('\n✅ MESSAGE PASSED ALL FILTERS');

  } catch (err) {

    console.error(
      '❌ MESSAGE HANDLER ERROR'
    );

    console.error(err);

  }

});

client.login(
  process.env.U_MAIL_1,
  process.env.U_PASS_1
);

const { VK, API, Upload, Keyboard, resolveResource, VoteContext, getRandomId} = require('vk-io');
const hash = require('object-hash')
const moment = require('moment')
moment.locale(`ru`)
const axios = require('axios').default
const fs = require('fs')
const { createCanvas, loadImage} = require('canvas')
const vk = new VK({
token: ``, apiLimit: 20
});
let fake = new VK({token: ``})
//const rusAnonymUtils = require(`rus-anonym-utils`).default;
let users = require('./database/users.json')
let chat = require('./database/chat.json')
let botinfo = require('./database/botinfo.json')
const math = require("mathjs")
const Qiwi = require('node-qiwi')
const wallet = new Qiwi('')
const { re, prod, e } = require('mathjs')
const commands = [];
const { updates } = vk;
function getUnix() {
	return Date.now();
}
function getUnixx() {
	return Math.floor(Date.now()/1000);
}
function getTime() {
	return Math.floor(Date.now() / 1000);
}
function getDate() {
    let data = new Date()
    let mes = data.getMonth()+1
    if(mes < 10) mes = `0${mes}`
    let text = `${data.getDate()}.${mes}.${data.getFullYear()}`
    return text
}
function getRandomElement(array) { 
 	return array[getRandomInt(array.length - 1)]; 
 }

// Хандлеры, логи, атаки //
/*function fileH(){
    fs.open(`игры/${getDate()}.txt`, 'w', (err) => {
    if(err) throw err;
    });
}*/

function fileHandler(stamp) {
    fs.appendFile('logs.txt', stamp, (err) => {
        if(err) throw err;
    });
}

/*function attack(stamp) {
    fs.appendFile('атаки.txt', stamp, (err) => {
        if(err) throw err;
    });
}*/

async function saveUsers(){
    require('fs').writeFileSync('./database/users.json', JSON.stringify(users, null, '\t'));
    require('fs').writeFileSync('./database/chat.json', JSON.stringify(chat, null, '\t'));
    require('fs').writeFileSync('./database/botinfo.json', JSON.stringify(botinfo, null, '\t'));
}

const utils = {
	sp: (int) => {
        int = int.toString();
        return int.split('').reverse().join('').match(/[0-9]{1,3}/g).join('.').split('').reverse().join('');
	},
	rn: (int, fixed) => {
		if (int === null) return null;
		if (int === 0) return '0';
		fixed = (!fixed || fixed < 0) ? 0 : fixed;
		let b = (int).toPrecision(2).split('e'),
			k = b.length === 1 ? 0 : Math.floor(Math.min(b[1].slice(1), 14) / 3),
			c = k < 1 ? int.toFixed(0 + fixed) : (int / Math.pow(10, k * 3) ).toFixed(1 + fixed),
			d = c < 0 ? c : Math.abs(c),
			e = d + ['', 'тыс', 'млн', 'млрд', 'трлн'][k];

			e = e.replace(/e/g, '');
			e = e.replace(/\+/g, '');

		return e;
	},
	gi: (int) => {
		int = int.toString();

		let text = ``;
		for (let i = 0; i < int.length; i++)
		{
			text += `${int[i]}&#8419;`;
		}

		return text;
	},
	decl: (n, titles) => {
        return titles[(n % 10 === 1 && n % 100 !== 11) ? 0 : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20) ? 1 : 2] 
    },
	random: (x, y) => {
		return y ? Math.round(Math.random() * (y - x)) + x : Math.round(Math.random() * x);
	},
	crach: (x, y) => {
        let c = y ? Math.random() * (y - x) + x : Math.random() * x;
		return Number(c.toFixed(2));
	},
	pick: (array) => {
		return array[utils.random(array.length - 1)];
	}
}

updates.start().catch(console.error).then(console.log(`Бот запущен (VK).`))

updates.on('message_new', async (message) => {
    if (Number(message.senderId) <= 0) return;
    if (/\[club203077981\|(.*)\]/i.test(message.text)) message.text = message.text.replace(/\[club203077981\|(.*)\]/ig, '').trim();
    if(!users.find((x) => x.id === message.senderId)){
        const [user_info] = await vk.api.users.get({ user_id: message.senderId });
		users.push({
			id: message.senderId,
			balance: 0,
			snus: 0,
			monetki: 0,
			sm: 0,
			smtime: 0,
			scamtime: 0,
			name: user_info.first_name,
			regDate: getDate(),
			ban: false,
			bantime: 0,
			rban: false,
			mention: true,
			hash: 0,
			nick: user_info.first_name,
			namelimit: 12,
			win: 0,
			lose: 0,
			sms: 0,
		});
		if(!message.isChat) {
            message.send(`👏 здарова, [id${message.senderId}|${user_info.first_name}]!\n🔥 тебя приветствует бот дак, самый ахуеный бот\n\n✅ помощь по командам: «дак помощь»`,{keyboard: Keyboard.keyboard([])
                .textButton({
                    label: `помощь`,
                    color: 'positive',
                })
                .textButton({
                    label: `писюн`,
                })
                .textButton({
                    label: `скам`,
                })
                .textButton({
                    label: `я`,
                    color: 'negative',
                })
            }) 
        }
	}
	
	if (!message.text) return;
	message.user = users.find((x) => x.id === message.senderId)
	if(message.user.balance > 0){
        message.user.balance = Math.floor(message.user.balance)
    }
    if(message.user.snus > 0){
        message.user.snus = Math.floor(message.user.snus)
    }
    if(message.user.monetki > 0){
        message.user.monetki = Math.floor(message.user.monetki)
    }
    
    //botinfo.message += 1;
    const command = commands.find(x => x[0].test(message.text));
    const bot = (text, params) => {
		return message.send(`${message.user.mention ? `@id${message.user.id} (${message.user.name})` : `${message.user.name}`}, ${text}`, params);
	}
	const [user_info] = await vk.api.users.get({user_id: message.user.id});
    console.log(`${user_info.first_name} (ID: ${message.user.id}): ${message.text}`)
	fileHandler(`[${moment(getUnix()).format("DD.MM.YYYY, HH:mm:ss")}] - ID${message.user.id}: «${message.text}»\n`)

	if(!command) return;
	
    message.args = message.text.match(command[0]);
    await command[1](message, bot);
});

setInterval(async () => {
	await saveUsers();
}, 30000);

updates.on('message_event', async (message) => {
    message.user = users.find((x) => x.id === message.userId)
    const command = commandsEvent.find(x => x[0].test(message.eventPayload.type));
    if(!command) return;
    // botinfo.message += 1;
    message.args = message.eventPayload.type.match(command[0]);
    await command[1](message); 
    console.log(`${message.user.name} (ID: ${message.user.id}): ${message.eventPayload.type}`)
})

const cmd = {
    one: (p, f) => {
        commands.push([p, f]);
    },
    callback: (p, f) => {
        commandsEvent.push([p, f])
    },
    payload: (p, f) => {
        payload.push([p, f])
    }
}
function clipper(ctx,img, x,y,w,h,rad){
    ctx.beginPath();
    ctx.arc(x+rad, y+rad, rad, Math.PI, Math.PI+Math.PI/2 , false);
    ctx.lineTo(x+w - rad, y);
    ctx.arc(x+w-rad, y+rad, rad, Math.PI+Math.PI/2, Math.PI*2 , false);
    ctx.lineTo(x+w,y+h - rad);
    ctx.arc(x+w-rad,y+h-rad,rad,Math.PI*2,Math.PI/2,false);
    ctx.lineTo(x+rad,y+h);
    ctx.arc(x+rad,y+h-rad,rad,Math.PI/2,Math.PI,false);
    ctx.closePath();
    ctx.save();
    ctx.clip();
    ctx.drawImage(img,x,y,w,h);
    ctx.restore();
}
function unixStampLeft(stamp) {
	stamp = stamp / 1000;
    let s = stamp % 60;
    stamp = ( stamp - s ) / 60;
    let m = stamp % 60;
    stamp = (stamp - m) / 60;
    let	h = (stamp) % 24;
    let	d = (stamp - h) / 24;
    let text = ``;

    if(d > 0) text += Math.floor(d) + " дн. ";
    if(h > 0) text += Math.floor(h) + " ч. ";
    if(m > 0) text += Math.floor(m) + " мин. ";
    if(s > 0) text += Math.floor(s) + " сек.";

	return text;
}

cmd.one(/^(?:я|меня|мой|i|мой профиль|я профиль|кто я)$/i, async (message, bot) => {
    const [user_info] = await vk.api.users.get({user_id: message.user.id});

    return message.send(`ого это же © ${user_info.first_name} ${user_info.last_name}. Вот твой профиль:
    
〰️ писюн: ${message.user.sm} см.
💊 снюс: ${message.user.snus} шт.
💰 монеты (drub): ${message.user.monetki}

`);
});

cmd.one(/^(?:писюн|дак писюн|duck chlen|член|дак член)$/i, async (message, bot) => {
    if(message.user.smtime > Date.now()) return message.send(`падажжи, писюн мерить можно буит через ${unixStampLeft(message.user.smtime - Date.now())} ⏳`);
    
    message.user.smtime = Date.now() + 86400000;
    let random = utils.random(1,10);
    message.user.sm += random;
   
    let res = getUnixx()
    await message.send(`наяриваю..`);
    
   return message.send(`твой писюнчик вырос на ${random} см.\nтеперь его размерчик составляет ${message.user.sm} см.`);
});

cmd.one(/^(?:дак ци|дак цитата|дак цитани)$/i, async (message, bot) => {
    if(!message.replyMessage && !message.forwards[0]) return message.send(`перешли сообщение со словом «цитата» и я сделаю цитату 😒`)
    let text = ``
    if(message.replyMessage || message.forwards[0]) {
        text = message.replyMessage ? message.replyMessage.text:message.forwards[0].text
    }
    let id = false
    if(message.replyMessage || message.forwards[0]) {
        id = message.replyMessage ? message.replyMessage.senderId:message.forwards[0].senderId
    }
    if(id < 0) return message.send(`не могу цитануть группу 😕`)
    let stik = ``
    if(!text) {
        stik = message.replyMessage ? message.replyMessage.attachments[0].images[4].url:message.forwards[0].attachments[0].images[4].url
    }
    if(!stik && !text) return message.send(`перешли сообщение со словом «цитата» и я сделаю цитату 😒`)
    if(!stik) {
        //if(text.length >= 50) return bot(`текст слишком длинный.`)
    }
    const canvas = createCanvas(1280, 800)
    let res = getUnixx()
    message.send(`ща ебану, падажди`)
    let s = utils.pick([`quote3.png`, `quote2.png`])
    const Canvas = require('canvas'); 
    const Image = Canvas.Image; 
    const ctxx = canvas.getContext('2d'); 
    const img = new Image(); 
    ctxx.fillStyle = "#000000"; 
    ctxx.fillRect(0, 0, 1010, 1000); 
    ctxx.fillStyle = "#FFFFFF"; 
    ctxx.font = "33px Tahoma"
    img.src = `./image/${s}`; 
    ctxx.drawImage(img, 0, 0); 
    const { registerFont } = require('canvas') 
    registerFont('./image/18942.otf', { 
    family: 'Regular' 
    }) 
    let use_id1 = id
    let [ava_info] = await vk.api.users.get({ 
        user_id: use_id1, 
        fields: "photo_200" 
    }); 
    let mychit = await loadImage(ava_info.photo_200); 
    clipper(ctxx, mychit, 90, 240, 340, 340, 170);
    ctxx.fillText(`@ ${moment(res*1000).format("DD.MM.YYYY")}`, 95, 680); 
    ctxx.fillText(`® ${ava_info.first_name} ${ava_info.last_name}`, 95, 630);
    ctxx.font = "60px Tahoma"
    registerFont('./image/9041.ttf', { 
        family: 'Regular' 
    }) 
    ctxx.fillText(`ЦИТАТА ЕБАНУТОГО`, 440, 180); 
    ctxx.textAlign = 'center'
    ctxx.font = "35px Tahoma"
    registerFont('./image/18942.otf', { 
        family: 'Regular' 
    }) 
    if(text.length < 45) { 
        ctxx.fillText(text, 840, 450);
    } else {
        if(text.length < 90) {
            let ff = false
            for(let i = 37;i<=text.length;i++) {
                if(text[i] !== ` `) continue;
                if(ff == false)text[i] = ` \n`
            }  
            ctxx.fillText(text, 840, 500);      
        }
    }
    if(message.isChat == true) {
            return message.sendPhotos([{value: canvas.toBuffer()}],{message: `ебанул цитату, чекай`,peer_id: message.peerId})
    } else {
        return message.sendPhotos([{value: canvas.toBuffer()}],{message: `ебанул цитату, чекай`,peer_id: message.peerId})
    }
});
    
cmd.one(/^(?:дак кто|duck who)\s(.*)$/i, async (message, bot) => {
    // Проверка, если сообщение не из чата - игнор
    if (!message.isChat) {
    	return;
    }
    // Получаем массив профилей, ибо items возвращает не совсем то, что нам надо
    let { profiles } = await vk.api.messages.getConversationMembers({
    	peer_id: message.peerId
    });
    // Получаем случайный профиль из массива
    let profile = utils.pick(profiles);
    // Отправляем результат
    await message.send(
    	utils.pick([`🦆 Это точно, что ${message.args[1]}`, `🦆 Я уверен, что ${message.args[1]}`, `🦆 Сотку даю, что ${message.args[1]}`, `🦆 Я считаю, что ${message.args[1]}`, `🦆 Я предполагаю, что ${message.args[1]}`, `🦆 А твоя мама говорит, что ${message.args[1]}`]) + ' -- @id' + profile.id + '(' + profile.first_name + ')'
    );
});

cmd.one(/^(?:дак|duck|утка|дак бот|дак ты тут?|дак жив?)$/i, async (message, bot) => {
    return message.send(`Щегельме бегельме?`);
});

cmd.one(/^(?:дак гиф|duck gif)\s(.*)$/i, async (message, bot) => {
	fake.api.call('docs.search', {q: message.args[1] + '.gif', count: 1}) .then(response => { 
		var items = response.items.map(x => `doc${x.owner_id}_${x.id}`).join(','); 
		return message.send(`держи гифку дура`, {attachment: items}) 
	}) 
});

/*
vk.updates.hear(/^(?:aget|агет|огет|астат|админ стата)\s?([0-9]+)?/i,  (message) => { 
	var bd = acc.users[user_id(message.user)];
	if(bd.ap < 3) {
		message.reply('Вы не Спец Администратор.');
		return message.sendSticker(17500);
	}
	var id = message.$match[1]
	if(!id) return message.send(`Введите ID Администратора.`)
		if (!acc.users[id]) return message.send(`Данный пользователь не зарегистрирован в боте.`);
	if(acc.users[id].ap == 0) return message.send(`Он не Администратор.`)
		vk.api.users.get({user_id: acc.users[id].id, name_case: "gen", fields: "domain"}).then((res) => { 	
			const e = res[0];
			message.send(`Пожалуйта подождите..\n Сейчас я вам пришлю карточку Администратора @${e.domain}(${e.first_name} ${e.last_name})`);
			const { createCanvas, loadImage } = require('canvas');
			const canvas = createCanvas(1420, 400);
			const ctx = canvas.getContext('2d');

			const Image = Canvas.Image;
			const img = new Image();
			img.src = 'mrak.png';
			ctx.drawImage(img, 0, 0);

			ctx.font = '30px Roboto';
			ctx.fillStyle = "#FFFFFF";
			ctx.fillText(`
				Статистика Администратора: "${e.first_name} ${e.last_name}"
				Ссылка на страницу VK: https://vk.com/${e.domain} 
				Обращение VK @${e.domain}

				Ник Администратора: ${acc.users[id].prefix}
				— ID: ${id}
				— Доступ: ${acc.users[id].ap.toString().replace(/0/gi, "Игрок").replace(/1/gi, "VIP-Пользватель").replace(/2/gi, "Модератор").replace(/3/gi, "Администратор").replace(/4/gi, "Старший Администратор").replace(/5/gi, "Главный Администратор").replace(/6/gi, "Специальный Администратор").replace(/7/gi, "Разработчик")}
				— Ответов на репорт: ${spaces(acc.users[id].ainfo.all_ans)}
				— Выговоров: ${spaces(acc.users[id].ainfo.vig)}/3`, -270, 30);

			ctx.font = '30px Roboto'; 
			ctx.fillStyle = "#FFFFFF"; 
			ctx.fillText(`

				Баланс: ${spaces(acc.users[id].balance)}$
				Биткоинов: ${spaces(acc.users[id].bitcoin)} 
				Рейтинг: ${spaces(acc.users[id].global_exs)} 

				Сообщений: ${spaces(acc.users[id].msg.messages)} 
				Посл. Актив.: ${acc.users[id].msg.last_msg}`, 400, 90)

			return message.sendPhoto(canvas.toBuffer());
		});
});
*/

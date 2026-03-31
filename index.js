const { Client, GatewayIntentBits, AttachmentBuilder } = require("discord.js");
const { createCanvas, loadImage } = require("@napi-rs/canvas");
require("dotenv").config();

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
    ]
});

const WELCOME_CHANNEL_ID = "1488424449798705263";
const ROL_CIUDADANO_ID = "1485856691487768730";

client.on("clientReady", () => {
    console.log(`✅ Encendido como: ${client.user.tag}`);
});

client.on("guildMemberAdd", async (member) => {
    try {
        const rol = member.guild.roles.cache.get(ROL_CIUDADANO_ID);
        if (rol) await member.roles.add(rol);
    } catch (err) {
        console.error("Error asignando rol:", err);
    }

    const channel = member.guild.channels.cache.get(WELCOME_CHANNEL_ID);
    if (!channel) return;

    try {
        const canvas = createCanvas(1536, 1024);
        const ctx = canvas.getContext("2d");

        const background = await loadImage("./Bienvenida.png");
        ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

        const avatarURL = member.user.displayAvatarURL({ extension: "png", size: 512, forceStatic: true });
        let avatar;
        try {
            avatar = await loadImage(avatarURL);
        } catch {
            avatar = await loadImage("https://cdn.discordapp.com/embed/avatars/0.png");
        }

        const cx = 770;
        const cy = 345;
        const radio = 255;

        ctx.save();
        ctx.beginPath();
        ctx.arc(cx, cy, radio, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(avatar, cx - radio, cy - radio, radio * 2, radio * 2);
        ctx.restore();

        ctx.font = "bold 90px Impact";
        ctx.textAlign = "center";
        ctx.strokeStyle = "#9B59B6";
        ctx.lineWidth = 5;
        ctx.strokeText("BIENVENID@", cx, cy + radio + 90);
        ctx.fillStyle = "#ffffff";
        ctx.fillText("BIENVENID@", cx, cy + radio + 90);

        ctx.font = "bold 50px Impact";
        ctx.textAlign = "center";
        ctx.strokeStyle = "#000000";
        ctx.lineWidth = 4;
        ctx.strokeText(`@${member.user.username.toUpperCase()}`, cx, cy + radio + 155);
        ctx.fillStyle = "#e0c8ff";
        ctx.fillText(`@${member.user.username.toUpperCase()}`, cx, cy + radio + 155);

        const attachment = new AttachmentBuilder(canvas.toBuffer("image/png"), {
            name: "welcome.png",
        });

        await channel.send({
            content: `👑 ¡Bienvenido a **LA FAMA RP**, ${member}!`,
            files: [attachment],
        });

    } catch (err) {
        console.error("Error generando bienvenida:", err);
    }
});

client.login(process.env.TOKE);
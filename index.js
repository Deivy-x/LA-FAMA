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

client.on("ready", () => {
    console.log(`✅ Encendido como: ${client.user.tag}`);
});

client.on("guildMemberAdd", async (member) => {
    // Asignar rol
    try {
        await member.guild.roles.fetch();
        const rol = member.guild.roles.cache.get(ROL_CIUDADANO_ID);
        if (rol) {
            await member.roles.add(rol);
            console.log(`✅ Rol asignado a ${member.user.username}`);
        } else {
            console.error(`❌ Rol ${ROL_CIUDADANO_ID} no encontrado`);
        }
    } catch (err) {
        console.error("Error asignando rol:", err);
    }

    // Enviar bienvenida
    const channel = member.guild.channels.cache.get(WELCOME_CHANNEL_ID);
    if (!channel) {
        console.error("❌ Canal de bienvenida no encontrado");
        return;
    }

    try {
        const canvas = createCanvas(1536, 1024);
        const ctx = canvas.getContext("2d");

        // Fondo
        const background = await loadImage("./Bienvenida.png");
        ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

        // Avatar
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

        // Círculo del avatar
        ctx.save();
        ctx.beginPath();
        ctx.arc(cx, cy, radio, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(avatar, cx - radio, cy - radio, radio * 2, radio * 2);
        ctx.restore();

        // Texto BIENVENID@
        ctx.shadowColor = "rgba(0, 0, 0, 0.9)";
        ctx.shadowBlur = 15;
        ctx.shadowOffsetX = 3;
        ctx.shadowOffsetY = 3;

        ctx.font = "bold 90px Impact";
        ctx.textAlign = "center";
        ctx.strokeStyle = "#9B59B6";
        ctx.lineWidth = 8;
        ctx.strokeText("BIENVENID@", cx, cy + radio + 90);
        ctx.fillStyle = "#ffffff";
        ctx.fillText("BIENVENID@", cx, cy + radio + 90);

        // Texto username
        ctx.shadowColor = "rgba(0, 0, 0, 0.9)";
        ctx.shadowBlur = 12;
        ctx.shadowOffsetX = 3;
        ctx.shadowOffsetY = 3;

        ctx.font = "bold 50px Impact";
        ctx.strokeStyle = "#000000";
        ctx.lineWidth = 6;
        ctx.strokeText(`@${member.user.username.toUpperCase()}`, cx, cy + radio + 155);
        ctx.fillStyle = "#e0c8ff";
        ctx.fillText(`@${member.user.username.toUpperCase()}`, cx, cy + radio + 155);

        // Limpiar shadow
        ctx.shadowColor = "transparent";
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;

        const attachment = new AttachmentBuilder(canvas.toBuffer("image/png"), {
            name: "welcome.png",
        });

        await channel.send({
            content: `👑 ¡Bienvenido a **LA FAMA RP**, ${member}!`,
            files: [attachment],
        });

        console.log(`✅ Bienvenida enviada a ${member.user.username}`);

    } catch (err) {
        console.error("Error generando bienvenida:", err);
    }
});

client.login(process.env.TOKEN);
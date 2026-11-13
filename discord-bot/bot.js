// A Discord bot on CLI. Set DISCORD_TOKEN and DISCORD_APP_ID (the template asks for them).
import { createServer } from "node:http";
import { Client, Events, GatewayIntentBits, REST, Routes, SlashCommandBuilder } from "discord.js";

const token = process.env.DISCORD_TOKEN;
const appId = process.env.DISCORD_APP_ID;
let ready = false;

// CLI checks this to know the bot is up.
createServer((req, res) => {
  res.writeHead(req.url === "/health" && ready ? 200 : req.url === "/health" ? 503 : 404, { "content-type": "application/json" });
  res.end(JSON.stringify({ ok: ready }));
}).listen(Number(process.env.PORT ?? 3000));

if (!token || !appId) {
  console.error("Set DISCORD_TOKEN and DISCORD_APP_ID in the service's variables, then redeploy.");
} else {
  const commands = [new SlashCommandBuilder().setName("ping").setDescription("Check the bot is alive").toJSON()];
  await new REST().setToken(token).put(Routes.applicationCommands(appId), { body: commands });

  const client = new Client({ intents: [GatewayIntentBits.Guilds] });
  client.once(Events.ClientReady, (c) => {
    ready = true;
    console.log(`Logged in as ${c.user.tag}`);
  });
  client.on(Events.InteractionCreate, async (i) => {
    if (i.isChatInputCommand() && i.commandName === "ping") await i.reply(`Pong from CLI (${Math.round(client.ws.ping)} ms)`);
  });
  await client.login(token);
}

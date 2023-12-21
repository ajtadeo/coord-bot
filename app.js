// main entrypoint for app
import express from 'express';
import 'dotenv/config';
import {
  InteractionType,
  InteractionResponseType,
  // InteractionResponseFlags,
  // MessageComponentTypes,
  // ButtonStyleTypes,
} from 'discord-interactions';
import { VerifyDiscordRequest, AddCoord, GetAllCoords, PrettifyCoords, DeleteCoord, GetCoord, GetUsername, RegisterUsername } from './utils.js';
import pkg from 'pg';
const { Client } = pkg

const app = express();
const PORT = 3000;
app.use(express.json({ verify: VerifyDiscordRequest(process.env.PUBLIC_KEY) }));

const client = new Client();
client.connect()
  .then(() => {
    console.log("Connected to PostgreSQL database")
  })
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })

// API endpoints
app.post('/interactions', async function (req, res) {
  // Interaction type and data
  const { type, id, data, member } = req.body;

  /**
   * Handle verification requests
   */
  if (type === InteractionType.PING) {
    return res.send({ type: InteractionResponseType.PONG });
  }

  /**
   * Handle slash command requests
   * See https://discord.com/developers/docs/interactions/application-commands#slash-commands
   */
  if (type === InteractionType.APPLICATION_COMMAND) {
    const { name } = data;

    if (name == 'add') {
      let name = data.options[0].value
      if ((await GetCoord(client, name)) !== null) {
        return res.send({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            content: `:flushed:  Oops! **${name}** already exists.`
          },
        })
      } else {
        let x = data.options[1].value
        let y = data.options[2].value
        let z = data.options[3].value
        await AddCoord(client, name, x, y, z);
        return res.send({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            content: `:round_pushpin: Added **${name}** at ${x}, ${y}, ${z}`
          },
        });
      }
    } else if (name == 'delete') {
      let name = data.options[0].value
      if ((await GetCoord(client, name)) === null) {
        return res.send({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            content: `:flushed:  Oops! **${name}** doesn't exist`
          },
        })
      } else {
        await DeleteCoord(client, name);
        return res.send({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            content: `:x: Deleted **${name}**`
          },
        });
      }
    } else if (name == 'list') {
      let coords = await GetAllCoords(client)
      return res.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: ":map:  Listing all coordinates\n" + PrettifyCoords(coords)
        }
      })
    } else if (name == 'tp') {
      let name = data.options[0].value
      let coord = await GetCoord(client, name)
      if (coord === null) {
        return res.send({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            content: `:flushed:  Oops! **${name}** doesn't exist`
          },
        })
      } else {
        let minecraftUsername = await GetUsername(client, member.user.global_name)
        if (minecraftUsername) {
          return res.send({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: {
              content: `:magic_wand: Generated tp command to **${name}**` + "```\\tp " + `${minecraftUsername} ${coord.x} ${coord.y} ${coord.z}` + "```"
            },
          });
        } else {
          return res.send({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: {
              content: `:flushed:  Oops! No Minecraft username is registered for **${member.user.global_name}**. Register one with \`/register\`!`
            },
          })
        }
      }
    } else if (name == 'register') {
      let minecraftUsername = data.options[0].value
      let discordUsername = member.user.global_name
      await RegisterUsername(client, discordUsername, minecraftUsername)
      return res.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: `:floppy_disk: Registered **${minecraftUsername}** for **${discordUsername}**`
        },
      });
    }
  }
});

process.on('SIGINT', async () => {
  console.log("Disconnecting from PostgreSQL database")
  await client.end()
  process.exit(0)
})

app.listen(PORT, () => {
  console.log('Listening on port', PORT);
});
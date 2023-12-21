import 'dotenv/config';
import fetch from 'node-fetch';
import { verifyKey } from 'discord-interactions';

export function VerifyDiscordRequest(clientKey) {
  return function (req, res, buf, encoding) {
    const signature = req.get('X-Signature-Ed25519');
    const timestamp = req.get('X-Signature-Timestamp');

    const isValidRequest = verifyKey(buf, signature, timestamp, clientKey);
    if (!isValidRequest) {
      res.status(401).send('Bad request signature');
      throw new Error('Bad request signature');
    }
  };
}

export async function DiscordRequest(endpoint, options) {
  // append endpoint to root API URL
  const url = 'https://discord.com/api/v10/' + endpoint;
  // Stringify payloads
  if (options.body) options.body = JSON.stringify(options.body);
  // Use node-fetch to make requests
  const res = await fetch(url, {
    headers: {
      Authorization: `Bot ${process.env.DISCORD_TOKEN}`,
      'Content-Type': 'application/json; charset=UTF-8',
      'User-Agent': 'Coord Bot (https://github.com/ajtadeo/coord-bot, 1.0.0)',
    },
    ...options
  });
  // throw API errors
  if (!res.ok) {
    const data = await res.json();
    console.log(res.status);
    throw new Error(JSON.stringify(data));
  }
  // return original response
  return res;
}

export async function InstallGlobalCommands(appId, commands) {
  // API endpoint to overwrite global commands
  const endpoint = `applications/${appId}/commands`;

  try {
    // This is calling the bulk overwrite endpoint: https://discord.com/developers/docs/interactions/application-commands#bulk-overwrite-global-application-commands
    await DiscordRequest(endpoint, { method: 'PUT', body: commands });
  } catch (err) {
    console.error(err);
  }
}

// export async function CoordAlreadyExists(client, name) {
//   let alreadyExists = false;
//   try {
//     const res = await client.query('SELECT * FROM coords WHERE name = $1 LIMIT 1;', [name])
//     if (res.rows.length > 0) {
//       alreadyExists = true
//     }
//   } catch (err) {
//     console.error(err)
//   }
//   return alreadyExists
// }

export async function AddCoord(client, name, x, y, z) {
  try {
    await client.query('INSERT INTO coords (name, x, y, z) VALUES ($1, $2, $3, $4)', [name, x, y, z])
  } catch (err) {
    console.error(err)
  }
}

export async function GetAllCoords(client) {
  let coords = []
  try {
    let result = await client.query('SELECT * FROM coords')
    coords = result.rows
  } catch (err) {
    console.error(err)
  }
  return coords
}

export async function GetCoord(client, name) {
  let coord = {}
  try {
    let res = await client.query('SELECT * FROM coords WHERE name = $1', [name])
    if (res.rows.length !== 1) {
      return null
    } else {
      coord = res.rows[0]
    }
  } catch (err) {
    console.error(err)
  }
  return coord
}

export function PrettifyCoords(coords) {
  let result = ""
  coords.map(x => {
    let s = `* **${x.name}**: ${x.x}, ${x.y}, ${x.z}\n`
    result = result + s
  })
  return result
}

export async function DeleteCoord(client, name) {
  try {
    await client.query('DELETE FROM coords WHERE name = $1', [name]);
  } catch (err) {
    console.error(err)
  }
}

export async function RegisterUsername(client, discordUsername, minecraftUsername) {
  try {
    await client.query('INSERT INTO usernames (discordUsername, minecraftUsername) VALUES ($1, $2)', [discordUsername, minecraftUsername])
  } catch (err) {
    console.error(err)
  }
}

export async function GetUsername(client, discordUsername) {
  let minecraftUsername = ""
  try {
    let res = await client.query('SELECT * FROM usernames WHERE discordUsername = $1', [discordUsername])
    if (res.rows.length < 1) {
      return null
    } else {
      minecraftUsername = res.rows[0].minecraftusername
    }
  } catch (err) {
    console.error(err)
  }
  return minecraftUsername
}
# coord-bot
Discord bot for saving and organizing Minecraft world coordinates

```sql
CREATE TABLE coords (
  name VARCHAR(255) UNIQUE NOT NULL,
  x INTEGER NOT NULL,
  y INTEGER NOT NULL,
  z INTEGER NOT NULL
);
```

```sql
CREATE TABLE usernames (
  discordUsername VARCHAR(255) UNIQUE NOT NULL,
  minecraftUsername VARCHAR(255) UNIQUE NOT NULL
);
```
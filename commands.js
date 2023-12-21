import 'dotenv/config';
import { InstallGlobalCommands } from './utils.js';

const ADD_COMMAND = {
  name: "add",
  description: "Add a Minecraft coordinate.",
  options: [
    {
      name: 'name',
      description: 'Name of the location',
      type: 3, // String type
      required: true,
    },
    {
      name: 'x',
      description: 'X coordinate',
      type: 4, // int type
      required: true,
    },
    {
      name: 'y',
      description: 'Y coordinate',
      type: 4, // int type
      required: true,
    },
    {
      name: 'z',
      description: 'Z coordinate',
      type: 4, // int type
      required: true,
    },
  ],
}

const LIST_COMMAND = {
  name: "list",
  description: "List all Minecraft coordinates.",
}

const DELETE_COMMAND = {
  name: "delete",
  description: "Delete a Minecraft coordinate.",
  options: [
    {
      name: "name",
      description: "Name of location",
      required: true,
      type: 3
    }
  ]
}

const TP_COMMAND = {
  name: "tp",
  description: "Generates a tp command for a Minecraft coordinate.",
  options: [
    {
      name: "name",
      description: "Name of location",
      required: true,
      type: 3
    }
  ]
}

const REGISTER_COMMAND = {
  name: "register",
  description: "Registers a Minecraft username for a Discord user.",
  options: [
    {
      name: "username",
      description: "Your Minecraft username",
      required: true,
      type: 3
    }
  ]
}

const ALL_COMMANDS = [ADD_COMMAND, LIST_COMMAND, DELETE_COMMAND, TP_COMMAND, REGISTER_COMMAND];

InstallGlobalCommands(process.env.APP_ID, ALL_COMMANDS);
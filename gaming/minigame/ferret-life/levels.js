import { livingRoom, diningRoom } from "./maps.js";

export const LEVELS = [
  {
    name: "Round 1 – Living Room",
    room: livingRoom,
    unlocks: ["Dining Room"],
  },
  {
    name: "Round 2 – Dining Room",
    room: diningRoom,
    unlocks: ["Kitchen"],
  },
];

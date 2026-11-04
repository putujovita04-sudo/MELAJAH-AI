export * from "../../../shared/players.js";

import {
  MAX_PLAYERS,
  MIN_PLAYERS,
  NAME_MAX_LENGTH,
  PLAYER_PALETTE,
} from "../../../shared/players.js";

export { MAX_PLAYERS, MIN_PLAYERS, NAME_MAX_LENGTH, PLAYER_PALETTE };

export const createPlayers = ({ names = [] } = {}) =>
  names.map((name, index) => {
    const palette = PLAYER_PALETTE[index % PLAYER_PALETTE.length];
    return {
      id: `player-${index + 1}`,
      name: String(name ?? "").slice(0, NAME_MAX_LENGTH) || `Pemain ${index + 1}`,
      color: palette.color,
      soft: palette.soft,
      label: palette.label,
      gender: palette.gender,
      isComputer: false,
      position: 1,
      score: 0,
      stats: { correct: 0, near: 0, wrong: 0, answered: 0 },
    };
  });

export const getPlayerName = (players, index) => players?.[index]?.name ?? "Pemain";

import { useEffect, useRef, useState } from "react";
import { BookOpen, Landmark, MoveDown, MoveUp, Star } from "lucide-react";
import { motion } from "framer-motion";
import Pawn from "./Pawn";
import {
  BOARD_COLS,
  BOARD_SIZE,
  FINISH_TILE,
  START_TILE,
  getTileEndpointRole,
  getTileRole,
} from "../config/boardConfig";
import {
  ladderGeometry,
  pawnOffsets,
  snakeGeometry,
  tilePercent,
  tileToGrid,
} from "../utils/board";
import { cn } from "../utils/cn";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function Tile({ tile, board }) {
  const { col, row, gridRow } = tileToGrid(tile, BOARD_COLS);
  const role = getTileRole(tile);
  const endpoint = getTileEndpointRole(board, tile);
  const isFinish = tile === FINISH_TILE;
  const isStart = tile === START_TILE;

  const className = cn(
    "tile !p-0.5 sm:!p-1",
    isFinish
      ? "border-ink bg-gold"
      : isStart
        ? "border-ink bg-teal text-surface"
        : role === "question"
          ? "border-accent/70 bg-accent-soft"
          : endpoint === "ladder"
            ? "border-[#B97A0B]/70 bg-gold-soft"
            : endpoint === "snake"
              ? "border-leaf/70 bg-leaf-soft"
              : row % 2 === 0
                ? "border-ink/20 bg-surface"
                : "border-ink/15 bg-surface-2/30",
  );

  return (
    <div
      role="group"
      className={className}
      style={{ gridColumn: col + 1, gridRow }}
      aria-label={[
        `Petak ${tile}`,
        isStart ? "START" : "",
        isFinish ? "FINISH" : "",
        role === "question" ? "berisi soal" : "",
        endpoint === "ladder" ? "titik tangga" : "",
        endpoint === "snake" ? "titik ular" : "",
      ]
        .filter(Boolean)
        .join(", ")}
    >
      <span
        className={cn(
          "relative z-30 grid min-w-[1.15rem] place-items-center rounded px-0.5 font-display text-[0.5rem] font-bold leading-[0.95rem] sm:text-[0.62rem]",
          isFinish
            ? "bg-ink text-surface"
            : isStart
              ? "bg-surface text-ink"
              : "bg-surface/85 text-ink",
        )}
      >
        {tile}
      </span>

      {role === "question" && (
        <span className="relative z-30 mt-0.5 grid h-3 w-3 place-items-center rounded-sm border border-ink bg-accent text-surface sm:h-4 sm:w-4">
          <BookOpen size={8} strokeWidth={3} aria-hidden="true" />
        </span>
      )}

      {role === "start" && (
        <span className="absolute inset-x-0 bottom-0.5 z-30 text-center text-[0.36rem] font-extrabold uppercase tracking-wide sm:text-[0.46rem]">
          START
        </span>
      )}
      {role === "finish" && (
        <span className="absolute inset-0 z-30 grid place-items-center">
          <span className="grid h-4 w-4 place-items-center rounded-full border border-ink bg-surface/90 sm:h-5 sm:w-5">
            <Landmark size={9} strokeWidth={2.6} aria-hidden="true" />
          </span>
          <span className="absolute bottom-0.5 text-[0.36rem] font-extrabold uppercase tracking-wide text-ink sm:text-[0.46rem]">
            FINISH
          </span>
        </span>
      )}

      {!isStart && !isFinish && endpoint === "ladder" && (
        <span className="absolute bottom-0.5 right-0.5 z-30 grid h-3 w-3 place-items-center rounded-full bg-gold text-ink sm:h-3.5 sm:w-3.5">
          <MoveUp size={7} strokeWidth={3.5} aria-hidden="true" />
        </span>
      )}
      {!isStart && !isFinish && endpoint === "snake" && (
        <span className="absolute bottom-0.5 right-0.5 z-30 grid h-3 w-3 place-items-center rounded-full bg-leaf text-surface sm:h-3.5 sm:w-3.5">
          <MoveDown size={7} strokeWidth={3.5} aria-hidden="true" />
        </span>
      )}
    </div>
  );
}

function Snake({ item, active }) {
  const geo = snakeGeometry(item.from, item.to, BOARD_COLS);
  return (
    <g
      className={cn(active && "drop-shadow-[0_0_8px_rgba(63,122,60,0.7)]")}
      opacity={active ? 1 : 0.45}
    >
      <path d={geo.path} fill="none" stroke="#2A1B12" strokeWidth="11" strokeLinecap="round" opacity="0.9" />
      <path d={geo.path} fill="none" stroke="#3F7A3C" strokeWidth="7" strokeLinecap="round" />
      <path
        d={geo.path}
        fill="none"
        stroke="#F4C24F"
        strokeWidth="1.4"
        strokeDasharray="1.5 7"
        strokeLinecap="round"
        opacity="0.9"
      />
      <circle cx={geo.head.x} cy={geo.head.y} r="6.5" fill="#3F7A3C" stroke="#2A1B12" strokeWidth="1.7" />
      <circle cx={geo.head.x - 2.2} cy={geo.head.y - 2.2} r="1.3" fill="#FFFDF8" />
      <circle cx={geo.head.x + 2.2} cy={geo.head.y - 2.2} r="1.3" fill="#FFFDF8" />
      <circle cx={geo.tail.x} cy={geo.tail.y} r="2.4" fill="#3F7A3C" stroke="#2A1B12" strokeWidth="1.2" />
    </g>
  );
}

function Ladder({ item, active }) {
  const geo = ladderGeometry(item.from, item.to, BOARD_COLS);
  return (
    <g
      className={cn(active && "drop-shadow-[0_0_8px_rgba(244,194,79,0.95)]")}
      opacity={active ? 1 : 0.5}
    >
      {geo.rails.map((rail, index) => (
        <line
          key={`shadow-${index}`}
          x1={rail.x1}
          y1={rail.y1}
          x2={rail.x2}
          y2={rail.y2}
          stroke="#2A1B12"
          strokeWidth="4.8"
          strokeLinecap="round"
        />
      ))}
      {geo.rails.map((rail, index) => (
        <line
          key={`rail-${index}`}
          x1={rail.x1}
          y1={rail.y1}
          x2={rail.x2}
          y2={rail.y2}
          stroke="#F4C24F"
          strokeWidth="2.6"
          strokeLinecap="round"
        />
      ))}
      {geo.rungs.map((rung, index) => (
        <g key={`rung-${index}`}>
          <line
            x1={rung.x1}
            y1={rung.y1}
            x2={rung.x2}
            y2={rung.y2}
            stroke="#2A1B12"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <line
            x1={rung.x1}
            y1={rung.y1}
            x2={rung.x2}
            y2={rung.y2}
            stroke="#F4C24F"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </g>
      ))}
    </g>
  );
}

export default function Board({
  board,
  players = [],
  currentPlayerId,
  lastMove = null,
  phase = "ready",
}) {
  const [displayPositions, setDisplayPositions] = useState(() =>
    Object.fromEntries(players.map((player) => [player.id, player.position])),
  );
  const [walkingId, setWalkingId] = useState(null);
  const [activeEffect, setActiveEffect] = useState(null);
  const animatedMoveRef = useRef(lastMove?.id ?? null);
  const animatingPlayerRef = useRef(null);

  useEffect(() => {
    setDisplayPositions((previous) => {
      const next = { ...previous };
      for (const player of players) {
        if (animatingPlayerRef.current !== player.id) next[player.id] = player.position;
      }
      return next;
    });
  }, [players]);

  useEffect(() => {
    if (!lastMove || lastMove.id === animatedMoveRef.current) return undefined;
    animatedMoveRef.current = lastMove.id;

    let cancelled = false;
    const { playerId, from, to, finalPosition, effect } = lastMove;

    const run = async () => {
      animatingPlayerRef.current = playerId;
      setWalkingId(playerId);
      setActiveEffect(null);

      const direction = Math.sign(to - from);
      if (direction !== 0) {
        for (
          let position = from + direction;
          direction > 0 ? position <= to : position >= to;
          position += direction
        ) {
          if (cancelled) return;
          setDisplayPositions((previous) => ({ ...previous, [playerId]: position }));
          await sleep(155);
        }
      }

      if (effect && finalPosition !== to) {
        if (cancelled) return;
        setActiveEffect(effect);
        await sleep(620);
        if (cancelled) return;
        setDisplayPositions((previous) => ({ ...previous, [playerId]: finalPosition }));
        await sleep(420);
      } else if (finalPosition !== to) {
        setDisplayPositions((previous) => ({ ...previous, [playerId]: finalPosition }));
      }

      if (cancelled) return;
      setWalkingId(null);
      animatingPlayerRef.current = null;
      await sleep(700);
      if (!cancelled) setActiveEffect(null);
    };

    run();
    return () => {
      cancelled = true;
      animatingPlayerRef.current = null;
    };
  }, [lastMove]);

  const groups = new Map();
  for (const player of players) {
    const position = displayPositions[player.id] ?? player.position;
    if (!groups.has(position)) groups.set(position, []);
    groups.get(position).push(player);
  }

  const layouts = {};
  for (const [position, group] of groups.entries()) {
    const total = group.length;
    const point = tilePercent(position, BOARD_COLS);
    const width = total >= 3 ? 4.2 : total === 2 ? 5.2 : 6.5;
    const items = group.map((player, index) => {
      const offset = pawnOffsets(index, total, BOARD_COLS);
      return {
        player,
        width,
        left: point.left + offset.x,
        top: point.top + offset.y + 2.2,
      };
    });

    const half = width / 2;
    const minLeft = Math.min(...items.map((item) => item.left));
    const maxLeft = Math.max(...items.map((item) => item.left));
    let shift = 0;
    if (minLeft < half + 0.8) shift = half + 0.8 - minLeft;
    else if (maxLeft > 100 - half - 0.8) shift = 100 - half - 0.8 - maxLeft;

    const height = width * 1.5;
    for (const item of items) {
      const left = Math.min(100 - half - 0.8, Math.max(half + 0.8, item.left + shift));
      const top = Math.min(99.2, Math.max(height * 1.2 + 0.8, item.top));
      layouts[item.player.id] = { left, top, width };
    }
  }

  return (
    <div className="panel overflow-hidden">
      <div className="poleng h-2.5" aria-hidden="true" />
      <div className="p-2 sm:p-3">
        <div
          className="relative aspect-square w-full select-none overflow-hidden rounded bg-surface"
          role="group"
          aria-label={`Papan ular tangga 10 kali 10. ${players
            .map((player) => `${player.name} di petak ${player.position}`)
            .join(". ")}`}
        >
          <div
            className="absolute inset-0 grid gap-[2px] sm:gap-1"
            style={{
              gridTemplateColumns: `repeat(${BOARD_COLS}, minmax(0, 1fr))`,
              gridTemplateRows: `repeat(${BOARD_COLS}, minmax(0, 1fr))`,
            }}
          >
            {Array.from({ length: BOARD_SIZE }, (_, index) => index + 1).map((tile) => (
              <Tile key={tile} tile={tile} board={board} />
            ))}
          </div>

          <svg
            viewBox="0 0 1000 1000"
            className="pointer-events-none absolute inset-0 z-20 h-full w-full"
            aria-hidden="true"
          >
            {board.ladders.map((item) => (
              <Ladder
                key={`ladder-${item.from}`}
                item={item}
                active={activeEffect?.type === "ladder" && activeEffect.from === item.from}
              />
            ))}
            {board.snakes.map((item) => (
              <Snake
                key={`snake-${item.from}`}
                item={item}
                active={activeEffect?.type === "snake" && activeEffect.from === item.from}
              />
            ))}
          </svg>

          <div className="pointer-events-none absolute inset-0 z-40">
            {players.map((player) => {
              const layout = layouts[player.id];
              const isActive = player.id === currentPlayerId;
              const walking = walkingId === player.id;
              const width = `${layout?.width ?? 6.5}%`;

              return (
                <motion.div
                  key={player.id}
                  className="absolute"
                  initial={false}
                  style={{ width, zIndex: isActive ? 6 : 4 }}
                  animate={{
                    left: `${layout?.left ?? 50}%`,
                    top: `${layout?.top ?? 50}%`,
                    x: "-50%",
                    y: "-80%",
                  }}
                  transition={{ type: "spring", stiffness: 320, damping: 26 }}
                >
                  <div className="relative">
                    {isActive && (
                      <span className="absolute -top-1.5 left-1/2 z-10 -translate-x-1/2">
                        <span className="grid h-3.5 w-3.5 place-items-center rounded-full border border-ink bg-gold">
                          <Star size={7} strokeWidth={3.5} fill="#2A1B12" aria-hidden="true" />
                        </span>
                      </span>
                    )}
                    <Pawn
                      variant={player.gender}
                      color={player.color}
                      walking={walking}
                      name={player.name}
                      className="h-auto w-full drop-shadow-[0_1px_1px_rgba(42,27,18,0.4)]"
                    />
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
      <div className="poleng h-2.5" aria-hidden="true" />
    </div>
  );
}

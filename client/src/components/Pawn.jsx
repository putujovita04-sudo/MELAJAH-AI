import { motion } from "framer-motion";

const SKIN = "#E8B07B";
const SKIN_SHADE = "#D99A62";

const Pattern = () => (
  <>
    <path d="M19 60h26M18 68h28M18 76h28" stroke="#F4C24F" strokeWidth="1.6" opacity="0.8" />
    <path d="M22 61v8M29 61v8M36 61v8M43 61v8" stroke="#2A1B12" strokeWidth="0.8" opacity="0.35" />
  </>
);

const Feet = ({ walking }) => (
  <>
    <g className={walking ? "pawn-leg-a" : undefined}>
      <ellipse cx="27" cy="87" rx="5.2" ry="3.1" fill={SKIN} stroke="#2A1B12" strokeWidth="1.6" />
    </g>
    <g className={walking ? "pawn-leg-b" : undefined}>
      <ellipse cx="38" cy="87" rx="5.2" ry="3.1" fill={SKIN} stroke="#2A1B12" strokeWidth="1.6" />
    </g>
  </>
);

 function MalePawn({ color, walking }) {
  return (
    <>
      <ellipse cx="32" cy="90" rx="14" ry="3.4" fill="#2A1B12" opacity="0.16" />
      <Feet walking={walking} />
      <path
        d="M23 50c-3 10-5 22-6 34h31c-1-12-3-24-7-34Z"
        fill={color}
        stroke="#2A1B12"
        strokeWidth="2.2"
        strokeLinejoin="round"
      />
      <Pattern />
      <path d="M22 49l20 6-1 5-20-6Z" fill="#F4C24F" stroke="#2A1B12" strokeWidth="1.6" />
      <path
        d="M26 34c4-2 9-2 13 0l3 17c-6 3-13 3-19 0Z"
        fill="#FFFDF8"
        stroke="#2A1B12"
        strokeWidth="2.1"
        strokeLinejoin="round"
      />
      <path d="M30 39v10" stroke="#E8D4B4" strokeWidth="1.4" />
      <circle cx="33.5" cy="41" r="1" fill="#2A1B12" />
      <circle cx="33.5" cy="46" r="1" fill="#2A1B12" />
      <path
        d="M26 36c-5 4-7 11-8 18"
        fill="none"
        stroke={SKIN}
        strokeWidth="5.4"
        strokeLinecap="round"
      />
      <circle cx="18" cy="55" r="3" fill={SKIN} stroke="#2A1B12" strokeWidth="1.4" />
      <path
        d="M39 36c5 4 7 11 8 18"
        fill="none"
        stroke={SKIN}
        strokeWidth="5.4"
        strokeLinecap="round"
      />
      <circle cx="47" cy="55" r="3" fill={SKIN} stroke="#2A1B12" strokeWidth="1.4" />
      <rect x="29" y="31" width="7" height="5" rx="2.5" fill={SKIN} stroke="#2A1B12" strokeWidth="1.6" />
      <circle cx="32" cy="25" r="10.5" fill={SKIN} stroke="#2A1B12" strokeWidth="2.2" />
      <circle cx="21.4" cy="26" r="2.2" fill={SKIN} stroke="#2A1B12" strokeWidth="1.4" />
      <circle cx="42.6" cy="26" r="2.2" fill={SKIN} stroke="#2A1B12" strokeWidth="1.4" />
      <path d="M22 22c1-6 5-9 10-9s9 3 10 9l-1.5 2c-5-3-12-3-17 0Z" fill="#2A1B12" />
      <path
        d="M20.5 21.5c1.2-7 5.4-10.5 11.5-10.5s10.3 3.5 11.5 10.5c-7-3.4-16-3.4-23 0Z"
        fill="#FFFDF8"
        stroke="#2A1B12"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path d="M21.4 19.6c6.7-3 14.5-3 21.2 0" stroke="#F4C24F" strokeWidth="2.2" />
      <path
        d="M42 15.4c3.2.4 4.7 2.2 4.2 5.2-1.8-.4-3.3-1.4-4.2-3Z"
        fill="#FFFDF8"
        stroke="#2A1B12"
        strokeWidth="1.6"
      />
      <circle cx="28.6" cy="26" r="1.15" fill="#2A1B12" />
      <circle cx="35.4" cy="26" r="1.15" fill="#2A1B12" />
      <path d="M29.2 30c1.7 1.6 3.9 1.6 5.6 0" fill="none" stroke="#2A1B12" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="25.4" cy="29.4" r="1.5" fill="#C8401F" opacity="0.28" />
      <circle cx="38.6" cy="29.4" r="1.5" fill="#C8401F" opacity="0.28" />
      <path d="M26 63h12" stroke={SKIN_SHADE} strokeWidth="1" opacity="0.5" />
    </>
  );
}

function FemalePawn({ color, walking }) {
  return (
    <>
      <ellipse cx="32" cy="90" rx="14" ry="3.4" fill="#2A1B12" opacity="0.16" />
      <Feet walking={walking} />
      <path
        d="M22 50c-3 10-5 22-6 34h32c-1-12-3-24-7-34Z"
        fill={color}
        stroke="#2A1B12"
        strokeWidth="2.2"
        strokeLinejoin="round"
      />
      <Pattern />
      <path d="M21 49l22 6-1 5-22-6Z" fill="#F4C24F" stroke="#2A1B12" strokeWidth="1.6" />
      <path
        d="M25 33c4-3 10-3 14 0l3 18c-6 3-14 3-20 0Z"
        fill={color}
        stroke="#2A1B12"
        strokeWidth="2.1"
        strokeLinejoin="round"
      />
      <path d="M32 35v15" stroke="#F4C24F" strokeWidth="2" />
      <circle cx="32" cy="39" r="1.1" fill="#F4C24F" />
      <circle cx="32" cy="44" r="1.1" fill="#F4C24F" />
      <path
        d="M25 35c-4 4-6 10-7 17"
        fill="none"
        stroke={color}
        strokeWidth="5.6"
        strokeLinecap="round"
      />
      <circle cx="18" cy="54" r="3" fill={SKIN} stroke="#2A1B12" strokeWidth="1.4" />
      <path
        d="M39 35c4 4 6 10 7 17"
        fill="none"
        stroke={color}
        strokeWidth="5.6"
        strokeLinecap="round"
      />
      <circle cx="46" cy="54" r="3" fill={SKIN} stroke="#2A1B12" strokeWidth="1.4" />
      <path d="M24 34c-2 8-1 16 3 22" fill="none" stroke="#F4C24F" strokeWidth="2.4" opacity="0.9" />
      <rect x="29" y="30" width="7" height="5" rx="2.5" fill={SKIN} stroke="#2A1B12" strokeWidth="1.6" />
      <circle cx="32" cy="24.5" r="10.3" fill={SKIN} stroke="#2A1B12" strokeWidth="2.2" />
      <path d="M21.5 26c-1-8 3-14 10.5-14s11.5 6 10.5 14c-1.5 2-2 4-2 6-5-3-12-3-17 0 0-2-.5-4-2-6Z" fill="#2A1B12" />
      <circle cx="43" cy="13.5" r="5.6" fill="#2A1B12" stroke="#2A1B12" strokeWidth="1" />
      <g>
        <circle cx="48.5" cy="10.5" r="2.5" fill="#FFFDF8" />
        <circle cx="51" cy="14" r="2.5" fill="#F4C24F" />
        <circle cx="46" cy="15" r="2" fill="#FFFDF8" />
        <circle cx="49" cy="16.5" r="1.8" fill="#FBE1D8" />
        <circle cx="48.8" cy="13.2" r="1.5" fill="#C8401F" />
      </g>
      <circle cx="21.4" cy="25.5" r="2.1" fill="#F4C24F" stroke="#2A1B12" strokeWidth="1.2" />
      <circle cx="42.6" cy="25.5" r="2.1" fill="#F4C24F" stroke="#2A1B12" strokeWidth="1.2" />
      <circle cx="28.6" cy="25.5" r="1.15" fill="#2A1B12" />
      <circle cx="35.4" cy="25.5" r="1.15" fill="#2A1B12" />
      <path d="M29.2 29.4c1.7 1.6 3.9 1.6 5.6 0" fill="none" stroke="#2A1B12" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="25.4" cy="29" r="1.5" fill="#C8401F" opacity="0.28" />
      <circle cx="38.6" cy="29" r="1.5" fill="#C8401F" opacity="0.28" />
    </>
  );
}

export default function Pawn({
  variant = "male",
  color = "#C8401F",
  walking = false,
  name,
  className = "",
  title,
}) {
  return (
    <motion.svg
      viewBox="0 0 64 96"
      className={className}
      role={name ? "img" : undefined}
      aria-label={name ? `Bidak ${name}` : undefined}
      aria-hidden={name ? undefined : true}
      animate={walking ? { y: [0, -2, 0] } : { y: 0 }}
      transition={walking ? { duration: 0.32, repeat: Infinity, ease: "easeInOut" } : { duration: 0.2 }}
    >
      {title && <title>{title}</title>}
      {variant === "female" ? (
        <FemalePawn color={color} walking={walking} />
      ) : (
        <MalePawn color={color} walking={walking} />
      )}
    </motion.svg>
  );
}

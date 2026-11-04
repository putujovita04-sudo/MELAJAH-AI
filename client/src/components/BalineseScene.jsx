import Pawn from "./Pawn";

export default function BalineseScene({ className = "" }) {
  return (
    <div className={`relative ${className}`} aria-hidden="true">
      <svg viewBox="0 0 560 480" className="h-auto w-full" role="presentation">
        <ellipse cx="280" cy="258" rx="256" ry="216" fill="#FCEFC9" opacity="0.85" />
        <circle cx="462" cy="92" r="46" fill="#F4C24F" stroke="#2A1B12" strokeWidth="2.5" />
        <g stroke="#2A1B12" strokeWidth="2" strokeLinecap="round">
          <path d="M462 30v-14M462 154v14M400 92h-14M524 92h14M419 49l-10-10M505 135l10 10M505 49l10-10M419 135l-10 10" />
        </g>

        <g fill="#FFFDF8" stroke="#2A1B12" strokeWidth="2.2" strokeLinejoin="round">
          <path d="M62 110c-2-13 9-23 21-19 5-12 24-12 29 2 14-3 24 8 21 18Z" />
          <path d="M356 78c-1-9 7-16 15-13 4-9 17-9 21 1 10-2 17 6 15 13Z" />
        </g>

        <path d="M0 340h560v110H0Z" fill="#E6F1E1" />
        <path
          d="M22 340 138 190l76 90 74-128 92 128 66-70 92 130Z"
          fill="#D9EDE6"
          stroke="#2A1B12"
          strokeWidth="2.4"
          strokeLinejoin="round"
        />
        <path
          d="M176 340 300 160l124 180Z"
          fill="#B7DCCF"
          stroke="#2A1B12"
          strokeWidth="2.6"
          strokeLinejoin="round"
        />
        <path d="M300 160l28 48-30 26-26-26Z" fill="#DFF0EA" opacity="0.9" />
        <path d="M176 340l124-180-38 180Z" fill="#3F7A3C" opacity="0.12" />
        <g stroke="#0B6B5D" strokeWidth="2" opacity="0.4" fill="none">
          <path d="M200 318q34-20 68 0M214 300q30-18 60 0M228 282q24-14 48 0" />
        </g>

        {/* Pura meru */}
        <g>
          <ellipse cx="388" cy="333" rx="88" ry="11" fill="#2A1B12" opacity="0.12" />
          <rect x="308" y="310" width="120" height="18" rx="4" fill="#FFFDF8" stroke="#2A1B12" strokeWidth="2.4" />
          <rect x="318" y="276" width="100" height="36" rx="3" fill="#FFFDF8" stroke="#2A1B12" strokeWidth="2.4" />
          <path d="M340 312v-26h20v26Z" fill="#C8401F" stroke="#2A1B12" strokeWidth="2" />
          <path d="M377 312v-26h20v26Z" fill="#F4C24F" stroke="#2A1B12" strokeWidth="2" />
          <path
            d="M298 278q70-30 140 0-70 16-140 0Z"
            fill="#C8401F"
            stroke="#2A1B12"
            strokeWidth="2.6"
            strokeLinejoin="round"
          />
          <rect x="328" y="240" width="80" height="38" rx="3" fill="#FFFDF8" stroke="#2A1B12" strokeWidth="2.4" />
          <path d="M348 278v-24h12v24Z" fill="#0B6B5D" stroke="#2A1B12" strokeWidth="1.8" />
          <path d="M371 278v-24h12v24Z" fill="#0B6B5D" stroke="#2A1B12" strokeWidth="1.8" />
          <path
            d="M313 242q55-25 110 0-55 15-110 0Z"
            fill="#C8401F"
            stroke="#2A1B12"
            strokeWidth="2.6"
            strokeLinejoin="round"
          />
          <rect x="342" y="210" width="52" height="32" rx="3" fill="#FFFDF8" stroke="#2A1B12" strokeWidth="2.4" />
          <path
            d="M326 212q42-22 84 0-42 13-84 0Z"
            fill="#C8401F"
            stroke="#2A1B12"
            strokeWidth="2.6"
            strokeLinejoin="round"
          />
          <path d="M368 190v-18" stroke="#2A1B12" strokeWidth="3" />
          <circle cx="368" cy="169" r="6" fill="#F4C24F" stroke="#2A1B12" strokeWidth="2" />
          <path d="M336 206q32-9 64 0" stroke="#F4C24F" strokeWidth="2.2" fill="none" />
          <path d="M310 307q58-12 116 0" stroke="#F4C24F" strokeWidth="2" fill="none" />
        </g>

        {/* Candi bentar / gapura */}
        <g stroke="#2A1B12" strokeWidth="2.4" strokeLinejoin="round">
          <path d="M62 340v-78l22-24 22 24v78Z" fill="#C8401F" />
          <path d="M76 340v-72l8-10 8 10v72Z" fill="#2A1B12" opacity="0.18" />
          <path d="M84 250v-16l8-12 8 12v16Z" fill="#C8401F" />
          <path d="M74 268h44M74 296h44" stroke="#F4C24F" strokeWidth="2.2" />
          <path d="M140 340v-78l22-24 22 24v78Z" fill="#C8401F" />
          <path d="M154 340v-72l8-10 8 10v72Z" fill="#2A1B12" opacity="0.18" />
          <path d="M162 250v-16l8-12 8 12v16Z" fill="#C8401F" />
          <path d="M152 268h44M152 296h44" stroke="#F4C24F" strokeWidth="2.2" />
        </g>

        {/* Tangga menuju pura */}
        <g strokeLinecap="round">
          <path d="M203 358 285 267" stroke="#2A1B12" strokeWidth="9" />
          <path d="M229 358 311 267" stroke="#2A1B12" strokeWidth="9" />
          <path d="M203 358 285 267" stroke="#F4C24F" strokeWidth="5" />
          <path d="M229 358 311 267" stroke="#F4C24F" strokeWidth="5" />
          {[0.12, 0.28, 0.44, 0.6, 0.76, 0.9].map((t) => (
            <path
              key={t}
              d={`M${203 + (285 - 203) * t} ${358 - (358 - 267) * t} L${229 + (311 - 229) * t} ${358 - (358 - 267) * t}`}
              stroke="#2A1B12"
              strokeWidth="5"
            />
          ))}
        </g>

        {/* Ular ramah */}
        <g>
          <path
            d="M492 388c-36 6-60-24-42-46 18-22 68-6 64-38-4-32-56-18-84-35-24-15-20-38-8-48"
            fill="none"
            stroke="#2A1B12"
            strokeWidth="22"
            strokeLinecap="round"
          />
          <path
            d="M492 388c-36 6-60-24-42-46 18-22 68-6 64-38-4-32-56-18-84-35-24-15-20-38-8-48"
            fill="none"
            stroke="#3F7A3C"
            strokeWidth="15"
            strokeLinecap="round"
          />
          <path
            d="M492 388c-36 6-60-24-42-46 18-22 68-6 64-38-4-32-56-18-84-35-24-15-20-38-8-48"
            fill="none"
            stroke="#F4C24F"
            strokeWidth="2"
            strokeDasharray="2 10"
            strokeLinecap="round"
          />
          <circle cx="422" cy="221" r="17" fill="#3F7A3C" stroke="#2A1B12" strokeWidth="2.6" />
          <circle cx="416" cy="217" r="3.4" fill="#FFFDF8" />
          <circle cx="426" cy="216" r="3.4" fill="#FFFDF8" />
          <circle cx="416.5" cy="217.5" r="1.5" fill="#2A1B12" />
          <circle cx="425.5" cy="216.5" r="1.5" fill="#2A1B12" />
          <path d="M422 228c5 4 10 3 13 0" fill="none" stroke="#2A1B12" strokeWidth="2" strokeLinecap="round" />
          <path d="M409 228q-10 3-14 9M409 232q-9 5-11 11" stroke="#C8401F" strokeWidth="2" strokeLinecap="round" />
          <circle cx="462" cy="352" r="3.4" fill="#FFF6E6" />
          <circle cx="456" cy="326" r="3" fill="#FFF6E6" />
          <circle cx="431" cy="281" r="3.2" fill="#FFF6E6" />
          <circle cx="480" cy="308" r="2.6" fill="#FFF6E6" />
        </g>

        {/* Gamelan */}
        <g>
          <path d="M360 438v-54h152v54" fill="none" stroke="#2A1B12" strokeWidth="4" strokeLinejoin="round" />
          <rect x="356" y="380" width="160" height="18" rx="4" fill="#C8401F" stroke="#2A1B12" strokeWidth="2.4" />
          {[0, 1, 2, 3, 4].map((index) => (
            <rect
              key={index}
              x={370 + index * 27}
              y={388}
              width="21"
              height="10"
              rx="3"
              fill="#F4C24F"
              stroke="#2A1B12"
              strokeWidth="1.8"
            />
          ))}
          <circle cx="474" cy="415" r="22" fill="#F4C24F" stroke="#2A1B12" strokeWidth="2.4" />
          <circle cx="474" cy="415" r="7" fill="#C8401F" stroke="#2A1B12" strokeWidth="2" />
          <path d="M392 372l24-14M432 370l18-18" stroke="#2A1B12" strokeWidth="4" strokeLinecap="round" />
          <circle cx="390" cy="371" r="4" fill="#2A1B12" />
          <circle cx="431" cy="369" r="4" fill="#2A1B12" />
        </g>

        {/* Bunga kamboja */}
        <g>
          {[
            [48, 372, "#FFFDF8"],
            [292, 352, "#FFFDF8"],
            [540, 240, "#F4C24F"],
            [120, 180, "#FFFDF8"],
          ].map(([cx, cy, fill], index) => (
            <g key={index} transform={`translate(${cx} ${cy})`}>
              {[0, 72, 144, 216, 288].map((angle) => (
                <ellipse
                  key={angle}
                  cx="0"
                  cy="-6"
                  rx="4.4"
                  ry="7"
                  fill={fill}
                  stroke="#2A1B12"
                  strokeWidth="1.2"
                  transform={`rotate(${angle})`}
                />
              ))}
              <circle r="2.6" fill="#F4C24F" stroke="#2A1B12" strokeWidth="1" />
            </g>
          ))}
        </g>

        {/* Petak mulai */}
        <g>
          <rect x="190" y="401" width="104" height="47" rx="10" fill="#FFFDF8" stroke="#2A1B12" strokeWidth="2.6" />
          <text x="202" y="434" fontFamily="'Baloo 2', sans-serif" fontSize="24" fontWeight="800" fill="#2A1B12">1</text>
          <text x="222" y="431" fontFamily="Nunito, sans-serif" fontSize="10" fontWeight="800" fill="#6B4B34">MULAI</text>
          <path d="M270 419v16M270 419h12l-4 5 4 5h-12" fill="#C8401F" stroke="#2A1B12" strokeWidth="1.6" strokeLinejoin="round" />
        </g>

        <g transform="translate(368 186)">
          <rect width="42" height="26" rx="8" fill="#FFFDF8" stroke="#2A1B12" strokeWidth="2.2" />
          <text x="6" y="19" fontFamily="'Baloo 2', sans-serif" fontSize="15" fontWeight="800" fill="#C8401F">100</text>
        </g>
      </svg>

      <Pawn
        variant="male"
        color="#C8401F"
        className="absolute bottom-[11%] left-[38%] w-[8.5%] drop-shadow-[0_2px_0_rgba(42,27,18,0.2)]"
      />
      <Pawn
        variant="female"
        color="#0B6B5D"
        className="absolute bottom-[11%] left-[46%] w-[8.5%] drop-shadow-[0_2px_0_rgba(42,27,18,0.2)]"
      />
    </div>
  );
}

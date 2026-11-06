import { useEffect, useState } from "react";
import { MotionConfig } from "framer-motion";
import LandingPage from "./pages/LandingPage";
import StartPage from "./pages/StartPage";
import JoinPage from "./pages/JoinPage";
import HostPage from "./pages/HostPage";
import HostGamePage from "./pages/HostGamePage";
import PlayerGamePage from "./pages/PlayerGamePage";
import HowToPlayModal from "./components/HowToPlayModal";
import {
  clearAllSessions,
  clearHostSession,
  clearPlayerSession,
  loadHostSession,
  loadPlayerSession,
  saveHostSession,
  savePlayerSession,
} from "./utils/sessionStorage";

const readJoinCode = () => {
  if (typeof window === "undefined") return "";
  const code = new URLSearchParams(window.location.search).get("join") ?? "";
  return code.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 5);
};

const validHost = (value) => Boolean(value?.code && value?.hostToken);
const validPlayer = (value) =>
  Boolean(value?.code && value?.playerId && value?.playerToken);

export default function App() {
  const [queryCode] = useState(readJoinCode);
  const [storedHost] = useState(() => {
    const value = loadHostSession();
    return validHost(value) ? value : null;
  });
  const [storedPlayer] = useState(() => {
    const value = loadPlayerSession();
    return validPlayer(value) ? value : null;
  });

  const initialScreen = queryCode
    ? "join"
    : storedHost
      ? "host-game"
      : storedPlayer
        ? "player-game"
        : "landing";

  const [screen, setScreen] = useState(initialScreen);
  const [hostSession, setHostSession] = useState(storedHost);
  const [playerSession, setPlayerSession] = useState(storedPlayer);
  const [joinCode, setJoinCode] = useState(queryCode);
  const [howToOpen, setHowToOpen] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [screen]);

  const goHome = () => {
    clearAllSessions();
    setHostSession(null);
    setPlayerSession(null);
    setJoinCode("");
    if (typeof window !== "undefined") {
      window.history.replaceState({}, "", window.location.pathname);
    }
    setScreen("landing");
  };

  const openHostSetup = () => {
    setScreen("host-setup");
  };

  const handleSessionCreated = (result) => {
    const next = { code: result.code, hostToken: result.hostToken };
    saveHostSession(next);
    setHostSession(next);
    setPlayerSession(null);
    clearPlayerSession();
    setScreen("host-game");
  };

  const handleJoined = (result) => {
    const next = {
      code: result.code,
      playerId: result.playerId,
      playerToken: result.playerToken,
    };
    savePlayerSession(next);
    setPlayerSession(next);
    setHostSession(null);
    clearHostSession();
    setScreen("player-game");
    if (typeof window !== "undefined") {
      window.history.replaceState({}, "", window.location.pathname);
    }
  };

  const handlePlayerExit = () => {
    clearPlayerSession();
    setPlayerSession(null);
    goHome();
  };

  const handlePlayerJoinAgain = () => {
    clearPlayerSession();
    setPlayerSession(null);
    setJoinCode("");
    setScreen("join");
  };

  const handleHostNewSession = () => {
    clearHostSession();
    setHostSession(null);
    setScreen("host-setup");
  };

  return (
    <MotionConfig reducedMotion="user">
      <nav aria-label="Akses cepat">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[100] focus:rounded focus:border-2 focus:border-ink focus:bg-gold focus:px-3 focus:py-2 focus:font-bold focus:text-ink"
        >
          Lewati ke konten utama
        </a>
      </nav>

      {screen === "landing" && (
        <LandingPage
          onStart={() => setScreen("start")}
          onHost={openHostSetup}
          onHowTo={() => setHowToOpen(true)}
        />
      )}

      {screen === "start" && (
        <StartPage
          onBack={goHome}
          onHost={openHostSetup}
          onHowTo={() => setHowToOpen(true)}
        />
      )}

      {screen === "join" && (
        <JoinPage
          initialCode={joinCode}
          onBack={() => setScreen("start")}
          onJoined={handleJoined}
          onHost={openHostSetup}
        />
      )}

      {screen === "host-setup" && (
        <HostPage
          onBack={() => setScreen("start")}
          onSessionCreated={handleSessionCreated}
        />
      )}

      {screen === "host-game" && hostSession && (
        <HostGamePage
          session={hostSession}
          onHome={goHome}
          onNewSession={handleHostNewSession}
        />
      )}

      {screen === "player-game" && playerSession && (
        <PlayerGamePage
          session={playerSession}
          onHome={handlePlayerExit}
          onJoinAgain={handlePlayerJoinAgain}
        />
      )}

      <HowToPlayModal open={howToOpen} onClose={() => setHowToOpen(false)} />
    </MotionConfig>
  );
}

import { useState } from "react";
import HomeScreen from "./screens/HomeScreen";
import EditorScreen from "./screens/EditorScreen";
import PlayerScreen from "./screens/PlayScreen";

export default function App() {
  const [view, setView] = useState("home");

  return (
    <>
      {view === "home" && (
        <HomeScreen
          onCreateNew={() => {
            setView("editor");
          }}
          onLoadStory={() => {
            setView("editor");
          }}
        />
      )}

      {view === "editor" && (
        <EditorScreen 
          onHome={() => setView("home")}
          onPlay={() => setView("player")}
          />
      )}

      {view === "player" && (
        <PlayerScreen onExit={() => setView("home")} />
      )}
    </>
  );
}
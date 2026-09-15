import { useState } from "react";

import type {
  Choice,
  Scenes
} from "../components/CurrentScene";

const STORY_STORAGE_KEY = "narrative-story";

type SavedStory = {
  rootSceneId: string;
  scenes: Scenes;
};

type PlayerState = {
  story: SavedStory | null;
  scenePath: string[];
};

function createInitialPlayerState(): PlayerState {
  const story = loadSavedStory();

  return {
    story,
    scenePath: story
      ? [story.rootSceneId]
      : []
  };
}

type PlayerScreenProps = {
  onExit: () => void;
};

function loadSavedStory(): SavedStory | null {
  const savedStoryJson =
    localStorage.getItem(STORY_STORAGE_KEY);

  if (!savedStoryJson) {
    return null;
  }

  try {
    const savedStory =
      JSON.parse(savedStoryJson) as SavedStory;

    const rootSceneExists =
      savedStory.scenes?.[savedStory.rootSceneId];

    if (!rootSceneExists) {
      return null;
    }

    return savedStory;
  } catch (error) {
    console.error(
      "The saved story could not be loaded.",
      error
    );

    return null;
  }
}

export default function PlayerScreen({
  onExit
}: PlayerScreenProps) {
  const [selectedChoices, setSelectedChoices] =
    useState<Record<number, string>>({});

  const [initialPlayerState] =
    useState(createInitialPlayerState);

  const story = initialPlayerState.story;

  const [scenePath, setScenePath] =
    useState<string[]>(
      initialPlayerState.scenePath
    );

  /**
   * Handle user choice selection
   * @param choice 
   * @param sceneIndex 
   * @returns 
   */
  function handleChoice(
    choice: Choice,
    sceneIndex: number
  ) {
    if (!story) {
      return;
    }

    const nextScene =
      story.scenes[choice.nextSceneId];

    if (!nextScene) {
      console.error(
        `Scene "${choice.nextSceneId}" does not exist.`
      );

      window.alert(
        "The next scene could not be found."
      );

      return;
    }

    // Remember which choice was selected in this scene
    setSelectedChoices((previousChoices) => {
      return {
        ...previousChoices,
        [sceneIndex]: choice.id
      };
    });

    // Add next scene underneath
    setScenePath((previousPath) => [
      ...previousPath,
      choice.nextSceneId
    ]);
  }

  function handleJumpHere(sceneIndex: number) {
    setScenePath((previousPath) => {
      return previousPath.slice(0, sceneIndex + 1);
    });

    setSelectedChoices((previousChoices) => {
      const remainingChoices: Record<number, string> = {};

      Object.entries(previousChoices).forEach(
        ([indexText, choiceId]) => {
          const index = Number(indexText);

          // Keep choices made before the selected scene.
          // Clear the selected scene's choice so it can be chosen again.
          if (index < sceneIndex) {
            remainingChoices[index] = choiceId;
          }
        }
      );

      return remainingChoices;
    });
  }

  if (!story) {
    return (
      <main>
        <h1>Story Player</h1>

        <p>No saved story was found.</p>

        <button
          type="button"
          onClick={onExit}
        >
          Exit
        </button>
      </main>
    );
  }

  return (
    <main>
      <header>
        <h1>Story Player</h1>

        <button
          type="button"
          onClick={onExit}
        >
          Exit
        </button>
      </header>

      <div className="story-path">
        {scenePath.map((sceneId, sceneIndex) => {
          const scene = story.scenes[sceneId];

          if (!scene) {
            return null;
          }

          const isCurrentScene =
            sceneIndex === scenePath.length - 1;

          return (
            <section
              className="player-scene scene"
              key={`${sceneId}-${sceneIndex}`}
            >
              <div className="player-scene-header">
                <p className="player-chapter">
                  Chapter: {scene.chapter}
                </p>
              </div>

              <p className="player-story">
                {scene.storyText}
              </p>

              {!isCurrentScene && (
                <button
                  type="button"
                  className="jump-here"
                  onClick={() => {
                    handleJumpHere(sceneIndex);
                  }}
                >
                  Jump here
                </button>
              )}
              {scene.choices.length > 0 ? (
                <div className="player-choices">
                  {scene.choices.map((choice) => {
                    const selectedChoiceId =
                      selectedChoices[sceneIndex];

                    const choiceWasSelected =
                      selectedChoiceId === choice.id;

                    const anotherChoiceWasSelected =
                      selectedChoiceId !== undefined &&
                      selectedChoiceId !== choice.id;

                    return (
                      <button
                        type="button"
                        key={choice.id}
                        disabled={!isCurrentScene}
                        className={[
                          "player-choice",
                          choiceWasSelected
                            ? "selected-choice"
                            : "",
                          anotherChoiceWasSelected
                            ? "rejected-choice"
                            : ""
                        ]
                          .filter(Boolean)
                          .join(" ")}
                        onClick={() => {
                          handleChoice(
                            choice,
                            sceneIndex
                          );
                        }}
                      >
                        {choice.text || "Untitled choice"}
                      </button>
                    );
                  })}
                </div>
              ) : (
                isCurrentScene && (
                  <p className="story-ending">
                    End of this path.
                  </p>
                )
              )}
            </section>
          );
        })}
      </div>
    </main>
  );
}
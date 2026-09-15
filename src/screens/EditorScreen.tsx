import { useState } from "react";

import CurrentScene from "../components/CurrentScene";
import StoryPreview from "../components/StoryPreview";

import type {
  Choice,
  Scene,
  Scenes
} from "../components/CurrentScene";

const STORY_STORAGE_KEY = "narrative-story";
const PREVIEW_VISIBILITY_KEY =
  "narrative-story-preview-visible";

type SavedStory = {
  rootSceneId: string;
  scenes: Scenes;
};

function createNewStory(): SavedStory {
  const rootSceneId = crypto.randomUUID();

  return {
    rootSceneId,

    scenes: {
      [rootSceneId]: {
        id: rootSceneId,
        chapter: "Chapter 1",
        storyText: "",
        choices: []
      }
    }
  };
}

function loadStory(): SavedStory {
  const savedStoryJson =
    localStorage.getItem(STORY_STORAGE_KEY);

  if (!savedStoryJson) {
    return createNewStory();
  }

  try {
    const savedStory =
      JSON.parse(savedStoryJson) as SavedStory;

    const rootSceneExists =
      savedStory.scenes?.[savedStory.rootSceneId];

    if (!rootSceneExists) {
      console.error(
        "The saved story does not contain its root scene."
      );

      return createNewStory();
    }

    return savedStory;
  } catch (error) {
    console.error(
      "The saved story JSON could not be loaded.",
      error
    );

    return createNewStory();
  }
}

// const rootSceneId = crypto.randomUUID();

// const initialScenes: Scenes = {
//   [rootSceneId]: {
//     id: rootSceneId,
//     chapter: "Chapter 1",
//     storyText: "",
//     choices: []
//   }
// };

type EditorScreenProps = {
  onHome: () => void;
  onPlay: () => void;
};

export default function EditorScreen({
  onHome,
  onPlay
}: EditorScreenProps) {
  const [initialStory] =
    useState<SavedStory>(() => loadStory());

  const [scenes, setScenes] =
    useState<Scenes>(initialStory.scenes);

  const [currentSceneId, setCurrentSceneId] =
    useState<string>(initialStory.rootSceneId);

  const [sceneHistory, setSceneHistory] =
    useState<string[]>([]);

  const [isPreviewVisible, setIsPreviewVisible] =
    useState<boolean>(() => {
      const savedValue = localStorage.getItem(
        PREVIEW_VISIBILITY_KEY
      );

      /*
       * Show the preview by default when the user
       * has not previously selected a preference.
       */
      return savedValue !== "false";
    });
  function handleTogglePreview() {
    setIsPreviewVisible((previousValue) => {
      const nextValue = !previousValue;

      localStorage.setItem(
        PREVIEW_VISIBILITY_KEY,
        String(nextValue)
      );

      return nextValue;
    });
  }

  const rootSceneId = initialStory.rootSceneId;

  const currentScene = scenes[currentSceneId];

  const previewScenePath = [
    ...sceneHistory,
    currentSceneId
  ];

  function handlePreviewJump(
    sceneId: string,
    sceneIndex: number
  ) {
    if (!scenes[sceneId]) {
      console.error(
        `Scene "${sceneId}" does not exist.`
      );

      return;
    }

    /*
     * Ensure the requested index still points to the
     * expected scene.
     */
    if (previewScenePath[sceneIndex] !== sceneId) {
      console.error(
        "The preview path changed before the jump."
      );

      return;
    }

    /*
     * Everything before the selected scene becomes
     * its navigation history. Everything after it is
     * removed from the preview.
     */
    setSceneHistory(
      previewScenePath.slice(0, sceneIndex)
    );

    /*
     * Open the selected scene in CurrentScene.
     */
    setCurrentSceneId(sceneId);
  }

  function handleEditScene(sceneId: string) {
    if (!scenes[sceneId]) {
      return;
    }

    if (sceneId !== currentSceneId) {
      setSceneHistory((previousHistory) => [
        ...previousHistory,
        currentSceneId
      ]);
    }

    setCurrentSceneId(sceneId);
  }

  function handleSaveStory() {
    const storyToSave: SavedStory = {
      rootSceneId,
      scenes
    };

    const storyJson = JSON.stringify(
      storyToSave,
      null,
      2
    );

    localStorage.setItem(
      STORY_STORAGE_KEY,
      storyJson
    );

    window.alert("Story saved.");
  }

  function handleChapterChange(chapter: string) {
    setScenes((previousScenes) => {
      return {
        ...previousScenes,

        [currentSceneId]: {
          ...previousScenes[currentSceneId],
          chapter
        }
      };
    });
  }

  function handleStoryTextChange(storyText: string) {
    setScenes((previousScenes) => {
      return {
        ...previousScenes,

        [currentSceneId]: {
          ...previousScenes[currentSceneId],
          storyText
        }
      };
    });
  }

  function handleChoicesChange(choices: Choice[]) {
    setScenes((previousScenes) => {
      return {
        ...previousScenes,

        [currentSceneId]: {
          ...previousScenes[currentSceneId],
          choices
        }
      };
    });
  }

  function handleAddChoice() {
    const choiceId = crypto.randomUUID();
    const nextSceneId = crypto.randomUUID();

    const newChoice: Choice = {
      id: choiceId,
      text: "",
      nextSceneId
    };

    const newScene: Scene = {
      id: nextSceneId,
      chapter: currentScene.chapter,
      storyText: "",
      choices: []
    };

    setScenes((previousScenes) => {
      const sceneBeingEdited =
        previousScenes[currentSceneId];

      return {
        ...previousScenes,

        [currentSceneId]: {
          ...sceneBeingEdited,

          choices: [
            ...sceneBeingEdited.choices,
            newChoice
          ]
        },

        [nextSceneId]: newScene
      };
    });
  }

  function handleRemoveChoice(choiceToRemove: Choice) {
    const nextScene =
      scenes[choiceToRemove.nextSceneId];

    if (!nextScene) {
      console.error(
        `Scene "${choiceToRemove.nextSceneId}" does not exist.`
      );

      return;
    }

    // Do not allow removal when the destination scene
    // already has its own choices.
    if (nextScene.choices.length > 0) {
      window.alert(
        "This choice cannot be removed because its " +
        "next scene already contains choices."
      );

      return;
    }

    // If text has been written in the destination scene,
    // require confirmation before removing the link.
    if (nextScene.storyText.trim().length > 0) {
      const confirmed = window.confirm(
        "The next scene contains story text. " +
        "Are you sure you want to remove this choice?"
      );

      if (!confirmed) {
        return;
      }
    }

    setScenes((previousScenes) => {
      const sceneBeingEdited =
        previousScenes[currentSceneId];

      const updatedChoices =
        sceneBeingEdited.choices.filter((choice) => {
          return choice.id !== choiceToRemove.id;
        });

      return {
        ...previousScenes,

        [currentSceneId]: {
          ...sceneBeingEdited,
          choices: updatedChoices
        }
      };
    });
  }

  function handlePreviousScene() {
    if (sceneHistory.length === 0) {
      return;
    }

    const previousSceneId =
      sceneHistory[sceneHistory.length - 1];

    setCurrentSceneId(previousSceneId);

    setSceneHistory((previousHistory) => {
      return previousHistory.slice(0, -1);
    });
  }

  function handleNextScene(nextSceneId: string) {
    if (!scenes[nextSceneId]) {
      console.error(
        `Scene "${nextSceneId}" does not exist.`
      );

      return;
    }

    setSceneHistory((previousHistory) => [
      ...previousHistory,
      currentSceneId
    ]);

    setCurrentSceneId(nextSceneId);
  }

  return (
    <main>
      <h1>Story Editor</h1>

      <button
        type="button"
        onClick={handleSaveStory}
      >
        Save story
      </button>

      <button
        type="button"
        onClick={onHome}
      >
        Return Home
      </button>

      <button
        type="button"
        onClick={onPlay}
      >
        Play story
      </button>
      <br>
      </br>
      <button
        type="button"
        className="toggle-preview"
        onClick={handleTogglePreview}
        aria-expanded={isPreviewVisible}
        aria-controls="story-preview-pane"
      >
        {isPreviewVisible
          ? "Hide preview"
          : "Show preview"}
      </button>
      <div className="editor-layout">
        <section className="editor-pane">
          <CurrentScene
            sceneId={currentScene.id}
            chapter={currentScene.chapter}
            storyText={currentScene.storyText}
            choices={currentScene.choices}
            onChapterChange={handleChapterChange}
            onStoryTextChange={handleStoryTextChange}
            onChoicesChange={handleChoicesChange}
            onAddChoice={handleAddChoice}
            onNextScene={handleNextScene}
            onRemoveChoice={handleRemoveChoice}
          />

          <button
            type="button"
            onClick={handlePreviousScene}
            disabled={sceneHistory.length === 0}
          >
            Previous scene
          </button>
        </section>

        {isPreviewVisible && (
          <div id="story-preview-pane">
            <StoryPreview
              rootSceneId={rootSceneId}
              scenes={scenes}
              scenePath={previewScenePath}
              onJumpToScene={handlePreviewJump}
            />
          </div>
        )}
      </div>
    </main>
  );
}
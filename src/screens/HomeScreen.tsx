import { useState } from "react";

const STORY_STORAGE_KEY = "narrative-story";

type HomeScreenProps = {
  onCreateNew: () => void;
  onLoadStory: () => void;
};

function savedStoryExists(): boolean {
  const savedStoryJson =
    localStorage.getItem(STORY_STORAGE_KEY);

  if (!savedStoryJson) {
    return false;
  }

  try {
    const savedStory = JSON.parse(savedStoryJson);

    return Boolean(
      savedStory.rootSceneId &&
      savedStory.scenes &&
      savedStory.scenes[savedStory.rootSceneId]
    );
  } catch {
    return false;
  }
}

export default function HomeScreen({
  onCreateNew,
  onLoadStory
}: HomeScreenProps) {
  const [hasSavedStory] = useState(
    () => savedStoryExists()
  );

  function handleCreateNew() {
    if (hasSavedStory) {
      const confirmed = window.confirm(
        "Creating a new story will replace your saved story. Continue?"
      );

      if (!confirmed) {
        return;
      }
    }

    localStorage.removeItem(STORY_STORAGE_KEY);

    onCreateNew();
  }

  return (
    <main>
      <h1>Craft Your Story</h1>

      <button
        type="button"
        onClick={handleCreateNew}
      >
        Create new
      </button>

      {hasSavedStory && (
        <button
          type="button"
          onClick={onLoadStory}
        >
          Load story
        </button>
      )}

    </main>
  );
}
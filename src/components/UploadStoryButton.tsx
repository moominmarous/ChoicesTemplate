import { useRef } from "react";

import type { ChangeEvent } from "react";
import type { Scenes } from "./CurrentScene";

const STORY_STORAGE_KEY = "narrative-story";

type SavedStory = {
  rootSceneId: string;
  scenes: Scenes;
};

type UploadStoryButtonProps = {
  onStoryUploaded: () => void;
};

export default function UploadStoryButton({
  onStoryUploaded
}: UploadStoryButtonProps) {
  const fileInputRef =
    useRef<HTMLInputElement>(null);

  function handleOpenFilePicker() {
    fileInputRef.current?.click();
  }

  async function handleFileChange(
    event: ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    try {
      const storyJson = await file.text();

      const uploadedStory =
        JSON.parse(storyJson) as SavedStory;

      const rootScene =
        uploadedStory.scenes?.[
        uploadedStory.rootSceneId
        ];

      if (!uploadedStory.rootSceneId || !rootScene) {
        window.alert(
          "The selected file is not a valid story."
        );

        return;
      }

      localStorage.setItem(
        STORY_STORAGE_KEY,
        JSON.stringify(uploadedStory, null, 2)
      );

      /*
       * Tell App that the stored story changed.
       */
      onStoryUploaded();

      window.alert(
        `Story "${file.name}" uploaded.`
      );
    } catch (error) {
      console.error(
        "The story could not be uploaded.",
        error
      );

      window.alert(
        "The selected file does not contain valid story JSON."
      );
    } finally {
      /*
       * Allows the same file to be selected again.
       */
      event.target.value = "";
    }
  }

  return (
    <>
      <button
        type="button"
        className="upload-story"
        onClick={handleOpenFilePicker}
      >
        Upload story
      </button>

      <input
        ref={fileInputRef}
        type="file"
        accept=".json,application/json"
        onChange={handleFileChange}
        hidden
      />
    </>
  );
}
import type { Scenes } from "./CurrentScene";

type StoryPreviewProps = {
  rootSceneId: string;
  scenes: Scenes;
  scenePath: string[];

  onJumpToScene: (
    sceneId: string,
    sceneIndex: number
  ) => void;
};

export default function StoryPreview({
  rootSceneId,
  scenes,
  scenePath,
  onJumpToScene
}: StoryPreviewProps) {
  /*
   * Ensure the preview always has at least the root scene.
   */
  const previewPath =
    scenePath.length > 0
      ? scenePath
      : [rootSceneId];

  return (
    <aside className="story-preview">
      <h2>Story Preview</h2>

      <div className="story-path">
        {previewPath.map((sceneId, sceneIndex) => {
          const scene = scenes[sceneId];

          if (!scene) {
            return null;
          }

          const isCurrentScene =
            sceneIndex === previewPath.length - 1;
          /*
           * If another scene follows this one, find
           * the choice that connects them.
           */
          const nextSceneId =
            previewPath[sceneIndex + 1];

          const selectedChoice = nextSceneId
            ? scene.choices.find((choice) => {
              return (
                choice.nextSceneId === nextSceneId
              );
            })
            : undefined;

          return (
            <section
              className="player-scene scene"
              key={`${sceneId}-${sceneIndex}`}
            >
              <div>
                {!isCurrentScene && (
                  <button
                    type="button"
                    className="jump-here"
                    onClick={() => {
                      onJumpToScene(
                        scene.id,
                        sceneIndex
                      );
                    }}
                  >
                    Jump here
                  </button>
                )}
              </div>
              <p className="preview-scene-title">
                <strong>
                  {scene.chapter}
                </strong>
              </p>

              <p className="player-story">
                &gt; {scene.storyText ||
                  "This scene has no story text yet."}
              </p>

              {selectedChoice && (
                <div className="preview-result">
                  <p className="preview-result-label">
                    <strong>
                      Choice made:
                    </strong>
                  </p>

                  <i>
                    <p className="preview-choice-text">
                      &gt; {selectedChoice.text ||
                        "Untitled choice"}
                    </p>
                  </i>
                </div>
              )}

              {!nextSceneId &&
                scene.choices.length === 0 && (
                  <p className="story-ending">
                    End of this path.
                  </p>
                )}
            </section>
          );
        })}
      </div>
    </aside>
  );
}
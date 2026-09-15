export type Choice = {
  id: string;
  text: string;
  nextSceneId: string;
};

export type Scene = {
  id: string;
  chapter: string;
  storyText: string;
  choices: Choice[];
};

export type Scenes = Record<string, Scene>;

type CurrentSceneProps = {
  sceneId: string;
  chapter: string;
  storyText: string;
  choices: Choice[];

  onChapterChange: (chapter: string) => void;
  onStoryTextChange: (storyText: string) => void;
  onChoicesChange: (choices: Choice[]) => void;
  onAddChoice: () => void;
  onNextScene: (nextSceneId: string) => void;
  onRemoveChoice: (choice: Choice) => void;
};

export default function CurrentScene({
  sceneId,
  chapter,
  storyText,
  choices,
  onChapterChange,
  onStoryTextChange,
  onChoicesChange,
  onAddChoice,
  onNextScene,
  onRemoveChoice
}: CurrentSceneProps) {
  function updateChoiceText(
    choiceId: string,
    newText: string
  ) {
    const updatedChoices = choices.map((choice) => {
      if (choice.id === choiceId) {
        return {
          ...choice,
          text: newText
        };
      }

      return choice;
    });

    onChoicesChange(updatedChoices);
  }


  return (
    <section className="scene">
      <h2>Current Scene</h2>

      <p className="scene-id">
        Scene ID: {sceneId}
      </p>

      <div>
        <label htmlFor="chapter">
          Chapter
        </label>

        <input
          id="chapter"
          type="text"
          value={chapter}
          onChange={(event) => {
            onChapterChange(event.target.value);
          }}
        />
      </div>

      <div>
        <label htmlFor="story-text">
          Story
        </label>

        <textarea
          id="story-text"
          value={storyText}
          onChange={(event) => {
            onStoryTextChange(event.target.value);
          }}
        />
      </div>

      <div>
        <h3>Choices</h3>

        <div className="choices">
          {choices.map((choice, index) => {
            return (
              <div
                className="choice"
                key={choice.id}
              >
                <span className="choice-id">
                  &gt; {String(index + 1).padStart(2, "0")}
                </span>

                <input
                  type="text"
                  value={choice.text}
                  placeholder="Enter a choice"
                  aria-label={`Choice ${index + 1}`}
                  onChange={(event) => {
                    updateChoiceText(
                      choice.id,
                      event.target.value
                    );
                  }}
                />

                <button
                  type="button"
                  onClick={() => {
                    onNextScene(choice.nextSceneId);
                  }}
                >
                  Next scene
                </button>

                <button
                  type="button"
                  className="remove-choice"
                  onClick={() => {
                    onRemoveChoice(choice);
                  }}
                >
                  Remove choice
                </button>
                <p className="choice-id">{choice.nextSceneId}</p>
              </div>
            );
          })}

          <button
            type="button"
            className="add-choice"
            onClick={onAddChoice}
          >
            Add another choice
          </button>
        </div>
      </div>
    </section>
  );
}
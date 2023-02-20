export default function Message(props: {
  messageString: string;
  confirmSelect: { (): void };
  cancelSelect?: { (): void };
}) {
  const { messageString, confirmSelect, cancelSelect } = props;

  return (
    <section className="absolute w-full h-full flex items-center justify-center isolate bg-stone-800/60">
      <form className="grid">
        <div className="bg-white flex flex-col items-center rounded-lg p-6">
          <p>{messageString}</p>
          <div className="flex gap-2">
            <button onClick={() => confirmSelect()}>OK</button>
            {cancelSelect && (
              <button type="button" onClick={() => cancelSelect()}>
                Cancel
              </button>
            )}
          </div>
        </div>
      </form>
    </section>
  );
}
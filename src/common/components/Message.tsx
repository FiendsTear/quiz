import { useTranslation } from "next-i18next";
import { ModalWindow } from "./ModalWindow";
import Button from "./Button";

export default function Message(props: {
  messageString: string;
  confirmSelect: { (): void };
  cancelSelect?: { (): void };
}) {
  const { messageString, confirmSelect, cancelSelect } = props;
  const { t } = useTranslation("common");
  return (
    <ModalWindow exit={() => (cancelSelect ? cancelSelect() : "")}>
      <form className="grid">
        <div className="bg-white flex flex-col items-center rounded-lg p-6">
          <p>{messageString}</p>
          <div className="flex gap-2">
            <Button attr={{ onClick: () => confirmSelect() }}>{t("Ok")}</Button>
            {cancelSelect && (
              <Button attr={{ onClick: () => cancelSelect() }}>
                {t("Cancel")}
              </Button>
            )}
          </div>
        </div>
      </form>
    </ModalWindow>
  );
}

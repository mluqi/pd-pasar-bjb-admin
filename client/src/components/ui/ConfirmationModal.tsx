import { FC } from "react";
import { Modal } from "./modal";
import Button from "./button/Button";

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isConfirming?: boolean;
}

const ConfirmationModal: FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Delete",
  cancelText = "Cancel",
  isConfirming = false,
}) => {
  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-md">
      <div className="p-6 bg-white dark:bg-gray-900 rounded-lg shadow-lg">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {title}
        </h3>
        <div className="mt-2">
          <p className="text-sm text-gray-600 dark:text-gray-300">{message}</p>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" onClick={onClose} disabled={isConfirming}>
            {cancelText}
          </Button>
          <Button
            onClick={onConfirm}
            disabled={isConfirming}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmationModal;

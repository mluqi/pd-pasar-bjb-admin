import React from "react";
import Button from "../../components/ui/button/Button";

interface SuccessAnimationProps {
  message: string;
  onReset: () => void;
}

const SuccessAnimation: React.FC<SuccessAnimationProps> = ({
  message,
  onReset,
}) => {
  return (
    <div className="text-center py-10 px-4 sm:px-6 lg:px-8">
      <svg
        className="mx-auto h-20 w-20 text-green-500 animate-pulse"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1}
          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      <h2 className="mt-4 text-2xl font-bold text-gray-800 dark:text-white">
        Bukti Pembayaran Terkirim!
      </h2>
      <p className="mt-2 text-gray-600 dark:text-gray-400">{message}</p>
      <div className="mt-8">
        <Button onClick={onReset}>Lakukan Konfirmasi Lain</Button>
      </div>
    </div>
  );
};

export default SuccessAnimation;

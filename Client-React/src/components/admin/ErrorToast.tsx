import { useEffect } from "react";

interface Props {
  message: string;
  onClose: () => void;
  duration?: number;
}

export default function ErrorToast({ message, onClose, duration = 4000 }: Props) {
  useEffect(() => {
    const t = setTimeout(onClose, duration);
    return () => clearTimeout(t);
  }, [message, duration, onClose]);

  return (
    <div className="admin-toast admin-toast--error" role="alert">
      <span>{message}</span>
      <button className="admin-toast__close" onClick={onClose} aria-label="Закрити">✕</button>
    </div>
  );
}

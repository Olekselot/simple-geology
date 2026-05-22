interface Props {
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({ message, onConfirm, onCancel }: Props) {
  return (
    <div className="admin-modal-overlay" onClick={onCancel}>
      <div className="admin-modal admin-modal--confirm" onClick={(e) => e.stopPropagation()}>
        <p className="admin-confirm__msg">{message}</p>
        <div className="admin-form__actions">
          <button className="admin-btn admin-btn--secondary" type="button" onClick={onCancel}>Скасувати</button>
          <button className="admin-btn admin-btn--danger" type="button" onClick={onConfirm}>Так, видалити</button>
        </div>
      </div>
    </div>
  );
}

// Small presentational component for success/error messages.
export default function Alert({ type = 'error', message, onClose }) {
  if (!message) return null;
  return (
    <div className={`alert ${type}`}>
      {message}
      {onClose && (
        <button
          type="button"
          className="btn small secondary"
          style={{ float: 'right' }}
          onClick={onClose}
        >
          ×
        </button>
      )}
    </div>
  );
}

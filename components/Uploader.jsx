'use client';

export default function Uploader({ uploader, requireTransparent, hint }) {
  const { inputRef, previewUrl, progress, error, onInputChange, reset } = uploader;

  return (
    <div className={`uploader${requireTransparent ? ' transparent-required' : ''}`}>
      <div className={`up-preview${previewUrl ? ' show' : ''}`}>
        {previewUrl ? <img src={previewUrl} alt="" /> : null}
        <button type="button" className="up-remove" aria-label="Quitar" onClick={reset}>
          <svg className="icon" viewBox="0 0 24 24"><path d="M6 6l12 12M18 6 6 18" /></svg>
        </button>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept={requireTransparent ? 'image/png' : 'image/*'}
        style={{ display: 'none' }}
        onChange={onInputChange}
      />
      <button type="button" className="up-btn" onClick={() => inputRef.current && inputRef.current.click()}>
        <svg className="icon" viewBox="0 0 24 24"><path d="M12 16V5M8 9l4-4 4 4" /><path d="M4 15v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3" /></svg>
        {previewUrl ? 'Cambiar foto' : 'Elegir foto'}
      </button>
      <span className="up-hint">{hint || (requireTransparent ? 'Solo PNG con el fondo ya quitado.' : 'JPG o PNG, hasta 5 MB.')}</span>
      {requireTransparent && (
        <span className="up-note">¿No sabe cómo quitar el fondo? Usa remove.bg (gratis) antes de subirla.</span>
      )}
      <div className={`up-bar${progress > 0 && progress < 100 ? ' show' : ''}`}>
        <i style={{ width: `${progress}%` }} />
      </div>
      {error ? <div className="up-error form-msg error show">{error}</div> : null}
    </div>
  );
}

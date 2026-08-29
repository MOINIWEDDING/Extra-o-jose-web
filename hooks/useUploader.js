'use client';
import { useRef, useState, useCallback } from 'react';
import { uploadPhoto } from '@/lib/upload';

// opts.requireTransparent=true activa la validación de fondo transparente (fotos de producto).
export function useUploader(opts = {}) {
  const inputRef = useRef(null);
  const [url, setUrlState] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');

  const setUrl = useCallback((u) => {
    setUrlState(u || '');
    setPreviewUrl(u || '');
    setError('');
    if (inputRef.current) inputRef.current.value = '';
  }, []);

  const reset = useCallback(() => {
    setUrlState('');
    setPreviewUrl('');
    setError('');
    setProgress(0);
    if (inputRef.current) inputRef.current.value = '';
  }, []);

  const handleFile = useCallback(async (file) => {
    if (!file) return;
    setError('');
    const localUrl = URL.createObjectURL(file);
    setPreviewUrl(localUrl);
    setProgress(10);
    try {
      const publicUrl = await uploadPhoto(file, setProgress, opts);
      setUrlState(publicUrl);
      setPreviewUrl(publicUrl);
    } catch (err) {
      setError(err.message);
      setUrlState('');
      setPreviewUrl('');
      if (inputRef.current) inputRef.current.value = '';
    } finally {
      setTimeout(() => setProgress(0), 400);
    }
  }, [opts]);

  const onInputChange = useCallback((e) => {
    const file = e.target.files && e.target.files[0];
    handleFile(file);
  }, [handleFile]);

  return { inputRef, url, previewUrl, progress, error, setUrl, reset, onInputChange };
}

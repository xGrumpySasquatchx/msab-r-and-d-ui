import { useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { exportFigure } from './exportFigure';

const FORMATS = [
  { id: 'jpeg', label: '.jpeg' },
  { id: 'svg', label: '.svg' },
  { id: 'png', label: '.png' },
  { id: 'pdf', label: '.pdf' },
];

function figureTitle(anchor) {
  const card = anchor?.closest('.card');
  const title = card?.querySelector('.card-title');
  if (!title) return 'figure';
  const text = [...title.childNodes]
    .filter((node) => node.nodeType === Node.TEXT_NODE)
    .map((node) => node.textContent)
    .join(' ')
    .trim();
  return text || 'figure';
}

export default function FigureExport({ anchorRef, canvasRef }) {
  const [open, setOpen] = useState(false);
  const [host, setHost] = useState(null);
  const rootRef = useRef(null);
  const menuId = useId();

  useEffect(() => {
    setHost(anchorRef.current?.closest('.card') || null);
  }, [anchorRef]);

  useEffect(() => {
    if (!open) return undefined;
    const onPointer = (event) => {
      if (!rootRef.current?.contains(event.target)) setOpen(false);
    };
    const onKey = (event) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  if (!host) return null;

  const choose = async (format) => {
    setOpen(false);
    const canvas = canvasRef.current;
    if (!canvas) return;
    try {
      await exportFigure(canvas, format, figureTitle(anchorRef.current));
    } catch (error) {
      console.error(error);
    }
  };

  return createPortal(
    <div className="figure-export" ref={rootRef}>
      <button
        type="button"
        className="figure-export-btn"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen((value) => !value)}
      >
        Export
        <span className="figure-export-caret" aria-hidden="true" />
      </button>
      {open && (
        <ul className="figure-export-menu" id={menuId} role="listbox" aria-label="Export format">
          {FORMATS.map((format) => (
            <li key={format.id} role="none">
              <button type="button" role="option" onClick={() => choose(format.id)}>
                {format.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>,
    host,
  );
}

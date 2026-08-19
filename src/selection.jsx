import {
  createContext, useCallback, useContext, useMemo, useRef, useState,
} from 'react';

export function canonicalName(id) {
  if (id == null || id === '') return null;
  const s = String(id);
  if (s.startsWith('a-hTfR1_')) return s;
  const match = s.match(/iso_(\d+)/);
  if (match) return `a-hTfR1_iso_${match[1]}`;
  return s;
}

export function shortName(id) {
  const name = canonicalName(id) || String(id || '');
  return name.replace('a-hTfR1_iso_', 'iso_');
}

const SelectionContext = createContext(null);

export function SelectionProvider({ children }) {
  const [selected, setSelected] = useState(() => new Set());
  const openRef = useRef(null);

  const registerOpen = useCallback((fn) => {
    openRef.current = fn;
  }, []);

  const openProfile = useCallback((name) => {
    const id = canonicalName(name);
    if (id && openRef.current) openRef.current(id);
  }, []);

  const select = useCallback((ids, { additive = false } = {}) => {
    const incoming = [...new Set((Array.isArray(ids) ? ids : [ids]).map(canonicalName).filter(Boolean))];
    if (!incoming.length && additive) return;
    setSelected((prev) => {
      if (!incoming.length) return additive ? prev : new Set();
      if (!additive) return new Set(incoming);
      const next = new Set(prev);
      const allIn = incoming.every((id) => prev.has(id));
      if (allIn) incoming.forEach((id) => next.delete(id));
      else incoming.forEach((id) => next.add(id));
      return next;
    });
  }, []);

  const clear = useCallback(() => setSelected(new Set()), []);

  const has = useCallback((id) => selected.has(canonicalName(id)), [selected]);

  const value = useMemo(() => ({
    selected, select, clear, has, registerOpen, openProfile,
  }), [selected, select, clear, has, registerOpen, openProfile]);

  return (
    <SelectionContext.Provider value={value}>
      {children}
    </SelectionContext.Provider>
  );
}

export function useSelection() {
  const ctx = useContext(SelectionContext);
  if (!ctx) {
    throw new Error('useSelection must be used within SelectionProvider');
  }
  return ctx;
}

export function MoleculeRow({
  name, openOnClick = true, children, className, ...rest
}) {
  const { has, select, openProfile } = useSelection();
  const id = canonicalName(name);
  return (
    <tr
      className={[className, has(id) ? 'sel' : ''].filter(Boolean).join(' ')}
      onClick={(e) => {
        const additive = e.shiftKey || e.metaKey || e.ctrlKey;
        select([id], { additive });
        if (!additive && openOnClick) openProfile(id);
      }}
      {...rest}
    >
      {children}
    </tr>
  );
}

export function SelectionBar() {
  const { selected, clear, openProfile, select } = useSelection();
  const names = [...selected];
  if (!names.length) return null;
  return (
    <div className="sel-bar">
      <span className="sel-bar-label">{names.length} selected</span>
      <span className="sel-bar-hint">Shift/⌘-click charts or rows to add · click a chip to open profile</span>
      <div className="sel-chips">
        {names.slice(0, 12).map((n) => (
          <button
            key={n}
            type="button"
            className="sel-chip"
            onClick={() => {
              select([n]);
              openProfile(n);
            }}
          >
            {shortName(n)}
          </button>
        ))}
        {names.length > 12 && <span className="sel-more">+{names.length - 12}</span>}
      </div>
      <button type="button" onClick={clear}>Clear</button>
    </div>
  );
}

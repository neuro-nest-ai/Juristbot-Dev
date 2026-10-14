import React, { useCallback, useEffect, useId, useMemo, useState } from 'react';

/**
 * Interactive checklist. Ticks live in component state so the user can work
 * through the list; while a response is still streaming new items arrive and
 * are merged in without discarding anything already ticked.
 */
const ChecklistBlock = ({ title = 'Checklist', items = [], streaming = false }) => {
  const domId = useId().replace(/[:]/g, '');

  const [checked, setChecked] = useState(() => {
    const init = {};
    items.forEach((it) => { init[it.id] = it.defaultChecked; });
    return init;
  });

  /* Merge newly streamed items; keys already present keep the user's choice. */
  useEffect(() => {
    setChecked((prev) => {
      let changed = false;
      const next = { ...prev };
      items.forEach((it) => {
        if (!(it.id in next)) {
          next[it.id] = it.defaultChecked;
          changed = true;
        }
      });
      return changed ? next : prev;
    });
  }, [items]);

  const toggle = useCallback((id) => {
    setChecked((prev) => ({ ...prev, [id]: !prev[id] }));
  }, []);

  const done = useMemo(
    () => items.reduce((n, it) => n + (checked[it.id] ? 1 : 0), 0),
    [items, checked]
  );
  const total = items.length;
  const pct = total ? Math.round((done / total) * 100) : 0;

  if (!total) {
    return (
      <section className="rb-card rb-checklist">
        <div className="rb-card-label">{title}</div>
        <div className="rb-skeleton">{streaming ? 'Building the checklist…' : 'No items yet.'}</div>
      </section>
    );
  }

  return (
    <section className="rb-card rb-checklist" aria-label={title}>
      <header className="rb-checklist-head">
        <span className="rb-card-label">{title}</span>
        <span className="rb-checklist-count">{done} / {total} done</span>
      </header>

      <div
        className="rb-progress"
        role="progressbar"
        aria-valuenow={done}
        aria-valuemin={0}
        aria-valuemax={total}
      >
        <div className="rb-progress-fill" style={{ width: `${pct}%` }} />
      </div>

      <ul className="rb-checklist-items">
        {items.map((it) => {
          const isChecked = !!checked[it.id];
          const inputId = `${domId}-${it.id}`;
          return (
            <li key={it.id} className={`rb-checklist-item${isChecked ? ' is-done' : ''}`}>
              <input
                id={inputId}
                type="checkbox"
                className="rb-checkbox"
                checked={isChecked}
                onChange={() => toggle(it.id)}
              />
              <label htmlFor={inputId} className="rb-checklist-label">{it.label}</label>
            </li>
          );
        })}
      </ul>
    </section>
  );
};

export default React.memo(ChecklistBlock);
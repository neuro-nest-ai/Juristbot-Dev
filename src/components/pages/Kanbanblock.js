import React from 'react';

const KanbanBlock = ({ title = 'Board', columns = [], streaming = false }) => {
  if (!columns.length) {
    return (
      <section className="rb-card rb-kanban">
        <div className="rb-card-label">{title}</div>
        <div className="rb-skeleton">{streaming ? 'Building the board…' : 'No items yet.'}</div>
      </section>
    );
  }

  return (
    <section className="rb-card rb-kanban" aria-label={title}>
      <div className="rb-card-label">{title}</div>

      <div className="rb-kanban-board">
        {columns.map((col, ci) => (
          <div className="rb-kanban-col" key={`${col.title}-${ci}`}>
            <header className="rb-kanban-col-head">
              <span className="rb-kanban-col-title">{col.title}</span>
              <span className="rb-kanban-count">{col.cards.length}</span>
            </header>

            <ul className="rb-kanban-cards">
              {col.cards.map((card, i) => (
                <li
                  className={`rb-kanban-card${card.done ? ' is-done' : ''}`}
                  key={`${card.text}-${i}`}
                >
                  {card.done && <span className="rb-kanban-tick" aria-hidden="true">✓</span>}
                  <span>{card.text}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
};

export default React.memo(KanbanBlock);
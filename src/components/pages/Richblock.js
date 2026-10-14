import React from 'react';
import MermaidBlock from './Mermaidblock';
import KanbanBlock from './Kanbanblock';
import ChecklistBlock from './Checklistblock';
import MindmapBlock from './MindmapBlock';
import './chatui.css';


/** Single entry point used by the chat renderer. */
const RichBlock = ({ block }) => {
  if (!block) return null;

  switch (block.type) {
    case 'diagram':
      /* Mindmaps go to markmap so branches can be collapsed; every other
         diagram type is drawn by Mermaid. */
      if (block.kind === 'mindmap') {
        return (
          <MindmapBlock
            title={block.title}
            raw={block.raw}
            streaming={block.streaming}
          />
        );
      }
      return (
        <MermaidBlock
          kind={block.kind}
          title={block.title}
          code={block.code}
          streaming={block.streaming}
        />
      );
    case 'kanban':
      return (
        <KanbanBlock
          title={block.title}
          columns={block.columns}
          streaming={block.streaming}
        />
      );
    case 'checklist':
      return (
        <ChecklistBlock
          title={block.title}
          items={block.items}
          streaming={block.streaming}
        />
      );
    default:
      return null;
  }
};

export default RichBlock;
import Quill from 'quill';
import React, { forwardRef, useEffect, useLayoutEffect, useRef } from 'react';
import 'quill/dist/quill.snow.css';
import './text-editor.css';

// Editor is an uncontrolled React component
interface EditorProps {
  defaultValue: any;
  onTextChange: (...args: any[]) => void;
}

const Editor = forwardRef<Quill, EditorProps>(
  ({ defaultValue, onTextChange }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const defaultValueRef = useRef(defaultValue);
    const onTextChangeRef = useRef(onTextChange);

    useLayoutEffect(() => {
      onTextChangeRef.current = onTextChange;
    });

    useEffect(() => {
      const container = containerRef.current;
      if (!container) return;
      const editorContainer = container.appendChild(
        (container as HTMLElement).ownerDocument.createElement('div'),
      );
      const quill = new Quill(editorContainer, {
        modules: {
            toolbar: [
                ['bold', 'italic', 'strike'],
                [{list: 'ordered'}, {list: 'bullet'}]
            ]
        },
        theme: 'snow'
      });

      if (ref && 'current' in ref) {
        ref.current = quill;
      }

      if (defaultValueRef.current) {
        quill.setContents(defaultValueRef.current);
      }

      quill.on(Quill.events.TEXT_CHANGE, () => {
        const plainText = quill.getText().trim();
        if (plainText.length < 300) {
          onTextChangeRef.current?.(quill.getContents());
        } else {
          quill.deleteText(300, plainText.length);
        }
      });

      return () => {
        if (ref && 'current' in ref) {
          ref.current = null;
        }
        (container as HTMLElement).innerHTML = '';
      };
    }, [ref]);

    return <div className="text_editor_container" ref={containerRef}></div>;
  },
);

Editor.displayName = 'Editor';

export default Editor;
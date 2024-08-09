import React, { useEffect, useRef, useState } from 'react';
import Codemirror from 'codemirror';
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/dracula.css';
import 'codemirror/mode/javascript/javascript';
import 'codemirror/mode/python/python'
import 'codemirror/mode/clike/clike'
import 'codemirror/addon/edit/closetag';
import 'codemirror/addon/edit/closebrackets';
import '../comoponent_code/QuerPost/TextEditor.module.css'
import ACTIONS from '../actions';

export default function SyncEditor({ onCodeChange , socketRef, ...props }) {
  const editorRef = useRef(null);
  const syncRef = useRef(null);
  const [ed, setEd] = useState(null);
  const [codes, setCode] = useState(props.prog);

  useEffect(() => {
    async function init() {
      if (!editorRef.current) return;
      const newEd = Codemirror.fromTextArea(editorRef.current, {
        mode: 'python',
        theme: 'dracula',
        autoCloseTags: true,
        autoCloseBrackets: true,
        lineNumbers: true,
      });
      setEd(newEd);
      props.set(newEd);
      syncRef.current = newEd;

      syncRef.current.on('change', (instance, changes) => {
        const { origin } = changes;
        const program = instance.getValue();
        onCodeChange(program) ; 
        if (origin !== 'setValue' && socketRef.current) { // Check if socketRef.current exists
          socketRef.current.emit(ACTIONS.CODE_CHANGE, {
            roomId: props.roomId,
            code: program,
          });
        }
      });

    }
    init();
  }, [props.mode, props.prog]);
  

  useEffect(() => {
    if (socketRef.current) {
      socketRef.current.on(ACTIONS.CODE_CHANGE, ({ code }) => {
        if (code != null) {
          syncRef.current.setValue(code);
        }
      });
    }
    return ()=>{
      socketRef.current.off(ACTIONS.CODE_CHANGE)
    }
  }, [socketRef.current]); // Adding socketRef.current to dependencies

  return (
    <div
      id="o"
      className={props.tailwind}
      style={{
        height: props.h,
        width: props.w,
        overflow: 'hidden',
      }}
    >
      <textarea
        className={props.tailwind}
        ref={editorRef}
        id={props.id}
        style={{
          minHeight: props.h,
          width: props.w,
        }}
        value={codes}
      />
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import path from 'path';
import { Button, Grid } from '@mui/material';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { json } from "@codemirror/lang-json";
import css from './style.css';


function CodeEditor({ file, write }) {
  const [value, setValue] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const localStoredFile = window.localStorage.getItem(`${file.name}-cache`);
    if (localStoredFile) {
      const fileObject = JSON.parse(localStoredFile);
      setValue(fileObject.content);
      setSaved(false);
    } 
    else{
      (async () => {
        setValue(await file.text());
      })();
      setSaved(true);
    }
  }, [file]);

  const onSaveButtonClick = () => {
    // construct updated file object
    const updatedFile = new File(
      [
        value
      ],
      file.name,
      {
        type: file.type,
        lastModified: new Date()
      }
    );
    //delete localStorage data (if backend exist) -> window.localStorage.removeItem(`${file.name}-cache`);
    //call write function to save updatedFile to files.js
    write(updatedFile);
    setSaved(true);
  }

  const saveCacheToLocalStorage = (content) => {
    const fileCache = JSON.stringify({
      content: content,
      name: file.name,
      type: file.type,
      lastModified: new Date()
    });
    window.localStorage.setItem(`${file.name}-cache`, fileCache);
  }

  const onTextChange = (code) => {
    saveCacheToLocalStorage(code);
    setValue(code);
    setSaved(false);
  }


  return (
    <div className={css.editor}>
      <div className={css.title}>{path.basename(file.name)}</div>
      {
          file.type == 'text/javascript' ? 
          <CodeMirror
            value={value}
            height="300px"
            extensions={[javascript({ jsx: true })]}
            onChange={onTextChange}
          />
          :
          <CodeMirror
            value={value}
            height="100px"
            extensions={[json()]}
            onChange={onTextChange}
          />
      }
      <Grid container justifyContent="flex-end">
        {
          !saved ? 
          <Button variant="contained" onClick={onSaveButtonClick}>save</Button>
          :
          <Button disabled>save</Button>
        }
      </Grid>
    </div>
  );
}

CodeEditor.propTypes = {
  file: PropTypes.object,
  write: PropTypes.func
};

export default CodeEditor;

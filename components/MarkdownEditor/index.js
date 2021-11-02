import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import ReactMarkdown from 'react-markdown';
import path from 'path';
import { TextField, Button, Grid } from '@mui/material';
import css from './style.css';


function MarkdownEditor({ file, write }) {
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

  const onTextChange = (event) => {
    saveCacheToLocalStorage(event.target.value);
    setValue(event.target.value);
    setSaved(false);
  }


  return (
    <div className={css.editor}>

      <div className={css.title}>{path.basename(file.name)}</div>
      <ReactMarkdown children={value}></ReactMarkdown>

      <TextField id="outlined-basic" label="editing..." variant="outlined" 
          fullWidth multiline maxRows={12} value={value}
          onChange={onTextChange}/>
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

MarkdownEditor.propTypes = {
  file: PropTypes.object,
  write: PropTypes.func
};

export default MarkdownEditor;

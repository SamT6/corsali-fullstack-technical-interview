import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import PropTypes from 'prop-types';
import path from 'path';
import classNames from 'classnames';

import { listFiles } from '../files';

// Used below, these need to be registered
import MarkdownEditor from '../components/MarkdownEditor';
import PlaintextEditor from '../components/PlaintextEditor';
import CodeEditor from '../components/CodeEditior';

import IconPlaintextSVG from '../public/icon-plaintext.svg';
import IconMarkdownSVG from '../public/icon-markdown.svg';
import IconJavaScriptSVG from '../public/icon-javascript.svg';
import IconJSONSVG from '../public/icon-json.svg';

import CreateIcon from '@mui/icons-material/Create';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import {IconButton} from '@mui/material';

import css from './style.module.css';
import CreateNewFile from '../components/CreateNewFile';

const TYPE_TO_ICON = {
  'text/plain': IconPlaintextSVG,
  'text/markdown': IconMarkdownSVG,
  'text/javascript': IconJavaScriptSVG,
  'application/json': IconJSONSVG
};

function FilesTable({ files, activeFile, setActiveFile, editButtonClick, deleteButtonClick}) {
  return (
    <div className={css.files}>
      <table>
        <thead>
          <tr>
            <th> </th>
            <th>File</th>
            <th>Modified</th>
          </tr>
        </thead>
        <tbody>
          {files.map(file => (
            <tr
              key={file.name}
              className={classNames(
                css.row,
                activeFile && activeFile.name === file.name ? css.active : ''
              )}
              onClick={() => setActiveFile(file)}
            >
              <td>
                <IconButton onClick={() => deleteButtonClick(file.name)}>
                  <DeleteForeverIcon />
                </IconButton>
              </td>
              <td className={css.file}>
                <div
                  className={css.icon}
                  dangerouslySetInnerHTML={{
                    __html: TYPE_TO_ICON[file.type]
                  }}
                ></div>
                {path.basename(file.name)}
              </td>

              <td>
                {new Date(file.lastModified).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </td>
              <td>
                <IconButton onClick={editButtonClick}>
                  <CreateIcon />
                </IconButton>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

FilesTable.propTypes = {
  files: PropTypes.arrayOf(PropTypes.object),
  activeFile: PropTypes.object,
  setActiveFile: PropTypes.func
};

function Previewer({ file }) {
  const [value, setValue] = useState('');

  useEffect(() => {
    (async () => {
      setValue(await file.text());
    })();
  }, [file]);

  return (
    <div className={css.preview}>
      <div className={css.title}>{path.basename(file.name)}</div>
      <div className={css.content}>{value}</div>
    </div>
  );
}

Previewer.propTypes = {
  file: PropTypes.object
};

// Uncomment keys to register editors for media types
const REGISTERED_EDITORS = {
  "text/plain": PlaintextEditor,
  "text/markdown": MarkdownEditor,
  "text/javascript": CodeEditor,
  "application/json": CodeEditor,
};

function PlaintextFilesChallenge() {
  const [files, setFiles] = useState([]);
  const [activeFile, setActiveFile] = useState(null);
  const [edit, setEdit] = useState(false);


  useEffect(() => {
    const files = listFiles();
    // load from local storage, for changes persisting across reloads
    const updateFilesFromLocalStorage = files.map(file => {
      const localStoredFile = window.localStorage.getItem(`${file.name}-cache`);
      if (localStoredFile) {
        const fileObject = JSON.parse(localStoredFile);
        console.log(fileObject);
        return new File(
          [
            fileObject.content
          ],
          fileObject.name,
          {
            type: fileObject.type,
            lastModified: new Date(fileObject.lastModified)
          }
        );
      } 
      else{
        return file;
      }
    })

    setFiles(updateFilesFromLocalStorage);
  }, []);

  const write = file => {
    console.log('Writing soon... ', file.name);

    // Write the file to the `files` array
    const index = files.findIndex((f) => f.name == file.name);
    if(index != -1){ // file found! update a existing file
      const updatedFiles = [...files];
      updatedFiles[index] = file;
      setFiles(updatedFiles);
    }
    else{ //file not found, save a new file
      setFiles([file, ...files]);
    }
  };

  const Editor = activeFile ? REGISTERED_EDITORS[activeFile.type] : null;

  const editButtonClick = () => {
   setEdit(!edit);
  }

  const deleteButtonClick = (fileName) => {
    window.localStorage.removeItem(`${fileName}-cache`);
    const updatedFiles = files.filter(file => file.name != fileName);
    setFiles(updatedFiles);
  }


  return (
    <div className={css.page}>
      <Head>
        <title>Corsali Engineering Challenge</title>
      </Head>
      <aside>
        <header>
          <div className={css.tagline}>Corsali Engineering Challenge</div>
          <h1>Fun With Plaintext</h1>
          <div className={css.description}>
            Let{"'"}s explore files in JavaScript. What could be more fun than
            rendering and editing plaintext? Not much, as it turns out.
          </div>
        </header>

        
        <CreateNewFile write={write}/>


        <FilesTable
          files={files}
          activeFile={activeFile}
          setActiveFile={setActiveFile}
          editButtonClick={editButtonClick}
          deleteButtonClick={deleteButtonClick}
        />

        <div style={{ flex: 1 }}></div>

        <footer>
          <div className={css.link}>
            <a href="https://corsali.com/join">Corsali</a>
            &nbsp;—&nbsp;Fullstack Engineering Challenge
          </div>
          <div className={css.link}>
            Questions? Feedback? Email us at jobs@corsali.com
          </div>
        </footer>
      </aside>

      <main className={css.editorWindow}>
        {activeFile && (
          <>
            {edit  && <Editor file={activeFile} write={write} />}
            {!edit && <Previewer file={activeFile} />}
          </>
        )}

        {!activeFile && (
          <div className={css.empty}>Select a file to view or edit</div>
        )}
      </main>
    </div>
  );
}

export default PlaintextFilesChallenge;

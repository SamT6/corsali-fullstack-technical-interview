import React, { useState} from 'react';
import PropTypes from 'prop-types';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import {IconButton, Grid, Dialog, DialogActions, DialogTitle, DialogContent, Button, TextField} from '@mui/material';
import css from './style.css';


function CreateNewFile({ write }) {
    const [showDialog, setShowDialog] = useState(false);
    const [newFileName, setNewFileName] = useState("");


  const createNewFile = () => {
    let fileType = newFileName.split('.')[1];
    
    if(fileType == 'md'){
      fileType = 'text/markdown';
    }
    else if(fileType == 'js'){
      fileType = 'text/javascript';
    }
    else if(fileType == 'json'){
        fileType = 'application/json';
    }
    else{ // treat rest as txt file
      fileType = 'text/plain';
    }
    const newFile = new File(
      [
      ],
        "/" + newFileName,
      {
        type: fileType,
        lastModified: new Date()
      }
    )

    setNewFileName("");
    setShowDialog(false);
    write(newFile)
  }

  return (
    <div>
        <Grid container justifyContent="flex-end">
          <IconButton >
            <AddCircleOutlineIcon onClick={()=>setShowDialog(true)}/>
          </IconButton>
        </Grid>

        <Dialog open={showDialog} onClose={()=>setShowDialog(false)}>
          <DialogTitle>create a new file!</DialogTitle>
          <DialogContent>
          <div className={css.title}>
            Please follow the format of [file_name].[file_type], for example, hello.js.
          </div>
          <div className={css.title}>
            Supported file types are: .txt .md .js .json
          </div>
          <TextField
            autoFocus margin="dense" id="name"
            label="[file_name].[file_type]" type="text"
            fullWidth variant="standard"
            onChange={(e)=>{setNewFileName(e.target.value)}}
          />
          </DialogContent>
          <DialogActions>
            <Button type="button" onClick={createNewFile}>create</Button>
          </DialogActions>
        </Dialog>
    </div>
  );
}

CreateNewFile.propTypes = {
  write: PropTypes.func
};

export default CreateNewFile;

import React from 'react';
import Dropzone from 'react-dropzone';
import axios from 'axios';
import { updateWidth, setPageHeight, setServerImageContainerWidth } from './helpers';
import { FileMetadata } from '../../../types/platform_types';
import { Message } from '../../App';

export type FileUploaderProps = {
    flashMessage: (message: Message, duration: number) => void,
}

export type FileUploaderState = {
    serverFiles: FileMetadata[];
    clientFiles: FileMetadata[];
    pageWidth: string;
    pageHeight: string;
    serverImageContainerWidth: string;
    fileBeingViewed: FileMetadata | null;
    imageBeingCropped: FileMetadata | null;
}

class FileUploader extends React.Component<FileUploaderProps, FileUploaderState> {
    state = {
        serverFiles: [],
        clientFiles: [],
        pageWidth: "",
        pageHeight: "",
        serverImageContainerWidth: "",
        fileBeingViewed: null,
        imageBeingCropped: null,
    }
    updateWidth = updateWidth.bind(this)
    setPageHeight = setPageHeight.bind(this)
    setServerImageContainerWidth = setServerImageContainerWidth.bind(this)
    
    viewFile = (file: FileMetadata) => {
        // @ts-ignore
        if (this.state.fileBeingViewed && (file.path === this.state.fileBeingViewed.path)) {
            this.setState({
                fileBeingViewed: null,
            })
            return
        }

        if (file.type === "pdf") {
            this.setState({
                fileBeingViewed: file
            })
        } else {
            this.props.flashMessage({text: "Cannot view that file type. ", type: "error"}, 3)
        }

    }

    deleteFile = (file: FileMetadata) => {
        axios.delete(`/files/${file.name}`).then(() => {
            this.setState((state) => {
                state.serverFiles.splice(state.serverFiles.indexOf(file), 1)
                return {
                    serverFiles: state.serverFiles
                }
            })
        }).catch(() => {
            this.props.flashMessage({text: "Filed to delete file.", type: "error"}, 3)
        })
    }

    uploadFiles = () => {
        if (this.state.clientFiles.length < 1) return 

        for (let file of this.state.clientFiles as FileMetadata[]) { // THis is dumb!
            var validFilename = /^[a-z0-9_.@()-]+\.[a-z]+$/i.test(file.name);
            console.log("validFileName: ", validFilename)
            if (!validFilename) {
                this.props.flashMessage({text: "One or more filenames are invalid.", type: "error"}, 3)
                return
            }
        }

        const form = new FormData()
        
        Promise.all(this.state.clientFiles.map(async (file: FileMetadata) => {
            let blob = await fetch(file.path).then(response => response.blob())
            form.append(file.name, blob)
        })).then(() => {
            axios.post("/files", form).then(() => {
                this.setState((state) => {
                    state.clientFiles.forEach(file => {
                        URL.revokeObjectURL(file.path)
                    })
                    return {
                        clientFiles: [],
                    }
                })
                this.getServerFiles()
            }).catch(() => {
                this.props.flashMessage({text: "Upload failed, try again.", type: "error"} , 3)
            })
        }).catch(error => {
            console.log(error)
        })
    }

    handleFileNameChange = (event: React.SyntheticEvent & {target: any}) => {
        event.persist()
        this.setState((state) => {
            const indexToUpdate = state.clientFiles.findIndex(file => {
                return file.path === event.target.name
            })
            const file = state.clientFiles[indexToUpdate]
            file["name"] = event.target.value
            state.clientFiles.splice(indexToUpdate, 1, file)
            return {
                clientFiles: state.clientFiles,
            }
        })
    }


    removeClientFile = (file: FileMetadata) => {
        URL.revokeObjectURL(file.path)
        this.setState<any>((state: FileUploaderState): Partial<FileUploaderState> | undefined => {
            const rmIndex = state.clientFiles.indexOf(file)
            state.clientFiles.splice(rmIndex, 1)
            
            if (state.imageBeingCropped && (file.path === state.imageBeingCropped.path)) {
                return {
                    clientFiles: state.clientFiles,
                    imageBeingCropped: null,
                }
            } else {
                return {
                    clientFiles: state.clientFiles,
                }
            }
        })
    }

    getServerFiles = () => {
        axios.get("/files").then(response => {
            this.setState({
                serverFiles: response.data.files ? response.data.files : [],
            })
        }).catch(error => {
            console.log(error)
        })
    }

    onDropHandler = (acceptedFiles: File[]) => {
        this.setState((state) => {
            const clientFiles = state.clientFiles
            acceptedFiles.forEach(file => {
                const url = URL.createObjectURL(file) // i assume i can get a hold of the files easily from the object urls...
                const fileObj = {
                    path: url,
                    name: file.name,
                    type: file.type,
                }
                clientFiles.push(fileObj)
            })
            return {
                clientFiles: clientFiles
            }
        })
    }

    componentDidMount = () => {
        window.addEventListener("resize", this.updateWidth)
        window.addEventListener("resize", this.setPageHeight)
        this.updateWidth()
        this.setPageHeight()
        this.getServerFiles()
    }

    componentWillUnmount = () => {
        window.removeEventListener("resize", this.updateWidth)
        window.removeEventListener("resize", this.setPageHeight)
    }
    
    render() {
        return (
            <div className="Page" style={{
                height: this.state.pageHeight
            }}>
                <h3 className="Heading__3">Server Files</h3>
                <div className="FU__main-button-container">
                    <button className="FU__main-button" onClick={this.getServerFiles}><i className="material-icons">refresh</i></button>
                </div>
                <div className="FU__server-files">
                    {
                        this.state.serverFiles.map((file: FileMetadata) => {
                            let fileIcon
                            if (file.type === "pdf") {
                                fileIcon = <i className="far fa-file-pdf"></i>
                            } else if (file.type === "word") {
                                fileIcon = <i className="fas fa-file-word"></i>
                            } else if (file.type === "excel") {
                                fileIcon = <i className="fas fa-file-excel"></i>
                            } else if (file.type === "powerpoint") {
                                fileIcon = <i className="fas fa-file-powerpoint"></i>
                            } else if (file.type === "video") {
                                fileIcon = <i className="fas fa-file-video"></i>
                            } else if (file.type === "code") {
                                fileIcon = <i className="fas fa-file-code"></i>
                            } else {
                                fileIcon = <i className="fas fa-file"></i>
                            }
      
                            return (
                                <div key={file.path} className="FU__file-container">
                                    <div className="FU__file">
                                        { fileIcon }
                                        <span className="FU__file-name">{file.name}</span>
                                        <button className="FU__file-button FU__file-button--delete" onClick={() => { this.deleteFile(file); }}><i className="material-icons">clear</i></button>
                                        <button className="FU__file-button FU__file-button--view" onClick={() => { this.viewFile(file)}}><i className="material-icons">visibility</i></button>
                                        <a className="FU__file-button FU__file-button--download" href={file.path} download><i className="material-icons">cloud_download</i></a>                                    
                                    </div>
                                </div>
                            )
                        })
                    }
                </div>

                <div className="FU__main-button-container">
                    <button className="FU__main-button" onClick={this.uploadFiles}><i className="material-icons">cloud_upload</i></button>
                </div>

                <div className="FU__drop-container">

                    <Dropzone
                        onDrop={this.onDropHandler}
                        accept={["application/*", "video/*"]}>
                        {({ getRootProps, getInputProps }) => (
                            <section className="FU__drop-area">
                                <div {...getRootProps()}>
                                    <input {...getInputProps()} />
                                    <p>Drag 'n' drop some files here, or click to select files</p>
                                </div>
                            </section>
                        )}
                    </Dropzone>

                    <div className="FU__file-drop-view">
                        {
                            this.state.clientFiles.map((file: FileMetadata) => {
                                return (
                                    <div key={file.path} className="FU__file-container">
                                        <div className="FU__file">
                                            <i className="fas fa-file"></i>
                                            <input className="FU__file-name-input" name={file.path} value={file.name} onChange={this.handleFileNameChange}/>
                                            <button className="FU__file-button FU__file-button--delete" name={file.path} onClick={(e) => { this.removeClientFile(file); }}><i className="material-icons">clear</i></button>
                                        </div>
                                    </div>
                                )
                                
                            })
                        }
                    </div>

                </div>

                { this.state.fileBeingViewed &&
                    <iframe 
                        src={
                            // @ts-ignore
                            this.state.fileBeingViewed.path
                        } 
                        width="90%" 
                        height="100%" 
                        className="FU__pdf-preview"
                    >
                        This browser does not support PDFs. Please download the PDF to view it: 
                        <a href={
                            // @ts-ignore
                            this.state.fileBeingViewed.path
                        }>
                            Download PDF
                        </a>
                    </iframe>
                }

            </div>
        );
    }
}


export default FileUploader;
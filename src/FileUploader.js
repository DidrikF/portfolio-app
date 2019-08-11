import React from 'react';
import Dropzone from 'react-dropzone';
import axios from 'axios';



function updateWidth() {
    const width = (parseInt(window.innerWidth, 10) - 302) * 0.9

    this.setState({
        pageWidth: width
    })
}

function setPageHeight() {
    this.setState({
        pageHeight: document.documentElement.clientHeight
    })
}

function setServerImageContainerWidth() {
    const containerWidth = parseInt(document.getElementsByClassName("FU__server-images")[0].offsetWidth, 10)
    this.setState({
        serverImageContainerWidth: containerWidth
    })
}


class FileUploader extends React.Component {
    constructor(props) {
        super(props)

        this.updateWidth = updateWidth.bind(this)
        this.setPageHeight = setPageHeight.bind(this)
        this.setServerImageContainerWidth = setServerImageContainerWidth.bind(this)

        this.state = {
            serverFiles: [],
            clientFiles: [],
            pageWidth: "",
            pageHeight: "",
            serverImageContainerWidth: "",
            fileBeingViewed: null,
        }

        this.onDropHandler = this.onDropHandler.bind(this)
        this.viewFile = this.viewFile.bind(this)
        this.deleteFile = this.deleteFile.bind(this)

        this.uploadFiles = this.uploadFiles.bind(this)
        
        this.handleInputChange = this.handleInputChange.bind(this)
        
        this.handleFileNameChange = this.handleFileNameChange.bind(this)
        this.getServerFiles = this.getServerFiles.bind(this)

    }


    viewFile(file) {
        // if file is viewable, show it in the appropriate way.

        if (file === false || (this.state.fileBeingViewed && (file.path === this.state.fileBeingViewed.path))) {
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

    deleteFile(file) {
        // delete single file from the server with the given url
        axios.delete(`/files/${file.name}`).then(response => {
            this.setState((state, props) => {
                state.serverFiles.splice(state.serverFiles.indexOf(file), 1)
                return {
                    serverFiles: state.serverFiles
                }
            })
        }).catch(error => {
            this.props.flashMessage({text: "Filed to delete file.", type: "error"}, 3)
        })
    }

    uploadFiles() {
        if (this.state.clientFiles.length < 1) return 

        for (let file of this.state.clientFiles) {
            var validFilename = /^[a-z0-9_.@()-]+\.[a-z]+$/i.test(file.name);
            console.log("validFileName: ", validFilename)
            if (!validFilename) {
                this.props.flashMessage({text: "One or more filenames are invalid.", type: "error"}, 3)
                return
            }
        }

        const form = new FormData()
        
        Promise.all(this.state.clientFiles.map(async file => {
            let blob = await fetch(file.path).then(response => response.blob())
            console.log("blob: ", blob)

            form.append(file.name, blob)

            
        })).then(files => {
            for (var pair of form.entries()) {
                console.log(pair[0]+ ', ' + pair[1]); 
            }
    
            axios.post("/files", form).then(response => {
                this.setState((state, props) => {
                    state.clientFiles.forEach(file => {
                        URL.revokeObjectURL(file.path)
                    })
                    return {
                        clientFiles: [],
                    }
                })
                this.getServerFiles()
            }).catch(error => {
                this.props.flashMessage({text: "Upload failed, try again.", type: "error"} , 3)
            })
        }).catch(error => {
            console.log(error)
        })

        // remove urls from clientImages
    }

    handleInputChange(e) {
        const value = e.target.value
        const name = e.target.name
        this.setState({
            [name]: value,
        })
    }


    handleFileNameChange(e) {
        e.persist()
        this.setState((state, props) => {
            const indexToUpdate = state.clientFiles.findIndex(file => {
                return file.path === e.target.name
            })
            const file = state.clientFiles[indexToUpdate]
            file["name"] = e.target.value
            state.clientFiles.splice(indexToUpdate, 1, file)
            return {
                clientFiles: state.clientFiles,
            }
        })
    }


    removeClientFile(file) {
        URL.revokeObjectURL(file.path)
        this.setState((state, props) => {
            const rmIndex = state.clientFiles.indexOf(file)
            state.clientFiles.splice(rmIndex, 1)
            
            if (state.imageBeingCropped && (file.path === state.imageBeingCropped.path)) {
                return {
                    clientFiles: state.clientFiles,
                    imageBeingCropped: null,
                    cropDataUrl: null,
                }
            } else {
                return {
                    clientFiles: state.clientFiles,
                }
            }
        })
    }

    getServerFiles() {
        axios.get("/files").then(response => {
            this.setState({
                serverFiles: response.data.files ? response.data.files : [],
            })
        }).catch(error => {
            console.log(error)
        })
    }

    onDropHandler(acceptedFiles) {
        console.log("acceptedFiles: ", acceptedFiles)

        this.setState((state, props) => {
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


    componentDidMount() {

        window.addEventListener("resize", this.updateWidth)
        window.addEventListener("resize", this.setPageHeight)
        // window.addEventListener("resize", this.setServerImageContainerWidth)
        this.updateWidth()
        this.setPageHeight()
        // this.setServerImageContainerWidth()

        this.getServerFiles()
    }

    componentWillUnmount() {
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

                        this.state.serverFiles.map(file => {
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
                                        <button className="FU__file-button FU__file-button--delete" onClick={(e) => { this.deleteFile(file); }}><i className="material-icons">clear</i></button>
                                        <button className="FU__file-button FU__file-button--view" onClick={(e) => { this.viewFile(file)}}><i className="material-icons">visibility</i></button>
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
                            this.state.clientFiles.map(file => {
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
                    <iframe src={this.state.fileBeingViewed.path} width="90%" height="100%" className="FU__pdf-preview">
                        This browser does not support PDFs. Please download the PDF to view it: 
                    <a href={this.state.fileBeingViewed.path}>Download PDF</a></iframe>
                }

            </div>
        );
    }
}


export default FileUploader;
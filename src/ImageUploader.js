import React, { useEffect, useState, useRef } from 'react';
import Dropzone from 'react-dropzone';
import { evaluate } from 'mathjs'


import Cropper from 'react-cropper'
import 'cropperjs/dist/cropper.css';
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

// Try to get around this...
function setServerImageContainerWidth() {
    const containerWidth = parseInt(document.getElementsByClassName("FU__server-images")[0].offsetWidth, 10)
    this.setState({
        serverImageContainerWidth: containerWidth
    })
}


class ImageUploader extends React.Component {
    constructor(props) {
        super(props)

        this.cropper = null
        this.updateWidth = updateWidth.bind(this)
        this.setPageHeight = setPageHeight.bind(this)
        this.setServerImageContainerWidth = setServerImageContainerWidth.bind(this)

        this.state = {

            aspectRatio: "16 / 9",
            numericAspectRatio: 16 / 9,
            clientImages: [],
            serverImages: [],
            pageWidth: "",
            pageHeight: "",
            serverImageContainerWidth: "",
            imageToView: "",

            cropTimer: null, 
            imageBeingCropped: null,
            cropDataUrl: null,
        }

        this.onDropHandler = this.onDropHandler.bind(this)
        this.viewImage = this.viewImage.bind(this)
        this.deleteImage = this.deleteImage.bind(this)
        this.uploadImages = this.uploadImages.bind(this)
        this.cancelCrop = this.cancelCrop.bind(this)
        this.commitCrop = this.commitCrop.bind(this)
        this.crop = this.crop.bind(this)
        this.handleInputChange = this.handleInputChange.bind(this)
        this.setAspectRatio = this.setAspectRatio.bind(this)
        this.setImageToCrop = this.setImageToCrop.bind(this)
        this.handleImageNameInput = this.handleImageNameInput.bind(this)
        this.getServerImages = this.getServerImages.bind(this)

    }

    // upload files with react-dropzone and display mini preivew
    // previews have a delete button
    // click a preview to open in the cropper
    // select aspect ratio 
    // crop image and show a preview
    // if happy click replace, which updates the image about to be uploaded with the newly cropped image

    // When all the images are selected and cropped according to needs: click upload to upload the image to the server
    viewImage(imageUrl) {
        if (imageUrl && (imageUrl !== this.state.imageToView)) {
            this.setState({
                imageToView: imageUrl
            })
        } else {
            this.setState({
                imageToView: "",
            })
        }
    }

    // The challenge is to manage a list of files in browser memory (display them, updating them, keeping reference to them, packaging and sending them)

    deleteImage(image) {
        // delete single image from the server with the given url
        axios.delete(`/images/${image.name}`).then(response => {
            this.setState((state, props) => {
                state.serverImages.splice(state.serverImages.indexOf(image), 1)
                return {
                    serverImages: state.serverImages
                }
            })
        }).catch(error => {
            this.props.flashMessage({text: "Filed to delete image.", type: "error"}, 3)
        })
    }

    uploadImages() {
        if (this.state.clientImages.length < 1) return 

        for (let image of this.state.clientImages) {
            var validFilename = /^[a-z0-9_.@()-]+\.[png|jpg|jpeg]+$/i.test(image.name);
            console.log("validFileName: ", validFilename)
            if (!validFilename) {
                this.props.flashMessage({text: "One or more filenames are invalid.", type: "error"}, 3)
                return
            }
        }

        const form = new FormData()
        
        Promise.all(this.state.clientImages.map(async image => {
            let blob = await fetch(image.path).then(response => response.blob())
            console.log("blob: ", blob)

            form.append(image.name, blob)

            
        })).then(images => {
            for (var pair of form.entries()) {
                console.log(pair[0]+ ', ' + pair[1]); 
            }
    
            axios.post("/images", form).then(response => {
                this.setState((state, props) => {
                    state.clientImages.forEach(image => {
                        URL.revokeObjectURL(image.path)
                    })
                    return {
                        clientImages: [],
                        imageBeingCropped: null, 
                        cropDataUrl: null,
                    }
                })
                this.getServerImages()
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


    handleImageNameInput(e) {
        e.persist()
        this.setState((state, props) => {
            const indexToUpdate = state.clientImages.findIndex(image => {
                return image.path === e.target.name
            })
            const image = state.clientImages[indexToUpdate]
            image["name"] = e.target.value
            state.clientImages.splice(indexToUpdate, 1, image)
            return {
                clientImages: state.clientImages,
            }
        })
    }

    setAspectRatio(e) {
        if (e.key !== "Enter") return
        const value = e.target.value
        let ratio = evaluate(value)
        if (typeof ratio === 'number') {
            this.setState({
                numericAspectRatio: ratio
            })
        }
    }

    setImageToCrop(image) {
        this.setState({
            imageBeingCropped: image,
        })
    }


    crop() {
        if (typeof this.cropper.getCroppedCanvas() === 'undefined') return 

        this.setState((state, props) => {
            clearTimeout(state.cropTimer)
            
            const cropTimer = setTimeout(() => {
                this.setState({
                    cropDataUrl: this.cropper.getCroppedCanvas().toDataURL(), // To display the cropped image
                })
            }, 500)
            
            return {
                cropTimer: cropTimer
            }
        })
    }

    cancelCrop() {
        this.setState({
            imageBeingCropped: null,
            cropDataUrl: null,
        })
    }

    commitCrop() {
        // update the selected clientImage with the cropped version
        this.cropper.getCroppedCanvas().toBlob((blob) => {
            this.setState((state, props) => {
                const imageToReplace = state.imageBeingCropped
    
                URL.revokeObjectURL(imageToReplace.path)
                const url = URL.createObjectURL(blob)
    
                state.clientImages.splice(state.clientImages.indexOf(imageToReplace), 1, {
                    path: url,
                })
                return {
                    clientImages: state.clientImages,
                    imageBeingCropped: null,
                    cropDataUrl: null,
                }
            })

        }, "image/png")
    }

    removeClientImage(image) {
        URL.revokeObjectURL(image.path)
        this.setState((state, props) => {
            const rmIndex = state.clientImages.indexOf(image)
            state.clientImages.splice(rmIndex, 1)
            
            if (state.imageBeingCropped && (image.path === state.imageBeingCropped.path)) {
                return {
                    clientImages: state.clientImages,
                    imageBeingCropped: null,
                    cropDataUrl: null,
                }
            } else {
                return {
                    clientImages: state.clientImages,
                }
            }
        })
    }

    onDropHandler(acceptedFiles) {
        // console.log("Accepted Files: ", acceptedFiles)

        this.setState((state, props) => {
            const clientImages = state.clientImages
            const imageURLs = acceptedFiles.map(file => {
                const url = URL.createObjectURL(file) // i assume i can get a hold of the files easily from the object urls...
                const imageObj = {
                    path: url,
                    name: file.name,
                    type: file.type,
                }
                clientImages.push(imageObj)
                /*
                const img = new Image()
                img.onload(function() {
                    imageObj["width"] = this.width
                    imageObj["height"] = this.height

                    clientImages.push(imageObj)
                })
                img.src = url
                */
            })

            return {
                clientImages: clientImages
            }
        })

    }

    getServerImages() {
        axios.get("/images").then(response => {
            this.setState({
                serverImages: response.data.images ? response.data.images : [],
            })
        }).catch(error => {
            console.log(error)
        })
    }

    componentDidMount() {

        window.addEventListener("resize", this.updateWidth)
        window.addEventListener("resize", this.setPageHeight)
        window.addEventListener("resize", this.setServerImageContainerWidth)
        this.updateWidth()
        this.setServerImageContainerWidth()

        /*
        let serverImages = [
            { path: "/images/background.jpg", width: 2600, height: 2200 },
            { path: "/images/background_bw.jpg", width: 2598, height: 1204 },
            { path: "/images/background_color.jpg", width: 2598, height: 1193 },
            { path: "/images/chatapp_chat.PNG", width: 926, height: 801 },
            { path: "/images/chatapp_login.PNG", width: 869, height: 752 },
            { path: "/images/chatapp_register.PNG", width: 879, height: 756 },
            { path: "/images/codetube_frontpage.png", width: 1093, height: 868 },
            { path: "/images/coding.jpg", width: 3543, height: 2365 },
            { path: "/images/company_page.png", width: 1700, height: 1374 },
            { path: "/images/didrikfleischer_about.PNG", width: 963, height: 755 },
            { path: "/images/didrikfleischer_article.PNG", width: 903, height: 767 },
            { path: "/images/didrikfleischer_frontpage.png", width: 1658, height: 1296 },
            { path: "/images/didrikfleischer_portfolio.PNG", width: 910, height: 734 },
            { path: "/images/favicon-32x32.png", width: 32, height: 32 },
            { path: "/images/feature_channel.png", width: 894, height: 951 },
            { path: "/images/feature_editvideo.png", width: 884, height: 715 },
            { path: "/images/feature_search.png", width: 884, height: 855 },
            { path: "/images/feature_watchvideo.png", width: 868, height: 976 },
            { path: "/images/notifications.png", width: 1670, height: 1018 },
            { path: "/images/not_available.png", width: 500, height: 500 },
            { path: "/images/paxos_bank_client.png", width: 1754, height: 1338 },
            { path: "/images/paxos_benchmark.png", width: 1764, height: 1326 },
            { path: "/images/paxos_event_client.png", width: 1138, height: 847 },
            { path: "/images/paxos_goroutines.png", width: 1936, height: 1420 },
            { path: "/images/paxos_messages_functions.png", width: 1929, height: 1401 },
            { path: "/images/paxos_normal_distribution.png", width: 1634, height: 1264 },
            { path: "/images/paxos_servers_in_sync.png", width: 625, height: 608 },
            { path: "/images/portfolio_image.png", width: 1337, height: 1132 },
            { path: "/images/profile_picture.png", width: 537, height: 596 },
            { path: "/images/profile_picture_bw.jpg", width: 537, height: 596 },
            { path: "/images/profile_picture_color.jpg", width: 537, height: 596 },
            { path: "/images/TicketBeast_buytickets.png", width: 1167, height: 983 },
            { path: "/images/TicketBeast_frontpage.png", width: 1467, height: 1278 },
            { path: "/images/TicketBeast_ordersummary.png", width: 1196, height: 939 },
            { path: "/images/TicketBeast_tickets.png", width: 1228, height: 1101 },
            { path: "/images/TicketBeast_yourconcerts.png", width: 1221, height: 1017 },
            { path: "/images/under_development.png", width: 532, height: 532 },
            { path: "/images/watchlist.png", width: 1382, height: 1180 },
            { path: "/images/watchlist_frontpage.png", width: 1097, height: 869 }
        ]


        this.setState({
            serverImages: serverImages,
        })
        */

        
        this.getServerImages()
        

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
                <h3 className="Heading__3">Server Images</h3>
                <div className="FU__main-button-container">
                    <button className="FU__main-button" onClick={this.getServerImages}><i className="material-icons">refresh</i></button>
                </div>
                <div className="FU__server-images">
                    {

                        this.state.serverImages.map(image => {
                            return (
                                <div key={image.path} className="FU__img-container">
                                    <div
                                        style={{
                                            backgroundImage: `url(${image.path})`,
                                            width: (this.state.imageToView === image.path) ? this.state.serverImageContainerWidth * 0.8 : "",
                                            height: (this.state.imageToView === image.path) ? (this.state.serverImageContainerWidth * (image.height / image.width)) * 0.8 + "px" : "",
                                            backgroundSize: (this.state.imageToView === image.path) ? (`${this.state.serverImageContainerWidth * 0.8}px ${(this.state.serverImageContainerWidth * (image.height / image.width)) * 0.8}px`) : "",
                                            display: (this.state.imageToView === image.path) ? "block" : "",
                                        }}
                                        className="FU__img"
                                        onClick={() => { this.viewImage(image.path) }}
                                    >
                                        <span className="FU__image-dimensions">{`${image.width}px x ${image.height}px`}</span>
                                        <button className="FU__image-button FU__image-button--delete" onClick={(e) => { e.stopPropagation(); this.deleteImage(image); }}><i className="material-icons">clear</i></button>
                                        <a className="FU__image-button FU__image-button--download" href={image.path} download onClick={(e) => { e.stopPropagation(); }}><i className="material-icons">cloud_download</i></a>
                                        
                                    </div>
                                    <p className="FU__image-name">{image.path.split("/")[2]}</p>
                                </div>
                            )
                        })
                    }
                </div>

                <div className="FU__main-button-container">
                    <button className="FU__main-button" onClick={this.uploadImages}><i className="material-icons">cloud_upload</i></button>
                </div>

                <div className="FU__drop-container">

                    <Dropzone
                        onDrop={this.onDropHandler}
                        accept="image/*">
                        {({ getRootProps, getInputProps }) => (
                            <section className="FU__drop-area">
                                <div {...getRootProps()}>
                                    <input {...getInputProps()} />
                                    <p>Drag 'n' drop some files here, or click to select files</p>
                                </div>
                            </section>
                        )}
                    </Dropzone>

                    <div className="FU__drop-view">
                        {
                            this.state.clientImages.map(image => {
                                return (
                                    <div key={image.path} className="FU__img-container-client">
                                        <div
                                            style={{
                                                backgroundImage: `url(${image.path})`,
                                            }}
                                            className="FU__img-client"
                                            >
                                            {/*<span className="FU__image-dimensions">{`${image.width}px x ${image.height}px`}</span>*/}
                                            <button className="FU__image-button FU__image-button--delete" onClick={() => { this.removeClientImage(image) }}><i className="material-icons">clear</i></button>
                                            <button className="FU__image-button FU__image-button--crop" onClick={() => { this.setImageToCrop(image) }}><i className="material-icons">crop</i></button>
                                        </div>
                                        <input className="FU__image-name-input" name={image.path} value={image.name} onChange={this.handleImageNameInput}/>
                                    </div>
                                )
                            })
                        }
                    </div>

                </div>


                { this.state.imageBeingCropped && 
                    <React.Fragment>
                        <div className="FU__main-button-container">
                            <button className="FU__main-button" onClick={this.cancelCrop}><i className="material-icons">cancel</i></button>
                            <button className="FU__main-button" onClick={this.commitCrop}><i className="material-icons">update</i></button>
                        </div>
                        <input className="FU__cropper-aspect-ratio-input" name="aspectRatio" value={this.state.aspectRatio} onChange={this.handleInputChange} onKeyUp={this.setAspectRatio}/>
                        <Cropper
                            ref={cropper => { this.cropper = cropper; }}
                            src={this.state.imageBeingCropped ? this.state.imageBeingCropped.path : null}
                            className="FU__cropper"
                            style={{
                                width: this.state.pageWidth,// this.state.pageWidth
                                height: "500px",
                            }}
                            // Cropper.js options
                            aspectRatio={this.state.numericAspectRatio}
                            guides={false}
                            crop={this.crop}
                        />
                    </React.Fragment>
                }
                { this.state.cropDataUrl && 
                    <div className="FU__cropper-preview-container">
                        <img className="FU__cropper-preview" src={this.state.cropDataUrl} alt="cropped image" />
                    </div>
                }

                { this.state.message &&
                    <p 
                        className="FU__flash-message"
                        style={{
                            background: (this.state.message.type === "error") ? "orange" : "green",
                        }}
                    >
                        { this.state.message.text }
                    </p>
                }
            </div>
        );
    }
}


export default ImageUploader;

/*
function FileUploader(props) {
    const [files, setFiles] = useState([]);
    const [aspectRatio, setAspectRatio] = useState([]);
    const cropperRef = useRef(null);

    const { getRootProps, getInputProps } = useDropzone({
        accept: 'image/*',
        onDrop: acceptedFiles => {
            setFiles(acceptedFiles.map(file => Object.assign(file, {
                preview: URL.createObjectURL(file)
            })));
        }
    });

    const thumbs = files.map(file => (
        <div style={thumb} key={file.name}>
            <div style={thumbInner}>
                <img
                    src={file.preview}
                    style={img}
                />
            </div>
        </div>
    ));

    useEffect(() => () => {
        // Make sure to revoke the data uris to avoid memory leaks
        files.forEach(file => URL.revokeObjectURL(file.preview));
    }, [files]);

    return (
        <div>
            <section className="container">
                <div {...getRootProps({ className: 'dropzone' })}>
                    <input {...getInputProps()} />
                    <p>Drag 'n' drop some files here, or click to select files</p>
                </div>
                <aside style={thumbsContainer}>
                    {thumbs}
                </aside>
            </section>
            <Cropper
                ref={cropperRef}
                src='/images/chatapp_chat.PNG'
                className="FU__cropper"
                // Cropper.js options
                aspectRatio={aspectRatio}
                guides={false}
                crop={crop}
            />
        </div>
    );
}

*/


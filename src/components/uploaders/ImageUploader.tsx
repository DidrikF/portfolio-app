import React from 'react';
import Dropzone from 'react-dropzone';
import { evaluate } from 'mathjs'
import Cropper from 'react-cropper'
// import 'cropperjs/dist/cropper.css';
import axios from 'axios';
import { ImageMetadata } from '../../../types/platform_types';
import { updateWidth, setPageHeight } from './helpers';
import { Message } from '../../App';

export type ImageUploaderProps = {
    flashMessage: (message: Message, duration: number) => void,

}

export type ImageUploaderState = {
    aspectRatio: string;
    numericAspectRatio: number;
    clientImages: ImageMetadata[];
    serverImages: ImageMetadata[];
    pageWidth: string;
    pageHeight: string;
    serverImageContainerWidth: number;
    imageToView: string;
    cropTimer: any; 
    imageBeingCropped: ImageMetadata | null;
    cropDataUrl: string | undefined;
}


class ImageUploader extends React.Component<ImageUploaderProps, ImageUploaderState> {
    state = {
        aspectRatio: "16 / 9",
        numericAspectRatio: 16 / 9,
        clientImages: [],
        serverImages: [],
        pageWidth: "",
        pageHeight: "",
        serverImageContainerWidth: 0,
        imageToView: "",
        cropTimer: null, 
        imageBeingCropped: null,
        cropDataUrl: undefined
    }
    
    cropper: any = null
    updateWidth = updateWidth.bind(this)
    setPageHeight = setPageHeight.bind(this)
    // setServerImageContainerWidth = setServerImageContainerWidth.bind(this)

    viewImage = (imageUrl: string) => {
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

    deleteImage = (image: ImageMetadata) => {
        // delete single image from the server with the given url
        axios.delete(`/images/${image.name}`).then(() => {
            this.setState((state) => {
                state.serverImages.splice(state.serverImages.indexOf(image), 1)
                return {
                    serverImages: state.serverImages
                }
            })
        }).catch(() => {
            this.props.flashMessage({text: "Filed to delete image.", type: "error"}, 3)
        })
    }

    uploadImages = () => {
        if (this.state.clientImages.length < 1) return 

        for (let image of this.state.clientImages as ImageMetadata[]) {
            var validFilename = /^[a-z0-9_.@()-]+\.[png|jpg|jpeg]+$/i.test(image.name);
            if (!validFilename) {
                this.props.flashMessage({text: "One or more filenames are invalid.", type: "error"}, 3)
                return
            }
        }

        const form = new FormData()
        Promise.all(this.state.clientImages.map(async (image: ImageMetadata) => {
            let blob = await fetch(image.path).then(response => response.blob())
            form.append(image.name, blob)
        })).then(() => {
            /*
            for (var pair of form.entries()) {
                console.log(pair[0]+ ', ' + pair[1]); 
            }
            */
            axios.post("/images", form).then(() => {
                this.setState((state) => {
                    state.clientImages.forEach(image => {
                        URL.revokeObjectURL(image.path)
                    })
                    return {
                        clientImages: [],
                        imageBeingCropped: null, 
                        cropDataUrl: undefined,
                    }
                })
                this.getServerImages()
            }).catch(() => {
                this.props.flashMessage({text: "Upload failed, try again.", type: "error"} , 3)
            })
        }).catch(error => {
            console.log(error)
        })
    }

    handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const name = event.target.name as 'aspectRatio' | 'pageWidth' | 'pageHeight' | 'imageToView' | 'cropDataUrl';
        const value = event.target.value as string;
        this.setState({
            [name]: value,
        } as Pick<ImageUploaderState, ('aspectRatio' | 'pageWidth' | 'pageHeight' | 'imageToView' | 'cropDataUrl')>)
    }

    handleImageNameInput = (event: React.SyntheticEvent & {target: any}) => {
        event.persist()
        this.setState((state) => {
            const indexToUpdate = state.clientImages.findIndex(image => {
                return image.path === event.target.name
            })
            const image = state.clientImages[indexToUpdate]
            image["name"] = event.target.value
            state.clientImages.splice(indexToUpdate, 1, image)
            return {
                clientImages: state.clientImages,
            }
        })
    }

    setAspectRatio = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key !== "Enter") return
        const value = (event.target as any).value
        let ratio = evaluate(value)
        if (typeof ratio === 'number') {
            this.setState({
                numericAspectRatio: ratio
            })
        }
    }

    setImageToCrop = (image: ImageMetadata) => {
        this.setState({
            imageBeingCropped: image,
        })
    }


    crop = () => {
        if (this.cropper && typeof this.cropper.getCroppedCanvas() === 'undefined') return 

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

    cancelCrop = () => {
        this.setState({
            imageBeingCropped: null,
            cropDataUrl: undefined,
        })
    }

    commitCrop = () => {
        if (!this.cropper) return;

        this.cropper.getCroppedCanvas().toBlob((blob: Blob) => {
            this.setState<any>((state: ImageUploaderState): Partial<ImageUploaderState> | undefined => {
                const imageToReplace = state.imageBeingCropped
                if (imageToReplace) {
                    URL.revokeObjectURL(imageToReplace.path)
                    const url = URL.createObjectURL(blob)
        
                    state.clientImages.splice(state.clientImages.indexOf(imageToReplace), 1, {
                        path: url,
                        name: "",
                        type: "image",
                        width: 100,
                        height: 100,
                    })
                    return {
                        clientImages: state.clientImages,
                        imageBeingCropped: null,
                        cropDataUrl: undefined,
                    }
                }
                return undefined;
            })
        }, "image/png")
    }

    removeClientImage = (image: ImageMetadata) => {
        URL.revokeObjectURL(image.path)
        this.setState<any>((state: ImageUploaderState): Partial<ImageUploaderState> | undefined => {
            const rmIndex = state.clientImages.indexOf(image)
            state.clientImages.splice(rmIndex, 1)
            
            if (state.imageBeingCropped && (image.path === state.imageBeingCropped.path)) {
                return {
                    clientImages: state.clientImages,
                    imageBeingCropped: null,
                    cropDataUrl: undefined,
                }
            } else {
                return {
                    clientImages: state.clientImages,
                }
            }
        })
    }
    onDropHandler = (acceptedFiles: File[], rejectedFiles: File[]) => {
        this.setState((state) => {
            const clientImages = state.clientImages
            acceptedFiles.forEach(file => {
                const url = URL.createObjectURL(file) // i assume i can get a hold of the files easily from the object urls...
                const imageObj = {
                    path: url,
                    name: file.name,
                    type: file.type,
                    width: 100,
                    height: 100,
                }
                clientImages.push(imageObj)
                /* What is this stuff?
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

    getServerImages = () => {
        axios.get("/images").then(response => {
            this.setState({
                serverImages: response.data.images ? response.data.images : [],
            })
        }).catch(error => {
            console.log(error)
        })
    }

    componentDidMount = () => {
        window.addEventListener("resize", this.updateWidth)
        window.addEventListener("resize", this.setPageHeight)
        // window.addEventListener("resize", this.setServerImageContainerWidth)
        this.updateWidth()
        // this.setServerImageContainerWidth()        
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
                        this.state.serverImages.map((image: ImageMetadata)  => {
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
                            this.state.clientImages.map((image: ImageMetadata) => {
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
                        {/*
                        // @ts-ignore*/}
                        <Cropper 
                            ref={(cropper: any) => { this.cropper = cropper; }}
                            // @ts-ignore
                            src={this.state.imageBeingCropped ? this.state.imageBeingCropped.path : undefined}
                            className="FU__cropper"
                            style={{
                                width: this.state.pageWidth,// this.state.pageWidth
                                height: "500px",
                            }}
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
            </div>
        );
    }
}


export default ImageUploader;

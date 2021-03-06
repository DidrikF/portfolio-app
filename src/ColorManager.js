import React from 'react'
import axios from 'axios';
import { SketchPicker } from 'react-color'


class ColorManager extends React.Component {
    constructor(props) {
        super(props)
        
        this.state = {
            colorPallets: [],
            editing: false,

            activePallet: -1,
            activeColor: -1,

            showColorPicker: false,
            colorPickerColor: "",
            colorPickerState: {},
        }

        this.toggleEditing = this.toggleEditing.bind(this)
        this.handleColorChange = this.handleColorChange.bind(this)
        this.addColor = this.addColor.bind(this)
        this.deleteColor = this.deleteColor.bind(this)
        this.addColorPallet = this.addColorPallet.bind(this)
        this.deleteColorPallet = this.deleteColorPallet.bind(this)
        this.saveColorPallets = this.saveColorPallets.bind(this)
        this.handleColorClick = this.handleColorClick.bind(this)
    }

    toggleEditing() {
        this.setState((state, props) => {
            if (state.editing === true) {
                return {
                    activePallet: -1,
                    activeColor: -1,
                    showColorPicker: false,
                    editing: !state.editing,
                }
            } else {
                return {
                    editing: !state.editing,
                }
            }

        })
    }

    chooseColorHandler(e, colorPalletIndex, colorIndex) {
        // open the pallet (with add button)
        this.setState({
            activePallet: colorPalletIndex,
            activeColor: colorIndex,
            showColorPicker: true,
        })
    }

    handleColorChange(color) {
        this.setState((state, props) => {
            if ((state.activePallet >= 0) && (state.activeColor >= 0)) {
                state.colorPallets[state.activePallet][state.activeColor]["hex"] = color.hex
            }
            return {
                colorPallets: state.colorPallets,

                colorPickerColor: color.hex,
                colorPickerState: color
            }
        })
    }

    addColor(colorPalletIndex) {
        this.setState((state, props) => {
            const color = {
                hex: "#000",
            }
            const newLen = state.colorPallets[colorPalletIndex].push(color)
            return { 
                colorPallets: state.colorPallets,
                activePallet: colorPalletIndex,
                editing: true,
                activeColor: newLen - 1,
                showColorPicker: true,
            }
        })
    }

    deleteColor(colorPalletIndex, colorIndex) {
        this.setState((state, props) => {
            state.colorPallets[colorPalletIndex].splice(colorIndex, 1)
            return {
                colorPallets: state.colorPallets,
            }
        })
    }

    addColorPallet() {
        this.setState((state, props) => {
            const colorPallet = []
            state.colorPallets.push(colorPallet)
            return {
                colorPallets: state.colorPallets,
            }
        })
    }

    deleteColorPallet(colorPalletIndex) {
        this.setState((state, props) => {
            state.colorPallets.splice(colorPalletIndex, 1)
            return {
                colorPallets: state.colorPallets,
            }
        })
    }

    clickCopyHandler(colorPalletIndex, colorIndex) {
        const color = this.state.colorPallets[colorPalletIndex][colorIndex].hex
        navigator.clipboard.writeText(color).then(() => {
            this.props.flashMessage({text: `"${color}" was written to the clipboard`, type: "success" }, 3)
        }).catch(() => {
            this.props.flashMessage({text: `Failed to write "${color}" to the clipboard`, type: "success" }, 3)
        })
    }

    handleColorClick(e, colorPalletIndex, colorIndex) {
        if (this.state.editing) {
            this.chooseColorHandler(e, colorPalletIndex, colorIndex)
        } else {
            this.clickCopyHandler(colorPalletIndex, colorIndex)
        }
    }

    loadColorPallets() {
        axios.get("/colors").then(response => {
            if (response.data && Array.isArray(response.data.pallets)) {
                this.setState({
                    colorPallets: response.data.pallets
                })
            }
        }).catch(error => {
            this.props.flashMessage({text: "Failed to load color pallets, please reload the app.", type: "error"})
        })
    }

    saveColorPallets() {
        axios.put(`/colors`, this.state.colorPallets).then(response => {
            if (response.data && Array.isArray(response.data)) {
                this.setState({
                    colorPallets: response.data
                })
            }
            this.props.flashMessage({text: "Successfully saved pallets!", type: "success"}, 3);
        }).catch(error => {
            this.props.flashMessage({text: "Failed to save color pallets, please try again.", type: "error"}, 3)
        })
    }

    // No post or delete for colorPallets

    componentDidMount() {
        this.loadColorPallets()
    }


    render() {
        return (
            <div className="SN__container">
                <p className="SN__menu-title">COLOR MANAGER</p>
                <div className='SN__widget'> {/* Section__toolbarMenu */}
                    <div 
                        className="CP__container"
                        style={{
                            border: this.state.editing ? "1px dashed #EFF3F8" : "",
                        }}
                    >

                        { this.state.colorPallets.map((colorPallet, colorPalletIndex) => {
                            const pallet = colorPallet.map((color, colorIndex) => {
                                return (
                                    <div 
                                        key={colorIndex}
                                        className="CP__color" 
                                        style={{
                                            background: color.hex
                                        }}
                                        onClick={(e) => this.handleColorClick(e, colorPalletIndex, colorIndex) }
                                    >
                                        <i className="FU__color-button--delete material-icons" onClick={(e) => { e.stopPropagation(); this.deleteColor(colorPalletIndex, colorIndex)}}>delete</i>
                                    </div>
                                )
                            })
                            return (
                                <div className="CP__pallet"key={colorPalletIndex}>
                                    { pallet }
                                    <button className="SN__button SN__add-button" onClick={() => this.addColor(colorPalletIndex)}>
                                        <i className="material-icons">add_box</i>
                                    </button>
                                    <button className="SN__button SN__delete-button" onClick={() => {this.deleteColorPallet(colorPalletIndex)}}>
                                        <i className="material-icons">delete</i> {/* Delete pallet */}
                                    </button>
                                </div>
                            )})
                        }

                        <button className="SN__button SN__edit-button" onClick={this.toggleEditing}>
                            <i className="material-icons">edit</i>
                        </button>              

                        <button className="SN__button-normal SN__button--create" onClick={this.addColorPallet}>New Pallet</button>
                        <button className="SN__button-normal SN__button--create" onClick={this.saveColorPallets}>Save Pallets</button>

                        {this.state.showColorPicker &&
                            <SketchPicker
                                className="Page__color-pallet"
                                color={this.state.colorPickerState}
                                onChangeComplete={this.handleColorChange}
                            />
                        }
                    </div>
                </div>
            </div>

        )
    }
}


export default ColorManager
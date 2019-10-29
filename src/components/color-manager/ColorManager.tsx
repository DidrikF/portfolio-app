import React from 'react'
import axios from 'axios';
import { SketchPicker, ColorResult } from 'react-color'

import { ColorPallet } from '../../../types/platform_types';
import { Message } from '../../App';

export type ColorManagerProps = {
    flashMessage: (message: Message, duration: number) => void;
}


export type ColorManagerState = {
    colorPallets: ColorPallet[]; 
    editing: boolean;
    activePallet: number;
    activeColor: number;
    showColorPicker: boolean;
    colorPickerColor: string;
    colorPickerState: any;
}

class ColorManager extends React.Component<ColorManagerProps, ColorManagerState> {
    constructor(props: ColorManagerProps) {
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
        this.setState<any>((state: ColorManagerState): Partial<ColorManagerState> => {
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

    chooseColorHandler(event: React.MouseEvent<HTMLElement>, colorPalletIndex: number, colorIndex: number) {
        // open the pallet (with add button)
        this.setState({
            activePallet: colorPalletIndex,
            activeColor: colorIndex,
            showColorPicker: true,
        })
    }

    handleColorChange(color: ColorResult) {
        this.setState((state) => {
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

    addColor(colorPalletIndex: number) {
        this.setState((state) => {
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

    deleteColor(colorPalletIndex: number, colorIndex: number) {
        this.setState((state) => {
            state.colorPallets[colorPalletIndex].splice(colorIndex, 1)
            return {
                colorPallets: state.colorPallets,
            }
        })
    }

    addColorPallet() {
        this.setState((state) => {
            const colorPallet: ColorPallet = [];
            state.colorPallets.push(colorPallet)
            return {
                colorPallets: state.colorPallets,
            }
        })
    }

    deleteColorPallet(colorPalletIndex: number) {
        this.setState((state) => {
            state.colorPallets.splice(colorPalletIndex, 1)
            return {
                colorPallets: state.colorPallets,
            }
        })
    }

    clickCopyHandler(colorPalletIndex: number, colorIndex: number) {
        const color = this.state.colorPallets[colorPalletIndex][colorIndex].hex
        navigator.clipboard.writeText(color).then(() => {
            this.props.flashMessage({text: `"${color}" was written to the clipboard`, type: "success" }, 3)
        }).catch(() => {
            this.props.flashMessage({text: `Failed to write "${color}" to the clipboard`, type: "success" }, 3)
        })
    }

    handleColorClick(event: React.MouseEvent<HTMLElement>, colorPalletIndex: number, colorIndex: number) {
        if (this.state.editing) {
            this.chooseColorHandler(event, colorPalletIndex, colorIndex)
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
        }).catch(() => {
            this.props.flashMessage({text: "Failed to load color pallets, please reload the app.", type: "error"}, 3)
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
        }).catch(() => {
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
                            <div className="Page__color-pallet">
                                <SketchPicker
                                    // className="Page__color-pallet"
                                    color={this.state.colorPickerState}
                                    onChangeComplete={this.handleColorChange}
                                />
                            </div>
                        }
                    </div>
                </div>
            </div>

        )
    }
}


export default ColorManager
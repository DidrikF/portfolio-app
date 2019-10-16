import uuidv4 from 'uuid/v4'

export function getId() {
    return uuidv4()
}

export function setScrollableHeight() {
    const userInfoElement = document.getElementsByClassName("SN-UserInfo")[0]
    const accountInfoElement = document.getElementById("SN__account-info")
    const documentHeight = document.documentElement.clientHeight
    const scrollableHeight = documentHeight - userInfoElement.offsetHeight - accountInfoElement.offsetHeight
    
    this.setState({
        scrollableHeight: scrollableHeight
    })
    
}

export function deepStyleMerge(obj, update) {
    _.assign(obj, update)
    if (update.style && Object.keys(update.style).length === 0) {
        obj.style = {} // #REFACTOR Clear style (not optimal)
    }
    return obj
}
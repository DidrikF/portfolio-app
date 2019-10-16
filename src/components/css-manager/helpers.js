export const mediaQueries = {
    mobile: "",
    tablet: "@media only screen and (min-width: 600px) ",
    desktop: "@media only screen and (min-width: 1000px) "
}

export function combineCssDocuments(cssDocuments) {
    return cssDocuments.reduce((combined, doc) => {
        return [...combined, ...doc.items]
    }, [])
}

export function itemsToCss(items, baseIndentation) {
    const attributeIndentation = baseIndentation + "\t";
    let css = ""; 
    items.forEach(item => {
        css += baseIndentation + item.selector + "{\n";
        item.attributes.forEach(att => {
        css += attributeIndentation + att.key + ": " + att.value + ";\n";
        })
        css += baseIndentation + "}\n";
    })
    return css;
}

export function cssDocumentToString(combinedCssDocument) {
    let css = ""; 

    // sort based on media query
    let desktopItems = combinedCssDocument.filter(item => item.mediaQuery === "desktop");
    let tabletItems = combinedCssDocument.filter(item => item.mediaQuery === "tablet");
    let mobileItems = combinedCssDocument.filter(item => item.mediaQuery === "mobile");

    css += mediaQueries["mobile"] + "\n";
    css += itemsToCss(mobileItems, "");
    css += "}\n";
    css += mediaQueries["tablet"] + "\n";
    css += itemsToCss(tabletItems, "\t");
    css += "}\n";
    css += mediaQueries["desktop"] + "{\n";
    css += itemsToCss(desktopItems, "\t");
    css += "}\n";

    return css;
}

// Shim for isArray check. (cc. https://stackoverflow.com/a/20956445)
if (typeof Array.isArray === "undefined") {
    Array.isArray = function (obj) {
        return Object.prototype.toString.call(obj) === "[object Array]";
    };
}

/**
 *
 * @param {string} string html string to convert to a html content
 * @returns template element.
 * @note This code does not sanitize **any** html and is inheriently unsafe.
 */
function htmlToNodes(string) {
    const tmp = document.createElement("template");
    tmp.innerHTML = string;
    return tmp;
}

/**
 *
 * @param {any[]} arr An array support flatMap and slice.
 * @param {any} x the item to interleave each item into.
 * @returns
 */
function interleave(arr, x) {
    return arr.flatMap((e) => [e, x]).slice(0, -1);
}

// Tiny Dom Element builder. Adapted from stackoverflow.

/**
 *
 * @param {tag} tag The dom tag to create. Can be anything.
 * @param {object} prop Any tag properties to set.
 * Some values such as `dataset`, `className`/`classList`/`class` goes through a custom transformation process.
 * @param {any[]|string} children a list of children to put in the element. Can be a single string.
 * Strings are appended as a text string, Nodes are inserted as... Well, nodes. Any falsy values are discarded.
 * @returns A Node.
 */
const elNew = (tag, prop, children = []) => {
    const _elCustomValue = ["dataset", "className", "classList", "class"];
    const element = document.createElement(tag);
    if (prop) {
        const filteredObject = Object.keys(prop).reduce(function (
            returnObj,
            key
        ) {
            if (!_elCustomValue.includes(key) && prop[key])
                returnObj[key] = prop[key];
            return returnObj;
        },
        {});
        const customProps = Object.keys(prop).reduce(function (
            returnObj,
            elementKey
        ) {
            if (_elCustomValue.includes(elementKey) && prop[elementKey])
                returnObj[elementKey] = prop[elementKey];
            return returnObj;
        },
        {});
        Object.assign(element, filteredObject);
        if (Object.keys(customProps).length > 0) {
            for (const key in customProps) {
                const propValue = customProps[key];
                if (key === "dataset") {
                    for (const datasetKey in propValue) {
                        element.dataset[datasetKey] = propValue[datasetKey];
                    }
                } else if (
                    key === "className" ||
                    key === "classList" ||
                    key === "class"
                ) {
                    if (typeof propValue === "string") {
                        element.className = propValue;
                    } else if (
                        typeof propValue === "object" &&
                        Array.isArray(propValue)
                    ) {
                        element.className = propValue
                            .filter((m) => m)
                            .join(" ");
                    } else {
                        console.error(
                            `Passed in a non Array/String value to ${key}. will be ignored.`
                        );
                    }
                }
            }
        }
    }
    if (typeof children !== "string") {
        // Cleanup children.
        children = children.filter((m) => m);

        if (children.length > 0)
            children.forEach((child) => {
                if (child !== null) {
                    if (typeof child === "string") {
                        if (child !== "") {
                            element.appendChild(document.createTextNode(child));
                        }
                    } else {
                        element.appendChild(child);
                    }
                }
            });
    } else {
        element.appendChild(document.createTextNode(children));
    }

    return element;
};

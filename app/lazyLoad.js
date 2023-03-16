function getFileData(fileString) {
    fileString = fileString.replace(/\s+/g,'')
    const { routerComponent, routers} = slicingRoute(fileString)
    const importString = routerComponent.replace(/\.\.\//g, '@/')
    const routersString = getRoutesString(routers)
    return {
        routerComponent: getRouterObj(importString),
        routers: JSON.parse(unifyQuotesAndRemoveCommas(routersString))
    }
}

function getRouterObj(listString) {
    const routerObj = {}
    const listArray = listString.split('import')
    for(const item of listArray) {
        if(!item && item.includes('from')) continue;
        const itemArray = item.split('from')
        let value = itemArray[1], title = ''
        if(itemArray[1] && itemArray[1].includes('//')) {
            const vt = itemArray[1].split('//')
            value = vt[0]
            title = vt[1]
        }
        value = value && value.replace(/\'/g,'')
        const pathArray = value && value.split('/') || []

        routerObj[itemArray[0]] = {
            component: value,
            title: title,
            folder: pathArray.length > 1 ? pathArray[1] : ''
        }
    }

    return routerObj
}

function slicingRoute(fileString) {
    const markArray = ['exportdefault','Vue.use', 'letrouter', 'router.beforeEach', 'router.afterEach' ]
    const res = {}
    const dep = (s) => {
        if(!s) return
        for(const v of markArray) {
            if(s.includes(v)) {
                const arr = s.split(v)
                dep(arr[0])
                dep(arr[1])
                return
            }
        }

        if(s.includes('import') && s.includes('from')) {
            res.routerComponent = s
        }

        if(s.includes('routes:')) {
            res.routers = s
        }
    }
    dep(fileString)
    return res
}

function getRoutesString(str) {
    const regex = /(?<=\(\{)\S+(?=\s*(,\}\)|\}\)))/g
    const matchStr = str.match(regex)[0]
    return matchStr.split('routes:')[1]
}

function unifyQuotesAndRemoveCommas(text) {
    return text.replace(/(?<=[:,\{]\s*)(\w+)(?=\s*(,|:|\}))/g, '"$1"').replace(/\'/g, '"').replace(/\}\,\]/g, '}]').replace(/,\s*}/g, '}').replace(/,,/g, ',').replace(/\}\],/g, '}]')
}

export const formatRouter = (e) => {
    const { sourceFile, fileType, outPutFolder } = e
    const { routerComponent, routers } = getFileData(sourceFile)
    let sourceData = {}, sourceList = {}
    const dep = (arr, isChild) => {
        for(let i = 0; i < arr.length; i++) {
            let v = arr[i]
            if(routerComponent.hasOwnProperty(v.name)) {
                const routerObj = routerComponent[v.name]
                arr[i].component = routerObj.component
                arr[i].title = routerObj.title

                if(v.children && v.children.length) {
                    arr[i].children = dep(v.children, true)
                }
                if(!isChild) {
                    sourceData[routerObj.folder] = sourceData[routerObj.folder] || {
                        routers: [],
                        className: routerObj.folder
                    }
                    sourceData[routerObj.folder].routers.push(arr[i])
                }
            }
            
        }
        return arr
    }

    sourceList[outPutFolder] = dep(routers)
    return fileType ? sourceData : sourceList
}



 
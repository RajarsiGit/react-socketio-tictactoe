const generateKey = (): string => {
    let key: string = '';
    while (key.length !== 7) {
        key = Math.random().toString(36).substring(6).toUpperCase()
    }
    return key;
}

export {
    generateKey
}
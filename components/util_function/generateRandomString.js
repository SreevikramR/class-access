const generateRandomString = (length) => {
    const getRandomCharacter = () => {
        const characters = 'ABCDEFGHIJKLMNPQRSTUVWXYZ123456789';
        return characters[Math.floor(Math.random() * characters.length)];
    }
    let result = '';
    for (let i = 0; i < length; i++) {
        result += getRandomCharacter();
    }
    return result;
}

export default generateRandomString;
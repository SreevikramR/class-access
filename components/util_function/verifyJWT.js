import jwt from 'jsonwebtoken'

const verifyJWT = (jwtToken) => {
    let decodedJWT;
    try {
        decodedJWT = jwt.verify(jwtToken, process.env.JWT_SECRET);
        teacherUUID = decoded.sub;
    } catch {
        return false;
    }
    return decodedJWT;
}

export default verifyJWT
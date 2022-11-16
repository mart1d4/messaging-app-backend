import { verify } from 'jsonwebtoken';

const verifyJWT = (req, res, next) => {
    const authHeader = req.headers.authorization || req.headers.Authorization;
    if (!authHeader?.startsWith('Bearer ')) {
        console.log('here');
        return res.sendStatus(401);
    }
    const token = authHeader.split(' ')[1];

    verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if (err) return res.sendStatus(403);
        req.user = decoded.UserInfo;
        next();
    });
};

export default verifyJWT;

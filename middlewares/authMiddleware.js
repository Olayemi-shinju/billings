import jwt from 'jsonwebtoken'
import User from '../models/userModel.js'

export const protect = async (req, res, next)=>{
        try {
            const token = req.headers.authorization?.split(" ")[1];
            if(!token) return res.status(401).json({message: "Not authorized."})
                const decoded = jwt.verify(token, process.env.JWT_SECRET)
            req.user = await User.findById(decoded.id)
            next()
        } catch (error) {
            res.send(401).json({message: "Invalid token"})
        }
}

// RBAC
export const authorized = (...roles)=>{
    return (req, res, next)=>{
        if(!roles.includes(req.user.role)){
            res.status(403).json({message: "Access denied"})
        }
        next()
    }
}

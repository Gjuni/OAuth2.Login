import { Request, Response, NextFunction } from "express";
import dotenv from 'dotenv';
import { kakaoLoginService } from "../loginService/kakaoService";

dotenv.config();

export const kakaoLoginController = async (
    req : Request,
    res : Response,
    next : NextFunction
): Promise<any> => {
    try {
        const code = req.query.code as string; // 프론트에서 받아온 정보
    
        if(!code) {
            return res.status(400).json({ message : "Authorization code is required" });
        }
    
        const KAKAO_REST_API_KEY = process.env.KAKAO_REST_API_KEY as string;
        const KAKAO_REDIRECT_URI = process.env.KAKAO_REDIRECT_URI as string;

        const result = await kakaoLoginService(code, KAKAO_REST_API_KEY, KAKAO_REDIRECT_URI);
        
        return res.status(200).json({ logininfo : result });
    } catch (error : any) {
        next(error);
    }
};
import { kakaoLoginModel } from "../loginModel/kakaoModel";
import { KakaoLoginDTO } from '../dto/kakaoDTO';  


export const kakaoLoginService = async (
    info : string,
    KAKAO_REST_API_KEY : string,
    KAKAO_REDIRECT_URI : string
): Promise<{ success : boolean, kakaoLogininfo : KakaoLoginDTO, accessToken : string }> => {
    
    const result = await kakaoLoginModel(info, KAKAO_REST_API_KEY, KAKAO_REDIRECT_URI);

    return result;
}
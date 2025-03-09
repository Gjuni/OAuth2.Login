import axios from "axios";
import { KakaoLoginDTO } from '../dto/kakaoDTO'; 
import { generateToken } from "../../middleWare/JWT/secureJWT";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({log: ['query']});

export const kakaoLoginModel = async (
    code: string,
    KAKAO_REST_API_KEY: string,
    KAKAO_REDIRECT_URI: string
): Promise <{ success : boolean, kakaoLogininfo : KakaoLoginDTO, accessToken : string }> => {
    try {
        console.log('Redirect URI:', KAKAO_REDIRECT_URI);
        console.log('Received code:', code);

        const tokenResponse = await axios.post(
            "https://kauth.kakao.com/oauth/token",
            new URLSearchParams({
                grant_type: "authorization_code",
                client_id: KAKAO_REST_API_KEY,
                redirect_uri: KAKAO_REDIRECT_URI,   
                code: code,
            }).toString(),
            {
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
            }
        );

        console.log("토큰 응답:", JSON.stringify(tokenResponse.data, null, 2));

        const { access_token } = tokenResponse.data;

        // 카카오 사용자 정보 요청
        const userResponse = await axios.get("https://kapi.kakao.com/v2/user/me", {
            headers: { Authorization: `Bearer ${access_token}` },
        });

        console.log("사용자 정보 응답:", JSON.stringify(userResponse.data, null, 2));

        const kakaoId = userResponse.data.id?.toString();
        if (!kakaoId) {
            throw new Error("Kakao ID not found in response");
        }

        // 카카오 계정 정보에서 프로필이 존재하는지 확인
        // 오류를 던지지 말고 조건부 로직 구현
        const kakaoAccount = userResponse.data.kakao_account || {};
        const profile = kakaoAccount.profile || {};
        const nickname = profile.nickname || '사용자';
        const profileImageUrl = profile.profile_image_url || null;
        const email = kakaoAccount.email || "test123@gmail.com";

        // 기존 사용자 확인
        let user = await prisma.user.findUnique({
            where: {
                user_id: kakaoId,   
            },
        });

        // 기존 회원이 없으면 새로운 회원 생성
        if (user === null) {
            // 함수 호출을 await로 처리하고, 반환값에서 user 정보만 추출
            const result = await kakaoRegisterModel(kakaoId, nickname, profileImageUrl, email);
            user = result.user;
        }

        // null 체크 추가
        if (!user) {
            throw new Error("Failed to create or find user");
        }

        // JWT 토큰 생성
        const accessToken = await generateToken(user);

        // 사용자 정보와 JWT 토큰 반환
        return {
            success: true,
            kakaoLogininfo: {
                id: user.id,
                user_id: user.user_id,
                nickname: user.nickname,
                email: user.email,
                profile_image: user.profile_image,
            },
            accessToken, // JWT 토큰 반환
        };

    } catch (error : any) {
        console.error("Kakao login error:", error);
        if (error.response) {   
            console.error("에러 응답 데이터:", error.response.data);
            console.error("에러 응답 상태:", error.response.status);
            console.error("에러 응답 헤더:", error.response.headers);
        } else if (error.request) {
            console.error("요청은 되었으나 응답이 없음:", error.request);
        } else {
            console.error("에러 메시지:", error.message);
        }
        
        throw new Error(`Kakao login failed: ${error.message}`);
    }
};


export const kakaoRegisterModel = async (
    kakaoId: string,
    nickname: string,
    profileImageUrl: string,
    email: string
): Promise<{ kakaoLogininfo: KakaoLoginDTO, platform: string, user: any }> => {

    console.log("새 회원 생성 시도:", {
        kakaoId,
        nickname,
        profileImageUrl,
        email
    });

    const user = await prisma.user.create({
        data: {
            user_id: kakaoId,
            nickname: nickname,
            profile_image: profileImageUrl,
            email: email,
            platform: 'kakao',
        }
    });

    // Prisma create는 성공 시 항상 객체를 반환하지만, 
    // 타입 안전성을 위해 null 체크 추가
    if (!user) {
        throw new Error("Failed to create user");
    }

    return {
        kakaoLogininfo: {
            id: user.id,
            user_id: user.user_id,
            nickname: user.nickname,
            email: user.email,
            profile_image: user.profile_image,
        },
        platform: user.platform,
        user: user // 생성된 전체 유저 객체도 함께 반환
    };
}
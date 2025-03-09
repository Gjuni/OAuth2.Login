import {Request, Response, Router} from 'express';
import { kakaoLoginController } from './loginController/kakaoContoller';

const router = Router();

router.get('/', (req: Request, res: Response) => {
    res.send('kakaoLogin');
});

router.get('/kakaoLogin', kakaoLoginController);
router.get('/kakaoRegister', kakaoLoginController);


export default router;
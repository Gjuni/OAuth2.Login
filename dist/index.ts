import express, { Router } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';

import kakaoLogin from './LoginPage/kakaoRouter';
import { errorHandler } from './middleWare/errorHandler/error.middleWare';

const app = express();
const router = Router();
dotenv.config();

app.use(cors());
app.use(express.json());

router.get('/', (req, res) => {
    res.send('Team-Mobile');
});

app.use('/' ,router);
app.use('/loginKakao', kakaoLogin);

app.get('/auth/kakao/callback', async (
    req,
    res
):Promise<any> => {
    const { code } = req.query;
    if (!code) {
        return res.status(400).json({ error: "Authorization code is missing" });
    }
    res.send(`인가 코드: ${code}`);
});

app.use(errorHandler);

app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
});
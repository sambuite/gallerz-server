import { Request, Response } from 'express';
import { sign } from 'jsonwebtoken';
import pool from '@database/connection';
import { compare } from 'bcryptjs';

import authConfig from '@config/auth';

export default class SessionController {
  async create(req: Request, res: Response) {
    const db = await pool.connect();
    const { email, password } = req.body;

    db.query(
      `SELECT id,email,password FROM tb_user WHERE email = $1;`,
      [email],
      async (error, result) => {
        if (error) {
          console.error(error.stack);
          return res.status(500).json({ message: 'Erro inesperado!' });
        }

        const user = result.rows[0];

        const checkPassword = await compare(password, user?.password || '');

        if (!user || !checkPassword) {
          return res
            .status(400)
            .json({ message: 'Os dados enviados são incorretos!' });
        }

        const token = sign({ userId: user?.id }, authConfig.secret as string, {
          expiresIn: authConfig.expiresIn,
        });

        return res.status(200).json({ userId: user?.id, token });
      },
    );
    return res.status(401);
  }
}

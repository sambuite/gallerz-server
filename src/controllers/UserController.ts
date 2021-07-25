import { Request, Response } from 'express';
import pool from '@database/connection';
import { hash } from 'bcryptjs';

export class UsersController {
  async create(req: Request, res: Response) {
    const db = await pool.connect();

    const { name, email, password } = req.body;

    try {
      const hashedPassword = await hash(password, 8);
      if (name && email && password && hashedPassword)
        db.query(
          `INSERT INTO tb_user(name, email, password) VALUES($1, $2, $3);`,
          [name, email, hashedPassword],
          (error, result) => {
            if (error) {
              console.error(error.stack);
              return res.status(500).json({ message: 'Erro inesperado!' });
            }

            return res.status(200).json({ ok: true });
          },
        );
      else
        return res
          .status(400)
          .json({ error: 'Os dados enviados são incorretos!' });
    } catch (error) {
      console.error(error.stack);
      return res.status(500).json({ message: 'Erro inesperado!' });
    }
  }

  async index(req: Request, res: Response) {
    const db = await pool.connect();

    const query = req.query;

    try {
      if (Object.keys(query).length) {
        db.query(
          'SELECT * FROM tb_user ORDER BY id LIMIT $1 OFFSET $2;',
          [query.skip, query.take],
          (error, result) => {
            if (error) {
              console.error(error.stack);
              return res.status(500).json({ message: 'Erro inesperado!' });
            }

            const data = (result.rows as any[]).map((user) => {
              return {
                name: user.name,
                id: user.id,
                email: user.email,
              };
            });
            res.status(200).json(data);
          },
        );
      } else {
        db.query('SELECT * FROM tb_user;', (error, result) => {
          if (error) {
            console.error(error.stack);
            return res.status(500).json({ message: 'Erro inesperado!' });
          }

          const data = (result.rows as any[]).map((user) => {
            return {
              name: user.name,
              id: user.id,
              email: user.email,
            };
          });
          res.status(200).json(data);
        });
      }
    } catch (error) {
      console.error(error.stack);
      return res.status(500).json({ message: 'Erro inesperado!' });
    }
  }

  async edit(req: Request, res: Response) {
    const db = await pool.connect();

    const { id } = req.params;
    const { name, email, password } = req.body;

    try {
      if (name && email && password)
        db.query(
          'UPDATE tb_user SET name = $1, email = $2, password = $3 WHERE id = $4',
          [name, email, password, id],
          (error, result) => {
            if (error) {
              console.error(error.stack);
              return res.status(500).json({ message: 'Erro inesperado!' });
            }

            res.status(200).json({ ok: true });
          },
        );
      else
        return res
          .status(400)
          .json({ error: 'Os dados enviados são incorretos!' });
    } catch (error) {
      console.error(error.stack);
      return res.status(500).json({ message: 'Erro inesperado!' });
    }
  }

  async delete(req: Request, res: Response) {
    const db = await pool.connect();

    const { id } = req.params;

    if (id)
      db.query('DELETE FROM tb_user WHERE id = $1;', [id], (error, result) => {
        if (error) {
          console.error(error.stack);
          return res.status(500).json({ message: 'Erro inesperado!' });
        }

        res.status(200).json({ ok: true });
      });
    else return res.status(400).json({ error: 'Id inválido' });
  }
}

import { Request, Response } from 'express';
import pool from '@database/connection';
import { QueryResult } from 'pg';

export class ProductController {
  async create(req: Request, res: Response) {
    const db = await pool.connect();

    const { userId, name, imageUrl, price } = req.body;

    try {
      db.query(
        `SELECT * FROM tb_user WHERE id = $1;`,
        [userId],
        (error, result) => {
          if (error) {
            console.error(error.stack);
            return res.status(500).json({ message: 'Erro inesperado!' });
          }

          if (result.rowCount === 0) {
            return res
              .status(400)
              .json({ error: 'Os dados enviados são incorretos!' });
          }
        },
      );

      if (name && imageUrl && price && userId)
        db.query(
          `INSERT INTO tb_product(tb_user_id, name, image_url, price) VALUES($1, $2, $3, $4);`,
          [userId, name, imageUrl, price],
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
      console.error(error);
      return res.status(500).json({ message: 'Erro inesperado!' });
    }
  }

  async index(req: Request, res: Response) {
    const db = await pool.connect();

    const { userId } = req.body;

    try {
      if (userId) {
        db.query(
          'SELECT * FROM tb_product WHERE tb_user_id = $1;',
          [userId],
          (error, result) => {
            if (error) {
              console.error(error);
              return res.status(500).json({ message: 'Erro inesperado!' });
            }

            if (result.rowCount === 0) {
              console.error(error);
              return res
                .status(404)
                .json({ message: 'Produtos não encontrados!' });
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
      }
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Erro inesperado!' });
    }
  }

  async edit(req: Request, res: Response) {
    const db = await pool.connect();

    const { id } = req.params;
    const { name, imageUrl, price } = req.body;

    try {
      if (name && imageUrl && price)
        db.query(
          'UPDATE tb_product SET name = $1, image_url = $2, price = $3 WHERE id = $4',
          [name, imageUrl, price, id],
          (error, result) => {
            if (error) {
              console.error(error);
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
      console.error(error);
      return res.status(500).json({ message: 'Erro inesperado!' });
    }
  }

  async delete(req: Request, res: Response) {
    const db = await pool.connect();

    const { id } = req.params;

    try {
      db.query(
        `SELECT * FROM tb_product WHERE id = $1;`,
        [id],
        (error, result) => {
          if (error) {
            console.error(error.stack);
            return res.status(500).json({ message: 'Erro inesperado!' });
          }

          if (result.rowCount === 0) {
            return res
              .status(400)
              .json({ error: 'Os dados enviados são incorretos!' });
          }
        },
      );
      if (id)
        db.query(
          'DELETE FROM tb_product WHERE id = $1;',
          [id],
          (error, result) => {
            if (error) {
              console.error(error);
              return res.status(500).json({ message: 'Erro inesperado!' });
            }

            res.status(200).json({ ok: true });
          },
        );
      else return res.status(400).json({ error: 'Id inválido' });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Erro inesperado!' });
    }
  }
}

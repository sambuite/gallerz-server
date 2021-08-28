import { Request, Response } from 'express';
import pool from '@database/connection';
import { v4 as uuid } from 'uuid';

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

      if (name && imageUrl && price && userId) {
        const id = uuid();

        db.query(
          `INSERT INTO tb_product(id, tb_user_id, name, image_url, price) VALUES($1, $2, $3, $4, $5);`,
          [id, userId, name, imageUrl, price],
          (error, result) => {
            if (error) {
              console.error(error.stack);
              return res.status(500).json({ message: 'Erro inesperado!' });
            }

            return res.status(200).json({ ok: true });
          },
        );
      } else
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

    try {
      db.query(
        `SELECT p.id, p.name, p.image_url, p.price,
          u.id as user_id, u.name as user_name
          FROM tb_product as p INNER JOIN tb_user as u
          ON p.tb_user_id = u.id;`,
        [],
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

          const data = (result.rows as any[]).map((product) => {
            return {
              id: product.id,
              name: product.name,
              imageUrl: product.image_url,
              price: Number(product.price) || undefined,
              user: {
                id: product.user_id,
                name: product.user_name,
              },
            };
          });
          res.status(200).json(data);
        },
      );
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

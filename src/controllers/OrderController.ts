import { Request, Response } from 'express';
import pool from '@database/connection';
import { v4 as uuid } from 'uuid';

export class OrderController {
  async create(req: Request, res: Response) {
    const db = await pool.connect();

    const { userId, status, products } = req.body;

    try {
      if (
        !userId ||
        (typeof status !== 'number' && status < 0) ||
        !products.length
      )
        return res
          .status(400)
          .json({ error: 'Os dados enviados são incorretos!' });

      const orderId = uuid();

      db.query(
        `INSERT INTO tb_order(id, tb_user_id, date, status) VALUES($1, $2, CURRENT_TIMESTAMP, $3);`,
        [orderId, userId, status],
        (error, result) => {
          if (error) {
            console.error(error.stack);
            return res.status(500).json({ message: 'Erro inesperado!' });
          }
        },
      );

      (products as any[]).forEach(async (product) => {
        const orderProductId = uuid();
        db.query(
          `INSERT INTO tb_order_product(id, tb_order_id, tb_product_id, type, price, quantity) VALUES($1, $2, $3, $4, $5, $6);`,
          [
            orderProductId,
            orderId,
            product.id,
            product.type,
            product.price,
            product.quantity,
          ],
          (error, result) => {
            if (error) {
              console.error(error.stack);
              return res.status(500).json({ message: 'Erro inesperado!' });
            }
          },
        );
      });

      return res.status(200).json({ ok: true });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Erro inesperado!' });
    }
  }

  async index(req: Request, res: Response) {
    const db = await pool.connect();

    const query = req.query;

    try {
      if (Object.keys(query).length) {
        db.query(
          `SELECT
          o.id, o.date, o.status, p.name, p.image_url, op.price
          FROM tb_order as o
          INNER JOIN
          tb_order_product as op
          on op.tb_order_id = o.id
          INNER JOIN tb_product as p
          on p.id = op.tb_product_id
          ORDER BY id LIMIT $1 OFFSET $2;
          `,
          [query.skip, query.take],
          (error, result) => {
            if (error) {
              console.error(error);
              return res.status(500).json({ message: 'Erro inesperado!' });
            }

            console.log('RESULT1', result.rows);

            const data = (result.rows as any[]).map((order) => {
              return {
                id: order.id,
                date: order.date,
                status: order.status,
                products: order.products,
              };
            });
            res.status(200).json(data);
          },
        );
      } else {
        db.query(
          `SELECT
            o.id as order_id, o.date as order_date, o.status as order_status,
            p.id as product_id, p.name as product_name,
            p.image_url as product_image_url,
            op.id as order_product_id, op.type as order_product_type, op.tb_product_id as order_product_product_id,
            op.price as order_product_price, op.quantity as order_product_quantity
            FROM tb_order as o
            INNER JOIN
            tb_order_product as op
            on op.tb_order_id = o.id
            INNER JOIN tb_product as p
            on p.id = op.tb_product_id`,
          (error, result) => {
            if (error) {
              console.error(error);
              return res.status(500).json({ message: 'Erro inesperado!' });
            }

            const data = (result.rows as any[]).map((order) => ({
              id: order.order_id,
              date: order.order_date,
              status: order.order_status,
              products: [
                {
                  id: order.product_id,
                  name: order.product_name,
                  imageUrl: order.product_image_url,
                  type: order.order_product_type,
                  price: Number(order.order_product_type),
                  quantity: Number(order.order_product_quantity),
                },
              ],
            }));

            const output = [];

            data.forEach(function (item) {
              const existing = output.filter(function (v, i) {
                return v.id == item.id;
              });
              if (existing.length) {
                const existingIndex = output.indexOf(existing[0]);
                output[existingIndex].products = output[
                  existingIndex
                ].products.concat(item.products);
              } else {
                if (typeof item.products == 'string')
                  item.products = [item.products];
                output.push(item);
              }
            });

            res.status(200).json(output);
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
    const { status } = req.body;

    try {
      if (status)
        db.query(
          'UPDATE tb_order SET status = $1 WHERE id = $2',
          [status, id],
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

    if (!id) return res.status(400).json({ error: 'Id inválido' });

    db.query('DELETE FROM tb_order WHERE id = $1;', [id], (error, result) => {
      if (error) {
        console.error(error);
        return res.status(500).json({ message: 'Erro inesperado!' });
      }

      res.status(200).json({ ok: true });
    });

    db.query(
      'DELETE FROM tb_order_product WHERE tb_order_id = $1;',
      [id],
      (error, result) => {
        if (error) {
          console.error(error);
          return res.status(500).json({ message: 'Erro inesperado!' });
        }

        res.status(200).json({ ok: true });
      },
    );
  }
}

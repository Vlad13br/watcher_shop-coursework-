const pool = require("../db");

class StatsController {
    async getAllUsers(req, res) {
        try {
            const query = 'SELECT * FROM users';
            const result = await pool.query(query);
            res.status(200).json({ users: result.rows });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Server error' });
        }
    }

    async getNewUsers(req, res) {
        try {
            const query = `
      SELECT * FROM users
      WHERE created_at > NOW() - INTERVAL '1 month';
    `;
            const result = await pool.query(query);
            res.status(200).json({ users: result.rows });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Server error' });
        }
    }

    async getTopEarningUsers(req, res) {
        try {
            const query = `
      SELECT u.user_id, u.name, u.surname, u.email, u.phone, SUM(oi.price * oi.quantity) AS total_spent
      FROM users u
      JOIN orders o ON u.user_id = o.user_id
      JOIN order_items oi ON o.order_id = oi.order_id
      GROUP BY u.user_id
      ORDER BY total_spent DESC
    `;
            const result = await pool.query(query);
            res.status(200).json({ users: result.rows });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Server error' });
        }
    }


    async getTopSellingProducts(req, res) {
        try {
            const query = `
            SELECT w.watcher_id, w.product_name, SUM(oi.quantity) AS total_sold, SUM(oi.quantity * oi.price) AS total_revenue
            FROM watchers w
            JOIN order_items oi ON w.watcher_id = oi.watcher_id
            GROUP BY w.watcher_id
            ORDER BY total_sold DESC
        `;
            const result = await pool.query(query);
            res.status(200).json({ products: result.rows });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Server error' });
        }
    }

// Кількість товарів на складі
    async getProductStock(req, res) {
        try {
            const query = 'SELECT product_name, stock FROM watchers';
            const result = await pool.query(query);
            res.status(200).json({ products: result.rows });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Server error' });
        }
    }

    // Не завершені замовлення
    async getUncompletedOrders(req, res) {
        try {
            const query = `
            SELECT o.order_id, o.order_start, o.order_end, o.shipping_status, u.name, u.surname, 
                   SUM(oi.quantity * oi.price) AS total_order_value
            FROM orders o
            JOIN users u ON o.user_id = u.user_id
            JOIN order_items oi ON o.order_id = oi.order_id
            WHERE o.shipping_status != 'delivered'
            GROUP BY o.order_id, u.name, u.surname, o.order_start, o.order_end, o.shipping_status
        `;
            const result = await pool.query(query);
            res.status(200).json({ orders: result.rows });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Server error' });
        }
    }

// Зміна статусу замовлення
    async updateOrderStatus(req, res) {
        try {
            const { order_id, new_status } = req.body;

            // Перевірка статусy
            const validStatuses = ['pending', 'shipped', 'delivered', 'cancelled'];
            if (!validStatuses.includes(new_status)) {
                return res.status(400).json({ error: 'Invalid status' });
            }

            const query = `
      UPDATE orders 
      SET shipping_status = $1 
      WHERE order_id = $2
      RETURNING *;
    `;
            const result = await pool.query(query, [new_status, order_id]);

            if (result.rows.length === 0) {
                return res.status(404).json({ error: 'Order not found' });
            }

            res.status(200).json({ message: 'Order status updated', order: result.rows[0] });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Server error' });
        }
    }

}

module.exports = new StatsController();

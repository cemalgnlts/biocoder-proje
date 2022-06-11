const connection = require("../libs/databaseConnection");

const mysql2 = require("mysql2");

class Product {
    constructor() { }

    static async deleteProduct(userId, id) {
        const sql = "DELETE FROM products WHERE userId=? AND id=?";
        
        return await connection.query(sql, [userId, id]);
    }

    static async update(id, data) {
        const sql = `UPDATE products SET ${Object.keys(data).map(key => `${key}=?`)} WHERE id=?`;

        const format = mysql2.format(sql, [...Object.values(data), id]);
        const [rows] = await connection.query(format);

        return rows[0];

    }

    static async getProduct(user, productId) {
        const sql = "SELECT * FROM products WHERE userId=? AND id=?";
        const [rows] = await connection.query(sql, [user, productId]);
        const row = rows[0]

        row.emptyProductQuantity = row.productQuantity - (row.robustProductQuantity + row.brokenProductQuantity);

        return row;
    }

    static async getAll(user) {
        const sql = "SELECT * FROM products WHERE userId=?";
        const [rows] = await connection.query(sql, [user]);

        return rows;
    }

    static async save(userId, data) {
        const [latitude, longitude] = data.location.split(",");

        const sql = `INSERT INTO products (
            userId,
            businessNo,
            address,
            il,
            ilce,
            productType,
            latitude,
            longitude,
            weather,
            productQuantity,
            robustProductQuantity,
            brokenProductQuantity,
            productSize2020,
            productSize2021,
            productSize2022
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

        const [res] = await connection.query(sql, [
            userId,
            data.businessNo,
            data.address,
            data.il,
            data.ilce,
            data.productType,
            latitude,
            longitude,
            data.weather,
            data.productQuantity,
            data.robustProductQuantity || 0,
            data.brokenProductQuantity || 0,
            data.productSize2020 || 0,
            data.productSize2021 || 0,
            data.productSize2022 || 0
        ]);

        return res.insertId;
    }
}

module.exports = Product;
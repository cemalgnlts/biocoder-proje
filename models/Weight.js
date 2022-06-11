const connection = require("../libs/databaseConnection");

const mysql2 = require("mysql2");

class Weight {
    constructor() {

    }

    static async update(productId, data) {
        const ids = Object.keys(data);
        
        const sql = "UPDATE weight SET value=? WHERE id=?";
        const format = ids.map(id => mysql2.format(sql, [data[id] || 0, id]));
        
        return connection.query(format.join("; "));
    }

    static async findByIdProductId(id) {
        const sql = "SELECT * FROM weight WHERE productId=?";
        const [rows] = await connection.query(sql, [id]);

        return rows;
    }

    static async save(productId, values) {
        const data = [];
        const date = new Date();

        for (const value of values) {
            data.push([productId, date.toISOString().split("T")[0], value || 0]);
            date.setDate(date.getDate() + 1);
        }

        const sql = "INSERT INTO weight ( productId, date, value ) VALUES ?";
        const [res] = await connection.query(sql, [data]);

        return res.insertId;
    }
}

module.exports = Weight;
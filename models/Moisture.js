const connection = require("../libs/databaseConnection");

const mysql2 = require("mysql2");

class Moisture {
    constructor() {

    }

    static async update(productId, data) {
        const ids = Object.keys(data);
        
        const sql = "UPDATE moisture SET value=? WHERE id=?";
        const format = ids.map(id => mysql2.format(sql, [data[id] || 0, id]));

        return connection.query(format.join("; "));
    }

    static async findByIdProductId(id) {
        const sql = "SELECT * FROM moisture WHERE productId=?";
        const [rows] = await connection.query(sql, [id]);

        return rows;
    }

    static async save(productId, values) {
        const data = [];
        let time = 12;
        
        for (const value of values) {
            data.push([productId, time + ":00", value || 0]);
            time++;
        }

        const sql = "INSERT INTO moisture ( productId, time, value ) VALUES ?";
        const [res] = await connection.query(sql, [data]);

        return res.insertId;
    }
}

module.exports = Moisture;
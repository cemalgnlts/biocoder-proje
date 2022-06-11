const connection = require("../libs/databaseConnection");
const bcrypt = require("bcrypt");

module.exports = class User {
    constructor(user) {
        this.name = user.name.split(" ")[0];
        this.fullName = user.name;
        this.id = user.id;
    }

    static async findById(id) {
        const sql = "SELECT * FROM users WHERE id=?";
        const [rows] = await connection.execute(sql, [id]);
        const [user] = rows;

        if (!user) throw "Kullanıcı bulunamadı.";
        return new User(user);
    }

    static async login(data) {
        const sql = "SELECT * FROM users WHERE id=?";
        const [rows] = await connection.execute(sql, [data.id]);
        const [user] = rows;

        if (!user) throw "Kullanıcı bulunamadı.";
        const isPasswordEqual = await bcrypt.compare(data.password, user.password.toString());
        if (!isPasswordEqual) throw "Şifreniz hatalı.";

        return user.id;
    }

    static async save(data) {
        const password = await bcrypt.hash(data.password, 10);

        const sql = "INSERT INTO users (id, name, email, password) VALUES (?, ?, ?, ?)";
        return connection.execute(sql, [data.id, data.name, data.email, password]);
    }
}
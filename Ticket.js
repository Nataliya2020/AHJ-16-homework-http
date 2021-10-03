module.exports = class Ticket {
    constructor(id, name, status) {
        this.date = new Date().toLocaleDateString('ru-RU');
        this.id = id;
        this.name = name;
        this.status = status;
        this.created = `${this.date} ${new Date().toLocaleTimeString().slice(0,-3)}`;
    }
}
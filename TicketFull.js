module.exports =  class TicketFull {
    constructor(id, name, description, status) {
        this.date = new Date().toLocaleDateString();
        this.id = id;
        this.name = name;
        this.description = description;
        this.status = status;
        this.created = `${this.date} ${new Date().toLocaleTimeString().slice(0,-3)}`;
    }
}
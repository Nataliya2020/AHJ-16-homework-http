const Ticket = require('./Ticket');
const TicketFull = require('./TicketFull');

const http = require('http');
const Koa = require('koa');
const koaBody = require("koa-body");
const app = new Koa();

app.use(koaBody({
    urlencoded: true,
    multiptart: true
}));

function setNoCacheHeaders(ctx) {
    ctx.set('Cache-Control', 'no-store, no-cache, must-revalidate')
    ctx.set('Pragma', 'no-cache')
    ctx.set('Expires', 0)
}

app.use(async (ctx, next) => {
    const origin = ctx.request.get('Origin');
    if (!origin) {
        return await next();
    }

    setNoCacheHeaders(ctx);
    const headers = { 'Access-Control-Allow-Origin': '*' };

    if (ctx.request.method !== 'OPTIONS') {
        ctx.response.set({...headers});
        try {
            return await next();
        } catch (e) {
            e.headers = {...e.headers, ...headers};
            throw e;
        }
    }
    if (ctx.request.get('Access-Control-Request-Method')) {
        ctx.response.set({
            ...headers,
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH',
        });
        if (ctx.request.get('Access-Control-Request-Headers')) {
            ctx.response.set('Access-Control-Allow-Headers', ctx.request.get('Access-Control-Allow-Request-Headers'));
        }
        ctx.response.status = 204;
    }
});

const date = new Date().toLocaleDateString('ru-RU');

const tickets = [
    {
        id: 1,
        name: 'Тест: Заменить картридж в принтере',
        status: false,
        created: `${date} ${new Date().toLocaleTimeString('ru-RU').slice(0,-3)}`
    },
    {
        id: 2,
        name: 'Тест: Заказать канцелярские принадлежности',
        status: false,
        created: `${date} ${new Date().toLocaleTimeString('ru-RU').slice(0,-3)}`
    },
    {
        id: 3,
        name: 'Тест: Подготовить еженедельный отчет',
        status: false,
        created: `${date} ${new Date().toLocaleTimeString('ru-RU').slice(0,-3)}`
    }
];

const ticketsFull = [
    {
        id: 1,
        name: 'Тест: Заменить картридж в принтере',
        description: 'Тест: Найти подходящий картридж, если нет - заказать',
        status: false,
        created: `${date} ${new Date().toLocaleTimeString('ru-RU').slice(0,-3)}`
    },
    {
        id: 2,
        name: 'Тест: Заказать канцелярские принадлежности',
        description: 'Тест:  Определить каких не хватает и составить список',
        status: false,
        created: `${date} ${new Date().toLocaleTimeString('ru-RU').slice(0,-3)}`
    },
    {
        id: 3,
        name: 'Тест: Подготовить еженедельный отчет',
        description: 'Тест:  Описать что было сделано, чего удалось достичь',
        status: false,
        created: `${date} ${new Date().toLocaleTimeString('ru-RU').slice(0,-3)}`
    }
];

let idCreate = 4;

function getDescription(arr, value) {
    return arr
        .find(el => el.id === value);
}

function deleteTicket(arrName, arrDescription, id) {
    const indexDel = arrName.indexOf(arrName.find(el => el.id === id));

    arrName.splice(indexDel, 1);

    const indexDelFull = arrDescription.indexOf(arrDescription.find(el => el.id === id));
    arrDescription.splice(indexDelFull, 1);
}

function editTicket(arrDescription, id) {
     return arrDescription.find(el => el.id === id);
}

app.use(async ctx => {
    ctx.response.body ='server response';
    const method = ctx.request.query.method;
    const id = Number(ctx.request.query.id);

    switch (method) {
        case 'allTickets':
            ctx.response.body = tickets;
            break;
        case 'ticketById':
            ctx.response.body = getDescription(ticketsFull, id);
            break;
        case 'createTicket':
            let rez = JSON.parse(ctx.request.body);

            const { name, description, status, time } = rez;
            const editId = Number(ctx.request.query.id);

            if(!editId) {
                const newTicket = new Ticket(idCreate, name, status);
                const newTicketFull = new TicketFull(idCreate, name, description, status);

                idCreate += 1;

                tickets.push(Object.assign(newTicket));
                ticketsFull.push(Object.assign(newTicketFull));
            } else {
                tickets.forEach(ticket => {

                    if(editId === ticket.id) {
                        ticket.name = name;
                        ticket.time = time;
                        ticket.status = status;
                    }
                });

                ticketsFull.forEach(ticketFull => {
                    if(ticketFull.id === editId) {
                        ticketFull.name = name;
                        ticketFull.description = description;
                        ticketFull.time = time;
                        ticketFull.status = status;
                    }
                })
            }
            ctx.response.body = { status:"200",result:"ok" };
            break;

        case 'deleteTicket':
            deleteTicket(tickets, ticketsFull, id);
            ctx.response.body = { status:"200",result:"ok" };
            break;

        case 'editTicket':
            ctx.response.body = editTicket(ticketsFull, id);
            break;

        default:
            ctx.response.status = 404;
            break;
    }
});

const port = process.env.PORT || 7070;
const server = http.createServer(app.callback()).listen(port)




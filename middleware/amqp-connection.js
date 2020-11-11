require('dotenv').config();
const amqp = require('amqplib').connect(`amqp://${process.env.RABBIT_USER}:${process.env.RABBIT_PASS}@${process.env.RABBIT_HOST}:${process.env.RABBIT_PORT}?heartbeat=60`)
module.exports = {
	Connect: async () => {
		return await amqp;
	},
	Publisher: async(queue_name, data) => {
		await amqp.then( async function(conn) {
			return await conn.createChannel().then(rq => { return rq }).catch(err => { return err })
		}).then( async function(ch) {
			return await ch.assertQueue(queue_name).then(async function(ok) {
				await ch.sendToQueue(ok.queue, Buffer.from(JSON.stringify(data)));
				return ch.close();
			});
		}).catch(console.warn);
	},
	Queue: async (obj = {}) => {
		await amqp.then(async conn => {
			return await conn.createChannel().then(rq => { return rq }).catch(err => {
				if (err) console.log(err)
			})
		}).then(async ch => {
			if (obj.options !== undefined) {
				return await ch.assertQueue(obj.queue_name, obj.options).then(async ok => {
					await ch.sendToQueue(ok.queue, Buffer.from(JSON.stringify(obj.data)));
					return ch.close()
				});
			}
			else {
				return await ch.assertQueue(obj.queue_name).then(async ok => {
					await ch.sendToQueue(ok.queue, Buffer.from(JSON.stringify(obj.data)));
					return ch.close()
				});
			}
		}).catch(err => {
			if (err) console.log(err)
		});
	},
	
	PubliserExchange: async (obj = {}) => {
		await amqp.then(async function (conn) {
			return await conn.createChannel().then(rq => { return rq }).catch(err => { return err })
		}).then(async function (ch) {
			if (ch.ch > 1) {
				return await ch.assertExchange(obj.exchange_name, 'direct', {
					durable: true
				}).then( async function (ok) {
					if (ok) {
						await ch.assertQueue(obj.queue_name, {
							durable: true,
							persistent: true
						});
						await ch.publish(ok.exchange, obj.queue_name, Buffer.from(JSON.stringify(obj.data)))
						await ch.bindQueue(obj.queue_name, ok.exchange, obj.queue_name)
						return ch.close()
					}
				})
			}
		}).catch(console.error);
	}
}
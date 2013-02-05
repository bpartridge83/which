module.exports = function (db) {
	return {
		db: db.database,
		collection: 'log',
		safe: false,
		host: db.host,
		port: db.port,
		username: db.username,
		password: db.password,
		errorTimeout: 200,
		timeout: 200
	}
}
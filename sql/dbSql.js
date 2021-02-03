var DbSql = {
    insert : 'INSERT INTO User(id, userName, password) VALUES(?,?,?) ',
    query : 'SELECT * FROM user ',
    getUserById: 'SELECT * FROM user WHERE uid = ? '
};

module.exports = DbSql;
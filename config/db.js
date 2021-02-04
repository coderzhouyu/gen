var mysql = require('mysql')
var pool = mysql.createPool({
    connectionLimit: 10,
    host: '127.0.0.1',
    user: 'root',
    password: '123456',
    database: 'erp-admin'
});

function  query(sql, values, callback) {
    console.log("db pool");
    pool.getConnection(function (err, connection) {
        if(err) throw err;
        console.log("sql ",sql,values);
        //Use the connection
        connection.query(sql, values,function (err, results, fields) {
            console.log(JSON.stringify(results),err);
            //每次查询都会 回调
            callback(err, results);
            //只是释放链接，在缓冲池了，没有被销毁
            connection.release();
            if(err) throw error;
        });

    });
}

exports.query = query;

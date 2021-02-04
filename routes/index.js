var express = require('express');
var router = express.Router();
let db = require("../config/db")
let dbSql = require("../sql/dbSql")
let fs = require("fs")
var path = require('path')
let ejs = require('ejs')
/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('index', {
        step: 1
    });
});


router.post('/gen_info', function (req, res, next) {
    /**
     * 简单思路
     * 1. 通过 req.body 得到上一步中提交过来的信息
     * 2. 通过查询数据库得到目前连接的数据库的表信息
     */
    db.query(dbSql.tables, [], function (err, rows) {
        let tables = []
        rows.forEach(item => {
            tables.push(item['Tables_in_erp-admin'])
        })
        res.render('index', {
            postData: {...req.body},
            tables,
            step: 2
        });
    });
});


router.get('/table_info', function (req, res, next) {
    db.query(dbSql.columns + req.query.name, [], function (err, rows) {
        res.send(rows);
    });
});

// 递归创建目录 同步方法
function mkdirsSync(dirname) {
    if (fs.existsSync(dirname)) {
        return true;
    } else {
        if (mkdirsSync(path.dirname(dirname))) {
            fs.mkdirSync(dirname);
            return true;
        }
    }
}

const frontTemplateFiles = [
    {
        type: "dir",
        name: "components",
        children: [
            {
                type: "file",
                name: "UpdateForm.jsx",
                template: "gen/front/update"
            }
        ]
    },
    {
        type: "file",
        name: "index.jsx",
        template: "gen/front/index"
    },
    {
        type: "file",
        name: "service.js",
        template: "gen/front/api"
    }
]


router.get('/generate', function (req, res, next) {
    let dir = path.join(__dirname, '../temp/')
    mkdirsSync(dir)
    /**
     * 思路：
     *  根据文件结构配置模板，生成对应的数据
     */

    frontTemplateFiles.forEach(item => {
        if (item.type === "dir") {
            let path = dir + "/" + item.name
            mkdirsSync(path)
        } else if (item.type === "file") {
            let template = fs.readFileSync(path.join(__dirname, '../views/' + item.template + ".ejs"))
            let content = ejs.render(template.toString(),{
                author:"zhouyu"
            })

            let f = fs.createWriteStream(dir + "/" + item.name)
            f.write(content)
            f.close()
        }

        res.send("ok")
    })

})


module.exports = router;

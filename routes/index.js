const express = require('express')
const router = express.Router()
const db = require("../config/db")
const dbSql = require("../sql/dbSql")
const fs = require("fs")
const path = require('path')
const ejs = require('ejs')
const _ = require('lodash')
/**
 * 首页
 */
router.get('/', function (req, res) {
    res.render('index', {
        step: 1
    })
})


/**
 *  获取数据库中所有的数据表信息
 */
router.post('/tables', function (req, res) {
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


/**
 * ajax 通过表名返回表结构信息
 */
router.get('/table_info', function (req, res) {
    db.query(dbSql.columns + req.query.name, [], function (err, rows) {
        res.send(rows);
    });
});


/**
 * 前端代码结构
 * @type {({children: [{template: string, name: string, type: string}], name: string, type: string}|{template: string, name: string, type: string}|{template: string, name: string, type: string})[]}
 */
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

// 模板在的根目录
let templateRootPath = path.join(__dirname, '../views/')
// 生成模板代码的临时文件夹
let tempRootPath = path.join(__dirname, '../temp/')

/**
 * 渲染模板并写入指定目录
 * @param template
 * @param fileName
 * @param options 传入模板的变量
 */
function renderFile(template, fileName, options) {
    let templatePath = template + ".ejs"
    let templateContent = fs.readFileSync(templatePath).toString()
    let content = ejs.render(templateContent, {
        ...options
    })

    let f = fs.createWriteStream(tempRootPath + fileName)
    f.write(content)
    f.close()
}

/**
 * 递归生成代码
 * @param data
 * @param parentPath 指定的文件夹
 * @param options
 */
function generate(data, parentPath, options) {
    data.forEach(item => {
        if (item.type === "dir") {
            let path = parentPath + item.name
            mkdirsSync(path)
            if (item.children && item.children.length > 0) {
                generate(item.children, path + "/", options)
            }
        } else if (item.type === "file") {
            renderFile(
                templateRootPath + item.template,
                parentPath.replace(tempRootPath, "") + item.name,
                options
            )
        }
    })
}

/**
 * 递归创建目录 同步方法
 * @param dirname
 * @return {boolean}
 */
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


router.post('/gen', function (req, res) {

    // let dir = tempRootPath + new Date().getTime() + "/"
    let dir = tempRootPath
    const {tableColumn, postData} = req.body

    // 循环所有表
    _.each(tableColumn, function (item, key) {
        // 帕斯卡表名
        let pskTableName = _.capitalize(key)

        let frontPath = dir + key + "/front/" + pskTableName + "/"
        // 生成前端部分  按照表名称生成组件用帕斯卡方式
        mkdirsSync(frontPath)

        // 用到的值直接结构以免出现bug
        const {author, pre} = postData
        /*
         *  根据文件结构配置模板，生成对应的数据
         */
        let allColumns = tableColumn[key] ? tableColumn[key] : []


        generate(frontTemplateFiles, frontPath, {
            updateColumns: _.filter(allColumns, item => item.showUpdate),
            updateMustColumns: _.filter(allColumns, item => item.mustUpdate),
            addColumns: _.filter(allColumns, item => item.showAdd),
            addMustColumns: _.filter(allColumns, item => item.mustAdd),
            listColumns: _.filter(allColumns, item => item.showList),
            searchColumns: _.filter(allColumns, item => item.isSearch),
            allColumns,
            author,
            pre,
            pskTableName
        })
    })


    res.send("ok")
})


module.exports = router;

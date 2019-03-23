var mysql = require("mysql");
const inquirer = require("inquirer");

var prods;

var connection = mysql.createConnection({
    host: "localhost",

    // Your port; if not 3306
    port: 3306,

    // Your username
    user: "root",

    // Your password
    password: "kids4luv",
    database: "bamazon"
});

connection.connect(function (err) {
    if (err) throw err;
    console.log("connected as id " + connection.threadId);
    afterConnection();
});

function afterConnection() {
    connection.query("SELECT * FROM products", function (err, res) {
        if (err) throw err;
        console.table(res);

        questions(res);
    });
}

function questions(res) {
    prods = res.length;

    inquirer.prompt({
        type: "input",
        name: "prod_id",
        message: "What is the ID of the item you would like to purchase?"
    }).then(function (ans) {
        //console.log(ans);
        if (Number(ans.prod_id) > 0 && Number(ans.prod_id) <= prods) {
            var ind = ans.prod_id - 1;
            var pname = res[ind].product_name;
            console.log("you picked", pname);
            inquirer.prompt({
                type: "input",
                name: "units",
                message: "How many would you like to buy?"
            }).then(function (ans) {
                if (Number(ans.units) > Number(res[ind].stock_quantity)) {
                    console.log("Sorry, we do not have that many units of", pname);
                    questions(res);
                } else {
                    console.log("You have ordered", ans.units, "units of", pname);
                    var newQuan = res[ind].stock_quantity - ans.units;
                    connection.query("UPDATE products SET stock_quantity=" + newQuan + " WHERE product_name = '" + pname + "'");
                    var total = ans.units * res[ind].price;
                    console.log("The total cost is $", total);
                    connection.end();
                }
            });
        } else {
            console.log("You must pick a number between 1 and", prods);
            questions(res);
        }

    });
}

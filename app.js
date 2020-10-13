const mysql = require("mysql");
const inquirer = require("inquirer");
const cTable = require("console.table")

const connection = mysql.createConnection({
    host: "localhost",

    port: 3306,

    user: "root",

    password: "password",

    database: "employees_db"
});

connection.connect(function(err) {
    if (err) throw err;
    employeePrompt();
})

function employeePrompt() {
    inquirer
    .prompt({
        name: "action",
        type: "rawlist",
        message: "What would you like to do?",
        choices: [
            "View All Employees",
            "View All Departments",
            "View All Roles",
            "Add an Employee",
            "Add a Department",
            "Add a Role",
            "Update Employee Roles"
        ]
    })
    .then(function(answer) {
        switch(answer.action) {
            case "View All Employees":
                viewEmployees();
                break;

            case "View All Departments":
                viewDepartments();
                break;
            
            case "View All Roles":
                viewRoles();
                break;

            case "Add an Employee":
                addEmployee();
                break;

            case "Add a Department":
                addDepartment();
                break;

            case "Add a Role":
                addRole();
                break;

            case "Update Employee Roles":
                updateEmployee();
                break;
        }
    });
};

function viewEmployees() {
    connection.query("SELECT * FROM employee", function (err, res) {
        if (err) throw err;
        const employees = [];
        for (var i = 0; i < res.length; i++) {
            employees.push({
                ID: res[i].id,
                First: res[i].first_name,
                Last: res[i].last_name,
                RoleID: res[i].role_id,
                ManagerID: res[i].manager_id
            })
        }
        console.table(employees)
        employeePrompt();
    })
}

function viewDepartments() {
    connection.query("SELECT * FROM department", function (err, res) {
        if (err) throw err;
        const departments = []
        for (var i = 0; i < res.length; i++) {
            departments.push({
                ID: res[i].id,
                Name: res[i].name
            })
        }
        console.table(departments)
        employeePrompt();
    })
}

function viewRoles() {
    connection.query("SELECT * FROM role", function (err, res) {
        if (err) throw err;
        const roles = []
        for (var i = 0; i < res.length; i++) {
            roles.push({
                ID: res[i].id,
                Title: res[i].title,
                Salary: res[i].salary,
                DepartmentID: res[i].department_id
            })
        }
        console.table(roles)
        employeePrompt();
    })
}

function addEmployee() {
    connection.query("SELECT * FROM role", function (err, data) {
        if (err) throw err 

        let roleArr = data.map(function(role) {
            return {
                name: role.title,
                value: role.id
            }
        })

        inquirer.prompt([
            {
                name: "eFirst",
                type: "input",
                message: "What is the employee's first name?"
            },

            {
                name: "eLast",
                type: "input",
                message: "What is the employee's last name?"
            },

            {
                name: "eRole",
                type: "list",
                message: "What role does this employee have?",
                choices: roleArr
            }
        ]).then(function (answers) {
            connection.query("INSERT INTO employee SET ?", {
                first_name: answer.eFirst,
                last_name: answers.eLast,
                role: answers.eRole
            }, function (err) {
                if (err) throw err;
                console.log(answer.eFirst + " " + answer.eLast + " has been added to the list of employees.")
                employeePrompt();
            }
            
            )
        })
    })
}

function addRole() {
    connection.query("SELECT * FROM department", function (err, data) {
        if (err) throw err;

        let depArr = data.map(function(dep) {
            return {
                name: dep.title,
                value: dep.id
            }
        })

        inquirer.prompt([
            {
                name: "rTitle",
                type: "input",
                message: "What is the title of the role you want to add?"
            },

            {
                name: "rSalary",
                type: "number",
                message: "What is the salary for this role?"
            },

            {
                name: "rDep",
                type: "list",
                message: "What department is this role in?",
                choices: depArr
            },
        ]).then (function(answers) {
        connection.query("INSERT INTO role SET ?", {
            title: answers.rTitle,
            salary: answers.rSalary,
            department_id: answers.rDep
        }, function (err) {
            if (err) throw err;
            console.log(answers.rTitle + " has been added to the list of roles.")
            employeePrompt();
         })
     })
 })
}

function addDepartment() {
    inquirer.prompt({
        name: "depName",
        type: "input",
        message: "What is the name of the department you want to add?"
    }).then (function (answers) {
        connection.query("INSERT INTO department SET ?", {name: answers.depName},
        function (err) {
            if(err) throw err;
            employeePrompt();
        })
    })
}
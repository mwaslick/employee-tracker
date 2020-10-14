// Requires all variables and creates connection
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

const util = require('util');
connection.queryPromise = util.promisify(connection.query);

connection.connect(function(err) {
    if (err) throw err;
    employeePrompt();
})

// Initial function that first asks the user what to do
function employeePrompt() {
    inquirer
    .prompt({
        name: "action",
        type: "list",
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

// Function to view all employees
function viewEmployees() {
    console.log("Current Employees:")
    connection.query(`
        SELECT employee.first_name, employee.last_name, role.title, employee.manager_id
        FROM employee INNER JOIN role
        ON employee.role_id=role.id`, function (err, employees) {
        if (err) throw err;
        console.table(employees)
        employeePrompt();
    })
}

// Function to view all departments
function viewDepartments() {
    console.log("All Departments:")
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

// Function to view all roles
function viewRoles() {
    connection.query(`
        SELECT role.title, role.salary, department.name
        FROM role INNER JOIN department
        ON role.department_id=department.id`, function (err, roles) {
        if (err) throw err;
        console.table(roles)
        employeePrompt();
    })
}

// Function to add a new employee
async function addEmployee () {
    try {
    let employees = await connection.queryPromise('SELECT * FROM employee');
    let roles = await connection.queryPromise("SELECT * FROM role");

    let answers = await inquirer.prompt([
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
            message: "Which role do you want to give your employee?",
            choices: roles.map(({id, title}) => {
                return {
                    value: id,
                    name: title
                }
            })
         },
        
        {
            name: "eManager",
            type: "list",
            message: "Who is this employee's manager?",
            choices: employees.map(({ id, first_name, last_name }) => {
                return {
                    value: id,
                    name: `${first_name} ${last_name}`
                }
            })
        }
    ]);
    await connection.queryPromise("INSERT INTO employee SET ?", [{first_name: answers.eFirst, last_name: answers.eLast, role_id: answers.eRole, manager_id: answers.eManager}]);
    employeePrompt();
    } 
    catch (err) {
        console.error(err);
    }
   }

// Function to add a new role
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


// Function to add a new department
function addDepartment() {
    inquirer.prompt({
        name: "depName",
        type: "input",
        message: "What is the name of the department you want to add?"
    }).then (function (answers) {
        connection.query("INSERT INTO department SET ?", {name: answers.depName},
        function (err) {
            if (err) throw err;
            employeePrompt();
        })
    })
}


// Function to update an employee's role
async function updateEmployee() {
    try {
    let employees = await connection.queryPromise('SELECT * FROM employee');
    let roles = await connection.queryPromise("SELECT * FROM role");

    let answers = await inquirer.prompt([
        {
            name: "employeeUpdate",
            type: "list",
            message: "Which employee would you like to update?",
            choices: employees.map(({ id, first_name, last_name }) => {
                return {
                    value: id,
                    name: `${first_name} ${last_name}`
                }
            })
        },

        {
            name: "roleUpdate",
            type: "list",
            message: "Which role would you like to give this employee?",
            choices: roles.map(({id, title}) => {
                return {
                    value: id,
                    name: title
                }
            })
        }
    ]);
    await connection.queryPromise("UPDATE employee SET role_id = ? WHERE id = ?", [answers.roleUpdate, answers.employeeUpdate]);
    employeePrompt();
    } catch (err) {
        console.error(err);
    }
   }
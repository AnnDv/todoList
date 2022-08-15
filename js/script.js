const todoForm = document.getElementById("todo-form");
const addInput = document.getElementById("add-input");

// responsible for an task element 
class Task {
    // text, id, status are parameters for Task object. deleteItemFunction is reference
    // to TaskList method.
    constructor(text, id, status, parentObject) {
        this.text = text;
        this.id = id;
        this.status = status;
        // reference to TaskList
        this.parentObject = parentObject;
        // creates new elements in DOM
        this.todoItem = this.render()
    }

    render() {
        const checkbox = document.createElement("input");
        const label = document.createElement("label");
        const deleteButton = document.createElement("button");
        const listItem = document.createElement("li");

        checkbox.type = "checkbox";
        checkbox.className = "checkbox";

        label.innerText = this.text;
        label.className = "title";

        deleteButton.className = "fas fa-trash";

        listItem.className = "todo-item";
        listItem.appendChild(checkbox);
        listItem.appendChild(label);
        listItem.appendChild(deleteButton);

        checkbox.addEventListener("change", ()=>{listItem.classList.toggle("completed")});
        // Appends reference in TaskList method deleteItem
        deleteButton.addEventListener("click", ()=>{
            let indexOfObjectToDelete = null;
            let objectToDelete = null;
            // iterates through listOfTasks and if id is the same, deletes child from the view part
            for (let i = 0; i < this.parentObject.listOfTasks.length; i++) {
                if (this.id === this.parentObject.listOfTasks[i].id) {
                    
                    this.parentObject.todoList.removeChild(this.parentObject.listOfTasks[i].todoItem)
                    indexOfObjectToDelete = i;
                    objectToDelete = this.parentObject.listOfTasks[i];
                }
            }
            // deletes task by the index from parent
            this.parentObject.listOfTasks.splice(indexOfObjectToDelete, 1)
            deleteTask(objectToDelete);
        });

        return listItem;
    }
}

// create list objects and append to listofTasks
class TaskList{
    constructor(list) {
        this.todoList = document.getElementById("todo-list");
        this.listOfTasks = [];
        this.refresh(list)
    }

    render(){
        // add new item to our todo list
        for (let i = 0; i < this.listOfTasks.length; i++) {
            this.todoList.appendChild(this.listOfTasks[i].todoItem)
        }
    }
    // refresh the page 
    refresh (list) {
        let listOfTaskId = this.getElementsId();
        for (let i = 0; i < list.length; i++) {
            if(listOfTaskId.includes(list[i]["id"]) == false) {
                const task = new Task( 
                    list[i]["text"],
                    list[i]["id"],
                    list[i]["status"],
                    this)
                this.listOfTasks.push(task)
            }
        }
        console.log(this.listOfTasks)
        this.render();
    }

    getElementsId() {
        let arrayId = []
        for(let i = 0; i < this.listOfTasks.length; i++) {
            arrayId.push(this.listOfTasks[i].id)
        }
        return arrayId; 
    }
}

class Controller{
    constructor(baseUrl, name) {
        this.URL = baseUrl + "/" + name + "/todo";
        this.name = name;
    }

    // add new tasks to our backend and return updated list with elements
    async postTasks(data = {}) {
        const response = await fetch(this.URL, {
            method: 'POST', 
            mode: 'cors', 
            cache: 'no-cache', 
            credentials: 'same-origin', 
            
            headers: {
                'Content-Type': 'application/json'
                
            },
            redirect: 'follow', 
            referrerPolicy: 'no-referrer', 
            body: JSON.stringify(data) 
            });
        return response.json(); 
    }

    // request list from backend
    async getTasks() {
        const response = await fetch(this.URL, {
            method: 'GET', 
            mode: 'cors', 
            cache: 'no-cache', 
            headers: {
                'Content-Type': 'application/json'
                
            },
            redirect: 'follow', 
            referrerPolicy: 'no-referrer', 
            });
        return response.json();
    }

    async deleteTasks(task) {
        const response = await fetch(this.URL + "/delete", {
            method: 'POST', 
            mode: 'cors', 
            cache: 'no-cache', 
            credentials: 'same-origin', 
            
            headers: {
                'Content-Type': 'application/json'
                
            },
            redirect: 'follow', 
            referrerPolicy: 'no-referrer', 
            body: JSON.stringify(task) 
            });
        return response.json(); 
    }

}

// creates new object TaskController of type Controller
const TaskController = new Controller("https://jsfeajax.herokuapp.com", "AnaDvorac");
let taskList = null;

// returns list of the task from server
TaskController.getTasks()
        .then ((data => {
            console.log(data);
            listOfElements = data;
            taskList = new TaskList(listOfElements);
        }));

// add task to the server and returns updated list
function postTask(event) {
    event.preventDefault();

    if (addInput.value === "") {
        return alert("Enter something!");
    }

    TaskController.postTasks({text: addInput.value})
        .then((data => {
            console.log(data)
            taskList.refresh(data)
            addInput.value = ""
        }
    ))
}

// delete task and return updated list from the server
function deleteTask(task) {
    TaskController.deleteTasks({id: task.id, text: task.text, status: task.status})
        .then((data => {
            console.log(data)
            taskList.refresh(data)
        }
    ))
}

// bind button with postTask function
todoForm.addEventListener("submit", postTask);
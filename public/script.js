window.onload = () => {
    userInfo();
    tooglelogs();
    loadTodos();
};

async function signup() {
    try {
        const usernameInput = document.getElementById("username1");
        const passwordInput = document.getElementById("password1");
        const response = await axios.post("http://localhost:3006/signup", {
            username: usernameInput.value,
            password: passwordInput.value
        });

        if(response.data.message === "You are already signed up"){
            // alert("User already exists! Please sign in.")
        }else {
            alert("Signed up successful");
        }

        //clearing Input fields
        usernameInput.value = "";
        passwordInput.value = "";
    } catch (error) {
        console.error("Signup failed:", error.response ? error.response.data : error.message);
    }
}

async function signin() {
    try {
        const usernameInput = document.getElementById("username2");
        const passwordInput = document.getElementById("password2");
        const response = await axios.post("http://localhost:3006/signin", {
            username: usernameInput.value,
            password: passwordInput.value
        });

        if(response.data.token){
            if(localStorage.getItem("token") === null){
                 localStorage.setItem("token",response.data.token);
     
                 userInfo();
                 
                 alert("Signed in Sucessfully");

                 tooglelogs();
                 loadTodos();
             }else{
                 alert("Logout to signin!");
             }
        }

            //clearing Input fields
            usernameInput.value = "";
            passwordInput.value = "";
        } catch (error) {
            if(error.response && error.response.data.message === "Invalid User!"){ //error.response will be undefined incase of network error
                alert("User not found");
            }else{
                console.error("Signin failed:", error.response ? error.response.data:error.message);
            }
        }
}

async function userInfo() {
    const token = localStorage.getItem("token");
    const response = await axios.get("http://localhost:3006/me",{
        headers: {
            Authorization: token
        }
    })
    console.log(response.data);
    document.getElementById("information").innerHTML = response.data.username;
    document.getElementById("information2").innerHTML = response.data.username;
}

function toogleforms(){
    // event.preventDefault();
    const signupForm = document.getElementById("signup-form");
    const signinForm = document.getElementById("signin-form");

    if(signinForm.style.display === 'none'){
        signinForm.style.display = 'flex';
        signupForm.style.display = 'none';
    }else{
        signinForm.style.display = 'none';
        signupForm.style.display = 'flex';

    }
}

function tooglelogs() {
    const signupForm = document.getElementById("signup-form");
    const signinForm = document.getElementById("signin-form");
    const userData = document.getElementById("user-data");
    const logoutBtn = document.getElementById("logout-btn");
    const todosContainer = document.getElementById("todos-container");
    const inpTaker = document.getElementById("input-taker");

    if(localStorage.getItem("token") === null){
        signupForm.style.display = 'flex';
        signinForm.style.display = 'none';
        userData.style.display = 'none';
        logoutBtn.style.display = 'none';
        todosContainer.style.display = 'none';
        inpTaker.style.display = 'none';
    }else{
        signupForm.style.display = 'none';
        signinForm.style.display = 'none';
        userData.style.display = 'flex';
        logoutBtn.style.display = 'flex';
        todosContainer.style.display = 'flex';
        inpTaker.style.display = 'flex';
    }
}

// const signupForm = document.getElementById("signup-form");
// const signinForm = document.getElementById("signin-form");
// const userData = document.getElementById("user-data");
// const logoutBtn = document.getElementById("logout-btn");
// const todosContainer = document.getElementById("todos-container");

// signupForm.style.display = 'none';
// signinForm.style.display = 'none';
// userData.style.display = 'flex';
// logoutBtn.style.display = 'flex';
// todosContainer.style.display = 'flex';

async function logout() {
    localStorage.removeItem("token");

    tooglelogs();

    document.getElementById("information").innerHTML = "";
    document.getElementById("information2").innerHTML = "";
}

async function addTodo() {
    try{
        const task = document.getElementById("todo-adder");
        const token = localStorage.getItem("token");
        
        if(task.value.trim() === ""){
            alert("task input empty");
            return;
        }
        const response = await axios.post("http://localhost:3006/todos",{
            "task": task.value},{
                headers:{
                    Authorization: token
                }
            });
        task.value="";
        // alert(`Task was added`);
    }catch(error){
        alert(`task was not added due to ${error.message}`);
    }

    loadTodos();
}

async function loadTodos() {
    const token = localStorage.getItem("token");

    const response = await axios.get("http://localhost:3006/todos",{
        headers: {
            Authorization: token
        }
    });
    const tasks = response.data.tasks;
    const parentDiv = document.getElementById("todos-container");
    parentDiv.innerHTML = "";
    tasks.forEach(t => {
    //    <div class="task-container completed" style="flex-direction: column;">
    //         <div class="taskbox">
    //             <input type="checkbox" class="myCheckbox">
    //             <div class="task completed">Lorem ipsum dolor sit amet, consectetur adipisicing elit. </div>
    //             <div class="btns-keeper">
    //                 <input type="button" class="del-btn" value="delete" onclick="deleteTodo(index)">
    //                 <input type="button" class="edit-btn" value="edit" onclick="toogleEdit(index)">
    //             </div>
    //         </div>

    //         <div id="edit-items-container" class="edit-buttons">
    //             <input id="new-task" type="text" placeholder="new task">
    //             <input type="button" class="save-btn" value="save" onclick="editTodo(index)">
    //             <input type="button" class="cancel-btn" value="cancel" onclick="toogleEdit(index)">
    //         </div>
    //     </div>
        const input = document.createElement("input");
        input.setAttribute("type","checkbox");
        input.className = "myCheckbox";
        input.setAttribute("onclick",`marker("${t.id}")`)
        input.checked = t.completed;

        const div1 = document.createElement("div");
        div1.className = `task ${t.completed?"completed":""}`;
        div1.innerHTML = t.title;

        const inputdelB = document.createElement("input");
        inputdelB.setAttribute("type","button");
        inputdelB.setAttribute("onclick",`deleteTodo("${t.id}")`);
        inputdelB.setAttribute("value","delete");
        inputdelB.className = "del-btn";

        const inputeditB = document.createElement("input");
        inputeditB.setAttribute("type","button");
        inputeditB.setAttribute("onclick",`toogleEdit("${t.id}")`);
        inputeditB.setAttribute("value","edit");
        inputeditB.className = "edit-btn";

        const btnKeeprDiv = document.createElement("div");
        btnKeeprDiv.className = "btns-keeper";
        btnKeeprDiv.appendChild(inputdelB);
        btnKeeprDiv.appendChild(inputeditB);

        const taskboxDiv = document.createElement("div");
        taskboxDiv.className = "taskbox";
        taskboxDiv.appendChild(input);
        taskboxDiv.appendChild(div1);
        taskboxDiv.appendChild(btnKeeprDiv);

        const newTask = document.createElement("input");
        newTask.id = `new-task-${t.id}`;
        newTask.setAttribute("type","text");
        newTask.setAttribute("placeholder","new task")
        
        const inpSaveB = document.createElement("input");
        inpSaveB.className = "save-btn";
        inpSaveB.setAttribute("type","button");
        inpSaveB.setAttribute("value","save");
        inpSaveB.setAttribute("onclick",`editTodo("${t.id}")`);
        
        const inpCancelB = document.createElement("input");
        inpCancelB.className = "cancel-btn";
        inpCancelB.setAttribute("type","button");
        inpCancelB.setAttribute("value","cancel");
        inpCancelB.setAttribute("onclick",`toogleEdit("${t.id}")`);
        
        const editDiv = document.createElement("div");
        editDiv.id = `edit-items-container${t.id}`;
        editDiv.style.display = 'none';
        editDiv.className = "edit-buttons";
        editDiv.appendChild(newTask);
        editDiv.appendChild(inpSaveB);
        editDiv.appendChild(inpCancelB);


        const div2 = document.createElement("div");
        div2.className = `task-container ${t.completed?"completed":""}`

        div2.appendChild(taskboxDiv);
        div2.appendChild(editDiv);

        parentDiv.appendChild(div2);
    });
}

async function deleteTodo(index) {
    try {
        const response = await axios.delete("http://localhost:3006/todos",{
                data:{
                    "id":index
                },
                headers:{
                    Authorization: localStorage.getItem("token")
                }
            }   
        );
        
        // alert(`task at ${index} was deleted`)
    } catch (error) {
        alert(`error deleting task: ${error}`)
    }

    loadTodos();
}

function toogleEdit(index) {
    const edits = document.getElementById(`edit-items-container${index}`);

    if(edits.style.display === 'none'){
        edits.style.display = 'flex';
    }else{
        edits.style.display = 'none';
    }
}

async function editTodo(index) {
    const newTask = document.getElementById(`new-task-${index}`);

    if(newTask.value.trim() === ""){
        alert("empty input");
        return;
    }

    try{
        const response = await axios.put("http://localhost:3006/todos",{
            "task": newTask.value,
            "update": new Date().toISOString(),
            "id": index},{
            headers:{
                Authorization: localStorage.getItem("token")
            }
        });

        newTask.value = "";

        toogleEdit(index);
        loadTodos();

        // alert("task was updated");
    }catch(error){
        alert(`error updating task: ${error}`)
    }
}

async function marker(index) {
    try {
        const response = await axios.patch("http://localhost:3006/todos",{
            "id": index
            },{
            headers:{
                Authorization: localStorage.getItem("token")
            }
        });

        loadTodos();
        
        // alert("marked");
    } catch (error) {
        alert(`error marking: ${error}`)
    }
}
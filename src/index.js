const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers

  const user = users.find(user => user.username === username)

  if(!user) {
    return response.status(400).json({ error: 'User not found'})
   }

   request.user = user

   return next()
}

app.post('/users', (request, response) => {
  const { name, username } = request.body;

  const userAlreadyExists = users.some((user) => user.username === username)

  if(userAlreadyExists){ 
    return response.status(400).json({ error: 'User already exists'})
  }

  const userInfo = {
    name,
    username,
    id: uuidv4(),
    todos: []
  }
  users.push(userInfo);

  return response.status(201).send(userInfo)
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request

  response.status(200).json(user.todos)
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body
  const { user } = request

  const todos = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  }
  user.todos.push(todos)

  return response.status(201).send(todos)
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { id } = request.params
  const { user } = request
  const { title, deadline } = request.body

  const userById = user.todos.filter(todos => todos.id === id)

  if(userById[0]) {
    userById[0].title = title
    userById[0].deadline = new Date(deadline)
    
    return response.status(201).send(userById[0])
    
  } else {
    return response.status(404).json({ error: 'Task not found'})
  }
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { id } = request.params
  const { user } = request
  const userById = user.todos.filter(todos => todos.id === id)
  
  if(userById[0]) {
    user.todos[0].done = true
      return response.status(201).send(userById[0])
  } else {
    return response.status(404).json({ error: 'Task not found'})
  }
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { id } = request.params
  const { user } = request
  const userById = user.todos.filter(todos => todos.id === id)
  
  if(userById[0]) {
    user.todos.splice(user, 1)
      return response.status(201).send(userById[0])
  } else {
    return response.status(400).json({ error: 'Task not found'})
  }
});

module.exports = app;
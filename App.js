import { Header, User, TodoInput, TodoList, TodoCount, TodoFilter, Loading } from './components'
import { httpMethod, filterStatus, className } from './utils/constants.js'
import fetchManager from "./api/api.js"

const delay = (ms) => new Promise((resolve) => setTimeout(() => resolve(), ms))

const getTodoHash = (todos) => {
  return {
    [filterStatus.ALL]: todos,
    [filterStatus.ACTIVE]: todos.filter(({isCompleted}) => isCompleted === false),
    [filterStatus.COMPLETED]: todos.filter(({isCompleted}) => isCompleted === true)
  }
}

export default function App() {
  if (new.target !== App) {
    return new App()
  }

  this.init = async () => {
    const { postTodoItem, onChangeUser, onToggle, onDelete, onEdit, onFilter } = this
    this.username = 'donguk'
    this.todos = []
    this.todoHash = {
      [filterStatus.ALL]: this.todos,
      [filterStatus.ACTIVE]: [],
      [filterStatus.COMPLETED]: []
    }
    this.filterStatus = filterStatus.ALL

    this.$header = new Header({
      selector: '#user-title',
      username: this.username
    })

    this.$user = new User({
      selector: '#user-list',
      currentUser: this.username,
      users: await this.getUsers(),
      onChangeUser,
    })

    new TodoInput({
      selector: '.new-todo',
      postTodoItem
    })

    this.$todoList = new TodoList({
      selector: '.todo-list',
      todos: this.todos,
      onToggle,
      onDelete,
      onEdit,
    })

    this.$todoCount = new TodoCount({
      selector: '.todo-counter',
      totalCount: this.todos.length,
      completedCount: this.todos.filter(({isCompleted}) => isCompleted === true).length
    })

    new TodoFilter({
      selector: '.filters',
      onFilter
    })

    this.$loading = new Loading({
      selector: '.todo-list'
    })

    this.$removeAllBtn = document.querySelector(`.${className.REMOVE_ALL}`)
    this.$removeAllBtn.addEventListener('click', () => {
      this.onDeleteAll()
    })

    this.getTodos()
  }

  this.onFilter = (status) => {
    this.filterStatus = status
    this.setState()
  }

  this.setState = () => {
    const renderTodos = this.todoHash[this.filterStatus]
    this.$todoList.setState(this.username, renderTodos)
    this.$todoCount.setState(
      renderTodos.length,
      renderTodos.filter(({isCompleted}) => isCompleted === true).length
    )
  }

  this.getUsers = async () => {
    try {
      return await fetchManager({
        method: httpMethod.GET,
        path: '/api/u'
      })
    } catch (e) {
      console.error(e)
    }
  }

  this.getTodos = async () => {
    this.$loading.render() // loading on
    // await delay(500) // delay 주고 싶다면 추가
    try {
      const { todoList } = await fetchManager({
        method: httpMethod.GET,
        path: `/api/u/${this.username}/item`,
      })
      this.todos = todoList
      this.todoHash = getTodoHash(todoList)
      this.setState()
    } catch (e) {
      console.error(e)
      this.todos = [] // 해당 유저의 todo가 없는 경우
      this.setState()
    }
  }

  this.onChangeUser = (username) => {
    this.username = username
    this.$header.setState(username)
    this.$user.setState()
    this.getTodos()
  }

  this.onToggle = async (itemId) => {
   try {
     await fetchManager({
       method: httpMethod.PUT,
       path: `/api/u/${this.username}/item/${itemId}/toggle`,
     })
     this.getTodos()
   } catch(e) {
     console.error(e)
   }
  }

  this.onDelete = async (itemId) => {
    try {
      await fetchManager({
        method: httpMethod.DELETE,
        path: `/api/u/${this.username}/item/${itemId}`,
      })
      this.getTodos()
    } catch(e) {
      console.error(e)
    }
  }

  this.onEdit = async (itemId, contents) => {
    try {
      await fetchManager({
        method: httpMethod.PUT,
        path: `/api/u/${this.username}/item/${itemId}`,
        body: { contents }
      })
      this.getTodos()
    } catch (e) {
      console.error(e)
    }
  }

  this.onDeleteAll = async () => {
    try {
      await fetchManager({
        method: httpMethod.DELETE,
        path: `/api/u/${this.username}/items`,
      })
      this.getTodos()
    } catch (e) {
      console.error(e)
    }
  }

  this.postTodoItem = async (text) => {
    try {
      await fetchManager({
        method: httpMethod.POST,
        path: `/api/u/${this.username}/item`,
        body: { contents: text }
      })
      this.getTodos()
    } catch (e) {
      console.error(e)
    }
  }

  this.init()
}

import {checkSelector} from "../utils/validations.js"
import {tagName, className, keyName} from "../utils/constants.js"

export default function TodoList(props) {
  const {selector, todos, onToggle, onDelete, onEdit} = props
  if (new.target !== TodoList) {
    return new TodoList(props)
  }
  checkSelector(selector)

  this.init = () => {
    this.$target = document.querySelector(selector)
    this.todos = todos
    this.render()
    this.bindEvent()
  }

  this.bindEvent = () => {
    const clickEventHandler = (e) => {
      const li = e.target.closest('li')
      const {id} = li.dataset
      if (
        e.target.tagName === tagName.INPUT &&
        e.target.className === className.TOGGLE
      ) {
        onToggle(id)
      } else if (e.target.tagName === tagName.BUTTON) {
        onDelete(id)
      }
    }
    const dblclickEventHandler = (e) => {
      const li = e.target.closest('li')
      this.editInputValue = e.target.innerText // 수정 시작할 때 초기 상태의 value 저장
      if (!li.classList.contains(className.EDITING)) {
        li.classList.add(className.EDITING)
        li.querySelector(`.${className.EDIT}`).focus()
      }
    }
    const keyUpEventHandler = (e) => {
      if (e.key === keyName.ESC) {
        const li = e.target.closest('li')
        li.classList.remove(className.EDITING)
      } else if (e.key === keyName.ENTER && e.target.value.trim()) {
        const li = e.target.closest('li')
        li.classList.remove(className.EDITING)
        onEdit(li.dataset.id, e.target.value.trim())
      }
    }

    const focusInEventHandler = (e) => {
      if (
        e.target.tagName === tagName.INPUT &&
        e.target.className === className.EDIT
      ) {
        e.target.selectionStart = e.target.value.length
      }
    }

    const focusOutEventHandler = (e) => {
      if (
        e.target.tagName === tagName.INPUT &&
        e.target.className === className.EDIT
      ) {
        e.target.value = this.editInputValue //초기상태의 value로 reset
        const li = e.target.closest('li')
        if (li.classList.contains(className.EDITING)) {
          li.classList.remove(className.EDITING)
        }
      }
    }

    this.$target.addEventListener('click', clickEventHandler)
    this.$target.addEventListener('dblclick', dblclickEventHandler)
    this.$target.addEventListener('keyup', keyUpEventHandler)
    this.$target.addEventListener('focusin', focusInEventHandler) // 맨 마지막 글자에 focus
    this.$target.addEventListener('focusout', focusOutEventHandler)
  }

  const todoItemHTMLTemplate = ({_id, contents, isCompleted}, index) => {
    return `
      <li data-id=${_id} data-index=${index} class=${isCompleted ? 'completed' : ''}>
          <div class="view">
            <input class="toggle" type="checkbox" ${isCompleted ? 'checked' : ''}/>
            <label class="label">${contents}</label>
            <button class="destroy"></button>
          </div>
          <input class="edit" value=${contents} />
      </li>`
  }

  this.render = () => {
    this.$target.innerHTML = this.todos.map(todoItemHTMLTemplate).join()
  }

  this.setState = (username, todos) => {
    this.username = username
    this.todos = todos
    this.render()
  }

  this.init()
}


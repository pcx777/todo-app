// Получаем элементы DOM
const taskInput = document.getElementById('taskInput');
const addTaskButton = document.getElementById('addTaskButton');
const taskList = document.getElementById('taskList');
const filterButtons = document.querySelectorAll('.filter');
const editModal = document.getElementById('editModal');
const editTaskInput = document.getElementById('editTaskInput');
const saveEditButton = document.getElementById('saveEditButton');
const closeModalButton = document.querySelector('.close');
const loadMoreButton = document.getElementById('loadMoreButton');

// Массив для хранения задач
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

// Текущий фильтр
let currentFilter = 'all';

// Индекс редактируемой задачи
let editingIndex = null;

// Количество отображаемых задач
let visibleTasksCount = 5;

// Функция для сохранения задач в localStorage
function saveTasksToLocalStorage() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

// Функция для рендеринга списка задач с учетом текущего фильтра
function renderTasks(limit = visibleTasksCount) {
    taskList.innerHTML = ''; // Очищаем список перед перерисовкой

    const filteredTasks = tasks.filter(task => {
        if (currentFilter === 'all') return true;
        if (currentFilter === 'active') return !task.completed;
        if (currentFilter === 'completed') return task.completed;
    });

    // Отображаем только ограниченное количество задач
    filteredTasks.slice(0, limit).forEach((task, index) => {
        const li = document.createElement('li');
        li.className = task.completed ? 'completed' : '';

        // Контейнер для текста задачи
        const taskTextContainer = document.createElement('div');
        taskTextContainer.className = 'task-text';

        // Номер задачи
        const taskNumber = document.createElement('span');
        taskNumber.className = 'task-number';
        taskNumber.textContent = `${index + 1}. `;
        taskTextContainer.appendChild(taskNumber);

        // Добавляем текст задачи
        const span = document.createElement('span');
        span.textContent = task.text;
        taskTextContainer.appendChild(span);

        li.appendChild(taskTextContainer);

        // Контейнер для иконок действий
        const iconsContainer = document.createElement('div');
        iconsContainer.className = 'task-icons';

        // Иконка удаления
        const removeIcon = document.createElement('button');
        removeIcon.className = 'remove';
        removeIcon.innerHTML = '✖️'; // Unicode символ крестика
        removeIcon.addEventListener('click', () => removeTask(index));
        iconsContainer.appendChild(removeIcon);

        // Иконка завершения задачи
        const completeIcon = document.createElement('button');
        completeIcon.className = 'complete';
        completeIcon.innerHTML = task.completed ? '✔️' : '○'; // Unicode символ галочки или круга
        completeIcon.addEventListener('click', () => completeTask(index));
        iconsContainer.appendChild(completeIcon);

        // Иконка редактирования задачи
        const editIcon = document.createElement('button');
        editIcon.className = 'edit';
        editIcon.innerHTML = '✏️'; // Unicode символ карандаша
        editIcon.addEventListener('click', () => openEditModal(index));
        iconsContainer.appendChild(editIcon);

        li.appendChild(iconsContainer);
        taskList.appendChild(li);
    });

    // Показываем кнопку "Загрузить еще", если есть больше задач
    if (filteredTasks.length > limit) {
        loadMoreButton.style.display = 'block';
    } else {
        loadMoreButton.style.display = 'none';
    }

    saveTasksToLocalStorage();
}

// Функция для добавления новой задачи
function addTask() {
    const taskText = taskInput.value.trim();
    if (taskText !== '') {
        tasks.unshift({ text: taskText, completed: false }); // Добавляем задачу в начало массива
        taskInput.value = ''; // Очищаем поле ввода
        visibleTasksCount = 5; // Сбрасываем видимое количество задач
        renderTasks();
    }
}

// Функция для удаления задачи
function removeTask(index) {
    tasks.splice(index, 1); // Удаляем задачу по индексу
    renderTasks();
}

// Функция для отметки задачи как выполненной
function completeTask(index) {
    tasks[index].completed = !tasks[index].completed; // Переключаем состояние выполнения
    renderTasks();
}

// Функция для открытия модального окна редактирования
function openEditModal(index) {
    editingIndex = index;
    editTaskInput.value = tasks[index].text;
    editModal.style.display = 'block';
}

// Функция для закрытия модального окна
function closeEditModal() {
    editModal.style.display = 'none';
    editingIndex = null;
}

// Функция для сохранения изменений в задаче
function saveEditTask() {
    const newTaskText = editTaskInput.value.trim();
    if (newTaskText !== '') {
        tasks[editingIndex].text = newTaskText;
        closeEditModal();
        renderTasks();
    }
}

// Обработчик события для кнопки "Добавить задачу"
addTaskButton.addEventListener('click', addTask);

// Обработчик события для нажатия клавиши Enter
taskInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        addTask();
    }
});

// Обработчик событий для кнопок фильтрации
filterButtons.forEach(button => {
    button.addEventListener('click', () => {
        currentFilter = button.dataset.filter;
        renderTasks();
    });
});

// Обработчик события для закрытия модального окна
closeModalButton.addEventListener('click', closeEditModal);

// Обработчик события для сохранения изменений в модальном окне
saveEditButton.addEventListener('click', saveEditTask);

// Закрытие модального окна при клике вне его области
window.addEventListener('click', (event) => {
    if (event.target === editModal) {
        closeEditModal();
    }
});

// Обработчик события для кнопки "Загрузить еще"
loadMoreButton.addEventListener('click', () => {
    visibleTasksCount += 5; // Увеличиваем количество видимых задач на 5
    renderTasks(visibleTasksCount);
});

// Инициализация приложения
renderTasks();

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then((registration) => {
                console.log('Service Worker зарегистрирован:', registration);
            })
            .catch((error) => {
                console.error('Ошибка регистрации Service Worker:', error);
            });
    });
}
// frontend/src/context/TaskContext.jsx
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';

// ---------------------------------------------------------------
// CONTEXTO
// ---------------------------------------------------------------

const TaskContext = createContext();

export const useTasks = () => {
    const ctx = useContext(TaskContext);
    if (!ctx) {
        throw new Error("useTasks debe usarse dentro de un <TaskProvider>");
    }
    return ctx;
};

// ---------------------------------------------------------------
// PROVIDER
// ---------------------------------------------------------------

export const TaskProvider = ({ children }) => {
    const [tasks, setTasks] = useState([]);
    const [tags, setTags] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // -----------------------------------------------------------
    // Normalizar tarea (compatibilidad con date/due_date)
    // -----------------------------------------------------------
    const normalizeTask = (task) => ({
        ...task,
        due_date: task.due_date || task.date || null, // <-- importante
        status: task.status || (task.completed ? "completed" : "pending"),
        completed: task.completed ?? (task.status === "completed"),
        tags: Array.isArray(task.tags) ? task.tags : [],
    });

    // -----------------------------------------------------------
    // 1. Cargar tareas y tags desde localStorage
    // -----------------------------------------------------------
    const loadTasks = useCallback(() => {
        setLoading(true);
        try {
            const savedTasks = JSON.parse(localStorage.getItem('tasks')) || [];
            setTasks(savedTasks.map(normalizeTask));

            const savedTags = JSON.parse(localStorage.getItem('tags')) || [];
            setTags(savedTags);

        } catch (err) {
            console.error("loadTasks error:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadTasks();
    }, [loadTasks]);

    // -----------------------------------------------------------
    // 2. Guardar tareas y tags en localStorage
    // -----------------------------------------------------------
    const saveTasks = (tasksToSave) => {
        localStorage.setItem('tasks', JSON.stringify(tasksToSave));
    };

    const saveTags = (tagsToSave) => {
        localStorage.setItem('tags', JSON.stringify(tagsToSave));
    };

    // -----------------------------------------------------------
    // 3. Crear tarea
    // -----------------------------------------------------------
    const createTask = (taskData) => {
        setError(null);
        const newTask = normalizeTask({
            id: uuidv4(),
            title: taskData.title || 'Nueva tarea',
            description: taskData.description || '',
            date: taskData.date || new Date().toISOString().split('T')[0],
            due_date: taskData.due_date || taskData.date || new Date().toISOString().split('T')[0], // <-- agregado
            tags: taskData.tags || [],
            status: "pending",
            completed: false,
            priority: taskData.priority || 'medium',
            eisenhower_quadrant: taskData.eisenhower_quadrant || ''
        });

        const updatedTasks = [...tasks, newTask];
        setTasks(updatedTasks);
        saveTasks(updatedTasks);

        return newTask;
    };

    // -----------------------------------------------------------
    // 4. Actualizar tarea
    // -----------------------------------------------------------
    const updateTask = (taskId, updateData) => {
        setError(null);
        const updatedTasks = tasks.map(t => t.id === taskId ? normalizeTask({ ...t, ...updateData }) : t);
        setTasks(updatedTasks);
        saveTasks(updatedTasks);
        return updatedTasks.find(t => t.id === taskId);
    };

    // -----------------------------------------------------------
    // 5. Eliminar tarea
    // -----------------------------------------------------------
    const deleteTask = (taskId) => {
        setError(null);
        const updatedTasks = tasks.filter(t => t.id !== taskId);
        setTasks(updatedTasks);
        saveTasks(updatedTasks);
    };

    // -----------------------------------------------------------
    // 6. Crear tag
    // -----------------------------------------------------------
    const createTag = (name) => {
        const newTag = { id: uuidv4(), name };
        const updatedTags = [...tags, newTag];
        setTags(updatedTags);
        saveTags(updatedTags);
        return newTag;
    };

    // -----------------------------------------------------------
    // 7. Eliminar tag
    // -----------------------------------------------------------
    const deleteTag = (tagId) => {
        const updatedTags = tags.filter(t => t.id !== tagId);
        setTags(updatedTags);
        saveTags(updatedTags);

        const updatedTasks = tasks.map(task => ({
            ...task,
            tags: task.tags.filter(tag => tag.id !== tagId)
        }));
        setTasks(updatedTasks);
        saveTasks(updatedTasks);
    };

    const contextValue = {
        tasks,
        tags,
        loading,
        error,
        createTask,
        updateTask,
        deleteTask,
        createTag,
        deleteTag,
    };

    return (
        <TaskContext.Provider value={contextValue}>
            {children}
        </TaskContext.Provider>
    );
};

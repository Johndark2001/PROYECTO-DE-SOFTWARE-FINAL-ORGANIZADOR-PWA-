// frontend/src/pages/Hoy.jsx
import React, { useState } from 'react';
import { useTasks } from '../context/TaskContext.jsx';
import TaskItem from '../components/TaskItem';
import AddTaskModal from '../components/AddTaskModal';
import { IoAddCircle, IoFunnelOutline } from 'react-icons/io5';
import './Hoy.css';

const Hoy = () => {
    const { tasks } = useTasks();
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Fecha hoy (YYYY-MM-DD)
    const today = new Date().toISOString().split('T')[0];

    // -----------------------------------------------------------
    // Filtrar tareas del día
    // -----------------------------------------------------------
    const tasksToday = tasks.filter(task => {
        if (!task.date) return false;

        // Aseguramos que siempre trabajamos con string
        const rawDate = typeof task.date === "string" ? task.date : "";
        const dateOnly = rawDate.split("T")[0];

        return dateOnly === today;
    });

    const pending = tasksToday.filter(t => !t.completed);
    const completed = tasksToday.filter(t => t.completed);

    return (
        <div className="hoy-container">
            {/* ENCABEZADO */}
            <header className="hoy-header">
                <div>
                    <h1 className="main-title">Hoy</h1>
                    <p className="subtitle">
                        {new Date().toLocaleDateString('es-ES', {
                            weekday: 'long',
                            month: 'long',
                            day: 'numeric',
                        })}
                    </p>
                </div>

                <div className="action-buttons">
                    <button className="filter-btn" title="Filtrar tareas">
                        <IoFunnelOutline />
                    </button>

                    <button
                        className="add-task-btn btn-primary"
                        onClick={() => setIsModalOpen(true)}
                    >
                        <IoAddCircle className="add-icon" />
                        Añadir Tarea
                    </button>
                </div>
            </header>

            {/* LISTA DE TAREAS */}
            <div className="task-list-section">

                {/* PENDIENTES */}
                <section className="pending-tasks">
                    <h2 className="section-title">
                        Tareas Pendientes ({pending.length})
                    </h2>

                    <div className="tasks-grid">
                        {pending.map(task => (
                            <TaskItem key={task.id} task={task} />
                        ))}

                        {pending.length === 0 && (
                            <p className="empty-text">
                                No tienes tareas pendientes hoy 🎉
                            </p>
                        )}
                    </div>
                </section>

                {/* COMPLETADAS */}
                <section className="completed-tasks">
                    <h2 className="section-title completed-title">
                        Completadas ({completed.length})
                    </h2>

                    <div className="tasks-grid">
                        {completed.map(task => (
                            <TaskItem key={task.id} task={task} />
                        ))}

                        {completed.length === 0 && (
                            <p className="empty-text">
                                Aún no has completado tareas.
                            </p>
                        )}
                    </div>
                </section>
            </div>

            {/* MODAL */}
            <AddTaskModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />
        </div>
    );
};

export default Hoy;

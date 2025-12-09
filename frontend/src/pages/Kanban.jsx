// frontend/src/pages/Kanban.jsx
import React, { useMemo, useCallback } from 'react';
import { useTasks } from '../context/TaskContext.jsx';
import TaskItem from '../components/TaskItem';
import './Kanban.css';

// -----------------------------------------------------------
// Componente de Columna Kanban
// -----------------------------------------------------------
const KanbanColumn = ({ status, title, tasks, updateTask }) => {
    const { deleteTask } = useTasks();

    const handleMoveTask = useCallback(
        (taskId, newStatus) => {
            try {
                updateTask(taskId, {
                    status: newStatus,
                    completed: newStatus === "completed"
                });
            } catch (error) {
                alert(`Error al mover la tarea: ${error.message}`);
            }
        },
        [updateTask]
    );

    const renderMoveButtons = (task) => {
        switch (status) {
            case "pending":
                return (
                    <button
                        onClick={() => handleMoveTask(task.id, "in_progress")}
                        className="btn-kanban-move"
                    >
                        Iniciar
                    </button>
                );
            case "in_progress":
                return (
                    <>
                        <button
                            onClick={() => handleMoveTask(task.id, "pending")}
                            className="btn-kanban-move btn-undo-kanban"
                        >
                            Pausar
                        </button>

                        <button
                            onClick={() => handleMoveTask(task.id, "completed")}
                            className="btn-kanban-move btn-complete-kanban"
                        >
                            Finalizar
                        </button>
                    </>
                );
            case "completed":
                return (
                    <button
                        onClick={() => handleMoveTask(task.id, "pending")}
                        className="btn-kanban-move btn-undo-kanban"
                    >
                        Reabrir
                    </button>
                );
            default:
                return null;
        }
    };

    const handleDeleteTask = async (taskId, title) => {
        if (window.confirm(`¿Eliminar la tarea "${title}"?`)) {
            try {
                await deleteTask(taskId);
            } catch (err) {
                alert(`Error al eliminar la tarea: ${err.message}`);
            }
        }
    };

    return (
        <div className={`kanban-column column-${status}`}>
            <h2 className="kanban-title">
                {title} ({tasks.length})
            </h2>

            <div className="kanban-task-list">
                {tasks.length > 0 ? (
                    tasks.map(task => (
                        <div key={task.id} className="kanban-task-wrapper">
                            <TaskItem task={task} />
                            <div className="task-move-actions">
                                {renderMoveButtons(task)}
                                <button
                                    className="btn-kanban-delete"
                                    onClick={() => handleDeleteTask(task.id, task.title)}
                                    title="Eliminar tarea"
                                >
                                    🗑️
                                </button>
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="no-tasks">Añade tareas a esta columna.</p>
                )}
            </div>
        </div>
    );
};

// -----------------------------------------------------------
// Página Kanban
// -----------------------------------------------------------
function Kanban() {
    const { tasks, loading, error, updateTask } = useTasks();

    const columnDefinitions = useMemo(
        () => [
            { status: "pending", title: "🔴 Pendiente" },
            { status: "in_progress", title: "🟡 En Progreso" },
            { status: "completed", title: "🟢 Completada" }
        ],
        []
    );

    // Agrupar tareas por estado
    const groupedTasks = useMemo(() => {
        const groups = { pending: [], in_progress: [], completed: [] };

        tasks.forEach(task => {
            const st = task.status || "pending";
            if (groups[st]) groups[st].push(task);
        });

        // Ordenar por fecha
        Object.keys(groups).forEach(column => {
            groups[column].sort((a, b) => {
                const dateA = a.date ? new Date(a.date).getTime() : 0;
                const dateB = b.date ? new Date(b.date).getTime() : 0;
                return dateA - dateB;
            });
        });

        return groups;
    }, [tasks]);

    if (loading) return <p className="loading-state">Cargando el tablero Kanban...</p>;
    if (error) return <p className="form-error">❌ Error al cargar las tareas: {error}</p>;

    return (
        <div className="kanban-page">
            <h1 className="page-header">📊 Tablero Kanban</h1>
            <p className="kanban-subtitle">
                Usa los botones para cambiar el estado de tus tareas.
            </p>

            <div className="kanban-board">
                {columnDefinitions.map(col => (
                    <KanbanColumn
                        key={col.status}
                        status={col.status}
                        title={col.title}
                        tasks={groupedTasks[col.status]}
                        updateTask={updateTask}
                    />
                ))}
            </div>
        </div>
    );
}

export default Kanban;

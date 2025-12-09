// frontend/src/pages/Eisenhower.jsx
import React, { useMemo } from 'react';
import { useTasks } from '../context/TaskContext.jsx';
import TaskItem from '../components/TaskItem';
import './Eisenhower.css';

// -----------------------------------------------------------
// Componente de Cuadrante Eisenhower
// -----------------------------------------------------------
const Quadrant = ({ quadrantKey, title, tasks, color }) => {
    const { deleteTask } = useTasks();

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
        <div
            className={`eisenhower-quadrant quadrant-${quadrantKey}`}
            style={{ backgroundColor: color }}
        >
            <h2 className="quadrant-title">
                {title} ({tasks.length})
            </h2>

            <div className="quadrant-task-list">
                {tasks.length > 0 ? (
                    tasks.map(task => (
                        <div key={task.id} className="eisenhower-task-wrapper">
                            <TaskItem task={task} isEisenhowerView={true} />
                            <button
                                className="btn-eisenhower-delete"
                                onClick={() => handleDeleteTask(task.id, task.title)}
                                title="Eliminar tarea"
                            >
                                🗑️
                            </button>
                        </div>
                    ))
                ) : (
                    <p className="no-tasks">
                        ¡Vacío! Buen trabajo o no hay tareas en este cuadrante.
                    </p>
                )}
            </div>
        </div>
    );
};

// -----------------------------------------------------------
// Página Eisenhower
// -----------------------------------------------------------
function Eisenhower() {
    const { tasks, loading, error } = useTasks();

    const quadrants = useMemo(
        () => [
            {
                key: 'urgente_importante',
                title: 'HACER - Urgente e Importante',
                color: 'var(--color-eisenhower-rojo)',
            },
            {
                key: 'importante_no_urgente',
                title: 'PROGRAMAR - Importante, No Urgente',
                color: 'var(--color-eisenhower-amarillo)',
            },
            {
                key: 'urgente_no_importante',
                title: 'DELEGAR - Urgente, No Importante',
                color: 'var(--color-eisenhower-azul)',
            },
            {
                key: 'ni_urgente_ni_importante',
                title: 'ELIMINAR - Ni Urgente ni Importante',
                color: 'var(--color-eisenhower-verde)',
            },
        ],
        []
    );

    // Agrupación de tareas por cuadrante
    const groupedTasks = useMemo(() => {
        const groups = quadrants.reduce((acc, q) => ({ ...acc, [q.key]: [] }), {});

        tasks
            .filter(t => !t.completed)
            .forEach(task => {
                const key = task.eisenhower_quadrant || 'ni_urgente_ni_importante';
                if (groups[key]) groups[key].push(task);
            });

        Object.keys(groups).forEach(key => {
            groups[key].sort((a, b) => {
                const dateA = a.date ? new Date(a.date).getTime() : Infinity;
                const dateB = b.date ? new Date(b.date).getTime() : Infinity;
                return dateA - dateB;
            });
        });

        return groups;
    }, [tasks, quadrants]);

    if (loading) return <p className="loading-state">Cargando la matriz Eisenhower...</p>;
    if (error) return <p className="form-error">❌ Error al cargar las tareas: {error}</p>;

    return (
        <div className="eisenhower-page">
            <h1 className="page-header">⚔️ Matriz Eisenhower</h1>
            <p className="eisenhower-description">
                Organiza tus tareas según su <strong>Urgencia</strong> e{' '}
                <strong>Importancia</strong> para maximizar la productividad.
            </p>

            <div className="eisenhower-grid">
                {quadrants.map(q => (
                    <Quadrant
                        key={q.key}
                        quadrantKey={q.key}
                        title={q.title}
                        tasks={groupedTasks[q.key] || []}
                        color={q.color}
                    />
                ))}
            </div>

            <div className="legend">
                {/* Leyenda visual opcional */}
            </div>
        </div>
    );
}

export default Eisenhower;

// frontend/src/components/TaskItem.jsx
import React from 'react';
import './TaskItem.css';
import { FaRegClock, FaTag, FaCheckCircle, FaCircle, FaTrash } from 'react-icons/fa';
import { useTasks } from '../context/TaskContext';

const TaskItem = ({ task }) => {
    const { updateTask, deleteTask } = useTasks();

    const isCompleted = task.completed === true;

    // Cambiar estado completado
    const toggleComplete = async () => {
        await updateTask(task.id, {
            completed: !isCompleted,
            status: !isCompleted ? 'completed' : 'pending',
        });
    };

    // Eliminar tarea
    const handleDelete = async () => {
        if (window.confirm(`¿Eliminar la tarea "${task.title}"?`)) {
            try {
                await deleteTask(task.id);
            } catch (err) {
                alert(`Error al eliminar la tarea: ${err.message}`);
            }
        }
    };

    // Eliminar etiqueta de la tarea
    const handleRemoveTag = async (tagId) => {
        const updatedTags = task.tags.filter(tag => tag.id !== tagId);
        await updateTask(task.id, { tags: updatedTags });
    };

    const cardClass = isCompleted ? 'task-item completed' : 'task-item pending';

    const formattedDate = task.date
        ? new Date(task.date).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' })
        : 'Sin fecha';

    return (
        <div className={cardClass}>
            <div className="task-header">
                <div className="task-status-icon" onClick={toggleComplete}>
                    {isCompleted ? <FaCheckCircle className="completed-icon" /> : <FaCircle className="pending-icon" />}
                </div>

                <h3 className="task-title">{task.title}</h3>

                <div className="task-actions">
                    <button className="task-delete-btn" onClick={handleDelete} title="Eliminar tarea">
                        <FaTrash />
                    </button>
                </div>
            </div>

            <div className="task-details">
                <span className="task-detail-item">
                    <FaRegClock className="icon-clock" />
                    {formattedDate}
                </span>

                {task.tags?.length > 0 && (
                    <div className="task-tags">
                        {task.tags.map(tag => (
                            <span key={tag.id} className="task-tag">
                                {tag.name} <button onClick={() => handleRemoveTag(tag.id)} className="remove-tag-btn">×</button>
                            </span>
                        ))}
                    </div>
                )}
            </div>

            <div className={`task-priority-indicator priority-${task.priority || 'low'}`}></div>
        </div>
    );
};

export default TaskItem;

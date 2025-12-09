import React, { useMemo } from 'react';
import { useTasks } from '../context/TaskContext.jsx';
import TaskItem from '../components/TaskItem';
import './Semana.css';

// -----------------------------------------------------------
//  Verifica si una fecha cae dentro de los próximos 7 días
// -----------------------------------------------------------
const isWithinNextWeek = (dateString) => {
    if (!dateString) return false;

    const date = new Date(dateString);
    if (isNaN(date)) return false; // seguridad

    const today = new Date();
    const nextWeek = new Date();

    nextWeek.setDate(today.getDate() + 7);

    date.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    nextWeek.setHours(0, 0, 0, 0);

    return date >= today && date < nextWeek;
};

// -----------------------------------------------------------
//  Obtiene etiqueta de día: "Hoy", "Mañana", "Martes, 12 feb"
// -----------------------------------------------------------
const getDayLabel = (date) => {
    const today = new Date();
    const d = new Date(date);

    if (isNaN(d)) return ""; // seguridad

    today.setHours(0, 0, 0, 0);
    d.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    if (d.getTime() === today.getTime()) return "Hoy";
    if (d.getTime() === tomorrow.getTime()) return "Mañana";

    const dayName = d.toLocaleDateString("es-ES", { weekday: "long" });
    const formatted = d.toLocaleDateString("es-ES", { day: "numeric", month: "short" });

    return `${dayName.charAt(0).toUpperCase() + dayName.slice(1)}, ${formatted}`;
};

function Semana() {
    const { tasks, loading, error, fetchTasks } = useTasks();

    // -----------------------------------------------------------
    // AGRUPAR TAREAS POR DÍA (pendientes únicamente)
    // -----------------------------------------------------------
    const weeklyTasks = useMemo(() => {
        const grouped = {};

        tasks
            .filter(task =>
                !task.completed && 
                task.date && 
                isWithinNextWeek(task.date)
            )
            .forEach(task => {
                const dateKey = task.date.split("T")[0];

                if (!grouped[dateKey]) {
                    grouped[dateKey] = {
                        label: getDayLabel(task.date),
                        tasks: []
                    };
                }

                grouped[dateKey].tasks.push(task);
            });

        // Convertir a lista y ordenar por fecha
        return Object.keys(grouped)
            .sort()
            .map(key => grouped[key]);
    }, [tasks]);

    // -----------------------------------------------------------
    // ESTADOS — carga y error
    // -----------------------------------------------------------
    if (loading) {
        return (
            <p className="loading-state">
                Cargando tu planificación semanal...
            </p>
        );
    }

    if (error) {
        return (
            <div className="error-state">
                <p className="form-error">❌ Error al cargar la semana: {error}</p>
                <button className="btn-secondary" onClick={fetchTasks}>
                    Reintentar Carga
                </button>
            </div>
        );
    }

    // -----------------------------------------------------------
    // VISTA PRINCIPAL
    // -----------------------------------------------------------
    return (
        <div className="semana-page">
            <h1 className="page-header">🗓️ Planificación Semanal</h1>
            <p className="summary-text">
                Tareas para los próximos 7 días, organizadas por fecha de vencimiento.
            </p>

            <div className="weekly-task-groups">
                {weeklyTasks.length > 0 ? (
                    weeklyTasks.map((group, idx) => (
                        <div key={idx} className="day-group">
                            <h2 className="day-group-header">
                                {group.label} ({group.tasks.length})
                            </h2>

                            <div className="day-task-list">
                                {group.tasks
                                    .sort(
                                        (a, b) =>
                                            new Date(a.date) - new Date(b.date)
                                    )
                                    .map(task => (
                                        <TaskItem key={task.id} task={task} />
                                    ))}
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="no-tasks-message">
                        ☀️ ¡Tu semana está libre! Añade tareas con fecha de vencimiento.
                    </div>
                )}
            </div>
        </div>
    );
}

export default Semana;

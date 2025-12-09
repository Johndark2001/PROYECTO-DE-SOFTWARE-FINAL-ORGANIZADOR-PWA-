// frontend/src/pages/Settings.jsx
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTasks } from '../context/TaskContext.jsx';
import { FaUser, FaTag, FaClock, FaSignOutAlt, FaPlus, FaTrash, FaCheckCircle } from 'react-icons/fa';
import './Settings.css';

// -----------------------------------------------------------
// Componente de Gestión de Etiquetas (localStorage)
// -----------------------------------------------------------
const TagManager = () => {
    const { tags, createTag, deleteTag } = useTasks();
    const [newTagName, setNewTagName] = useState('');
    const [tagError, setTagError] = useState('');

    const handleCreateTag = (e) => {
        e.preventDefault();
        setTagError('');
        const trimmedName = newTagName.trim();

        if (!trimmedName) {
            setTagError('El nombre de la etiqueta no puede estar vacío.');
            return;
        }

        // Verificar si la etiqueta ya existe
        if (tags.some(tag => tag.name.toLowerCase() === trimmedName.toLowerCase())) {
            setTagError('Esta etiqueta ya existe.');
            return;
        }

        try {
            createTag(trimmedName);
            setNewTagName('');
        } catch (err) {
            setTagError(`Error al crear la etiqueta: ${err.message}`);
        }
    };

    const handleDeleteTag = (tagId, tagName) => {
        if (window.confirm(`¿Eliminar la etiqueta "${tagName}"? Se eliminará de todas las tareas.`)) {
            try {
                deleteTag(tagId);
            } catch (err) {
                setTagError(`Error al eliminar la etiqueta: ${err.message}`);
            }
        }
    };

    return (
        <div className="settings-section tag-manager">
            <h3><FaTag /> Gestión de Etiquetas</h3>
            <p>Aquí puedes crear y eliminar tus etiquetas personalizadas. Las etiquetas eliminadas se borrarán de todas tus tareas.</p>

            <form onSubmit={handleCreateTag} className="tag-creation-form">
                <input
                    type="text"
                    placeholder="Nombre de la nueva etiqueta"
                    value={newTagName}
                    onChange={(e) => setNewTagName(e.target.value)}
                />
                <button type="submit" className="btn-primary">
                    <FaPlus /> Crear
                </button>
            </form>
            {tagError && <p className="error-message">{tagError}</p>}

            <div className="tag-list">
                <h4>Etiquetas Actuales ({tags.length})</h4>
                {tags.length === 0 ? (
                    <p className="no-tags-msg">No tienes etiquetas creadas aún.</p>
                ) : (
                    tags.map(tag => (
                        <div key={tag.id} className="tag-item">
                            <span className="tag-name"><FaCheckCircle className="check-icon" /> {tag.name}</span>
                            <button 
                                onClick={() => handleDeleteTag(tag.id, tag.name)}
                                className="btn-delete-tag"
                                title={`Eliminar ${tag.name}`}
                            >
                                <FaTrash />
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

// -----------------------------------------------------------
// Componente de Configuración de Pomodoro
// -----------------------------------------------------------
const PomodoroSettings = () => {
    const [workTime, setWorkTime] = useState(localStorage.getItem('pomodoroWork') || 25);
    const [shortBreak, setShortBreak] = useState(localStorage.getItem('pomodoroShortBreak') || 5);
    const [longBreak, setLongBreak] = useState(localStorage.getItem('pomodoroLongBreak') || 15);
    const [isSaved, setIsSaved] = useState(false);

    const handleSave = () => {
        localStorage.setItem('pomodoroWork', workTime);
        localStorage.setItem('pomodoroShortBreak', shortBreak);
        localStorage.setItem('pomodoroLongBreak', longBreak);
        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 2000);
    };

    return (
        <div className="settings-section pomodoro-settings">
            <h3><FaClock /> Preferencias de Pomodoro</h3>
            <p>Define la duración de tus ciclos de productividad (en minutos).</p>
            
            <div className="setting-control">
                <label>Duración del Foco (min)</label>
                <input 
                    type="number" 
                    min="5" 
                    value={workTime} 
                    onChange={(e) => setWorkTime(e.target.value)} 
                />
            </div>
            <div className="setting-control">
                <label>Descanso Corto (min)</label>
                <input 
                    type="number" 
                    min="1" 
                    value={shortBreak} 
                    onChange={(e) => setShortBreak(e.target.value)} 
                />
            </div>
            <div className="setting-control">
                <label>Descanso Largo (min)</label>
                <input 
                    type="number" 
                    min="5" 
                    value={longBreak} 
                    onChange={(e) => setLongBreak(e.target.value)} 
                />
            </div>

            <button onClick={handleSave} className={`btn-primary save-btn ${isSaved ? 'saved' : ''}`}>
                {isSaved ? <><FaCheckCircle /> Guardado</> : 'Guardar Preferencias'}
            </button>
        </div>
    );
};

// -----------------------------------------------------------
// Componente Principal Settings
// -----------------------------------------------------------
function SettingsPage() {
    const { user, logout } = useAuth();

    return (
        <div className="settings-page">
            <h1 className="page-header">⚙️ Configuración</h1>

            {/* 1. Información del Usuario */}
            <div className="settings-section user-info-section">
                <h3><FaUser /> Información de Cuenta</h3>
                {user ? (
                    <div className="user-details">
                        <p><strong>Correo Electrónico:</strong> {user.email}</p>
                        <p><strong>Miembro desde:</strong> {new Date(user.created_at).toLocaleDateString()}</p>
                        <button onClick={logout} className="btn-secondary logout-btn">
                            <FaSignOutAlt /> Cerrar Sesión
                        </button>
                    </div>
                ) : (
                    <p>Cargando información del usuario...</p>
                )}
            </div>
            
            <PomodoroSettings />
            
            <TagManager />
            
            {/* 4. Otras configuraciones */}
            <div className="settings-section other-settings">
                <h3>🛠️ Otras Opciones</h3>
                <p><strong>Tema:</strong> (Funcionalidad pendiente - Claro / Oscuro)</p>
                <p><strong>Sincronización Offline:</strong> (Activa por defecto en PWA)</p>
            </div>

        </div>
    );
}

export default SettingsPage;

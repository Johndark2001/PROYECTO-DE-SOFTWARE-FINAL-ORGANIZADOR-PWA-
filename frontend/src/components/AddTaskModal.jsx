// frontend/src/components/AddTaskModal.jsx
import React, { useState } from 'react';
import './AddTaskModal.css';
import { IoCloseOutline } from 'react-icons/io5';
import { FaPlus } from 'react-icons/fa';
import { useTasks } from '../context/TaskContext';

const AddTaskModal = ({ isOpen, onClose }) => {
    const { tasks, createTask, tags, createTag } = useTasks();

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        date: '', // fecha límite
        priority: 'medium',
        tags: [], // array de objetos {id, name}
        status: 'pending',
        eisenhower_quadrant: '', // opcional
    });

    const [newTagName, setNewTagName] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        await createTask(formData);

        // Reset del formulario
        setFormData({
            title: '',
            description: '',
            date: '',
            priority: 'medium',
            tags: [],
            status: 'pending',
            eisenhower_quadrant: '',
        });
        onClose();
    };

    // -----------------------------------------------------------
    // Manejo de etiquetas
    // -----------------------------------------------------------
    const handleAddTagToTask = (tag) => {
        if (!formData.tags.some(t => t.id === tag.id)) {
            setFormData(prev => ({ ...prev, tags: [...prev.tags, tag] }));
        }
    };

    const handleRemoveTagFromTask = (tagId) => {
        setFormData(prev => ({ ...prev, tags: prev.tags.filter(t => t.id !== tagId) }));
    };

    const handleCreateNewTag = () => {
        const trimmedName = newTagName.trim();
        if (!trimmedName) return;

        // Verificar si ya existe
        let existing = tags.find(t => t.name.toLowerCase() === trimmedName.toLowerCase());
        if (existing) {
            handleAddTagToTask(existing);
        } else {
            const newTag = createTag(trimmedName);
            handleAddTagToTask(newTag);
        }

        setNewTagName('');
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Añadir Nueva Tarea</h2>
                    <button className="close-btn" onClick={onClose}>
                        <IoCloseOutline size={28} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="task-form">
                    <div className="form-group">
                        <label>Título</label>
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Descripción</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Fecha Límite</label>
                            <input
                                type="date"
                                name="date"
                                value={formData.date}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="form-group">
                            <label>Prioridad</label>
                            <select
                                name="priority"
                                value={formData.priority}
                                onChange={handleChange}
                            >
                                <option value="high">Alta</option>
                                <option value="medium">Media</option>
                                <option value="low">Baja</option>
                            </select>
                        </div>
                    </div>

                    {/* ---------------------------------------------------- */}
                    {/* Selección de etiquetas */}
                    <div className="form-group tag-selection">
                        <label>Etiquetas</label>
                        <div className="tag-list">
                            {tags.map(tag => (
                                <button
                                    type="button"
                                    key={tag.id}
                                    className={`tag-btn ${formData.tags.some(t => t.id === tag.id) ? 'selected' : ''}`}
                                    onClick={() => handleAddTagToTask(tag)}
                                >
                                    {tag.name}
                                </button>
                            ))}
                        </div>
                        <div className="new-tag-input">
                            <input
                                type="text"
                                placeholder="Crear nueva etiqueta"
                                value={newTagName}
                                onChange={(e) => setNewTagName(e.target.value)}
                            />
                            <button type="button" className="btn-primary" onClick={handleCreateNewTag}>
                                <FaPlus /> Añadir
                            </button>
                        </div>
                        <div className="selected-tags">
                            {formData.tags.map(tag => (
                                <span key={tag.id} className="selected-tag">
                                    {tag.name} <button type="button" onClick={() => handleRemoveTagFromTask(tag.id)}>×</button>
                                </span>
                            ))}
                        </div>
                    </div>

                    <button type="submit" className="save-task-btn btn-primary">
                        Guardar Tarea
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AddTaskModal;

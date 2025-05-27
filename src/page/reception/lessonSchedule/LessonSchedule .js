import React, { useState, useEffect } from 'react';
import {
    useCreateGroupLessonMutation,
    useGetAllGroupsQuery,
    useUpdateGroupMutation,
    useDeleteGroupMutation,
    useAddGroupaIdMutation,
    useRemoveGroupaIdMutation,
    useCreateLessonMutation,
    useUpdateLessonMutation,
    useDeleteLessonMutation,
} from '../../../context/lessonsApi';
import { message, Modal } from 'antd';
import './lessonSchedule.css';
import { FaPlus, FaEdit, FaTrash, FaExclamationTriangle, FaBook, FaSpinner, FaUsers, FaTimes, FaSearch } from 'react-icons/fa';
import 'antd/dist/reset.css';

const LessonSchedule = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('create');
    const [currentGroup, setCurrentGroup] = useState(null);
    const [selectedGroupId, setSelectedGroupId] = useState(null);
    const [formData, setFormData] = useState({
        groupaIds: '',
        subjects: '',
        level: 'beginner',
        step: 1,
        lessonName: '',
        description: '',
        homework: '',
        lessonId: '',
    });
    const [searchQuery, setSearchQuery] = useState('');
    const [levelFilter, setLevelFilter] = useState('all');

    // RTK Query hooks
    const { data: groups = [], isLoading, error } = useGetAllGroupsQuery();
    const [createGroup, { isLoading: isCreatingGroup }] = useCreateGroupLessonMutation();
    const [updateGroup, { isLoading: isUpdatingGroup }] = useUpdateGroupMutation();
    const [deleteGroup, { isLoading: isDeletingGroup }] = useDeleteGroupMutation();
    const [addGroupaId, { isLoading: isAddingGroupaId }] = useAddGroupaIdMutation();
    const [removeGroupaId, { isLoading: isRemovingGroupaId }] = useRemoveGroupaIdMutation();
    const [createLesson, { isLoading: isCreatingLesson }] = useCreateLessonMutation();
    const [updateLesson, { isLoading: isUpdatingLesson }] = useUpdateLessonMutation();
    const [deleteLesson, { isLoading: isDeletingLesson }] = useDeleteLessonMutation();

    // Set default selected group to the first group when data loads
    useEffect(() => {
        if (groups?.data?.length > 0 && !selectedGroupId) {
            setSelectedGroupId(groups.data[0]._id);
        }
    }, [groups, selectedGroupId]);

    // Open modal
    const openModal = (mode, group = null, lesson = null) => {
        setModalMode(mode);
        setCurrentGroup(group);
        if (mode === 'update' && group) {
            setFormData({
                groupaIds: '',
                subjects: group.subjects.join(', '),
                level: group.level,
                step: group.step,
                lessonName: '',
                description: '',
                homework: '',
                lessonId: '',
            });
        } else if (mode === 'addLesson' || mode === 'updateLesson') {
            setFormData({
                groupaIds: '',
                subjects: '',
                level: 'beginner',
                step: 1,
                lessonName: lesson ? lesson.lessonName : '',
                description: lesson ? lesson.description : '',
                homework: lesson ? lesson.homework : '',
                lessonId: lesson ? lesson._id : '',
            });
        } else if (mode === 'addGroupaId' && group) {
            setFormData({
                groupaIds: '',
                subjects: '',
                level: 'beginner',
                step: 1,
                lessonName: '',
                description: '',
                homework: '',
                lessonId: '',
            });
        } else {
            setFormData({
                groupaIds: '',
                subjects: '',
                level: 'beginner',
                step: 1,
                lessonName: '',
                description: '',
                homework: '',
                lessonId: '',
            });
        }
        setIsModalOpen(true);
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (modalMode === 'create') {
                const data = {
                    subjects: formData.subjects.split(',').map(s => s.trim()).filter(s => s),
                    level: formData.level,
                    step: parseInt(formData.step),
                };
                await createGroup(data).unwrap();
                message.success('Guruh muvaffaqiyatli qo\'shildi!');
            } else if (modalMode === 'update') {
                const data = {
                    groupaIds: formData.groupaIds.split(',').map(id => id.trim()).filter(id => id),
                    subjects: formData.subjects.split(',').map(s => s.trim()).filter(s => s),
                    level: formData.level,
                    step: parseInt(formData.step),
                };
                await updateGroup({ id: currentGroup._id, ...data }).unwrap();
                message.success('Guruh muvaffaqiyatli yangilandi!');
            } else if (modalMode === 'addLesson') {
                const data = {
                    lessonName: formData.lessonName,
                    description: formData.description,
                    homework: formData.homework,
                };
                await createLesson({ id: currentGroup._id, lessonData: data }).unwrap();
                message.success('Dars muvaffaqiyatli qo\'shildi!');
            } else if (modalMode === 'updateLesson') {
                const data = {
                    lessonName: formData.lessonName,
                    description: formData.description,
                    homework: formData.homework,
                };
                await updateLesson({ id: currentGroup._id, lessonId: formData.lessonId, lessonData: data }).unwrap();
                message.success('Dars muvaffaqiyatli yangilandi!');
            } else if (modalMode === 'addGroupaId') {
                await addGroupaId({ id: currentGroup._id, groupaId: formData.groupaIds }).unwrap();
                message.success('GroupaId muvaffaqiyatli qo\'shildi!');
            }
            setIsModalOpen(false);
            setFormData({
                groupaIds: '',
                subjects: '',
                level: 'beginner',
                step: 1,
                lessonName: '',
                description: '',
                homework: '',
                lessonId: '',
            });
        } catch (error) {
            console.error('Xato:', error);
            message.error(`Xato yuz berdi: ${error.data?.error || error.message}`);
        }
    };

    // Handle input change
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    // Delete group
    const handleDeleteGroup = (id) => {
        Modal.confirm({
            title: "Bu guruhni o'chirishni xohlaysizmi?",
            icon: <FaExclamationTriangle />,
            okText: 'Ha, o\'chirish',
            cancelText: 'Bekor qilish',
            onOk: async () => {
                try {
                    await deleteGroup(id).unwrap();
                    message.success('Guruh muvaffaqiyatli o\'chirildi!');
                    if (selectedGroupId === id) {
                        setSelectedGroupId(groups?.data?.[0]?._id || null);
                    }
                } catch (error) {
                    console.error("Guruhni o'chirishda xato:", error);
                    message.error(`Guruhni o'chirishda xato: ${error.data?.error || error.message}`);
                }
            },
        });
    };

    // Delete lesson
    const handleDeleteLesson = (groupId, lessonId) => {
        Modal.confirm({
            title: "Bu darsni o'chirishni xohlaysizmi?",
            icon: <FaExclamationTriangle />,
            okText: 'Ha, o\'chirish',
            cancelText: 'Bekor qilish',
            onOk: async () => {
                try {
                    await deleteLesson({ id: groupId, lessonId }).unwrap();
                    message.success('Dars muvaffaqiyatli o\'chirildi!');
                } catch (error) {
                    console.error("Darsni o'chirishda xato:", error);
                    message.error(`Darsni o'chirishda xato: ${error.data?.error || error.message}`);
                }
            },
        });
    };

    // Remove GroupaId
    const handleRemoveGroupaId = (groupId, groupaId) => {
        Modal.confirm({
            title: `GroupaId ${groupaId} ni o'chirishni xohlaysizmi?`,
            icon: <FaExclamationTriangle />,
            okText: 'Ha, o\'chirish',
            cancelText: 'Bekor qilish',
            onOk: async () => {
                try {
                    await removeGroupaId({ id: groupId, groupaId }).unwrap();
                    message.success('GroupaId muvaffaqiyatli o\'chirildi!');
                } catch (error) {
                    console.error("GroupaId ni o'chirishda xato:", error);
                    message.error(`GroupaId ni o'chirishda xato: ${error.data?.error || error.message}`);
                }
            },
        });
    };

    // Handle group selection for lessons table
    const handleShowLessons = (groupId) => {
        setSelectedGroupId(groupId);
    };

    // Filter groups by search query and level
    const filteredGroups = groups?.data?.filter(group => {
        const subjectsString = group.subjects.join(', ').toLowerCase();
        const matchesSearch = subjectsString.includes(searchQuery.toLowerCase());
        const matchesLevel = levelFilter === 'all' || group.level === levelFilter;
        return matchesSearch && matchesLevel;
    }) || [];

    // Get selected group's lessons
    const selectedGroup = filteredGroups.find(group => group._id === selectedGroupId) || filteredGroups[0];

    // Update selectedGroupId when filteredGroups changes
    useEffect(() => {
        if (filteredGroups.length > 0 && !filteredGroups.find(group => group._id === selectedGroupId)) {
            setSelectedGroupId(filteredGroups[0]?._id || null);
        }
    }, [filteredGroups, selectedGroupId]);

    // Loading or error state
    if (isLoading) return <div className="lesson-schedule-container"><FaSpinner className="spinner" /> Yuklanmoqda...</div>;
    if (error) return <div className="lesson-schedule-container"><FaExclamationTriangle /> Xato: {error.data?.error || error.message}</div>;

    return (
        <div className="lesson-schedule-container">
            <h1 className="lesson-schedule-main-title"><FaBook /> Dars Jadvali</h1>

            <div className="lesson-schedule-navbar">
                <div className="lesson-schedule-search">
                    <FaSearch className="lesson-schedule-search-icon" />
                    <input
                        type="text"
                        placeholder="Fanlar bo'yicha qidirish..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="lesson-schedule-search-input"
                    />
                </div>
                <select
                    value={levelFilter}
                    onChange={(e) => setLevelFilter(e.target.value)}
                    className="lesson-schedule-select"
                >
                    <option value="all">Barcha Darajalar</option>
                    <option value="beginner">Boshlang'ich</option>
                    <option value="intermediate">O'rta</option>
                    <option value="advanced">Yuqori</option>
                </select>
                <button
                    onClick={() => openModal('create')}
                    className="lesson-schedule-action-button-nav "
                >
                    <FaPlus /> Yangi ish reja qo'shish
                </button>
            </div>
            <div className="lesson-schedule-gridbox">
                <div className="lesson-schedule-grid">
                    {filteredGroups.map(group => (
                        <div
                            key={group._id}
                            className={`lesson-schedule-card ${selectedGroupId === group._id ? 'lesson-schedule-card-selected' : ''}`}
                            onClick={() => handleShowLessons(group._id)}
                        >
                            <p className="lesson-schedule-card-text"><strong>Fanlar:</strong> {group.subjects.join(', ')}</p>
                            <p className="lesson-schedule-card-text"><strong>Daraja:</strong> {group.level}</p>
                            <p className="lesson-schedule-card-text"><strong>Bosqich:</strong> {group.step}</p>
                            <div className="lesson-schedule-button-group">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation(); // Prevents the event from bubbling up to the parent
                                        openModal('addLesson', group);
                                    }}
                                    className="lesson-Btn lesson-scheduleBtn lesson-schedule-action-button lesson-schedule-update-button"
                                >
                                    <FaPlus /> Dars Qo'shish
                                </button>
                                {/* addGroupaId */}
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation(); // Prevents the event from bubbling up to the parent
                                        openModal('addGroupaId', group);
                                    }}
                                    disabled={group.groupaIds?.length === 0}
                                    className="lesson-Btn lesson-scheduleBtn lesson-schedule-action-button lesson-schedule-update-button"
                                >
                                    {group?.groupaIds?.length ? `${group.groupaIds.length} guruh foydalanmoqda` : "Foydalanilmayapti"}
                                </button>
                                <div className="lesson-schedule-section">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation(); // Prevents the event from bubbling up to the parent
                                            openModal('update', group);
                                        }}
                                        className="lesson-Btn lesson-scheduleBtn lesson-schedule-action-button lesson-schedule-update-button"
                                    >
                                        <FaEdit /> Tahrirlash
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation(); // Prevents the event from bubbling up to the parent
                                            handleDeleteGroup(group._id);
                                        }}
                                        className="lesson-Btn lesson-scheduleBtn lesson-schedule-action-button lesson-schedule-delete-button"
                                        disabled={isDeletingGroup}
                                    >
                                        <FaTrash /> O'chirish
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="lesson-schedule-table-container">
                    {selectedGroup && (
                        <table border={1} className="lesson-schedule-table">
                            <thead>
                                <tr>
                                    <th scope="col">№</th>
                                    <th>Dars Nomi</th>
                                    <th>Tavsif</th>
                                    <th>Uy Vazifasi</th>
                                    <th>Amallar</th>
                                </tr>
                            </thead>
                            <tbody>
                                {selectedGroup.lessons.map((lesson, inx) => (
                                    <tr key={inx}>
                                        <td>{inx + 1}</td>
                                        <td>{lesson.lessonName}</td>
                                        <td>{lesson.description}</td>
                                        <td>{lesson.homework}</td>
                                        <td>
                                            <div className="lesson-schedule-button-tabel">
                                                <button
                                                    onClick={() => openModal('updateLesson', selectedGroup, lesson)}
                                                    className="lesson-schedule-action-button lesson-schedule-update-button"
                                                >
                                                    <FaEdit />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteLesson(selectedGroup._id, lesson._id)}
                                                    className="lesson-schedule-action-button lesson-schedule-delete-button"
                                                    disabled={isDeletingLesson}
                                                >
                                                    <FaTrash />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
            {isModalOpen && (
                <div className="lesson-schedule-modal-overlay">
                    <div className="lesson-schedule-modal">
                        <h3 className="lesson-schedule-modal-title">
                            {modalMode === 'create' ? <><FaPlus /> Yangi Guruh Qo'shish</> :
                                modalMode === 'update' ? <><FaEdit /> Guruhni Tahrirlash</> :
                                    modalMode === 'addLesson' ? <><FaBook /> Yangi Dars Qo'shish</> :
                                        modalMode === 'updateLesson' ? <><FaEdit /> Darsni Tahrirlash</> : <></>}
                        </h3>
                        <form onSubmit={handleSubmit}>
                            {(modalMode === 'create' || modalMode === 'update') && (
                                <>
                                    <div className="lesson-schedule-form-group">
                                        <label className="lesson-schedule-form-label">Fanlar (vergul bilan ajratilgan)</label>
                                        <input
                                            type="text"
                                            name="subjects"
                                            value={formData.subjects}
                                            onChange={handleInputChange}
                                            className="lesson-schedule-form-input"
                                            placeholder="Masalan: Matematika, Fizika"
                                        />
                                    </div>
                                    <div className="lesson-schedule-form-group">
                                        <label className="lesson-schedule-form-label">Daraja</label>
                                        <select
                                            name="level"
                                            value={formData.level}
                                            onChange={handleInputChange}
                                            className="lesson-schedule-form-input"
                                        >
                                            <option value="beginner">Boshlang'ich</option>
                                            <option value="intermediate">O'rta</option>
                                            <option value="advanced">Yuqori</option>
                                        </select>
                                    </div>
                                    <div className="lesson-schedule-form-group">
                                        <label className="lesson-schedule-form-label">Bosqich</label>
                                        <input
                                            type="number"
                                            name="step"
                                            value={formData.step}
                                            onChange={handleInputChange}
                                            min="1"
                                            max="10"
                                            className="lesson-schedule-form-input"
                                        />
                                    </div>
                                </>
                            )}
                            {(modalMode === 'addLesson' || modalMode === 'updateLesson') && (
                                <>
                                    <div className="lesson-schedule-form-group">
                                        <label className="lesson-schedule-form-label">Dars Nomi</label>
                                        <input
                                            type="text"
                                            name="lessonName"
                                            value={formData.lessonName}
                                            onChange={handleInputChange}
                                            className="lesson-schedule-form-input"
                                            required
                                        />
                                    </div>
                                    <div className="lesson-schedule-form-group">
                                        <label className="lesson-schedule-form-label">Tavsif</label>
                                        <textarea
                                            name="description"
                                            value={formData.description}
                                            onChange={handleInputChange}
                                            className="lesson-schedule-form-input"
                                            required
                                        />
                                    </div>
                                    <div className="lesson-schedule-form-group">
                                        <label className="lesson-schedule-form-label">Uy Vazifasi</label>
                                        <textarea
                                            name="homework"
                                            value={formData.homework}
                                            onChange={handleInputChange}
                                            className="lesson-schedule-form-input"
                                            required
                                        />
                                    </div>
                                </>
                            )}
                            {modalMode === 'addGroupaId' && (
                                <div className="lesson-schedule-form-group">
                                    <label className="lesson-schedule-form-label">Yangi GroupaId</label>
                                    <input
                                        type="text"
                                        name="groupaIds"
                                        value={formData.groupaIds}
                                        onChange={handleInputChange}
                                        className="lesson-schedule-form-input"
                                        placeholder="Masalan: id5"
                                        required
                                    />
                                </div>
                            )}
                            <div className="lesson-schedule-modal-button-group">
                                <button
                                    type="submit"
                                    className="lesson-schedule-action-button lesson-schedule-update-button"
                                    disabled={isCreatingGroup || isUpdatingGroup || isCreatingLesson || isUpdatingLesson || isAddingGroupaId}
                                >
                                    {modalMode === 'create' || modalMode === 'addLesson' ? <><FaPlus /> Qo'shish</> :
                                        modalMode === 'update' || modalMode === 'updateLesson' ? <><FaEdit /> Saqlash</> :
                                            <><FaUsers /> GroupaId Qo'shish</>}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="lesson-schedule-action-button lesson-schedule-cancel-button"
                                >
                                    <FaTimes /> Bekor Qilish
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LessonSchedule;
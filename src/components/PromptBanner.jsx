import React, { useState, useEffect } from 'react';
import { Edit2, Check, MessageCircle } from 'lucide-react';
import './PromptBanner.css';

const PromptBanner = ({ roomId, isHidden, isCollapsible = false }) => {
    const [prompt, setPrompt] = useState('How are you feeling today?');
    const [isEditingPrompt, setIsEditingPrompt] = useState(false);
    const [editPromptValue, setEditPromptValue] = useState('');
    const [isCollapsed, setIsCollapsed] = useState(isCollapsible);

    useEffect(() => {
        const saved = JSON.parse(localStorage.getItem('apw_rooms') || '{}');
        if (saved[roomId] && saved[roomId].prompt) {
            setPrompt(saved[roomId].prompt);
        }
    }, [roomId]);

    const handleSavePrompt = () => {
        if (!editPromptValue.trim()) return;

        const saved = JSON.parse(localStorage.getItem('apw_rooms') || '{}');
        if (saved[roomId]) {
            saved[roomId].prompt = editPromptValue;
            localStorage.setItem('apw_rooms', JSON.stringify(saved));
            setPrompt(editPromptValue);
            setIsEditingPrompt(false);
        }
    };

    if (isHidden) return null;

    if (isCollapsible && isCollapsed) {
        return (
            <button className="toggle-prompt-btn" onClick={() => setIsCollapsed(false)}>
                <MessageCircle size={16} style={{ marginRight: '6px' }} /> See Daily Prompt
            </button>
        );
    }

    return (
        <div className={`prompt-banner ${isCollapsible ? 'collapsible-mode' : ''} ${isHidden ? 'hidden' : ''}`}>
            <div className="prompt-header">
                <span className="prompt-label">Daily prompt</span>
                <div style={{ display: 'flex', gap: '8px' }}>
                    {!isEditingPrompt && (
                        <button
                            className="edit-prompt-btn"
                            onClick={() => {
                                setEditPromptValue(prompt);
                                setIsEditingPrompt(true);
                            }}
                        >
                            Edit <Edit2 size={14} />
                        </button>
                    )}
                    {isCollapsible && (
                        <button className="edit-prompt-btn" onClick={() => setIsCollapsed(true)}>
                            Close
                        </button>
                    )}
                </div>
            </div>
            {isEditingPrompt ? (
                <div className="prompt-edit-mode">
                    <input
                        type="text"
                        value={editPromptValue}
                        onChange={(e) => setEditPromptValue(e.target.value)}
                        autoFocus
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSavePrompt();
                            if (e.key === 'Escape') setIsEditingPrompt(false);
                        }}
                    />
                    <button className="save-prompt-btn" onClick={handleSavePrompt}>
                        <Check size={18} />
                    </button>
                </div>
            ) : (
                <p className="prompt-text">{prompt}</p>
            )}
        </div>
    );
};

export default PromptBanner;

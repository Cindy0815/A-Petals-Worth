import React from 'react';
import './WelcomeModal.css';

const WelcomeModal = ({ prompt, onClose, onPlant }) => {
    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="welcome-modal" onClick={e => e.stopPropagation()}>
                <h2>Welcome to the Garden</h2>
                <p>The Garden will grow as people join</p>
                <div className="prompt-display">
                    <h3>Today's Prompt</h3>
                    <p>{prompt}</p>
                </div>

                <div className="welcome-actions">
                    <button className="btn-primary" onClick={onPlant}>
                        Add to garden
                    </button>
                    <button className="btn-secondary" onClick={onClose}>
                        Browse garden
                    </button>
                </div>
            </div>
        </div>
    );
};

export default WelcomeModal;

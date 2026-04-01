import React from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import './FlowerModal.css';

const FlowerModal = ({ flower, onClose, onUpdate, currentUserName }) => {

    const [newComment, setNewComment] = React.useState('');

    const handleAddComment = (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        const updatedComments = [{
            id: Date.now().toString(),
            text: newComment,
            author: currentUserName || 'Anonymous',
            date: new Date().toLocaleDateString()
        }, ...(flower.comments || [])];

        onUpdate({
            ...flower,
            comments: updatedComments
        });
        setNewComment('');
    };

    return (
        <div className="flower-modal-wrapper" onClick={e => e.stopPropagation()}>
            <div className="modal-top-bar">
                <div className="modal-top-actions">
                    <button className="close-text-btn-modal" onClick={onClose}>
                        Close <X size={16} />
                    </button>
                </div>
            </div>

            <div className="flower-info-row">
                <div className="flower-image-box">
                    <img src={flower.imageData} alt="Flower creation" />
                </div>
                <div className="flower-details-col">
                    <h3>{flower.flowerName || flower.name}</h3>
                    <p className="tags">
                        {flower.formType ? `#${flower.formType}` : ''}
                    </p>
                    <div className="metadata">
                        <p>Created by: {flower.creatorName || flower.name}</p>
                        <p>Date: {flower.createdAt ? new Date(flower.createdAt).toLocaleDateString() : 'Just now'}</p>
                    </div>
                </div>
            </div>

            <div className="flower-message-box">
                {flower.message}
            </div>

            <div className="comments-section">
                <h4>Comments ({flower.comments?.length || 0})</h4>
                <div className="comments-list">
                    {(flower.comments || []).map(comment => (
                        <div key={comment.id} className="comment-item">
                            <span className="comment-text">
                                {comment.author && <strong style={{ color: 'var(--color-primary-dark)' }}>{comment.author}: </strong>}
                                {comment.text}
                            </span>
                            <span className="comment-date">{comment.date}</span>
                        </div>
                    ))}
                    {(!flower.comments || flower.comments.length === 0) && (
                        <p className="no-comments">No comments yet. Be the first to pull a weed or say hello!</p>
                    )}
                </div>
                <form className="add-comment-form" onSubmit={handleAddComment}>
                    <input
                        type="text"
                        placeholder="Add a comment..."
                        value={newComment}
                        onChange={e => setNewComment(e.target.value)}
                    />
                    <button type="submit" disabled={!newComment.trim()}>Post</button>
                </form>
            </div>
        </div>
    );
};

export default FlowerModal;

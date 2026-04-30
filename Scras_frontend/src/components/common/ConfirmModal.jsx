/**
 * Confirmation Modal Component
 * For delete/approve/reject confirmations
 */

import React from 'react';

const ConfirmModal = ({
    isOpen,
    onClose,
    onConfirm,
    title = "Confirm Action",
    message = "Are you sure you want to proceed?",
    confirmText = "Confirm",
    cancelText = "Cancel",
    confirmVariant = "danger" // danger, primary, warning
}) => {
    if (!isOpen) return null;

    const getConfirmClass = () => {
        switch (confirmVariant) {
            case 'danger': return 'btn-danger';
            case 'primary': return 'btn-primary';
            case 'warning': return 'btn-warning';
            default: return 'btn-primary';
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-container" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>{title}</h3>
                    <button className="modal-close" onClick={onClose}>✕</button>
                </div>
                <div className="modal-body">
                    <p>{message}</p>
                </div>
                <div className="modal-footer">
                    <button className="btn-secondary" onClick={onClose}>
                        {cancelText}
                    </button>
                    <button className={getConfirmClass()} onClick={onConfirm}>
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmModal;
// frontend/src/Message.jsx
import React from 'react';
import './index.css'; // Ensure to import the CSS file

const Message = ({ notification }) => {
    return (
        <div id="notificationHeader" className="notification">
            <h4>{notification.title}</h4>
            <p id="notificationBody">{notification.body}</p>
            {notification.icon && (
                <div id="imageContainer">
                    <img src={notification.data.icon} alt="Notification icon" style={{ maxWidth: '100%', height: 'auto' }} />
                </div>
            )}
        </div>
    );
};

export default Message;
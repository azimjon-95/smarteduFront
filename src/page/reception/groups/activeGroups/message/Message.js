import { Modal, Input, Button, message } from 'antd';
import { useState, useCallback, useEffect, useRef } from 'react';
import { BiLogoTelegram } from 'react-icons/bi';
import moment from 'moment';
import './style.css';

const MessageModal = ({ visible, onCancel, student }) => {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef(null); // Ref to scroll to the bottom
    const messageHistoryRef = useRef(null); // Ref for the message-history div

    // Mock message history (replace with API call in production)
    useEffect(() => {
        setMessages([
            {
                id: 1,
                text: `Salom, ${student.firstName}! O'tgan haftada matematika darsida 90% natija qayd etdingiz. Yaxshi ish!`,
                sender: 'teacher',
                timestamp: moment().subtract(1, 'day').format('YYYY-MM-DD HH:mm'),
            },
            {
                id: 2,
                text: 'Rahmat! Keyingi test qachon bo’ladi?',
                sender: 'student',
                timestamp: moment().subtract(1, 'day').add(1, 'hour').format('YYYY-MM-DD HH:mm'),
            },
            {
                id: 3,
                text: `${student.firstName}, keyingi matematika testi kelasi chorshanba kuni soat 10:00 da. Tayyorlaning!`,
                sender: 'teacher',
                timestamp: moment().subtract(1, 'day').format('YYYY-MM-DD HH:mm'),
            },
            {
                id: 4,
                text: 'Yaxshi, tayyorlanaman. Dars jadvalini yuborsangiz bo’ladi.',
                sender: 'student',
                timestamp: moment().subtract(1, 'day').add(1, 'hour').format('YYYY-MM-DD HH:mm'),
            },
        ]);
    }, [student]);

    // Scroll to bottom when messages change or modal opens
    useEffect(() => {
        if (messageHistoryRef.current && messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, visible]);

    const handleSendMessage = useCallback(() => {
        if (!newMessage.trim()) {
            message.error("Xabar bo'sh bo'lmasligi kerak!");
            return;
        }

        const newMsg = {
            id: messages.length + 1,
            text: newMessage,
            sender: 'teacher',
            timestamp: moment().format('YYYY-MM-DD HH:mm'),
        };

        setMessages((prev) => [...prev, newMsg]);
        setNewMessage('');
        message.success('Xabar yuborildi!');
        // In production, send to API: await sendMessageAPI(newMsg);
    }, [newMessage, messages]);

    return (
        <Modal
            title={`Xabar: ${student.firstName} ${student.lastName} yoki oilasiga`}
            visible={visible}
            onCancel={onCancel}
            footer={null}
            className="telegram-message-modal"
            width={400}
        >
            <div className="message-panel">
                <div className="message-history" ref={messageHistoryRef}>
                    {messages.map((msg) => (
                        <div
                            key={msg.id}
                            className={`message-bubble ${msg.sender === 'teacher' ? 'message-sent' : 'message-received'}`}
                        >
                            <p className="message-text">{msg.text}</p>
                            <span className="message-timestamp">{msg.timestamp}</span>
                        </div>
                    ))}
                    <div ref={messagesEndRef} /> {/* Empty div to mark the bottom */}
                </div>
                <div className="message-input-container">
                    <Input
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Xabar yozing..."
                        onPressEnter={handleSendMessage}
                    />
                    <Button type="primary" onClick={handleSendMessage}>
                        <BiLogoTelegram />
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

export default MessageModal;
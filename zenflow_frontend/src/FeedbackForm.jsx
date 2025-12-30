import React, { useState } from 'react';

const FeedbackIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
    </svg>
);

export default function FeedbackForm({ sessionId, user, onSubmit }) {
    const [feedback, setFeedback] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState('');
    const BACKEND_URL = "http://127.0.0.1:8001";

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!feedback.trim()) return;
        setIsSubmitting(true);
        setMessage('');
        const token = localStorage.getItem('zenflow_token');
        if (!token) return;

        try {
            const response = await fetch(`${BACKEND_URL}/feedback/`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ sessionId: sessionId, feedback_text: feedback }),
            });
            if (response.ok) {
                setMessage('Thank you for your feedback!');
                setTimeout(() => {
                    onSubmit();
                }, 2000);
            } else {
                setMessage('Failed to submit feedback. Please try again.');
            }
        } catch (err) {
            setMessage('Error connecting to the server.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-lg">
            <h2 className="text-2xl font-bold mb-4 text-gray-800 flex items-center">
                <FeedbackIcon /> How was your session?
            </h2>
            <form onSubmit={handleSubmit}>
                <textarea
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="e.g., 'Felt great, but my shoulders were a bit tight...'"
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-400 transition-colors"
                    rows="3"
                ></textarea>
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full mt-4 bg-gradient-to-r from-green-500 to-teal-500 text-white font-bold py-3 px-4 rounded-lg shadow-lg hover:scale-105 transition-transform disabled:bg-gray-400 disabled:from-gray-400 disabled:scale-100"
                >
                    {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
                </button>
                {message && <p className="text-center mt-4 text-sm text-gray-600">{message}</p>}
            </form>
        </div>
    );
}

import React, { useState } from 'react';


const ForgotPassword: React.FC = () => {
    const [username, setUsername] = useState('');

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setUsername(event.target.value);
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        try {
            //await forgotPassword({ username });
            console.log('Password reset email sent');
            // Handle successful password reset email sent
        } catch (error) {
            console.error('Error sending password reset email:', error);
            // Handle error
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <div>
                <label htmlFor="username">Username:</label>
                <input
                    type="text"
                    id="username"
                    name="username"
                    value={username}
                    onChange={handleChange}
                    required
                />
            </div>
            <button type="submit">Reset Password</button>
            {/* <p>
                Remembered your password? <button onClick={onSignInClick}>Sign In</button>
            </p> */}
        </form>
    );
};

export default ForgotPassword;
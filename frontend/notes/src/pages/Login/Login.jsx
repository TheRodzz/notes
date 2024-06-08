import React, { useState } from 'react';
import Navbar from '../../components/Navbar/Navbar';
import { Link, useNavigate } from 'react-router-dom';
import PasswordInput from '../../components/Input/PasswordInput';
import { validateEmail } from '../../utils/helper';
import axiosInstance from '../../utils/axiosInstance';
import ClipLoader from "react-spinners/ClipLoader"; // Import the spinner

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false); // Loading state
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        if (!validateEmail(email)) {
            setError("Please enter a valid email address");
            return;
        }
        if (!password) {
            setError("Please enter the password");
            return;
        }
        setError("");
        setLoading(true); // Set loading to true

        try {
            const response = await axiosInstance.post('/login', {
                email: email,
                password: password,
            });

            if (response.data && response.data.accessToken) {
                localStorage.setItem('token', response.data.accessToken);
                navigate('/dashboard');
            }
        } catch (error) {
            if (error.response && error.response.data && error.response.data.message) {
                setError(error.response.data.message);
            } else {
                setError('An unexpected error occurred');
            }
        } finally {
            setLoading(false); // Set loading to false
        }
    };

    return (
        <>
            {/* <Navbar userInfo={null} /> */}
            <div className='flex items-center justify-center mt-28'>
                <div className='w-96 border rounded bg-white px-7 py-10'>
                    <form onSubmit={handleLogin}>
                        <h4 className='text-2xl mb-7'>Login</h4>
                        <input 
                            type='text'
                            placeholder='Email'
                            className='input-box'
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                        <PasswordInput 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder={null}
                        />
                        {error && <p className='text-red-500 text-xs pb-1'>{error}</p>}
                        <button 
                            type='submit'
                            className='btn-primary'
                            disabled={loading} // Disable button while loading
                        >
                            Login
                        </button>
                        <p className='text-sm text-center mt-4'>
                            Not Registered yet? {" "}
                            <Link to="/signup" className="font-medium text-primary underline">
                                Create an Account
                            </Link>
                        </p>
                    </form>
                    {loading && (
                        <div className="flex justify-center mt-4">
                            <ClipLoader size={35} color={"#123abc"} loading={loading} />
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

export default Login;

import React, { useState } from "react";
import axios from "axios";

function Register() {

    const cartoon = "https://cdn-icons-png.flaticon.com/512/4140/4140048.png";

    const [register, setRegister] = useState({
        name: "",
        email: "",
        password: "",
    });

    const [message, setMessage] = useState("");

    const handleChange = (e) => {
        setRegister({
            ...register,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await axios.post(
                "https://meetx-backend-main-1.onrender.com/addUser",
                register
            );

            if (response.data === "Enter valid email") {
                setMessage("Enter valid email");
            } else if (response.data === "Email already registered") {
                setMessage("Email already registered");
            } else if (response.data === "Registration successful") {
                setMessage("Registration successful");

                setRegister({
                    name: "",
                    email: "",
                    password: "",
                });

                setTimeout(() => {
                    window.location.href = "/login";
                }, 1500);
            }
        } catch (error) {
            console.log(error);
            setMessage("Something went wrong");
        }
    };

    return (
        <div style={styles.page}>
            {/* Floating background bubbles */}
            <div style={styles.bubble1}></div>
            <div style={styles.bubble2}></div>

            <div style={styles.card}>
                {/* Cartoon */}
                <img
                    src={cartoon}
                    alt="cartoon"
                    style={styles.cartoon}
                />

                <h2 style={styles.heading}>
                    Create Account
                </h2>

                <p style={styles.subHeading}>
                    Welcome to animated world ✨
                </p>

                <form onSubmit={handleSubmit}>
                    <input
                        type="text"
                        name="name"
                        placeholder="Enter your name"
                        value={register.name}
                        onChange={handleChange}
                        style={styles.input}
                    />

                    <input
                        type="email"
                        name="email"
                        placeholder="Enter your email"
                        value={register.email}
                        onChange={handleChange}
                        style={styles.input}
                    />

                    <input
                        type="password"
                        name="password"
                        placeholder="Enter your password"
                        value={register.password}
                        onChange={handleChange}
                        style={styles.input}
                    />

                    <p style={{
                        color: message === "Registration successful" ? "#00ff99" : "#ff4d4f",
                        textAlign: "center",
                        marginBottom: "15px",
                        fontWeight: "bold",
                    }}>
                        {message}
                    </p>

                    <button
                        type="submit"
                        style={styles.button}
                    >
                        Register
                    </button>

                    <p
                        onClick={() => window.location.href = "/login"}
                        style={styles.link}
                    >
                        Already have an account?
                    </p>
                </form>
            </div>

            <style>
                {`
                @keyframes float {
                    0% {
                        transform: translateY(0px);
                    }
                    50% {
                        transform: translateY(-18px);
                    }
                    100% {
                        transform: translateY(0px);
                    }
                }

                @keyframes glow {
                    0% {
                        box-shadow: 0 0 10px rgba(255,255,255,0.3);
                    }
                    50% {
                        box-shadow: 0 0 30px rgba(255,255,255,0.8);
                    }
                    100% {
                        box-shadow: 0 0 10px rgba(255,255,255,0.3);
                    }
                }

                @media (max-width: 480px) {
                    input {
                        font-size: 14px;
                    }
                }
                `}
            </style>
        </div>
    );
}

const styles = {
    page: {
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "linear-gradient(135deg, #667eea, #764ba2)",
        overflow: "hidden",
        position: "relative",
        fontFamily: "Arial, sans-serif",
        padding: "20px",
    },

    bubble1: {
        position: "absolute",
        width: "250px",
        height: "250px",
        background: "rgba(255,255,255,0.15)",
        borderRadius: "50%",
        top: "-80px",
        left: "-80px",
        animation: "float 6s infinite ease-in-out",
        filter: "blur(10px)",
    },

    bubble2: {
        position: "absolute",
        width: "220px",
        height: "220px",
        background: "rgba(255,255,255,0.12)",
        borderRadius: "50%",
        bottom: "-60px",
        right: "-60px",
        animation: "float 5s infinite ease-in-out",
        filter: "blur(10px)",
    },

    card: {
        width: "100%",
        maxWidth: "400px",
        padding: "35px 25px",
        borderRadius: "28px",
        background: "rgba(255,255,255,0.16)",
        backdropFilter: "blur(18px)",
        WebkitBackdropFilter: "blur(18px)",
        boxShadow: "0 10px 40px rgba(0,0,0,0.35)",
        textAlign: "center",
        zIndex: 2,
        border: "1px solid rgba(255,255,255,0.18)",
    },

    cartoon: {
        width: "110px",
        maxWidth: "100%",
        marginBottom: "15px",
        animation: "float 3s infinite ease-in-out",
    },

    heading: {
        color: "white",
        fontSize: "clamp(28px, 5vw, 34px)",
        marginBottom: "8px",
        fontWeight: "bold",
    },

    subHeading: {
        color: "#f1f1f1",
        marginBottom: "28px",
        fontSize: "14px",
        lineHeight: "20px",
    },

    input: {
        width: "100%",
        padding: "15px",
        marginBottom: "18px",
        borderRadius: "14px",
        border: "1px solid rgba(255,255,255,0.15)",
        outline: "none",
        background: "rgba(255,255,255,0.18)",
        color: "white",
        fontSize: "15px",
        boxSizing: "border-box",
        transition: "0.3s",
    },

    button: {
        width: "100%",
        padding: "15px",
        border: "none",
        borderRadius: "14px",
        background: "linear-gradient(135deg, #ff9966, #ff5e62)",
        color: "white",
        fontSize: "16px",
        fontWeight: "bold",
        cursor: "pointer",
        animation: "glow 2s infinite",
        transition: "0.3s",
        marginTop: "5px",
    },

    link: {
        color: "#ffffff",
        cursor: "pointer",
        marginTop: "20px",
        fontSize: "14px",
    },
};

export default Register;
import React, { useState } from "react";
import axios from "axios";

function Login() {

    const cartoon =
        "https://cdn-icons-png.flaticon.com/512/4140/4140047.png";

    const [password, setPasswordValue] = useState("");
    const [email, setEmailValue] = useState("");
    const [message, setMessage] = useState("");

    const setPassword = (e) => {
        setPasswordValue(e.target.value);
    };

   const setEmail = (e) => {
    setEmailValue(e.target.value);
};

    const handleSubmit = async (e) => {

        e.preventDefault();

     const data = {
    email: email,
    password: password
};

        try {

            const response = await axios.post(
                "http://localhost:8080/loginUser",
                data
            );

            console.log(response.data);

            if (response.data === "Enter valid email") {

                setMessage("Enter valid email");

            }

            else if (
    response.data === "Invalid User"
) {

    setMessage("Invalid User");

}

else if (
    response.data === "Wrong Password"
) {

    setMessage("Wrong Password");

}

            else if (
                response.data === "Login Successful"
            ) {

                localStorage.setItem(
                    "isLoggedIn",
                    "true"
                );

                setMessage("Login Successful");

                setTimeout(() => {

                    window.location.href = "/";

                }, 1000);
            }

        } catch (error) {

            console.error(error);

            setMessage("Something went wrong");
        }
    };

    const redirectToRegister = () => {
        window.location.href = "/register";
    };

    return (

        <div style={styles.page}>

            {/* Floating Background */}
            <div style={styles.circle1}></div>
            <div style={styles.circle2}></div>

            <div style={styles.card}>

                {/* Cartoon */}
                <img
                    src={cartoon}
                    alt="cartoon"
                    style={styles.cartoon}
                />

                <h2 style={styles.heading}>
                    Welcome Back
                </h2>

                <p style={styles.subHeading}>
                    Login to continue ✨
                </p>

                <form onSubmit={handleSubmit}>

                    <input
                        type="email"
                        placeholder="Enter your user id"
                        title="Please enter your email or user id"
                        value={email}
onChange={setEmail}
                        style={styles.input}
                    />

                    <input
                        type="password"
                        placeholder="Enter your password"
                        title="Password must be secure"
                        value={password}
                        onChange={setPassword}
                        style={styles.input}
                    />

                    <p
                        style={{
                            color: message === "Login Successful" ? "#00ff99" : "#ff4d4f",
                            textAlign: "center",
                            marginBottom: "15px",
                            fontWeight: "bold",
                        }}
                    >
                        {message}
                    </p>

                    <p
                        onClick={redirectToRegister}
                        style={styles.link}
                    >
                        Don't have an account?
                    </p>

                    <button
                        type="submit"
                        style={styles.button}
                    >
                        Login
                    </button>

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
        background:
            "linear-gradient(135deg, #667eea, #764ba2)",
        overflow: "hidden",
        position: "relative",
        fontFamily: "Arial, sans-serif",
        padding: "20px",
    },

    circle1: {
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

    circle2: {
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
        background:
            "linear-gradient(135deg, #ff9966, #ff5e62)",
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
        marginBottom: "20px",
        fontSize: "14px",
    },

};

export default Login;

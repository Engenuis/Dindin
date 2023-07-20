import "./style.css";
import Header from "../../components/Header";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { api } from "../../services/api"

export default function Login(){
    const navigate = useNavigate();
    const [form, setForm] = useState({
        email: "",
        senha: ""
    });
    const [errorMessageLogin, setErrorMessageLogin] = useState("");

    useEffect(() => {
        const token = localStorage.getItem("token");
        token ? navigate("/home") : "";
    }, []);

    function handleChange(event){
        setForm({...form, [event.target.name]: event.target.value});
        setErrorMessageLogin("");
    }

    async function handleSubmit(event){
        event.preventDefault();

        if(!form.email){
            return setErrorMessageLogin("Preencha o campo de E-mail.")
        }

        if(!form.senha){
            return setErrorMessageLogin("Preencha o campo de Senha.")
        }

        try {
            const response = await api.post("login", {...form});
            const { token } = await response.data;
            localStorage.setItem("token", token);
            navigate("/home");
        } catch (error) {
            setErrorMessageLogin(error.response.data.mensagem)
        }
    }

    return(
        <div className="container-login">
            <Header />
            <div className="main-login">
                <aside className="login-aside">
                    <h1
                    className="login-aside__title">Controle suas <span className="login-aside__title-highlight">finanças</span>, sem planilha chata.</h1>
                    <p className="login-aside__text">Organizar as suas finanças nunca foi tão fácil, com o DINDIN, você tem tudo num único lugar e em um clique de distância.</p>
                    <Link to="/signin" className="login-aside__link">Cadastre-se</Link>
                </aside>
                <form className="login-form" onSubmit={handleSubmit}>
                    <h1 className="login-form__title">Login</h1>
                    <label htmlFor="email" className="login-form__label">E-mail</label>
                    <input type="email" name="email" id="email" className="login-form__input-email" onChange={handleChange}/>
                    <label htmlFor="senha" className="login-form__label">Password</label>
                    <input type="password" name="senha" id="senha" className="login-form__input-password" onChange={handleChange}/>
                    <button className="login-form__button">Entrar</button>
                {errorMessageLogin && <p className="error-message">{errorMessageLogin}</p>}
                </form>
            </div>
        </div>
    )
}
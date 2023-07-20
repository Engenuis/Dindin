import "./style.css";
import { Link, useNavigate } from "react-router-dom"
import Header from "../../components/Header";
import { useState } from "react";
import { api } from "../../services/api";

export default function SignIn() {
    const navigate = useNavigate();
    const [form, setForm] = useState({
        nome: "",
        email: "",
        senha: ""
    });
    const [password, setPassword] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    async function handleSubmit(event){
        event.preventDefault();
        if(!form.nome){
            return setErrorMessage("Preencha o campo de nome");
        }

        if(!form.email){
            return setErrorMessage("Preencha o campo de email.");
        }

        if(!form.senha){
            return setErrorMessage("Preencha o campo de senha.");
        }

        if(form.senha != password){
            return setErrorMessage("As senhas devem ser iguais.")
        }

        try {
            const response = await api.post("usuario", {
                ...form
            });
            setForm({
                nome: "",
                email: "",
                senha: ""
            });
            navigate("/")

        } catch (error) {
            const { mensagem } = error.response.data;
            setErrorMessage(mensagem);
        }
    }
    
    function handleChange(event){
        if(errorMessage){
            setErrorMessage("");
        }
        setForm({...form, [event.target.name]: event.target.value});
    }

    return(
        <div className="signin-container">
            <Header />
            <main className="signin-main">
                <form className="signin-form" onSubmit={handleSubmit}>
                    <h1 className="signin-form__title">Cadastre-se</h1>

                    <label htmlFor="nome" className="signin-form__label">Nome</label>
                    <input type="text" name="nome" id="nome" className="signin-form__input" value={form.nome} onChange={handleChange}/>
                    
                    <label htmlFor="email" className="signin-form__label">Email</label>
                    <input type="email" name="email" id="email" className="signin-form__input" value={form.email} onChange={handleChange}/>

                    <label htmlFor="senha" className="signin-form__label">Senha</label>
                    <input type="password" name="senha" id="senha" className="signin-form__input" value={form.senha} onChange={handleChange}/>

                    <label htmlFor="confirm-password" className="signin-form__label">Confirmação de senha</label>
                    <input type="password" name="confirm-password" id="confirm-password" className="signin-form__input-confirm" value={password} onChange={(event) => {setPassword(event.target.value)}}/>

                    <button className="signin-form__button">Cadastrar</button>
                </form>
                <Link to="/" className="signin-main__link">Já tem cadastro? Clique aqui</Link>
                {errorMessage && <p className="error-message">{errorMessage}</p>}
            </main>
        </div>
    )
}
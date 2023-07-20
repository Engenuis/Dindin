import "./style.css";
import UserIcon from "../../assets/userIcon.svg";
import Exit from "../../assets/exit.svg";
import Header from "../../components/Header";
import FilterIcon from "../../assets/filterIcon.png";
import FilterPlus from "../../assets/filterplus.svg";
import FilterX from "../../assets/filterx.svg";
import PoligonUp from "../../assets/poligon.svg";
import PoligonDown from "../../assets/polygondown.svg";
import Edit from "../../assets/edit.svg";
import Delete from "../../assets/delete.svg";
import Close from "../../assets/close.svg";
import { useEffect, useState } from "react";
import { api } from "../../services/api";
import { useNavigate } from "react-router-dom";
import { addHours, format, toDate } from "date-fns";

export default function HomePage(){
    const navigate = useNavigate();
    const [openFilter, setOpenFilter] = useState(false);
    const [order, setOrder] = useState(false);
    const [user, setUser] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [filteredTransactions, setFilteredTransactions] = useState([]);
    const [resume, setResume] = useState({});
    const [filteredResume, setFilteredResume] = useState({});
    const [option, setOption] = useState("");
    const [data, setData] = useState("");
    const [category, setCategory] = useState([]);
    const [postTransaction, setPostTransaction] = useState({
        tipo: "saida",
        descricao: "",
        valor: "",
        data: "",
        categoria_id: ""
    });
    const [modalOverlay, setModalOverlay] = useState(false);
    const [modalAdd, setModalAdd] = useState(false);
    const [editModal, setEditModal] = useState(false);
    const [idEdit, setIdEdit] = useState(0);
    const [transactionState, setTransactionState] = useState("saida");
    const [errorMessage, setErrorMessage] = useState("");
    const token = localStorage.getItem("token");

    async function getData(){
        const response = await api.get("usuario", {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });
        setUser(response.data);
    }

    async function getTransactions(){
        const response = await api.get("transacao", {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });
        setTransactions(response.data);
        setFilteredTransactions(response.data);
    }

    async function getCategory(){
        const response = await api.get("categoria", {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });
        setCategory(response.data.map((item) => {return {...item, isSelected: false}}));
    }

    async function getResume(){
        const response = await api.get("transacao/extrato", {headers: {"Authorization": `Bearer ${token}`}});
        setResume(response.data);
        setFilteredResume(response.data);
    }

    async function handleSubmit(event){
        event.preventDefault();

        if(!postTransaction.descricao){
            return setErrorMessage("Preencha o campo de descrição.");
        }

        if(!postTransaction.valor){
            return setErrorMessage("Preencha o campo de valor.");
        }

        if(!postTransaction.data){
            return setErrorMessage("Selecione uma data.");
        }

        if(!postTransaction.categoria_id){
            return setErrorMessage("Selecione uma categoria.");
        }

        try {
            const response = await api.post("transacao", {...postTransaction}, {headers: {"Authorization" : `Bearer ${token}`}});
            await getTransactions();
            await getResume();
            openAddModal();

        } catch (error) {
            console.log(error);
        }

    }

    async function handleEditSubmit(event){
        event.preventDefault();
        try {
            const response = await api.put(`transacao/${idEdit}`, {...postTransaction}, {headers: {"Authorization": `Bearer ${token}`}});
            await getTransactions();
            await getResume();
            openEditModal();

        } catch (error) {
            console.log(error);
        }
    }

    async function handleDelete(event){
        try {
            const respose = await api.delete(`transacao/${event.target.parentElement.id}`, {headers: {"Authorization": `Bearer ${token}`}});
            await getTransactions();
            await getResume();
        } catch (error) {
            console.log(error);
        }
    }
    
    function handleEdit(event){
        openEditModal();
        const localTransactions = filteredTransactions;
        const { id } = event.target.parentElement;
        const element = localTransactions.find((item) => {
            return item.id === Number(id);
        });
        setTransactionState(element.tipo);
        setPostTransaction({
            tipo: element.tipo,
            descricao: element.descricao,
            valor: element.valor,
            data: element.data,
            categoria_id: element.categoria_id
        });
        setOption(element.categoria_nome);
        setData(format(new Date(element.data), "yyyy-MM-dd"));
        setIdEdit(element.id);
    }

    useEffect(() => {
        
        try {
            getData();

            getTransactions();

            getCategory();

            getResume();

        } catch (error) {
            console.log(error.message)
        }
    }, []);

    function openAddModal(){
        setModalOverlay(!modalOverlay);
        setModalAdd(!modalAdd);
        setTransactionState("saida");
        setPostTransaction({
            tipo: "saida",
            descricao: "",
            valor: "",
            data: "",
            categoria_id: ""
        });
        setOption("");
        setData("");
    }

    function openEditModal(){
        setModalOverlay(!modalOverlay);
        setEditModal(!editModal);
        setTransactionState("saida");
        setPostTransaction({
            tipo: "saida",
            descricao: "",
            valor: "",
            data: "",
            categoria_id: ""
        });
        setOption("");
        setData("");
        setIdEdit(0);
    }
    
    function exitHome(){
        setUser(null);
        localStorage.clear();
        navigate("/");
    }

    function handleChangeTransaction(event){
        if(event.target.name === "data"){
            setData(format(addHours(toDate(event.target.valueAsNumber), 3), "yyyy-MM-dd"));
            return setPostTransaction({...postTransaction, data: new Date(event.target.valueAsDate)})
        }

        if(event.target.name === "categoria_id"){
            setOption(event.target[event.target.selectedIndex].value);
            return setPostTransaction({...postTransaction, categoria_id: event.target.selectedIndex});
        }
        
        setPostTransaction({...postTransaction, [event.target.name]: event.target.value});
        setErrorMessage("");
    }

    function sortData(){
        const localTransactions = filteredTransactions;
        if(!order){
            localTransactions.sort((firstElement, secondElement) => {
                const firstDate = new Date(firstElement.data);
                const secondDate = new Date(secondElement.data);
    
                return +firstDate - +secondDate;
            });
            setFilteredTransactions(localTransactions);
            setOrder(!order);
        }else{
            localTransactions.sort((firstElement, secondElement) => {
                const firstDate = new Date(firstElement.data);
                const secondDate = new Date(secondElement.data);
    
                return +secondDate - +firstDate;
            });
            setFilteredTransactions(localTransactions);
            setOrder(!order);
        }
    }

    function handleFilter(event){
        const localCategory = category;
        const element = localCategory.find((item) => {return item.id === Number(event.target.id)});
        element.isSelected = !element.isSelected;
        return setCategory((prevState) => { return prevState = [...localCategory]});
    }

    function cleanFilter(){
        const localCategory = category.map((item) => {return {...item, isSelected: false}});
        setCategory((prevState) => {return prevState = [...localCategory]});
        getResume();
        return setFilteredTransactions((prevState) => {return prevState = [...transactions]});
    }

    function applyFilter(){
        const localCategory = category.filter((item) => {return item.isSelected});
        const filterArray = localCategory.map((item) => {
            const elements = filteredTransactions.filter((itemCategoria) => {return itemCategoria.categoria_nome === item.descricao});
            return [...elements]
        });

        const spreadArray = [];
        let entries = 0;
        let withdraws = 0;
        filterArray.forEach((item) => spreadArray.push(...item));
        spreadArray.forEach((item) => {
            if(item.tipo === "saida"){
                withdraws += item.valor;
            }

            if(item.tipo === "entrada"){
                entries += item.valor;
            }
        });
        if(spreadArray.length === 0){
            setFilteredTransactions((prevState) => prevState = [...transactions]);
            cleanFilter();
            getResume();
        }else{
            setFilteredTransactions((prevState) => prevState = [...spreadArray]);
            setFilteredResume((prevState) => prevState = {entrada: entries, saida: withdraws});
        }
    }

    return(
        <div className="home-container">
            <Header />
            <div className="exit-box">
                <img src={UserIcon} alt="User Icon" className="exit-box__userIcon"/>
                {user && <p className="exit-box__text">{user.nome}</p>}
                <img src={Exit} alt="Exit button" className="exit-box__button" onClick={() => {exitHome()}}/>
            </div>
            <main className="home-main">
                <div className="home-main__filter" onClick={() => {setOpenFilter(!openFilter)}}>
                    <img src={FilterIcon} alt="Filter Icon" className="home-main__filter__icon"/>
                    <p className="home-main__filter__text">Filtrar</p>
                </div>

                {openFilter && 
                    <div className="filter-section">
                        <h1 className="filter-section__title">Categoria</h1>
                        <div className="filter-section__options">
                            {category.map((item) => {
                                return(
                                <div key={item.id} id={item.id} name={item.descricao} className={`filter-section__options__item ${item.isSelected ? "selected" : ""}`} onClick={(event) => {handleFilter(event)}} >{item.descricao}
                                <img src={item.isSelected ? FilterX : FilterPlus} alt="Filter Image" />
                                </div>
                            )})}
                        </div>
                        <button className="filter-section__clean" onClick={() => {cleanFilter()}}>Limpar Filtros</button>
                        <button className="filter-section__apply" onClick={() => {applyFilter()}}>Aplicar Filtros</button>
                    </div>
                }

                <div className="information">
                    <div className="table">
                        <div className="table-header">
                            <div className="table-header__data" onClick={() => { sortData() }}>
                                <p className="table-header__data__text">Data</p>
                                <img src={order ? PoligonDown : PoligonUp} alt="Poligon Icon" className="table-header__data__icon"/>
                            </div>
                            <p className="table-header__week">Dia da semana</p>
                            <p className="table-header__description">Descrição</p>
                            <p className="table-header__category">Categoria</p>
                            <p className="table-header__value">Valor</p>
                        </div>
                        {filteredTransactions && filteredTransactions.map((item) => {
                            const localDate = new Date(item.data);
                            const usedDate = addHours(localDate, 6);
                            const day = usedDate.getDay();
                            let dayName = "";
                            switch(day){
                                case 0: dayName = "Domingo";
                                break;
                                case 1: dayName = "Segunda";
                                break;
                                case 2: dayName = "Terça";
                                break;
                                case 3: dayName = "Quarta";
                                break;
                                case 4: dayName = "Quinta";
                                break;
                                case 5: dayName = "Sexta";
                                break;
                                case 6: dayName = "Sábado";
                                break;
                            }
                            const value = Number(item.valor / 100).toFixed(2).replace(".", ",");

                            return (
                                <div className="table-data" key={item.id} id={item.id}>
                                    <p className="table-data__date">{usedDate.toLocaleDateString()}</p>
                                    <p className="table-data__day">{dayName}</p>
                                    <p className="table-data__description">{item.descricao}</p>
                                    <p className="table-data__category">{item.categoria_nome}</p>
                                    <p className={`table-data__value ${item.tipo === "saida" ? "withdraw" : "entry"}`}>{`R$ ${value}`}</p>
                                    <img src={Edit} alt="Edit Icon" className="table-data__edit" onClick={(event) => {handleEdit(event)}}/>
                                    <img src={Delete} alt="Delete Icon" className="table-data__delete" onClick={(event) => {handleDelete(event)}}/>
                                </div>
                            )
                        })}
                    </div>
                    <div className="user-information">
                        <div className="home-entries">
                            <div className="resume">
                                <h1 className="resume__title">Resumo</h1>
                                <div className="resume__entry">
                                    <p className="resume__entry__text">Entradas</p>
                                    <p className="resume__entry__value">R$ {(filteredResume.entrada / 100).toFixed(2).replace(".", ",")}</p>
                                </div>
                                <div className="resume__exit">
                                    <p className="resume__exit__text">Saídas</p>
                                    <p className="resume__exit__value">R$ {(filteredResume.saida / 100).toFixed(2).replace(".", ",")}</p>
                                </div>
                                <div className="resume__total">
                                    <p className="resume__total__text">Saldo</p>
                                    <p className={`resume__total__value ${(filteredResume.entrada - filteredResume.saida) > 0 ? "positive" : "negative"}`}>R$ {(filteredResume.entrada / 100 - filteredResume.saida / 100).toFixed(2).replace(".", ",")}</p>
                                </div>
                            </div>
                        </div>
                        <button className="home-entries__button" onClick={() => {openAddModal()}}>Adicionar Registro</button>
                    </div>
                </div>
            </main>
            <div className={`modal-overlay ${modalOverlay ? "" : "hidden"}`}>
                <div className={`modal-add ${modalAdd ? "" : "hidden"}`}>
                        <div className="modal-add__exit">
                            <h1 className="modal-add__exit__title">Adicionar Registro</h1>
                            <img src={Close} alt="Close image" className="modal-add__exit__button" onClick={() => {openAddModal()}}/>
                        </div>
                        <div className="modal-add__type">
                            <button className={`modal-add__type__entry ${transactionState === "entrada" ? "selected" : ""}`} onClick={() => {
                                setTransactionState("entrada");
                                setPostTransaction({...postTransaction, tipo: "entrada"});
                            }}>Entrada</button>
                            <button className={`modal-add__type__exit ${transactionState === "saida" ? "selected" : ""}`} onClick={() => {
                                setTransactionState("saida");
                                setPostTransaction({...postTransaction, tipo: "saida"});
                            }}>Saída</button>
                        </div>

                    <form className="modal-add__form" onSubmit={handleSubmit}>
                        <label htmlFor="valor" className="modal-add__form__label">Valor</label>
                        <input type="number" name="valor" id="valor" className="modal-add__form__input-value" value={postTransaction.valor} onChange={handleChangeTransaction}/>

                        <label htmlFor="categoria_id" className="modal-add__form__label">Categoria</label>
                        <select name="categoria_id" id="categoria_id" className="modal-add__form__input-select" value={option} onChange={handleChangeTransaction}>
                            <option value=""></option>
                            {category && category.map((item) => {
                                return(
                                    <option value={item.descricao} key={item.id}>{item.descricao}</option>
                                )
                                })}
                        </select>

                        <label htmlFor="data" className="modal-add__form__label">Data</label>
                        <input type="date" name="data" id="data" className="modal-add__form__input-date" value={data} onChange={handleChangeTransaction}/>

                        <label htmlFor="descicao" className="modal-add__form__label">Descrição</label>
                        <input type="text" name="descricao" id="descricao" className="modal-add__form__input-description" value={postTransaction.descricao} onChange={handleChangeTransaction}/>

                        <button className="modal-add__form__button">Confirmar</button>
                        {errorMessage && <p className="error-message-home">{errorMessage}</p>}
                    </form>
                </div>

                <div className={`edit-modal ${editModal ? "" : "hidden"}`}>
                        <div className="edit-modal__exit">
                            <h1 className="edit-modal__exit__title">Editar Registro</h1>
                            <img src={Close} alt="Close image" className="edit-modal__exit__button" onClick={() => {openEditModal()}}/>
                        </div>
                        <div className="edit-modal__type">
                            <button className={`edit-modal__type__entry ${transactionState === "entrada" ? "selected" : ""}`} onClick={() => {
                                setTransactionState("entrada");
                                setPostTransaction({...postTransaction, tipo: "entrada"});
                            }}>Entrada</button>
                            <button className={`edit-modal__type__exit ${transactionState === "saida" ? "selected" : ""}`} onClick={() => {
                                setTransactionState("saida");
                                setPostTransaction({...postTransaction, tipo: "saida"});
                            }}>Saída</button>
                        </div>

                    <form className="edit-modal__form" onSubmit={handleEditSubmit}>
                        <label htmlFor="valor" className="edit-modal__form__label">Valor</label>
                        <input type="number" name="valor" id="valor" className="edit-modal__form__input-value" value={postTransaction.valor} onChange={handleChangeTransaction}/>

                        <label htmlFor="categoria_id" className="edit-modal__form__label">Categoria</label>
                        <select name="categoria_id" id="categoria_id" className="edit-modal__form__input-select" value={option} onChange={handleChangeTransaction}>
                            <option value=""></option>
                            {category && category.map((item) => {
                                return(
                                    <option value={item.descricao} key={item.id}>{item.descricao}</option>
                                )
                                })}
                        </select>

                        <label htmlFor="data" className="edit-modal__form__label">Data</label>
                        <input type="date" name="data" id="data" className="edit-modal__form__input-date" value={data} onChange={handleChangeTransaction}/>

                        <label htmlFor="descicao" className="edit-modal__form__label">Descrição</label>
                        <input type="text" name="descricao" id="descricao" className="edit-modal__form__input-description" value={postTransaction.descricao} onChange={handleChangeTransaction}/>

                        <button className="edit-modal__form__button">Confirmar</button>
                        {errorMessage && <p className="error-message-home">{errorMessage}</p>}
                    </form>
                </div>
            </div>
        </div>
    )
}
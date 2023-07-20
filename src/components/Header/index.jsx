import "./style.css";
import Dindin from "../../assets/dindin-logo.png";

export default function Header(){
    return(
        <header className="header">
            <img src={Dindin} alt="Dindin's Logo" className="header__logo"/>
        </header>
    )
}
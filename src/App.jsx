import './App.css';
import HomePage from './pages/HomePage';
import Login from './pages/Login';
import SignIn from './pages/SignIn';
import ProtectedRoute from './components/ProtectedRoute';
import { Routes, Route, BrowserRouter } from "react-router-dom";

function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={ <Login /> } />
        <Route path='/signin' element={ <SignIn /> } />
        <Route element={ <ProtectedRoute /> }>
          <Route path='/home' element={ <HomePage /> } />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App

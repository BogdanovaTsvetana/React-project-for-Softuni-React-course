import { useNavigate } from 'react-router-dom';
import { useContext, useEffect, useReducer, useState } from 'react';
import { useAuthContext } from '../../context/AuthContext.js';
import { NotificationContext, types } from '../../context/NotificationContext.js';

import * as authService from '../../services/authService.js';
import './Register.css';

function reducer(inputState, action){
    switch(action.type){
        case 'email_input':
            return {...inputState, emailValue: action.val, emailIsValid: undefined};
        case 'email_valid':
            return {...inputState, emailIsValid: inputState.emailValue.includes('@')};
        case 'username_input':
            return {...inputState, usernameValue: action.val, usernameIsValid: undefined} 
        case 'username_valid':
            return {...inputState, usernameIsValid: inputState.usernameValue.trim().length > 3};
        case 'password_input':
            return {...inputState, passwordValue: action.val, passwordIsValid: undefined};
        case 'password_valid':
            return {...inputState, passwordIsValid: inputState.passwordValue.trim().length > 4};
        case 'rePassword_input':
            return {...inputState, rePasswordValue: action.val, rePasswordIsValid: undefined};
        case 'rePassword_valid':
            return {...inputState, rePasswordIsValid: inputState.rePasswordValue.trim() === inputState.passwordValue}; 
        case 'location_input':
            return {...inputState, locationValue: action.val, locationIsValid: undefined};
        case 'location_valid':
            return {...inputState, locationIsValid: inputState.locationValue.trim().length > 0};                 
    }
}

export default function Register(){
    const navigate = useNavigate();
    const { login } = useAuthContext();
    const { addNotification } = useContext(NotificationContext); 

    let[inputState, inputDispatcher] = useReducer(reducer, {
        usernameValue: '',
        usernameIsValid: undefined,
        emailValue: '',
        emailIsValid: undefined,
        passwordValue: '',
        passwordIsValid: undefined,
        rePasswordValue: '',
        rePasswordIsValid: undefined,
        locationValue: '',
        locationIsValid: undefined
    })

    let[isFormValid, updateFormValidation] = useState(false);

    useEffect(() => {
        updateFormValidation(
            inputState.emailValue.includes('@') &&
            inputState.usernameValue.trim().length > 3 &&
            inputState.passwordValue.trim().length > 4 &&
            inputState.rePasswordValue.trim() === inputState.passwordValue &&
            inputState.locationValue.trim().length > 0
        )
    }, [inputState.emailIsValid, inputState.usernameIsValid, inputState.passwordIsValid, inputState.rePasswordIsValid, inputState.locationIsValid])

    const onChangeHandler = (e) => {
        let type = `${e.target.name}_input`;
        inputDispatcher({val: e.target.value, type: type});
    }

    const ValidationHandler = (e) => {
        let type = `${e.target.name}_valid`;
        switch(e.target.name){
            case 'email':
                inputDispatcher({val: inputState.emailValue, type})
                break;
            case 'username':
                inputDispatcher({val: inputState.usernameValue, type})
                break;
            case 'password':
                inputDispatcher({val: inputState.passwordValue, type})
                break;  
            case 'rePassword':
                inputDispatcher({val: inputState.rePasswordValue, type})
                break;
            case 'location':
                inputDispatcher({val: inputState.locationValue, type})
                break;   
            }
    }

    function onSubmit(e){
        e.preventDefault();
        if(isFormValid){
            const userData = {
                username: inputState.usernameValue,
                email: inputState.emailValue,
                password: inputState.passwordValue,
                location: inputState.locationValue,
                memberSince: new Date(),
            }
                    
            authService.register(userData)
                .then(result => {
                    login(result);
                    addNotification('You\'ve been registered!', types.success);
                    navigate('/list');
                })
                .catch(err => {
                    console.log(err.message)
                    addNotification(err.message, types.error);
                })
        }
    }

    
    return(
        <section className="common__section">
            <h2 className="common__title">Register</h2>
           
            <form className="form" onSubmit={onSubmit} method="POST" onChange={onChangeHandler} >

                <div>
                    <label htmlFor="email">Email:</label>
                    {inputState.emailIsValid === false && <p className="error-message">Email is not valid</p>}
                    <input 
                        type="text" 
                        name="email" 
                        placeholder="Email" 
                        defaultValue={inputState.emailValue}
                        onBlur={ValidationHandler}
                        className={inputState.emailIsValid === false ? 'input-error' : ''}
                    />
                </div>
                
                <div>
                    <label htmlFor="username">Username:</label>
                    {inputState.usernameIsValid === false && <p className="error-message">Username should be more than 3 characters long.</p>}
                    <input 
                        type="text" 
                        name="username" 
                        placeholder="Username should be more than 3 characters long" 
                        defaultValue={inputState.usernameValue}
                        onBlur={ValidationHandler}
                        className={inputState.usernameIsValid === false ? 'input-error' : ''}
                    />
                </div>
                
                <div>
                    <label htmlFor="password">Password:</label>
                    {inputState.passwordIsValid === false && <p className="error-message">Password should be more than 4 characters long.</p>}
                    <input 
                        type="password"  
                        name="password" 
                        placeholder="Password should be more than 4 characters long"
                        defaultValue={inputState.passwordValue}
                        onBlur={ValidationHandler}
                        className={inputState.passwordIsValid === false ? 'input-error' : ''} 
                    />
                </div>
                
                <div>
                    <label htmlFor="rePassword">Repeat Password:</label>
                    {inputState.rePasswordIsValid === false && <p className="error-message">Passwords don't match.</p>}
                    <input 
                        type="password"  
                        name="rePassword" 
                        placeholder="Repeat Password" 
                        onBlur={ValidationHandler}
                        className={inputState.rePasswordIsValid === false ? 'input-error' : ''} 
                    />
                </div>
                
                <div>
                    <label htmlFor="location">Location:</label>
                    <input type="text" name="location" placeholder="Location" />
                </div>
                
                <button type="submit" className="button" disabled={!isFormValid}>REGISTER</button>
    
            </form>
        </section>
    );
}


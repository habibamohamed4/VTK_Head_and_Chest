import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import Apps from './App1';
import reportWebVitals from './reportWebVitals';
//import { Button , ImageBackground} from 'react-native';

function chest(){
ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);
}

function head(){
ReactDOM.render(
  <React.StrictMode>
    <Apps />
  </React.StrictMode>,
  document.getElementById('root')
);
}
ReactDOM.render(
  <React.StrictMode>
    <div style={{
      
      alignItems: 'center',
      backgroundColor: '#00BFFF',
      padding: 100
      
    }}>
      <p style={{
        zIndex:"5", 
        position: "center",
        fontFamily:'Brush Script MT',
        marginLeft:320,
        fontSize:50
        }}>
        WELCOME DOCTOR
      </p>
    <button onClick={chest} style={{
        zIndex:"5", 
        position: "center",
        //margin:178,
        marginLeft:300,
        marginTop:175,
        fontSize:30
        }}>
    CHEST
    </button>
    <button onClick={head} style={{
        zIndex:"2", 
        position: "center",
        marginLeft:300,
        fontSize:30
        //margin:100
        }}>
    HEAD
    </button>
    </div>
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

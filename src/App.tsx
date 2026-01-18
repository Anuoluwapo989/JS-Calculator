import React, { useState, useEffect, useCallback } from 'react';
import { evaluate } from 'mathjs';
import './App.css';

// Type definition for the currently selected operator
type OperatorType = '/' | '*' | '-' | '+' | '=' | null;

function App() {
  const [display, setDisplay] = useState<string>("0");
  const [result, setResult] = useState<boolean>(false);
  const [activeOperator, setActiveOperator] = useState<OperatorType>(null);

  // Helper function to check if a symbol is an operator
  const isOperator = (symbol: string) => /[*/+-]/.test(symbol);

  // NOTE: We wrap calculate in useCallback so it can be used in the useEffect below
  const calculate = useCallback(() => {
    try {
      // Evaluate the math expression
      const evaluated = evaluate(display.trim());
      setDisplay(String(evaluated));
      setResult(true);
      setActiveOperator(null);
    } catch (error) {
      setDisplay("Error");
      setResult(true);
      setActiveOperator(null);
    }
  }, [display]);

  // NOTE: We wrap buttonPress in useCallback to avoid stale state in event listeners
  const buttonPress = useCallback((symbol: string) => {
    if (symbol === "clear") {
      setDisplay("0");
      setResult(false);
      setActiveOperator(null);
    }
    else if (symbol === "=") {
      calculate();
    }
    else if (isOperator(symbol)) {
      setResult(false);
      const lastChar = display.trim().slice(-1);
      
      // If user clicks a different operator, swap it
      if (isOperator(lastChar)) {
        setDisplay(prev => prev.trim().slice(0, -1).trim() + " " + symbol + " ");
      } else {
        setDisplay(prev => prev + " " + symbol + " ");
      }
      setActiveOperator(symbol as OperatorType);
    }
    else {
      // Logic for Numbers/Decimals
      if (display === "0" || result) {
        setDisplay(symbol);
        setResult(false);
      } else {
        setDisplay((prev) => prev + symbol);
      }
      // Typing a number turns off the visual highlight
      setActiveOperator(null);
    }
  }, [display, result, calculate]);

  // GLOBAL KEYBOARD LISTENER
  // We attach this to the window instead of the div. 
  // This allows desktop typing without needing to "focus" the display.
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const allowed = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'];
      
      if (e.key === 'Enter') {
        e.preventDefault();
        calculate();
        setActiveOperator(null);
      } else if (e.key === 'Escape') {
        e.preventDefault();
        buttonPress("clear");
      } else if (/^[0-9.+\-*/]$/.test(e.key)) {
        e.preventDefault();
        buttonPress(e.key);
      } else if (!allowed.includes(e.key)) {
        // Optional: prevent default only if you want to block other keys
        // e.preventDefault(); 
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    // Cleanup listener on unmount or re-render
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [buttonPress, calculate]); // Dependencies ensure the listener always has latest state

  // Helper function to check if a specific button is the currently active one
  const isButtonActive = (symbol: string) => activeOperator === symbol;

  // Logic to show only current number (mimicking iOS calculator)
  const formatDisplay = () => {
    return display.split(/[*/+-]/).filter(x => x.trim() !== "").pop()?.trim() || "0";
  };

  return (
    <div className="container">
      <h1>Calculator Web App</h1>
      <div id="calculator">
        <div id="display">
          {/* Changed from contentEditable to a standard div */}
          <div id="answer">
            {formatDisplay()}
          </div>
        </div>

        <button id="clear" onClick={() => buttonPress("clear")} className="light-gray">C</button>
        <button id="negative" onClick={() => buttonPress("negative")} className="light-gray">+/-</button>
        <button id="percentage" onClick={() => buttonPress("percent")} className="light-gray">%</button>
        <button id="divide" onClick={() => buttonPress("/")} className={`yellow ${isButtonActive('/') ? 'active-operator' : ''}`}>/</button>

        <button id="seven" onClick={() => buttonPress("7")} className="dark-gray">7</button>
        <button id="eight" onClick={() => buttonPress("8")} className="dark-gray">8</button>
        <button id="nine" onClick={() => buttonPress("9")} className="dark-gray">9</button>
        <button id="multiply" onClick={() => buttonPress("*")} className={`yellow ${isButtonActive('*') ? 'active-operator' : ''}`}>*</button>

        <button id="four" onClick={() => buttonPress("4")} className="dark-gray">4</button>
        <button id="five" onClick={() => buttonPress("5")} className="dark-gray">5</button>
        <button id="six" onClick={() => buttonPress("6")} className="dark-gray">6</button>
        <button id="subtract" onClick={() => buttonPress("-")} className={`yellow ${isButtonActive('-') ? 'active-operator' : ''}`}>-</button>

        <button id="one" onClick={() => buttonPress("1")} className="dark-gray">1</button>
        <button id="two" onClick={() => buttonPress("2")} className="dark-gray">2</button>
        <button id="three" onClick={() => buttonPress("3")} className="dark-gray">3</button>
        <button id="add" onClick={() => buttonPress("+")} className={`yellow ${isButtonActive('+') ? 'active-operator' : ''}`}>+</button>

        <button id="calc" onClick={() => buttonPress("calc")} className="dark-gray">
          <img id = "calc-icon" src="src\assets\calculator.png" alt="This is a calculator"></img>
        </button>
        <button id="zero" onClick={() => buttonPress("0")} className="dark-gray">0</button>
        <button id="decimal" onClick={() => buttonPress(".")} className="dark-gray">.</button>
        <button id="equals" onClick={() => buttonPress("=")} className="yellow">=</button>
      </div>
    </div>
  );
}

export default App;
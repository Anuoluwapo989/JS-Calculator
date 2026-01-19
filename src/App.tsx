import React, { useState, useEffect, useCallback } from 'react';
import { evaluate } from 'mathjs';
import './App.css';

// Type definition for the currently selected operator
type OperatorType = '/' | '*' | '-' | '+' | '=' | null;

function App() {
  // State 1: The full math string (e.g., "50 * 2 + 10")
  const [expression, setExpression] = useState<string>("");

  // State 2: The live answer (e.g., "110")
  const [result, setResult] = useState<string>("0");

  // const [display, setDisplay] = useState<string>("0");
  // const [result, setResult] = useState<boolean>(false);

  const [activeOperator, setActiveOperator] = useState<OperatorType>(null);

  // Helper function to check if a symbol is an operator
  const isOperator = (symbol: string) => /[*/+-]/.test(symbol);
  useEffect(() => {
    if (!expression) {
      setResult("0");
      return;
    }

    try {
      // Check if the last character is NOT an operator (so we don't solve "50 +")
      const lastChar = expression.slice(-1);
      if (!isOperator(lastChar)) {
        const calculated = evaluate(expression);
        setResult(String(calculated));
      }
    } catch (error) {
      // If the math is invalid (incomplete), we just ignore it 
      // and keep the previous valid result on screen.
    }
  }, [expression]);


  // // NOTE: We wrap calculate in useCallback so it can be used in the useEffect below
  // const calculate = useCallback(() => {
  //   try {
  //     // Evaluate the math expression
  //     const evaluated = evaluate(display.trim());
  //     setDisplay(String(evaluated));
  //     setResult(true);
  //     setActiveOperator(null);
  //   } catch (error) {
  //     setDisplay("Error");
  //     setResult(true);
  //     setActiveOperator(null);
  //   }
  // }, [display]);

  // NOTE: We wrap buttonPress in useCallback to avoid stale state in event listeners
  const buttonPress = useCallback((symbol: string) => {
    if (symbol === "clear") {
      setExpression("");
      setResult("0");
      setActiveOperator(null);
    }
    else if (symbol === "=") {
      // FINAL COMMIT: Replace the expression with the calculated result
      setExpression(result);
      setActiveOperator(null);
    }
    else if (symbol === "negative") {
      // Simple logic to toggle negative at the start
      if (expression === "") setExpression("-");
      else setExpression(prev => prev + "-");
    }
    else if (isOperator(symbol)) {
      const lastChar = expression.slice(-1);

      // If user typed an operator, prevent duplicates (e.g. "50++")
      if (isOperator(lastChar)) {
        // Replace the old operator with the new one
        setExpression(prev => prev.slice(0, -1) + symbol);
      } else {
        setExpression(prev => prev + symbol);
      }
      setActiveOperator(symbol as OperatorType);
    }
    else {
      // It's a number/decimal
      setExpression(prev => prev + symbol);
      setActiveOperator(null);
    }
  }, [expression, result]);

  // GLOBAL KEYBOARD LISTENER
  // We attach this to the window instead of the div. 
  // This allows desktop typing without needing to "focus" the display.
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const allowed = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight'];
      if (e.key === 'Enter') {
        e.preventDefault();
        buttonPress("=");
      } else if (e.key === 'Escape') {
        e.preventDefault();
        buttonPress("clear");
      } else if (e.key === 'Backspace') {
        setExpression(prev => prev.slice(0, -1));
      } else if (/^[0-9.+\-*/]$/.test(e.key)) {
        e.preventDefault();
        buttonPress(e.key);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [buttonPress]);

  return (
    <div className="container">
      <h1>Calculator Web App</h1>
      <div id="calculator">

        {/* NEW DUAL DISPLAY */}
        <div id="display">
          {/* Top: The Formula */}
          <div className="expression-text">
            {expression}
          </div>
          {/* Bottom: The Live Answer */}
          <div className="result-text">
            {result}
          </div>
        </div>
        <button id="clear" onClick={() => buttonPress("clear")} className="light-gray">C</button>
        <button id="negative" onClick={() => buttonPress("negative")} className="light-gray">+/-</button>
        <button id="percentage" onClick={() => buttonPress("percent")} className="light-gray">%</button>
        <button id="divide" onClick={() => buttonPress("/")} className={`yellow ${activeOperator === '/' ? 'active-operator' : ''}`}>/</button>

        <button id="seven" onClick={() => buttonPress("7")} className="dark-gray">7</button>
        <button id="eight" onClick={() => buttonPress("8")} className="dark-gray">8</button>
        <button id="nine" onClick={() => buttonPress("9")} className="dark-gray">9</button>
        <button id="multiply" onClick={() => buttonPress("*")} className={`yellow ${activeOperator === '*' ? 'active-operator' : ''}`}>*</button>

        <button id="four" onClick={() => buttonPress("4")} className="dark-gray">4</button>
        <button id="five" onClick={() => buttonPress("5")} className="dark-gray">5</button>
        <button id="six" onClick={() => buttonPress("6")} className="dark-gray">6</button>
        <button id="subtract" onClick={() => buttonPress("-")} className={`yellow ${activeOperator === '-' ? 'active-operator' : ''}`}>-</button>

        <button id="one" onClick={() => buttonPress("1")} className="dark-gray">1</button>
        <button id="two" onClick={() => buttonPress("2")} className="dark-gray">2</button>
        <button id="three" onClick={() => buttonPress("3")} className="dark-gray">3</button>
        <button id="add" onClick={() => buttonPress("+")} className={`yellow ${activeOperator === '+' ? 'active-operator' : ''}`}>+</button>

        <button id="calc" onClick={() => buttonPress("calc")} className="dark-gray">
          <span className="material-symbols-outlined">calculate</span>
        </button>
        <button id="zero" onClick={() => buttonPress("0")} className="dark-gray">0</button>
        <button id="decimal" onClick={() => buttonPress(".")} className="dark-gray">.</button>
        <button id="equals" onClick={() => buttonPress("=")} className="yellow">=</button>
      </div>
    </div>
  );
}

export default App;
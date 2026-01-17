import React, { useState, useRef, useEffect } from 'react';
import { evaluate } from 'mathjs';
import './App.css';

// Type definition for the currently selected operator
type OperatorType = '/' | '*' | '-' | '+' | '=' | null;

function App() {
  const [display, setDisplay] = useState<string>("0");
  const [result, setResult] = useState<boolean>(false);
  // State to track which operator button should be visually 'active'
  const [activeOperator, setActiveOperator] = useState<OperatorType>(null);
  const displayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    displayRef.current?.focus();
  }, []);

  const isOperator = (symbol: string) => /[*/+-]/.test(symbol);

  const calculate = () => {
    try {
      const evaluated = evaluate(display.trim());
      setDisplay(String(evaluated));
      setResult(true);
      setActiveOperator(null); // Calculation finished, clear active operator highlight
    } catch (error) {
      setDisplay("Error");
      setResult(true);
      setActiveOperator(null);
    }
  };

  const buttonPress = (symbol: string) => {
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
      let newDisplay = display;

      // If user clicks a different operator, swap it
      if (isOperator(lastChar)) {
        newDisplay = display.trim().slice(0, -1).trim() + " " + symbol + " ";
      } else {
        newDisplay = display + " " + symbol + " ";
      }

      setDisplay(newDisplay);
      setActiveOperator(symbol as OperatorType);
    }
    else {
      // Logic for Numbers/Decimals
      if (display === "0" || result) {
        setDisplay(symbol);
        setResult(false);
      } else {
        // APPEND the number even if an operator is active 
        // so the full expression stays in the background
        setDisplay((prev) => prev + symbol);
      }

      // Typing a number turns off the visual highlight
      setActiveOperator(null);
    }
    setTimeout(() => displayRef.current?.focus(), 0);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const allowed = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'];
    if (e.key === 'Enter') {
      e.preventDefault();
      calculate();
      setActiveOperator(null); // Clear highlight when Enter is pressed (triggers calculate anyway)
    } else if (e.key === 'Escape') {
      e.preventDefault();
      buttonPress("clear");
    } else if (/^[0-9.+\-*/]$/.test(e.key)) {
      e.preventDefault();
      buttonPress(e.key);
    } else if (!allowed.includes(e.key)) {
      e.preventDefault();
    }
  };

  // Helper function to check if a specific button is the currently active one
  const isButtonActive = (symbol: string) => activeOperator === symbol;

  return (
    <div className="container">
      <h1>Calculator Web App</h1>
      <div id="calculator">
        <div id="display">
          <div
            id="answer"
            ref={displayRef}
            contentEditable="plaintext-only"
            suppressContentEditableWarning={true}
            onKeyDown={handleKeyDown}
            tabIndex={0}
            // This logic extracts ONLY the numerical parts and shows the last one typed.
            // It effectively hides the operator symbols from the screen.
            dangerouslySetInnerHTML={{
              __html: display.split(/[*/+-]/).filter(x => x.trim() !== "").pop()?.trim() || "0"
            }}
          />



        </div>

        {/* Use the isButtonActive helper to apply a dynamic class name */}
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

        <button id="zero" onClick={() => buttonPress("0")} className="dark-gray">0</button>
        <button id="decimal" onClick={() => buttonPress(".")} className="dark-gray">.</button>
        <button id="equals" onClick={() => buttonPress("=")} className="yellow">=</button>
      </div>
    </div>
  );
}

export default App;

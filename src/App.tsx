import React, { useState, useEffect, useCallback, useRef } from 'react';
import { evaluate } from 'mathjs';
import { Analytics } from '@vercel/analytics/react';
import './App.css';

// Type definition for the currently selected operator
type OperatorType = '/' | '*' | '-' | '+' | '=' | null;

function App() {
  const [expression, setExpression] = useState<string>("");
  const [result, setResult] = useState<string>("0");
  const [history, setHistory] = useState<string[]>([]);
  const [showHistory, setShowHistory] = useState<boolean>(false);
  const [activeOperator, setActiveOperator] = useState<OperatorType>(null);
  
  const [hasCalculated, setHasCalculated] = useState<boolean>(false);
  const [lastCalcWasSimple, setLastCalcWasSimple] = useState<boolean>(false);
  
  const displayRef = useRef<HTMLDivElement>(null);

  const isOperator = (symbol: string) => /[*/+-]/.test(symbol);
  
  // Helper to detect simple numbers (only digits, dots, and optional negative)
  // Note: "50%" will return FALSE, which is good (it will be saved to history).
  const isSimpleNumber = (str: string) => /^-?\d*\.?\d*$/.test(str);

  const buttonPress = useCallback((symbol: string) => {
    if (symbol === "clear") {
      setExpression("");
      setResult("0");
      setActiveOperator(null);
      setHasCalculated(false);
      setLastCalcWasSimple(false);
    }
    else if (symbol === "=") {
      if (!expression) return;
      
      try {
        // 1. Calculate
        // mathjs handles "50%" automatically as 0.5
        const finalResult = evaluate(expression); 
        
        // 2. Check if simple
        const isSimple = isSimpleNumber(expression);
        setLastCalcWasSimple(isSimple);

        // 3. History: Save if NOT simple (e.g. "50 + 5" or "50%")
        if (!isSimple) {
            const historyItem = `${expression} = ${finalResult}`;
            setHistory(prev => [historyItem, ...prev]);
        }
        
        setResult(String(finalResult)); 
        setExpression(String(finalResult)); 
        setActiveOperator(null);
        setHasCalculated(true); 

      } catch (error) {
        setResult("Error");
      }
    }
    else if (symbol === "history") {
        setShowHistory(!showHistory);
    }
    // --- UPDATED PERCENT LOGIC ---
    else if (symbol === "percent") {
      // Prevent adding % if empty or if the last char is already a % or operator
      if (expression === "" || isOperator(expression.slice(-1)) || expression.slice(-1) === "%") return;
      
      // Just append the % symbol to the screen
      setExpression(prev => prev + "%");
    }
    // -----------------------------
    else if (symbol === "calc") {
      if (!expression) return;
      try {
        const finalResult = evaluate(expression); 
        setResult(String(finalResult)); 
        setExpression(String(finalResult)); 
        setActiveOperator(null);
        setHasCalculated(true); 
        setLastCalcWasSimple(true); 
      } catch (error) {
        setResult("Error");
      }
    }
    else if (symbol === "negative") {
      if (expression === "") setExpression("-");
      else setExpression(prev => prev + "-");
    }
    else if (isOperator(symbol)) {
      setHasCalculated(false);
      setLastCalcWasSimple(false); 

      const lastChar = expression.slice(-1);
      const secondLastChar = expression.slice(-2, -1);

      if (isOperator(lastChar)) {
        if (symbol === "-" && lastChar !== "-") {
            setExpression(prev => prev + symbol);
        }
        else if (symbol !== "-") {
            if (isOperator(secondLastChar)) {
                setExpression(prev => prev.slice(0, -2) + symbol);
            } else {
                setExpression(prev => prev.slice(0, -1) + symbol);
            }
        }
      } else {
        setExpression(prev => prev + symbol);
      }
      setActiveOperator(symbol as OperatorType);
    }
    else {
      // NUMBER LOGIC
      if (hasCalculated) {
        setExpression(symbol);
        setHasCalculated(false);
        setLastCalcWasSimple(false); 
      } else {
        if (symbol === ".") {
             const segments = expression.split(/[*/+-]/);
             const currentSegment = segments[segments.length - 1];
             if (currentSegment.includes(".")) return;
        }
        if (symbol === "0") {
             const segments = expression.split(/[*/+-]/);
             const currentSegment = segments[segments.length - 1];
             if (currentSegment === "0") return;
        }

        setExpression(prev => prev + symbol);
      }
      setActiveOperator(null);
    }
  }, [expression, showHistory, activeOperator, hasCalculated]);

  // Keyboard Handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') { e.preventDefault(); buttonPress("="); }
      else if (e.key === 'Escape') { e.preventDefault(); buttonPress("clear"); }
      else if (e.key === 'Backspace') {
        setExpression(prev => prev.slice(0, -1));
      } 
      // Added '%' to the regex to support keyboard input (Shift + 5)
      else if (e.key === '%') { e.preventDefault(); buttonPress("percent"); }
      else if (/^[0-9.+\-*/]$/.test(e.key)) {
        e.preventDefault();
        buttonPress(e.key);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [buttonPress]);

  // Auto-scroll Logic
  useEffect(() => {
    if (displayRef.current) {
      displayRef.current.scrollLeft = displayRef.current.scrollWidth;
    }
  }, [expression]);

  return (
    <div className="container">
      <Analytics />
      <h1>Calculator Web App</h1>
      <div id="calculator">

        <div className="display-container">
          
          <div className="expression-text">
            {history.length > 0 && !lastCalcWasSimple
              ? history[0].split('=')[0] 
              : '\u00A0'}
          </div>
          
          <div id="display" className="result-text" ref={displayRef}>
            {expression || "0"}
          </div>

          <div 
             onClick={() => setShowHistory(!showHistory)} 
             className="history-icon"
             title="View History"
          >
             <span className="material-symbols-outlined">history</span>
          </div>
        </div>

        {showHistory && (
            <div className="history-list">
                <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'10px'}}>
                   <h3>History</h3>
                </div>
                {history.length === 0 && <p>No calculations yet.</p>}
                {history.map((item, index) => (
                    <div key={index} className="history-item">{item}</div>
                ))}
                <button className="close-history" onClick={() => setShowHistory(false)}>Close</button>
            </div>
        )}

        {/* BUTTONS */}
        <button id="clear" onClick={() => buttonPress("clear")} className="light-gray">C</button>
        <button id="negative" onClick={() => buttonPress("negative")} className="light-gray">+/-</button>
        {/* Update: Pass "percent" string to buttonPress */}
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
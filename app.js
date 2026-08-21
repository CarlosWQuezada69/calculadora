// Calculator Web App - SPA Application
(function() {
    'use strict';

    // ============================================
    // State Management
    // ============================================
    const state = {
        currentInput: '',
        expression: '',
        history: [],
        memory: 0,
        maxHistory: 20
    };

    // ============================================
    // DOM Elements
    // ============================================
    const elements = {
        resultDisplay: document.getElementById('resultDisplay'),
        expressionDisplay: document.getElementById('expressionDisplay'),
        historyList: document.getElementById('historyList'),
        memoryDisplay: document.getElementById('memoryDisplay'),
        statusIndicator: document.getElementById('statusIndicator'),
        historyToggle: document.getElementById('historyToggle')
    };

    // ============================================
    // Utility Functions
    // ============================================
    const Utils = {
        formatNumber: (num) => {
            if (!num || isNaN(num)) return '0';
            const str = num.toString();
            if (str.length > 12) {
                return parseFloat(num.toPrecision(10)).toString();
            }
            return str;
        },

        displayExpression: (input) => {
            return input
                .replace(/\*/g, '×')
                .replace(/,/g, ',');
        },

        showToast: (message) => {
            elements.statusIndicator.textContent = message;
            elements.statusIndicator.classList.add('active');
            
            setTimeout(() => {
                if (elements.statusIndicator.textContent === message) {
                    elements.statusIndicator.classList.remove('active');
                }
            }, 2000);
        }
    };

    // ============================================
    // Display Management
    // ============================================
    const Display = {
        init() {
            this.update();
        },

        update() {
            this.resultDisplay.textContent = state.currentInput || '0';
            this.expressionDisplay.textContent = state.expression;
            this.memoryDisplay.textContent = Utils.formatNumber(state.memory);
        }
    };

    // ============================================
    // Calculator Core Logic
    // ============================================
    const Calculator = {
        appendNumber: (number) => {
            if (state.currentInput === 'Error' || state.currentInput === 'Infinity') {
                state.currentInput = '';
            }

            if (!state.currentInput && number !== '.') {
                state.currentInput = number;
            } else {
                // Prevent multiple decimals
                if (number === '.' && state.currentInput.includes('.')) {
                    return;
                }
                state.currentInput += number;
            }

            Display.update();
        },

        appendOperator: (operator) => {
            const lastChar = state.currentInput.slice(-1);
            const operators = ['+', '-', '*', '/', '%'];
            
            // Prevent starting with operator (except minus for negatives)
            if (state.currentInput === '' && operator !== '-') {
                return;
            }

            if (operators.includes(lastChar)) {
                state.currentInput = 
                    state.currentInput.slice(0, -1) + operator;
            } else {
                state.currentInput += operator;
            }

            Display.update();
        },

        clear: () => {
            state.currentInput = '';
            state.expression = '';
            Display.update();
        },

        deleteLast: () => {
            if (state.currentInput.length > 1) {
                state.currentInput = 
                    state.currentInput.slice(0, -1);
            } else {
                state.currentInput = '';
            }
            Display.update();
        },

        calculate: () => {
            try {
                // Save expression before calculation
                state.expression = state.currentInput;

                // Convert symbols to JS operators
                let expression = state.currentInput
                    .replace(/×/g, '*')
                    .replace(/÷/g, '/');

                // Handle percentage
                expression = expression.replace(/(\d+(\.\d+)?)%/g, (match) => {
                    return (parseFloat(match) / 100).toString();
                });

                // Safe evaluation with timeout
                const result = this.safeEvaluate(expression);

                // Add to history
                this.addToHistory(state.currentInput, Utils.formatNumber(result));

                // Update state
                state.currentInput = Utils.formatNumber(result);
                
                Utils.showToast('✅ Resulto calculado');
            } catch (error) {
                state.currentInput = 'Error';
                Display.update();
                Utils.showToast('❌ Error en la expresión');
            }
        },

        safeEvaluate: (expression) => {
            // Set timeout to prevent blocking UI
            return new Promise((resolve, reject) => {
                setTimeout(() => {
                    try {
                        // Validate expression first
                        this.validateExpression(expression);

                        // Use Function constructor for safer evaluation
                        const result = new Function('return ' + expression)();
                        
                        if (isFinite(result)) {
                            resolve(result);
                        } else {
                            throw new Error('Invalid result');
                        }
                    } catch (error) {
                        reject(error);
                    }
                }, 0);
            });
        },

        validateExpression: (expression) => {
            const invalidPatterns = [
                /[^0-9+\-*/().%]/,
                /^[+\-*/]$/,
                /\+\+|+-|-/,
                /(?!.)\*|\*$/,
                /(?!\*)\/|\/$/
            ];

            for (const pattern of invalidPatterns) {
                if (pattern.test(expression)) {
                    throw new Error('Invalid expression');
                }
            }

            // Check balanced parentheses
            const openParen = (expression.match(/\(/g) || []).length;
            const closeParen = (expression.match(/\)/g) || []).length;

            if (openParen !== closeParen) {
                throw new Error('Desbalanceado ()');
            }
        },

        addToHistory: (expression, result) => {
            // Remove leading zeros except for decimal point
            const cleanExpression = expression.replace(/^0+(?!.)/, '');

            const historyItem = {
                id: Date.now(),
                expression: cleanExpression,
                result: result,
                timestamp: new Date().toISOString()
            };

            state.history.unshift(historyItem);
            
            // Limit history size
            if (state.history.length > state.maxHistory) {
                state.history.pop();
            }

            History.render();
        },

        memoryMC: () => {
            state.memory = 0;
            Display.update();
            Utils.showToast('Memoria borrada');
        },

        memoryMR: () => {
            if (state.memory !== 0) {
                this.appendNumber(state.memory.toString());
                Display.update();
            }
        },

        memoryMPlus: () => {
            const currentValue = parseFloat(state.currentInput || '0');
            state.memory += currentValue;
            Display.update();
        },

        memoryMMinus: () => {
            const currentValue = parseFloat(state.currentInput || '0');
            state.memory -= currentValue;
            Display.update();
        }
    };

    // ============================================
    // History Management
    // ============================================
    const History = {
        init() {
            this.render();
            this.setupToggle();
        },

        render() {
            if (state.history.length === 0) {
                elements.historyList.innerHTML = `
                    <div style="text-align:center;padding:20px;color:#999;">
                        Sin historial aún
                    </div>
                `;
                return;
            }

            const itemsHtml = state.history.map(item => `
                <div class="history-item" data-id="${item.id}">
                    <div class="history-expression">${item.expression}</div>
                    <div class="history-result">= ${item.result}</div>
                </div>
            `).join('');

            elements.historyList.innerHTML = itemsHtml;
        },

        setupToggle() {
            if (elements.historyToggle) {
                elements.historyToggle.addEventListener('click', () => {
                    const historySection = document.querySelector('.history-section');
                    if (historySection) {
                        const isVisible = !historySection.classList.contains('hidden');
                        if (isVisible) {
                            historySection.classList.add('hidden');
                        } else {
                            historySection.classList.remove('hidden');
                        }
                    }
                });
            }
        },

        clear: () => {
            state.history = [];
            Display.update();
            this.render();
            Utils.showToast('🗑️ Historial borrado');
        }
    };

    // ============================================
    // Keyboard Support
    // ============================================
    const Keyboard = {
        init() {
            document.addEventListener('keydown', (e) => {
                const key = e.key;

                if (/^[0-9]$/.test(key)) {
                    Calculator.appendNumber(key);
                } else if (['+', '-', '*', '/', '%'].includes(key)) {
                    Calculator.appendOperator(key);
                } else if (key === '.') {
                    Calculator.appendNumber('.');
                } else if (key === 'Enter' || key === '=') {
                    e.preventDefault();
                    Calculator.calculate();
                } else if (key === 'Backspace') {
                    Calculator.deleteLast();
                } else if (['c', 'C', 'Escape'].includes(key)) {
                    Calculator.clear();
                }
            });

            // Prevent default behavior for calculator keys
            const keys = ['+', '-', '*', '/', '%', '.', 'Enter', '='];
            keys.forEach(key => {
                document.addEventListener('keydown', (e) => {
                    if (e.key === key) {
                        e.preventDefault();
                    }
                });
            });
        }
    };

    // ============================================
    // Event Listeners
    // ============================================
    const EventHandlers = {
        init() {
            const buttons = document.querySelectorAll('.btn');
            
            buttons.forEach(button => {
                button.addEventListener('click', (e) => {
                    e.preventDefault();
                    
                    const action = button.dataset.action;
                    const value = button.dataset.value;

                    switch (action) {
                        case 'clear':
                            Calculator.clear();
                            break;
                        case 'delete':
                            Calculator.deleteLast();
                            break;
                        case 'add':
                            Calculator.appendOperator('+');
                            break;
                        case 'subtract':
                            Calculator.appendOperator('-');
                            break;
                        case 'multiply':
                            Calculator.appendOperator('*');
                            break;
                        case 'divide':
                            Calculator.appendOperator('/');
                            break;
                        case 'percent':
                            Calculator.appendOperator('%');
                            break;
                        case 'calculate':
                            Calculator.calculate();
                            break;
                        case 'mc':
                            Calculator.memoryMC();
                            break;
                        case 'mr':
                            Calculator.memoryMR();
                            break;
                        case 'mplus':
                            Calculator.memoryMPlus();
                            break;
                        case 'mminus':
                            Calculator.memoryMMinus();
                            break;
                    }
                });
            });

            // History clear button
            const clearHistoryBtn = document.getElementById('clearHistoryBtn');
            if (clearHistoryBtn) {
                clearHistoryBtn.addEventListener('click', () => {
                    History.clear();
                });
            }
        }
    };

    // ============================================
    // Persistence (localStorage)
    // ============================================
    const Storage = {
        save() {
            try {
                const data = {
                    history: state.history,
                    memory: state.memory
                };
                localStorage.setItem('calculadoraData', JSON.stringify(data));
            } catch (error) {
                console.warn('No se pudo guardar:', error);
            }
        },

        load() {
            try {
                const saved = localStorage.getItem('calculadoraData');
                if (saved) {
                    const data = JSON.parse(saved);
                    if (data.history) state.history = data.history;
                    if (data.memory !== undefined) state.memory = data.memory;
                    
                    History.render();
                    Display.update();
                }
            } catch (error) {
                console.warn('No se pudo cargar:', error);
            }
        }
    };

    // ============================================
    // Application Initialization
    // ============================================
    const App = {
        init() {
            Display.init();
            History.init();
            Keyboard.init();
            EventHandlers.init();
            
            // Load saved data
            Storage.load();
            Utils.showToast('🚀 Calculadora lista');
        }
    };

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', App.init);
    } else {
        App.init();
    }

})();

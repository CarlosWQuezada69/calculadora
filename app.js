// Calculator Web App - Vanilla JavaScript SPA
(function() {
    'use strict';

    console.log('🚀 Calculadora JS cargada');

    // ============================================
    // State Management
    // ============================================
    const state = {
        currentInput: '0',
        expression: '',
        history: [],
        memory: 0,
        maxHistory: 20
    };

    // ============================================
    // DOM Elements - Safe Access Pattern
    // ============================================
    let elements = {};
    
    function initElements() {
        console.log('📌 Inicializando elementos del DOM...');
        
        elements = {
            resultDisplay: document.getElementById('resultDisplay'),
            expressionDisplay: document.getElementById('expressionDisplay'),
            historyList: document.getElementById('historyList'),
            memoryDisplay: document.getElementById('memoryDisplay'),
            statusIndicator: document.getElementById('statusIndicator') || null,
            historyToggle: document.getElementById('historyToggle') || null,
            clearHistoryBtn: document.getElementById('clearHistoryBtn') || null
        };
        
        // Verificar que los elementos existen
        if (!elements.resultDisplay) {
            console.error('❌ Error: resultDisplay no encontrado');
            return false;
        }
        if (!elements.expressionDisplay) {
            console.error('❌ Error: expressionDisplay no encontrado');
            return false;
        }
        
        console.log('✅ Elementos del DOM inicializados correctamente');
        return true;
    }

    // ============================================
    // Utility Functions
    // ============================================
    const Utils = {
        formatNumber: function(num) {
            if (!num || isNaN(num)) return '0';
            const str = num.toString();
            if (str.length > 12) {
                return parseFloat(num.toPrecision(10)).toString();
            }
            return str;
        },

        displayExpression: function(input) {
            return input
                .replace(/\*/g, '×')
                .replace(/,/g, ',');
        },

        showToast: function(message) {
            if (elements.statusIndicator) {
                elements.statusIndicator.textContent = message;
                elements.statusIndicator.classList.add('active');
                
                setTimeout(function() {
                    if (elements.statusIndicator.textContent === message) {
                        elements.statusIndicator.classList.remove('active');
                    }
                }, 2000);
            }
        }
    };

    // ============================================
    // Display Management
    // ============================================
    const Display = {
        update: function() {
            try {
                if (elements.resultDisplay) {
                    elements.resultDisplay.textContent = state.currentInput || '0';
                }
                
                if (elements.expressionDisplay) {
                    elements.expressionDisplay.textContent = state.expression;
                }
                
                if (elements.memoryDisplay) {
                    elements.memoryDisplay.textContent = Utils.formatNumber(state.memory);
                }
            } catch(e) {
                console.error('❌ Error en Display.update():', e);
            }
        },

        clear: function() {
            try {
                state.currentInput = '0';
                state.expression = '';
                this.update();
                console.log('✅ Display limpiado');
            } catch(e) {
                console.error('❌ Error en Display.clear():', e);
            }
        }
    };

    // ============================================
    // Calculator Core Logic
    // ============================================
    const Calculator = {
        appendNumber: function(number) {
            try {
                console.log('🔢 Append number:', number);
                
                if (state.currentInput === 'Error' || state.currentInput === 'Infinity') {
                    state.currentInput = '0';
                }

                // Si es el primer número y no es un punto decimal
                if (state.currentInput === '0' && number !== '.' && !isNaN(number)) {
                    state.currentInput = number;
                } else if (number === '.') {
                    // Prevenir múltiples puntos en el mismo nivel
                    const parts = state.currentInput.split(/[\+\-\*\/]/);
                    const currentPart = parts[parts.length - 1];
                    
                    if (!currentPart.includes('.')) {
                        state.currentInput += number;
                    }
                } else {
                    state.currentInput += number;
                }

                Display.update();
            } catch(e) {
                console.error('❌ Error en appendNumber:', e);
            }
        },

        appendOperator: function(operator) {
            try {
                console.log('🔢 Append operator:', operator);
                
                const lastChar = state.currentInput.slice(-1);
                const operators = ['+', '-', '*', '/', '%'];
                
                // Prevenir empezar con operador (excepto menos para negativos)
                if (state.currentInput === '0' && operator !== '-' && operator !== '.') {
                    return;
                }

                // Reemplazar operadores visuales por JS operators si es el último carácter
                const jsOperators = ['+', '-', '*', '/', '%'];
                if (jsOperators.includes(lastChar)) {
                    state.currentInput = 
                        state.currentInput.slice(0, -1) + operator;
                } else {
                    // Evitar operadores consecutivos
                    if (operators.includes(lastChar)) {
                        state.currentInput = state.currentInput.slice(0, -1);
                    }
                    state.currentInput += operator;
                }

                Display.update();
            } catch(e) {
                console.error('❌ Error en appendOperator:', e);
            }
        },

        clear: function() {
            try {
                console.log('🧹 Clear calculator');
                state.currentInput = '0';
                state.expression = '';
                Display.update();
            } catch(e) {
                console.error('❌ Error en Calculator.clear():', e);
            }
        },

        deleteLast: function() {
            try {
                console.log('🔙 Delete last character');
                
                if (state.currentInput.length > 1) {
                    state.currentInput = state.currentInput.slice(0, -1);
                } else {
                    state.currentInput = '0';
                }
                
                Display.update();
            } catch(e) {
                console.error('❌ Error en deleteLast:', e);
            }
        },

        calculate: function() {
            try {
                console.log('🧮 Calculando...');
                
                if (state.currentInput === '0' || state.currentInput === '') {
                    return;
                }

                // Guardar expresión antes de calcular
                state.expression = state.currentInput;

                // Convertir símbolos a operadores JS
                let expression = state.currentInput
                    .replace(/×/g, '*')
                    .replace(/÷/g, '/');

                // Manejar porcentaje
                expression = expression.replace(/(\d+(\.\d+)?)%/g, function(match) {
                    return (parseFloat(match) / 100).toString();
                });

                // Validar expresión antes de evaluar
                if (!this.validateExpression(expression)) {
                    state.currentInput = 'Error';
                    Display.update();
                    Utils.showToast('❌ Error en la expresión');
                    return;
                }

                // Evaluación segura con timeout (no async, devuelve Promise que se resuelve)
                const safeEvalPromise = this.safeEvaluate(expression);
                
                return safeEvalPromise.then(function(result) {
                    if (result === undefined || result === null) {
                        state.currentInput = 'Error';
                        Display.update();
                        Utils.showToast('❌ Error de cálculo');
                        return;
                    }

                    // Redondear para evitar errores de punto flotante
                    const roundedResult = parseFloat(result.toFixed(10)).toString();
                    
                    // Guardar en historial
                    Calculator.addToHistory(state.expression, roundedResult);

                    // Actualizar display
                    state.currentInput = roundedResult;
                    
                    Utils.showToast('✅ Resultado calculado');
                });

                // Guardar en historial
                this.addToHistory(state.expression, roundedResult);

                // Actualizar display
                state.currentInput = roundedResult;
                
                Utils.showToast('✅ Resultado calculado');
                
            } catch(e) {
                console.error('❌ Error en calculate():', e);
                state.currentInput = 'Error';
                Display.update();
                Utils.showToast('❌ Error');
            }
        },

        validateExpression: function(expression) {
            try {
                // Validar que no comience con operador inválido
                if (/^[+\-*/]/.test(expression)) {
                    return false;
                }

                // Validar paréntesis balanceados
                const openParen = (expression.match(/\(/g) || []).length;
                const closeParen = (expression.match(/\)/g) || []).length;

                if (openParen !== closeParen) {
                    console.error('❌ Paréntesis desbalanceados');
                    return false;
                }

                // Validar que no tenga operaciones inválidas
                if (/((?!^)[+\-])$/.test(expression)) {
                    return false;
                }

                // Evaluar con Function constructor (más seguro)
                const result = new Function('return ' + expression)();

                if (!isFinite(result) || isNaN(result)) {
                    console.error('❌ Resultado no válido');
                    return false;
                }

                return true;
            } catch(e) {
                console.error('❌ Error validando expresión:', e);
                return false;
            }
        },

        safeEvaluate: function(expression) {
            try {
                // Timeout para evitar bloquear UI
                return new Promise(function(resolve, reject) {
                    setTimeout(function() {
                        try {
                            const result = new Function('return ' + expression)();
                            
                            if (isFinite(result) && !isNaN(result)) {
                                resolve(result);
                            } else {
                                reject(new Error('Invalid result'));
                            }
                        } catch(e) {
                            reject(e);
                        }
                    }, 0);
                });
            } catch(e) {
                console.error('❌ safeEvaluate error:', e);
                return undefined;
            }
        },

        addToHistory: function(expression, result) {
            try {
                console.log('📜 Adding to history:', expression, '=>', result);

                // Limpiar formato de expresión para historial
                const cleanExpression = expression.replace(/^0+(?!\.)/, '').replace(/,/g, '');

                const historyItem = {
                    id: Date.now(),
                    expression: cleanExpression,
                    result: Utils.formatNumber(result),
                    timestamp: new Date().toISOString()
                };

                state.history.unshift(historyItem);
                
                // Limitar tamaño del historial
                if (state.history.length > state.maxHistory) {
                    state.history.pop();
                }

                History.render();
            } catch(e) {
                console.error('❌ Error en addToHistory:', e);
            }
        },

        memoryMC: function() {
            try {
                console.log('💾 Memory MC');
                state.memory = 0;
                Display.update();
                Utils.showToast('Memoria borrada');
            } catch(e) {
                console.error('❌ Error en memoryMC:', e);
            }
        },

        memoryMR: function() {
            try {
                console.log('💾 Memory MR');
                
                if (state.memory !== 0) {
                    // Reemplazar '0' con el valor de memoria para agregar
                    let tempInput = state.currentInput;
                    if (tempInput === '0') {
                        tempInput = '';
                    }
                    tempInput += state.memory.toString();
                    state.currentInput = tempInput;
                    Display.update();
                    Utils.showToast('Memoria añadida');
                } else {
                    Utils.showToast('Memría vacía');
                }
            } catch(e) {
                console.error('❌ Error en memoryMR:', e);
            }
        },

        memoryMPlus: function() {
            try {
                console.log('💾 Memory M+');
                
                const currentValue = parseFloat(state.currentInput || '0');
                state.memory += currentValue;
                Display.update();
                Utils.showToast('M+');
            } catch(e) {
                console.error('❌ Error en memoryMPlus:', e);
            }
        },

        memoryMMinus: function() {
            try {
                console.log('💾 Memory M-');
                
                const currentValue = parseFloat(state.currentInput || '0');
                state.memory -= currentValue;
                Display.update();
                Utils.showToast('M-');
            } catch(e) {
                console.error('❌ Error en memoryMMinus:', e);
            }
        }
    };

    // ============================================
    // History Management
    // ============================================
    const History = {
        render: function() {
            try {
                console.log('📜 Rendering history');
                
                if (elements.historyList) {
                    elements.historyList.innerHTML = '';

                    if (state.history.length === 0) {
                        const emptyDiv = document.createElement('div');
                        emptyDiv.style.cssText = 'text-align:center;padding:20px;color:#999;font-size:0.9rem;';
                        emptyDiv.textContent = 'Sin historial aún';
                        elements.historyList.appendChild(emptyDiv);
                    } else {
                        const itemsHtml = state.history.map(function(item) {
                            return '<div class="history-item" data-id="' + item.id + '">' +
                                   '<div class="history-expression">' + item.expression + '</div>' +
                                   '<div class="history-result">= ' + item.result + '</div></div>';
                        }).join('');

                        elements.historyList.innerHTML = itemsHtml;
                        
                        // Add click events to history items
                        const items = elements.historyList.querySelectorAll('.history-item');
                        items.forEach(function(item) {
                            item.addEventListener('click', function() {
                                const id = parseInt(this.dataset.id);
                                const item = state.history.find(h => h.id === id);
                                if (item) {
                                    state.currentInput = item.result;
                                    Display.update();
                                }
                            });
                        });
                    }
                }
            } catch(e) {
                console.error('❌ Error en History.render():', e);
            }
        },

        setupToggle: function() {
            try {
                if (elements.historyToggle) {
                    elements.historyToggle.addEventListener('click', function() {
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
            } catch(e) {
                console.error('❌ Error en setupToggle:', e);
            }
        },

        clear: function() {
            try {
                console.log('🗑️ Clearing history');
                
                state.history = [];
                Display.update();
                this.render();
                Utils.showToast('🗑️ Historial borrado');
            } catch(e) {
                console.error('❌ Error en History.clear():', e);
            }
        },

        init: function() {
            try {
                console.log('📜 Initializing history...');
                this.render();
                this.setupToggle();
                
                if (elements.clearHistoryBtn) {
                    elements.clearHistoryBtn.addEventListener('click', function() {
                        History.clear();
                    });
                }
                
                console.log('✅ History initialized');
            } catch(e) {
                console.error('❌ Error initializing history:', e);
            }
        }
    };

    // ============================================
    // Keyboard Support
    // ============================================
    const Keyboard = {
        init: function() {
            try {
                console.log('⌨️ Initializing keyboard support...');
                
                document.addEventListener('keydown', function(e) {
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

                console.log('✅ Keyboard initialized');
            } catch(e) {
                console.error('❌ Error initializing keyboard:', e);
            }
        }
    };

    // ============================================
    // Event Listeners
    // ============================================
    const EventHandlers = {
        init: function() {
            try {
                console.log('📤 Initializing event listeners...');
                
                const buttons = document.querySelectorAll('.btn');
                
                buttons.forEach(function(button) {
                    button.addEventListener('click', function(e) {
                        e.preventDefault();
                        
                        const action = button.dataset.action;
                        const value = button.dataset.value;

                        console.log('Button clicked:', action, 'value:', value);

                        if (!action && !value) return;

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
                            default:
                                if (value) {
                                    Calculator.appendNumber(value);
                                } else {
                                    console.error('Button clicked without action or value:', button);
                                }
                                break;
                        }
                    });
                });

                // Clear history button
                if (elements.clearHistoryBtn) {
                    elements.clearHistoryBtn.addEventListener('click', function() {
                        History.clear();
                    });
                }

                console.log('✅ Event listeners initialized');
            } catch(e) {
                console.error('❌ Error initializing event listeners:', e);
            }
        }
    };

    // ============================================
    // Persistence (localStorage)
    // ============================================
    const Storage = {
        save: function() {
            try {
                const data = {
                    history: state.history,
                    memory: state.memory
                };
                localStorage.setItem('calculadoraData', JSON.stringify(data));
                console.log('💾 Data saved to localStorage');
            } catch(e) {
                console.warn('No se pudo guardar:', e);
            }
        },

        load: function() {
            try {
                const saved = localStorage.getItem('calculadoraData');
                if (saved) {
                    const data = JSON.parse(saved);
                    if (data.history) state.history = data.history;
                    if (data.memory !== undefined) state.memory = data.memory;
                    
                    History.render();
                    Display.update();
                    console.log('💾 Data loaded from localStorage');
                }
            } catch(e) {
                console.error('❌ Error loading data:', e);
            }
        },

        clear: function() {
            localStorage.removeItem('calculadoraData');
            state.history = [];
            Display.update();
            History.render();
        }
    };

    // ============================================
    // Application Initialization
    // ============================================
    const App = {
        init: function() {
            try {
                console.log('🚀 Inicializando Calculadora Web App...');
                
                // Inicializar elementos del DOM primero
                const domInitialized = initElements();
                
                if (!domInitialized) {
                    throw new Error('Elementos del DOM no inicializados');
                }

                // Inicializar componentes
                Display.update();
                History.init();
                Keyboard.init();
                EventHandlers.init();
                
                // Cargar datos guardados
                Storage.load();
                
                console.log('✅ Calculadora inicializada correctamente');
                Utils.showToast('🚀 Calculadora lista!');
                
            } catch(e) {
                console.error('❌ Error en App.init():', e);
            }
        }
    };

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            console.log('📄 DOM loaded, initializing calculator...');
            App.init();
        });
    } else {
        console.log('DOM ya cargado, inicializando calculadora...');
        App.init();
    }

})();

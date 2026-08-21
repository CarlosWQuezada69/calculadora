# 🔢 Calculadora Web App

Una calculadora moderna, funcional y persistente construida con HTML, CSS y JavaScript puro (Vanilla JS).

## ✨ Características

- **Operaciones básicas**: Suma, resta, multiplicación, división, porcentaje
- **Funciones avanzadas**: 
  - Historial de operaciones
  - Memoria (MC, MR, M+, M-)
  - Borrado parcial y completo
- **Persistencia**: Guarda historial y memoria en localStorage
- **Soporte de teclado**: Usa [0-9], +, -, *, /, Enter, Backspace, C, Esc
- **Diseño responsive**: Funciona perfecto en móviles y escritorio
- **SPA (Single Page Application)**: Sin recargas de página

## 📁 Estructura del Proyecto

```
calculadora/
├── index.html      # Estructura HTML + referencias a CSS/JS
├── styles.css      # Estilos modernos con CSS Grid y variables
├── app.js          # Lógica completa de la calculadora (Vanilla JS)
└── README.md       # Documentación
```

## 🚀 Cómo Usar

### Opción 1: Abrir directamente en el navegador

```bash
# Abre el archivo index.html en tu navegador
index.html
```

### Opción 2: Servidor local (recomendado)

```bash
# Usa Python
python -m http.server 8000

# O usa Node.js
npx serve .
# o
npm install -g serve && serve
```

## ⌨️ Teclado

| Tecla | Acción |
|-------|--------|
| **0-9** | Agrega número |
| **.** | Punto decimal |
| **+ / - / * / /** | Operadores |
| **%** | Porcentaje |
| **Enter** = | Calcular resultado |
| **Backspace** | Borrar último dígito |
| **C** | Limpiar todo |
| **Esc** | Igual a C |

## 💾 Funciones de Memoria

- **MC**: Borra memoria
- **MR**: Muestra valor de memoria
- **M+**: Suma al valor actual a la memoria
- **M-**: Resta del valor actual a la memoria

## 🎨 Tecnologías

- HTML5 Semántico
- CSS3 (Grid, Flexbox, Variables CSS, Animaciones)
- JavaScript ES6+ (IIFE, Arrow functions, Template literals)
- localStorage para persistencia

## 📱 Responsive

La calculadora se adapta automáticamente:
- **Escritorio**: Diseño completo con panel lateral
- **Móvil (<480px)**: Diseño optimizado, botones más grandes
- **Tablets**: Tamaño intermedio ideal

## 🎯 Mejores Prácticas Implementadas

✅ **Separación de responsabilidades** (HTML/CSS/JS separados)  
✅ **SPA autocontenido** (Todo en un solo archivo por página)  
✅ **Código limpio** (ES6+, IIFE para evitar polución global)  
✅ **Validación de expresiones** (Prevención de errores comunes)  
✅ **Manejo de estados** (Estado centralizado y predecible)  
✅ **Accesibilidad** (ARIA labels, semántica HTML)  

## 📝 Licencia

MIT License - Puedes usar esto para proyectos personales o comerciales.

---

**Hecho con ❤️ usando Vanilla JavaScript**
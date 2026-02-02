/* 
    ===================================
    LOGIN SYSTEM - CRUDZASO v2
    ===================================
    
    Sistema de autenticación para CRUDZASO.
    Maneja login, validación y sesiones de usuario.
*/

// ==========================================
// CONFIGURACIÓN Y VARIABLES GLOBALES
// ==========================================

/* 
    Usuarios simulados para demostración
    
    En una app real, esto vendría de una base de datos segura.
    Las contraseñas estarían hasheadas, no en texto plano.
*/
const DEMO_USERS = [
    {
        id: 1,
        email: 'student@university.edu',
        password: 'password123',
        name: 'Alex Morgan',
        role: 'Product Designer',
        department: 'Computer Science',
        joinDate: '2023-09-15'
    },
    {
        id: 2,
        email: 'sarah@crudzaso.edu',
        password: 'admin123',
        name: 'Dr. Sarah Jenkins',
        role: 'System Admin',
        department: 'Computer Science',
        joinDate: '2020-09-14'
    },
    {
        id: 3,
        email: 'john@university.edu',
        password: 'student456',
        name: 'John Doe',
        role: 'Student',
        department: 'Mathematics',
        joinDate: '2024-01-10'
    }
];

/* Configuración de la aplicación */
const CONFIG = {
    SESSION_KEY: 'crudzaso_user_session',
    REMEMBER_ME_KEY: 'crudzaso_remember_me',
    REDIRECT_AFTER_LOGIN: 'pages/dashboard.html',
    PASSWORD_MIN_LENGTH: 6,
    MAX_LOGIN_ATTEMPTS: 3,
    LOCKOUT_TIME: 5 * 60 * 1000 // 5 minutos en milisegundos
};

// ==========================================
// INICIALIZACIÓN DE LA PÁGINA
// ==========================================

/* 
    Función que se ejecuta cuando la página termina de cargar
    
    Configura todos los event listeners y verificaciones iniciales.
    Es como el "constructor" de nuestra página de login.
*/
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 CRUDZASO Login v1 - Initialized');
    
    // Verificar si el usuario ya está autenticado
    checkExistingSession();
    
    // Configurar el formulario de login
    setupLoginForm();
    
    // Configurar la funcionalidad de mostrar/ocultar contraseña
    setupPasswordToggle();
    
    // Verificar si hay información recordada (Remember Me)
    checkRememberedCredentials();
    
    // Configurar validación en tiempo real
    setupRealTimeValidation();
    
    console.log('✅ Login page ready for user interaction');
});

// ==========================================
// GESTIÓN DE SESIÓN DE USUARIO
// ==========================================

/* 
    Verificar si ya existe una sesión activa
    
    Si el usuario ya está logueado, lo redirigimos directamente
    al dashboard para evitar el paso innecesario por el login.
*/
function checkExistingSession() {
    const existingSession = localStorage.getItem(CONFIG.SESSION_KEY);
    
    if (existingSession) {
        try {
            const sessionData = JSON.parse(existingSession);
            
            // Verificar que la sesión no haya expirado
            if (sessionData.expires && new Date() < new Date(sessionData.expires)) {
                console.log('👤 Existing session found, redirecting to dashboard');
                showLoadingMessage('Welcome back! Redirecting...');
                
                // Pequeña delay para mejor UX
                setTimeout(() => {
                    window.location.href = CONFIG.REDIRECT_AFTER_LOGIN;
                }, 1000);
                
                return true;
            } else {
                // Sesión expirada, limpiarla
                console.log('⏰ Session expired, clearing old data');
                clearSession();
            }
        } catch (error) {
            console.error('❌ Error reading session data:', error);
            clearSession();
        }
    }
    
    return false;
}

/* 
    Crear una nueva sesión de usuario
    
    Guarda la información del usuario en localStorage para
    mantenerlo logueado entre páginas y recargas.
*/
function createUserSession(user) {
    const sessionData = {
        userId: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        department: user.department,
        loginTime: new Date().toISOString(),
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 horas
    };
    
    // Guardar en localStorage
    localStorage.setItem(CONFIG.SESSION_KEY, JSON.stringify(sessionData));
    
    console.log('✅ User session created:', sessionData.name);
    return sessionData;
}

/* 
    Limpiar la sesión del usuario
    
    Elimina toda la información de sesión del navegador.
*/
function clearSession() {
    localStorage.removeItem(CONFIG.SESSION_KEY);
    localStorage.removeItem(CONFIG.REMEMBER_ME_KEY);
    console.log('🧹 User session cleared');
}

// ==========================================
// CONFIGURACIÓN DEL FORMULARIO
// ==========================================

/* 
    Configurar el formulario de login con todos sus event listeners
*/
function setupLoginForm() {
    const loginForm = document.getElementById('login-form');
    
    if (!loginForm) {
        console.error('❌ Login form not found!');
        return;
    }
    
    // Event listener para el envío del formulario
    loginForm.addEventListener('submit', handleLoginSubmit);
    
    // Event listeners para validación en tiempo real
    const emailInput = document.getElementById('login-email');
    const passwordInput = document.getElementById('login-password');
    
    if (emailInput) {
        emailInput.addEventListener('input', validateEmailField);
        emailInput.addEventListener('blur', validateEmailField);
    }
    
    if (passwordInput) {
        passwordInput.addEventListener('input', validatePasswordField);
        passwordInput.addEventListener('keypress', function(e) {
            // Permitir envío con Enter
            if (e.key === 'Enter') {
                loginForm.requestSubmit();
            }
        });
    }
    
    console.log('📝 Login form configured successfully');
}

/* 
    Manejar el envío del formulario de login
    
    Esta función se ejecuta cuando el usuario hace click en "Sign in"
    o presiona Enter en el formulario.
*/
async function handleLoginSubmit(event) {
    // Prevenir el comportamiento por defecto del formulario
    event.preventDefault();
    
    console.log('🔍 Processing login attempt...');
    
    // Obtener los valores del formulario
    const formData = getLoginFormData();
    
    if (!formData) {
        console.log('❌ Invalid form data');
        return;
    }
    
    // Validar los campos antes de procesar
    if (!validateLoginForm(formData)) {
        console.log('❌ Form validation failed');
        return;
    }
    
    // Mostrar indicador de carga
    showLoadingState(true);
    
    try {
        // Simular delay de red para realismo
        await delay(1000);
        
        // Intentar autenticar al usuario
        const authResult = await authenticateUser(formData.email, formData.password);
        
        if (authResult.success) {
            // Login exitoso
            handleSuccessfulLogin(authResult.user);
        } else {
            // Login fallido
            handleFailedLogin(authResult.error);
        }
        
    } catch (error) {
        console.error('💥 Unexpected error during login:', error);
        showErrorMessage('An unexpected error occurred. Please try again.');
    } finally {
        // Ocultar indicador de carga
        showLoadingState(false);
    }
}

/* 
    Obtener y limpiar los datos del formulario
*/
function getLoginFormData() {
    const emailInput = document.getElementById('login-email');
    const passwordInput = document.getElementById('login-password');
    
    if (!emailInput || !passwordInput) {
        console.error('❌ Form inputs not found');
        return null;
    }
    
    return {
        email: emailInput.value.trim().toLowerCase(),
        password: passwordInput.value,
        rememberMe: document.getElementById('remember-me')?.checked || false
    };
}

// ==========================================
// AUTENTICACIÓN DE USUARIO
// ==========================================

/* 
    Autenticar las credenciales del usuario
    
    En una aplicación real, esto haría una llamada al servidor.
    Por ahora simulo el proceso con un array de usuarios locales.
*/
async function authenticateUser(email, password) {
    console.log(`🔐 Attempting to authenticate: ${email}`);
    
    // Simular verificación contra base de datos
    const user = DEMO_USERS.find(u => u.email === email);
    
    if (!user) {
        console.log('❌ User not found');
        return {
            success: false,
            error: 'Invalid email or password. Please check your credentials and try again.'
        };
    }
    
    if (user.password !== password) {
        console.log('❌ Invalid password');
        return {
            success: false,
            error: 'Invalid email or password. Please check your credentials and try again.'
        };
    }
    
    console.log('✅ Authentication successful');
    return {
        success: true,
        user: user
    };
}

/* 
    Manejar login exitoso
    
    Crear sesión, mostrar mensaje de éxito y redirigir al usuario.
*/
function handleSuccessfulLogin(user) {
    console.log(`🎉 Welcome back, ${user.name}!`);
    
    // Crear la sesión del usuario
    createUserSession(user);
    
    // Mostrar mensaje de éxito
    showSuccessMessage(`Welcome back, ${user.name}! Redirecting to your dashboard...`);
    
    // Redirigir después de una pequeña pausa para que el usuario vea el mensaje
    setTimeout(() => {
        window.location.href = CONFIG.REDIRECT_AFTER_LOGIN;
    }, 1500);
}

/* 
    Manejar login fallido
    
    Mostrar error apropiado y permitir al usuario intentar de nuevo.
*/
function handleFailedLogin(errorMessage) {
    console.log('❌ Login failed');
    
    // Mostrar el mensaje de error
    showErrorMessage(errorMessage);
    
    // Limpiar el campo de contraseña por seguridad
    const passwordInput = document.getElementById('login-password');
    if (passwordInput) {
        passwordInput.value = '';
        passwordInput.focus();
    }
    
    // Animar el formulario para indicar error
    animateFormError();
}

// ==========================================
// VALIDACIÓN DE FORMULARIOS
// ==========================================

/* 
    Validar todo el formulario antes del envío
*/
function validateLoginForm(formData) {
    let isValid = true;
    
    // Validar email
    if (!formData.email) {
        showFieldError('login-email', 'Email is required');
        isValid = false;
    } else if (!isValidEmail(formData.email)) {
        showFieldError('login-email', 'Please enter a valid email address');
        isValid = false;
    } else {
        clearFieldError('login-email');
    }
    
    // Validar contraseña
    if (!formData.password) {
        showFieldError('login-password', 'Password is required');
        isValid = false;
    } else if (formData.password.length < CONFIG.PASSWORD_MIN_LENGTH) {
        showFieldError('login-password', `Password must be at least ${CONFIG.PASSWORD_MIN_LENGTH} characters`);
        isValid = false;
    } else {
        clearFieldError('login-password');
    }
    
    return isValid;
}

/* 
    Validar campo de email en tiempo real
*/
function validateEmailField(event) {
    const email = event.target.value.trim();
    
    if (email && !isValidEmail(email)) {
        showFieldError('login-email', 'Please enter a valid email address');
    } else {
        clearFieldError('login-email');
    }
}

/* 
    Validar campo de contraseña en tiempo real
*/
function validatePasswordField(event) {
    const password = event.target.value;
    
    if (password && password.length < CONFIG.PASSWORD_MIN_LENGTH) {
        showFieldError('login-password', `Password must be at least ${CONFIG.PASSWORD_MIN_LENGTH} characters`);
    } else {
        clearFieldError('login-password');
    }
}

/* 
    Configurar validación en tiempo real para mejor UX
*/
function setupRealTimeValidation() {
    // La validación en tiempo real ya se configura en setupLoginForm()
    console.log('⚡ Real-time validation enabled');
}

// ==========================================
// FUNCIONALIDAD DE MOSTRAR/OCULTAR CONTRASEÑA
// ==========================================

/* 
    Configurar los botones de toggle de contraseña
*/
function setupPasswordToggle() {
    // El toggle ya está configurado inline en el HTML
    // Esta función está aquí por si necesitamos lógica adicional
    console.log('👁️ Password toggle functionality ready');
}

/* 
    Alternar visibilidad de contraseña
    
    Esta función se llama desde el botón en el HTML
*/
function togglePassword(inputId) {
    const passwordInput = document.getElementById(inputId);
    const toggleButton = passwordInput.parentElement.querySelector('.toggle-password');
    
    if (!passwordInput || !toggleButton) {
        console.error('❌ Password toggle elements not found');
        return;
    }
    
    // Alternar el tipo de input
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        toggleButton.textContent = '🙈'; // Ícono de "ocultar"
    } else {
        passwordInput.type = 'password';
        toggleButton.textContent = '👁️'; // Ícono de "mostrar"
    }
    
    // Mantener el foco en el input
    passwordInput.focus();
}

// ==========================================
// FUNCIONALIDAD "REMEMBER ME"
// ==========================================

/* 
    Verificar si hay credenciales recordadas
    
    Si el usuario había activado "Remember Me" previamente,
    cargar esas credenciales automáticamente.
*/
function checkRememberedCredentials() {
    const rememberedData = localStorage.getItem(CONFIG.REMEMBER_ME_KEY);
    
    if (rememberedData) {
        try {
            const credentials = JSON.parse(rememberedData);
            
            // Solo rellenar el email, nunca la contraseña por seguridad
            const emailInput = document.getElementById('login-email');
            if (emailInput && credentials.email) {
                emailInput.value = credentials.email;
                console.log('📧 Remembered email loaded');
            }
            
        } catch (error) {
            console.error('❌ Error loading remembered credentials:', error);
            localStorage.removeItem(CONFIG.REMEMBER_ME_KEY);
        }
    }
}

// ==========================================
// UTILIDADES Y HELPERS
// ==========================================

/* 
    Validar formato de email
*/
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/* 
    Función delay para simular operaciones asíncronas
*/
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// ==========================================
// INTERFAZ DE USUARIO Y FEEDBACK
// ==========================================

/* 
    Mostrar/ocultar estado de carga
*/
function showLoadingState(isLoading) {
    const submitButton = document.querySelector('#login-form button[type="submit"]');
    const originalText = 'Sign in';
    
    if (!submitButton) return;
    
    if (isLoading) {
        submitButton.disabled = true;
        submitButton.textContent = '🔄 Signing in...';
        submitButton.classList.add('loading');
    } else {
        submitButton.disabled = false;
        submitButton.textContent = originalText;
        submitButton.classList.remove('loading');
    }
}

/* 
    Mostrar mensaje de éxito
*/
function showSuccessMessage(message) {
    showMessage(message, 'success');
}

/* 
    Mostrar mensaje de error
*/
function showErrorMessage(message) {
    showMessage(message, 'error');
}

/* 
    Mostrar mensaje de carga
*/
function showLoadingMessage(message) {
    showMessage(message, 'info');
}

/* 
    Sistema unificado de mensajes
*/
function showMessage(message, type = 'info') {
    // Remover mensaje anterior si existe
    const existingMessage = document.querySelector('.auth-message');
    if (existingMessage) {
        existingMessage.remove();
    }
    
    // Crear nuevo mensaje
    const messageElement = document.createElement('div');
    messageElement.className = `auth-message auth-message-${type}`;
    messageElement.textContent = message;
    
    // Insertar después del formulario
    const form = document.getElementById('login-form');
    if (form && form.parentElement) {
        form.parentElement.insertBefore(messageElement, form.nextSibling);
    }
    
    // Auto-remover después de 5 segundos (excepto para loading)
    if (type !== 'info') {
        setTimeout(() => {
            if (messageElement.parentElement) {
                messageElement.remove();
            }
        }, 5000);
    }
}

/* 
    Mostrar error en un campo específico
*/
function showFieldError(fieldId, errorMessage) {
    const field = document.getElementById(fieldId);
    if (!field) return;
    
    // Agregar clase de error al campo
    field.classList.add('error');
    
    // Buscar o crear elemento de error
    let errorElement = field.parentElement.querySelector('.field-error');
    if (!errorElement) {
        errorElement = document.createElement('div');
        errorElement.className = 'field-error';
        field.parentElement.appendChild(errorElement);
    }
    
    errorElement.textContent = errorMessage;
}

/* 
    Limpiar error de un campo específico
*/
function clearFieldError(fieldId) {
    const field = document.getElementById(fieldId);
    if (!field) return;
    
    // Remover clase de error
    field.classList.remove('error');
    
    // Remover mensaje de error
    const errorElement = field.parentElement.querySelector('.field-error');
    if (errorElement) {
        errorElement.remove();
    }
}

/* 
    Animación de error en el formulario
*/
function animateFormError() {
    const form = document.getElementById('login-form');
    if (!form) return;
    
    form.classList.add('shake');
    setTimeout(() => {
        form.classList.remove('shake');
    }, 500);
}

// ==========================================
// EXPORTACIÓN PARA TESTING (SI ES NECESARIO)
// ==========================================

/* 
    En caso de que necesitemos testear estas funciones,
    las podemos exportar (en un entorno con módulos ES6)
*/
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        authenticateUser,
        validateLoginForm,
        isValidEmail,
        createUserSession,
        clearSession
    };
}

/* 
    ¡FIN DEL ARCHIVO LOGIN.JS! 🎉
    
    Este archivo maneja completamente la experiencia de login:
    ✅ Autenticación simulada pero realista
    ✅ Validación robusta de formularios
    ✅ Gestión de sesión de usuario
    ✅ Feedback visual apropiado
    ✅ Funcionalidades de UX (toggle password, remember me)
    ✅ Manejo de errores graceful
    ✅ Código bien documentado y mantenible
    
    La experiencia de login es la primera impresión que tendrán
    los usuarios de CRUDZASO, ¡así que debe ser perfecta!
    
    ¡Happy coding! 👨‍💻👩‍💻
*/
/* 
    ===================================
    REGISTER SYSTEM - CRUDZASO v2
    ===================================
    
    Sistema de registro para nuevos usuarios de CRUDZASO.
    Incluye validación de formularios y creación de cuentas.
*/

// ==========================================
// CONFIGURACIÓN Y CONSTANTES
// ==========================================

/* Configuración específica para el registro */
const REGISTER_CONFIG = {
    PASSWORD_MIN_LENGTH: 8,
    PASSWORD_REQUIRE_UPPERCASE: true,
    PASSWORD_REQUIRE_LOWERCASE: true,
    PASSWORD_REQUIRE_NUMBER: true,
    PASSWORD_REQUIRE_SPECIAL: false, // Por ahora flexible para demo
    NAME_MIN_LENGTH: 2,
    NAME_MAX_LENGTH: 50,
    AUTO_LOGIN_AFTER_REGISTER: true,
    REDIRECT_AFTER_REGISTER: '../pages/dashboard.html'
};

/* Patrones de validación */
const VALIDATION_PATTERNS = {
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    name: /^[a-zA-ZÀ-ÿ\u00f1\u00d1\s'-]{2,50}$/,
    strongPassword: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/
};

/* Mensajes de validación personalizados */
const VALIDATION_MESSAGES = {
    name: {
        required: 'Full name is required',
        tooShort: `Name must be at least ${REGISTER_CONFIG.NAME_MIN_LENGTH} characters`,
        tooLong: `Name cannot exceed ${REGISTER_CONFIG.NAME_MAX_LENGTH} characters`,
        invalid: 'Name can only contain letters, spaces, hyphens and apostrophes'
    },
    email: {
        required: 'Email address is required',
        invalid: 'Please enter a valid email address',
        exists: 'This email is already registered. Try signing in instead.'
    },
    password: {
        required: 'Password is required',
        tooShort: `Password must be at least ${REGISTER_CONFIG.PASSWORD_MIN_LENGTH} characters`,
        weak: 'Password should contain uppercase, lowercase, and numbers',
        strong: 'Great! Your password looks strong 💪'
    },
    confirmPassword: {
        required: 'Please confirm your password',
        mismatch: 'Passwords do not match',
        match: 'Passwords match! ✓'
    }
};

// ==========================================
// INICIALIZACIÓN
// ==========================================

/* 
    Inicializar la página de registro cuando se carga el DOM
*/
document.addEventListener('DOMContentLoaded', function() {
    console.log('📝 CRUDZASO Register v1 - Initializing...');
    
    // Configurar el formulario principal
    setupRegisterForm();
    
    // Configurar validación en tiempo real
    setupRealTimeValidation();
    
    // Configurar indicadores de fortaleza de contraseña
    setupPasswordStrengthIndicator();
    
    // Configurar verificación de contraseñas coincidentes
    setupPasswordMatching();
    
    // Configurar toggles de visibilidad
    setupPasswordToggles();
    
    console.log('✅ Register page initialized successfully');
});

// ==========================================
// CONFIGURACIÓN DEL FORMULARIO
// ==========================================

/* 
    Configurar todos los aspectos del formulario de registro
*/
function setupRegisterForm() {
    const registerForm = document.getElementById('register-form');
    
    if (!registerForm) {
        console.error('❌ Register form not found');
        return;
    }
    
    // Event listener para el envío del formulario
    registerForm.addEventListener('submit', handleRegisterSubmit);
    
    console.log('📋 Register form configured');
}

/* 
    Configurar validación en tiempo real para mejor UX
    
    La validación inmediata ayuda a los usuarios a corregir
    errores antes de intentar enviar el formulario.
*/
function setupRealTimeValidation() {
    // Validación del nombre
    const nameInput = document.getElementById('register-name');
    if (nameInput) {
        nameInput.addEventListener('input', validateNameField);
        nameInput.addEventListener('blur', validateNameField);
    }
    
    // Validación del email
    const emailInput = document.getElementById('register-email');
    if (emailInput) {
        emailInput.addEventListener('input', validateEmailField);
        emailInput.addEventListener('blur', checkEmailAvailability);
    }
    
    // Validación de la contraseña
    const passwordInput = document.getElementById('register-password');
    if (passwordInput) {
        passwordInput.addEventListener('input', validatePasswordField);
        passwordInput.addEventListener('input', updatePasswordStrength);
    }
    
    // Validación de confirmación de contraseña
    const confirmInput = document.getElementById('register-confirm');
    if (confirmInput) {
        confirmInput.addEventListener('input', validateConfirmPasswordField);
        confirmInput.addEventListener('blur', validateConfirmPasswordField);
    }
    
    console.log('⚡ Real-time validation enabled');
}

// ==========================================
// MANEJO DEL ENVÍO DEL FORMULARIO
// ==========================================

/* 
    Procesar el envío del formulario de registro
*/
async function handleRegisterSubmit(event) {
    event.preventDefault();
    
    console.log('📝 Processing registration...');
    
    // Obtener datos del formulario
    const formData = getRegisterFormData();
    
    if (!formData) {
        console.log('❌ Invalid form data');
        return;
    }
    
    // Validar todos los campos
    if (!validateCompleteForm(formData)) {
        console.log('❌ Form validation failed');
        showErrorMessage('Please correct the highlighted errors before continuing.');
        return;
    }
    
    // Mostrar estado de carga
    showLoadingState(true);
    
    try {
        // Simular procesamiento del servidor
        await delay(1500);
        
        // Registrar el usuario
        const registrationResult = await registerNewUser(formData);
        
        if (registrationResult.success) {
            handleSuccessfulRegistration(registrationResult.user);
        } else {
            handleFailedRegistration(registrationResult.error);
        }
        
    } catch (error) {
        console.error('💥 Registration error:', error);
        showErrorMessage('An unexpected error occurred. Please try again.');
    } finally {
        showLoadingState(false);
    }
}

/* 
    Obtener y limpiar datos del formulario
*/
function getRegisterFormData() {
    const nameInput = document.getElementById('register-name');
    const emailInput = document.getElementById('register-email');
    const passwordInput = document.getElementById('register-password');
    const confirmInput = document.getElementById('register-confirm');
    
    if (!nameInput || !emailInput || !passwordInput || !confirmInput) {
        console.error('❌ Form inputs not found');
        return null;
    }
    
    return {
        name: nameInput.value.trim(),
        email: emailInput.value.trim().toLowerCase(),
        password: passwordInput.value,
        confirmPassword: confirmInput.value
    };
}

// ==========================================
// REGISTRO DE NUEVOS USUARIOS
// ==========================================

/* 
    Registrar un nuevo usuario en el sistema
    
    En una aplicación real, esto haría una llamada al servidor
    para crear el usuario en la base de datos.
*/
async function registerNewUser(userData) {
    console.log(`👤 Registering new user: ${userData.email}`);
    
    // Verificar que el email no esté ya registrado
    if (await isEmailAlreadyRegistered(userData.email)) {
        return {
            success: false,
            error: VALIDATION_MESSAGES.email.exists
        };
    }
    
    // Crear el nuevo usuario
    const newUser = {
        id: generateUserId(),
        name: userData.name,
        email: userData.email,
        password: userData.password, // En producción: hashear la contraseña
        role: 'Student', // Rol por defecto
        department: 'General', // Departamento por defecto
        joinDate: new Date().toISOString().split('T')[0],
        registrationDate: new Date().toISOString()
    };
    
    // Simular guardado en base de datos
    // En una app real, aquí se haría la llamada al API
    const savedUser = await saveUserToDatabase(newUser);
    
    if (savedUser) {
        console.log('✅ User registered successfully');
        return {
            success: true,
            user: savedUser
        };
    } else {
        return {
            success: false,
            error: 'Failed to save user data. Please try again.'
        };
    }
}

/* 
    Verificar si un email ya está registrado
*/
async function isEmailAlreadyRegistered(email) {
    // Simular consulta a base de datos
    await delay(300);
    
    // Verificar contra los usuarios demo existentes
    const existingUsers = JSON.parse(localStorage.getItem('crudzaso_users') || '[]');
    return existingUsers.some(user => user.email === email);
}

/* 
    Simular guardado en base de datos
*/
async function saveUserToDatabase(user) {
    try {
        // Obtener usuarios existentes
        const existingUsers = JSON.parse(localStorage.getItem('crudzaso_users') || '[]');
        
        // Agregar el nuevo usuario
        existingUsers.push(user);
        
        // Guardar en localStorage
        localStorage.setItem('crudzaso_users', JSON.stringify(existingUsers));
        
        console.log('💾 User saved to local storage');
        return user;
        
    } catch (error) {
        console.error('❌ Error saving user:', error);
        return null;
    }
}

/* 
    Generar ID único para el usuario
*/
function generateUserId() {
    return Date.now() + Math.random().toString(36).substr(2, 9);
}

// ==========================================
// MANEJO DE RESULTADOS DE REGISTRO
// ==========================================

/* 
    Manejar registro exitoso
*/
function handleSuccessfulRegistration(user) {
    console.log(`🎉 Welcome to CRUDZASO, ${user.name}!`);
    
    // Mostrar mensaje de éxito
    showSuccessMessage(`Welcome to CRUDZASO, ${user.name}! 🎉 Your account has been created successfully.`);
    
    // Decidir qué hacer después del registro
    if (REGISTER_CONFIG.AUTO_LOGIN_AFTER_REGISTER) {
        // Crear sesión automáticamente
        createUserSession(user);
        
        // Redirigir al dashboard
        setTimeout(() => {
            window.location.href = REGISTER_CONFIG.REDIRECT_AFTER_REGISTER;
        }, 2000);
    } else {
        // Redirigir al login
        setTimeout(() => {
            window.location.href = '../index.html';
        }, 2000);
    }
}

/* 
    Manejar registro fallido
*/
function handleFailedRegistration(errorMessage) {
    console.log('❌ Registration failed');
    showErrorMessage(errorMessage);
    
    // Enfocar el primer campo con error
    const firstErrorField = document.querySelector('.form-group input.error');
    if (firstErrorField) {
        firstErrorField.focus();
    }
}

// ==========================================
// VALIDACIONES ESPECÍFICAS DE CAMPOS
// ==========================================

/* 
    Validar campo de nombre completo
*/
function validateNameField(event) {
    const name = event.target.value.trim();
    const fieldId = 'register-name';
    
    if (!name) {
        if (event.type === 'blur') {
            showFieldError(fieldId, VALIDATION_MESSAGES.name.required);
        }
        return false;
    }
    
    if (name.length < REGISTER_CONFIG.NAME_MIN_LENGTH) {
        showFieldError(fieldId, VALIDATION_MESSAGES.name.tooShort);
        return false;
    }
    
    if (name.length > REGISTER_CONFIG.NAME_MAX_LENGTH) {
        showFieldError(fieldId, VALIDATION_MESSAGES.name.tooLong);
        return false;
    }
    
    if (!VALIDATION_PATTERNS.name.test(name)) {
        showFieldError(fieldId, VALIDATION_MESSAGES.name.invalid);
        return false;
    }
    
    clearFieldError(fieldId);
    return true;
}

/* 
    Validar campo de email
*/
function validateEmailField(event) {
    const email = event.target.value.trim().toLowerCase();
    const fieldId = 'register-email';
    
    if (!email) {
        if (event.type === 'blur') {
            showFieldError(fieldId, VALIDATION_MESSAGES.email.required);
        }
        return false;
    }
    
    if (!VALIDATION_PATTERNS.email.test(email)) {
        showFieldError(fieldId, VALIDATION_MESSAGES.email.invalid);
        return false;
    }
    
    clearFieldError(fieldId);
    return true;
}

/* 
    Verificar disponibilidad de email (simulado)
*/
async function checkEmailAvailability(event) {
    const email = event.target.value.trim().toLowerCase();
    const fieldId = 'register-email';
    
    if (!email || !VALIDATION_PATTERNS.email.test(email)) {
        return;
    }
    
    // Mostrar indicador de verificación
    showFieldLoading(fieldId, true);
    
    try {
        const isRegistered = await isEmailAlreadyRegistered(email);
        
        if (isRegistered) {
            showFieldError(fieldId, VALIDATION_MESSAGES.email.exists);
        } else {
            clearFieldError(fieldId);
            showFieldSuccess(fieldId, 'Email is available! ✓');
        }
    } catch (error) {
        console.error('Error checking email availability:', error);
    } finally {
        showFieldLoading(fieldId, false);
    }
}

/* 
    Validar campo de contraseña
*/
function validatePasswordField(event) {
    const password = event.target.value;
    const fieldId = 'register-password';
    
    if (!password) {
        if (event.type === 'blur') {
            showFieldError(fieldId, VALIDATION_MESSAGES.password.required);
        }
        return false;
    }
    
    if (password.length < REGISTER_CONFIG.PASSWORD_MIN_LENGTH) {
        showFieldError(fieldId, VALIDATION_MESSAGES.password.tooShort);
        return false;
    }
    
    // Verificar fortaleza de contraseña
    const strength = calculatePasswordStrength(password);
    if (strength.score < 3) {
        showFieldWarning(fieldId, VALIDATION_MESSAGES.password.weak);
        return true; // No es error, pero es advertencia
    }
    
    clearFieldError(fieldId);
    showFieldSuccess(fieldId, VALIDATION_MESSAGES.password.strong);
    return true;
}

/* 
    Validar confirmación de contraseña
*/
function validateConfirmPasswordField(event) {
    const confirmPassword = event.target.value;
    const originalPassword = document.getElementById('register-password').value;
    const fieldId = 'register-confirm';
    
    if (!confirmPassword) {
        if (event.type === 'blur') {
            showFieldError(fieldId, VALIDATION_MESSAGES.confirmPassword.required);
        }
        return false;
    }
    
    if (confirmPassword !== originalPassword) {
        showFieldError(fieldId, VALIDATION_MESSAGES.confirmPassword.mismatch);
        updatePasswordMatchIndicator(false);
        return false;
    }
    
    clearFieldError(fieldId);
    showFieldSuccess(fieldId, VALIDATION_MESSAGES.confirmPassword.match);
    updatePasswordMatchIndicator(true);
    return true;
}

/* 
    Validar todo el formulario antes del envío
*/
function validateCompleteForm(formData) {
    let isValid = true;
    
    // Simular eventos para validar todos los campos
    const nameEvent = { target: { value: formData.name }, type: 'blur' };
    const emailEvent = { target: { value: formData.email }, type: 'blur' };
    const passwordEvent = { target: { value: formData.password }, type: 'blur' };
    const confirmEvent = { target: { value: formData.confirmPassword }, type: 'blur' };
    
    if (!validateNameField(nameEvent)) isValid = false;
    if (!validateEmailField(emailEvent)) isValid = false;
    if (!validatePasswordField(passwordEvent)) isValid = false;
    if (!validateConfirmPasswordField(confirmEvent)) isValid = false;
    
    return isValid;
}

// ==========================================
// INDICADORES DE FORTALEZA DE CONTRASEÑA
// ==========================================

/* 
    Configurar el indicador de fortaleza de contraseña
*/
function setupPasswordStrengthIndicator() {
    const passwordInput = document.getElementById('register-password');
    
    if (passwordInput) {
        // Crear el elemento indicador si no existe
        let strengthElement = document.getElementById('password-strength');
        if (!strengthElement) {
            strengthElement = document.createElement('div');
            strengthElement.id = 'password-strength';
            strengthElement.className = 'password-strength';
            passwordInput.parentElement.appendChild(strengthElement);
        }
    }
    
    console.log('💪 Password strength indicator ready');
}

/* 
    Actualizar indicador de fortaleza en tiempo real
*/
function updatePasswordStrength(event) {
    const password = event.target.value;
    const strengthElement = document.getElementById('password-strength');
    
    if (!strengthElement) return;
    
    if (!password) {
        strengthElement.innerHTML = '';
        return;
    }
    
    const strength = calculatePasswordStrength(password);
    
    strengthElement.innerHTML = `
        <div class="strength-bar">
            <div class="strength-fill strength-${strength.level}" style="width: ${strength.percentage}%"></div>
        </div>
        <div class="strength-text">${strength.text}</div>
    `;
}

/* 
    Calcular la fortaleza de una contraseña
*/
function calculatePasswordStrength(password) {
    let score = 0;
    let feedback = [];
    
    // Longitud
    if (password.length >= 8) score += 1;
    else feedback.push('at least 8 characters');
    
    // Minúsculas
    if (/[a-z]/.test(password)) score += 1;
    else feedback.push('lowercase letters');
    
    // Mayúsculas
    if (/[A-Z]/.test(password)) score += 1;
    else feedback.push('uppercase letters');
    
    // Números
    if (/\d/.test(password)) score += 1;
    else feedback.push('numbers');
    
    // Caracteres especiales
    if (/[^A-Za-z0-9]/.test(password)) score += 1;
    else feedback.push('special characters');
    
    // Determinar nivel y texto
    let level, text;
    
    if (score < 2) {
        level = 'weak';
        text = 'Weak - Add ' + feedback.slice(0, 2).join(' and ');
    } else if (score < 3) {
        level = 'fair';
        text = 'Fair - Add ' + feedback.slice(0, 1).join(' and ');
    } else if (score < 4) {
        level = 'good';
        text = 'Good - Almost there!';
    } else {
        level = 'strong';
        text = 'Strong password! 🔒';
    }
    
    return {
        score,
        level,
        text,
        percentage: Math.min((score / 5) * 100, 100)
    };
}

// ==========================================
// VERIFICACIÓN DE CONTRASEÑAS COINCIDENTES
// ==========================================

/* 
    Configurar la verificación de contraseñas coincidentes
*/
function setupPasswordMatching() {
    // Crear elemento indicador si no existe
    const confirmInput = document.getElementById('register-confirm');
    if (confirmInput) {
        let matchElement = document.getElementById('password-match');
        if (!matchElement) {
            matchElement = document.createElement('div');
            matchElement.id = 'password-match';
            matchElement.className = 'password-match';
            confirmInput.parentElement.appendChild(matchElement);
        }
    }
    
    console.log('🔄 Password matching verification ready');
}

/* 
    Actualizar indicador de coincidencia de contraseñas
*/
function updatePasswordMatchIndicator(isMatch) {
    const matchElement = document.getElementById('password-match');
    if (!matchElement) return;
    
    if (isMatch) {
        matchElement.innerHTML = '<span class="match-success">✓ Passwords match</span>';
        matchElement.className = 'password-match success';
    } else {
        matchElement.innerHTML = '<span class="match-error">✗ Passwords do not match</span>';
        matchElement.className = 'password-match error';
    }
}

// ==========================================
// UTILIDADES DE INTERFAZ
// ==========================================

/* 
    Mostrar estado de carga en el botón
*/
function showLoadingState(isLoading) {
    const submitButton = document.querySelector('#register-form button[type="submit"]');
    
    if (!submitButton) return;
    
    if (isLoading) {
        submitButton.disabled = true;
        submitButton.innerHTML = '⏳ Creating Account...';
        submitButton.classList.add('loading');
    } else {
        submitButton.disabled = false;
        submitButton.innerHTML = 'Register';
        submitButton.classList.remove('loading');
    }
}

/* 
    Configurar toggles de visibilidad de contraseña
*/
function setupPasswordToggles() {
    console.log('👁️ Password toggles configured');
}

/* 
    Función global para toggle de contraseñas (llamada desde HTML)
*/
function togglePassword(inputId) {
    const passwordInput = document.getElementById(inputId);
    const toggleButton = passwordInput.parentElement.querySelector('.toggle-password');
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        toggleButton.textContent = '🙈';
    } else {
        passwordInput.type = 'password';
        toggleButton.textContent = '👁️';
    }
    
    passwordInput.focus();
}

// ==========================================
// SISTEMA DE FEEDBACK VISUAL
// ==========================================

/* 
    Mostrar error en campo específico
*/
function showFieldError(fieldId, message) {
    const field = document.getElementById(fieldId);
    if (!field) return;
    
    field.classList.add('error');
    field.classList.remove('success', 'warning');
    
    let errorElement = field.parentElement.querySelector('.field-message');
    if (!errorElement) {
        errorElement = document.createElement('div');
        errorElement.className = 'field-message';
        field.parentElement.appendChild(errorElement);
    }
    
    errorElement.innerHTML = `<span class="error-text">${message}</span>`;
    errorElement.className = 'field-message error';
}

/* 
    Mostrar éxito en campo específico
*/
function showFieldSuccess(fieldId, message) {
    const field = document.getElementById(fieldId);
    if (!field) return;
    
    field.classList.add('success');
    field.classList.remove('error', 'warning');
    
    let messageElement = field.parentElement.querySelector('.field-message');
    if (!messageElement) {
        messageElement = document.createElement('div');
        messageElement.className = 'field-message';
        field.parentElement.appendChild(messageElement);
    }
    
    messageElement.innerHTML = `<span class="success-text">${message}</span>`;
    messageElement.className = 'field-message success';
}

/* 
    Mostrar advertencia en campo específico
*/
function showFieldWarning(fieldId, message) {
    const field = document.getElementById(fieldId);
    if (!field) return;
    
    field.classList.add('warning');
    field.classList.remove('error', 'success');
    
    let messageElement = field.parentElement.querySelector('.field-message');
    if (!messageElement) {
        messageElement = document.createElement('div');
        messageElement.className = 'field-message';
        field.parentElement.appendChild(messageElement);
    }
    
    messageElement.innerHTML = `<span class="warning-text">${message}</span>`;
    messageElement.className = 'field-message warning';
}

/* 
    Mostrar indicador de carga en campo
*/
function showFieldLoading(fieldId, isLoading) {
    const field = document.getElementById(fieldId);
    if (!field) return;
    
    if (isLoading) {
        field.classList.add('loading');
    } else {
        field.classList.remove('loading');
    }
}

/* 
    Limpiar mensajes de campo
*/
function clearFieldError(fieldId) {
    const field = document.getElementById(fieldId);
    if (!field) return;
    
    field.classList.remove('error', 'success', 'warning', 'loading');
    
    const messageElement = field.parentElement.querySelector('.field-message');
    if (messageElement) {
        messageElement.remove();
    }
}

/* 
    Sistema de mensajes generales (reutilizado del login)
*/
function showMessage(message, type = 'info') {
    const existingMessage = document.querySelector('.auth-message');
    if (existingMessage) {
        existingMessage.remove();
    }
    
    const messageElement = document.createElement('div');
    messageElement.className = `auth-message auth-message-${type}`;
    messageElement.textContent = message;
    
    const form = document.getElementById('register-form');
    if (form && form.parentElement) {
        form.parentElement.insertBefore(messageElement, form.nextSibling);
    }
    
    if (type !== 'info') {
        setTimeout(() => {
            if (messageElement.parentElement) {
                messageElement.remove();
            }
        }, 5000);
    }
}

function showSuccessMessage(message) { showMessage(message, 'success'); }
function showErrorMessage(message) { showMessage(message, 'error'); }

// ==========================================
// FUNCIONES COMPARTIDAS CON LOGIN
// ==========================================

/* 
    Crear sesión de usuario (reutilizada)
*/
function createUserSession(user) {
    const sessionData = {
        userId: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        department: user.department,
        loginTime: new Date().toISOString(),
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    };
    
    localStorage.setItem('crudzaso_user_session', JSON.stringify(sessionData));
    console.log('✅ User session created for new user');
    return sessionData;
}

/* 
    Función delay para simulaciones
*/
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/* 
    ¡FIN DEL ARCHIVO REGISTER.JS! 🎊
    
    Este archivo proporciona una experiencia completa de registro:
    ✅ Validación exhaustiva y en tiempo real
    ✅ Indicadores de fortaleza de contraseña
    ✅ Verificación de disponibilidad de email
    ✅ Confirmación de contraseñas coincidentes
    ✅ Feedback visual rico y útil
    ✅ Proceso de registro fluido y celebratorio
    ✅ Integración seamless con el sistema de sesiones
    
    El objetivo es que cada nuevo usuario tenga una primera
    experiencia excepcional que los motive a usar CRUDZASO
    al máximo de su potencial académico.
    
    ¡Bienvenidos a la familia CRUDZASO! 🏫✨
*/
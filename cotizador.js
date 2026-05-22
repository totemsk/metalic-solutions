<!-- start Simple Custom CSS and JS -->
<script type="text/javascript">


const COTIZADOR_SCRIPT_REVISION = '2026-05-11-https-api';

function resolveApiUrl() {
    const configured =
        typeof window !== 'undefined' &&
        typeof window.COTIZADOR_API_URL === 'string' &&
        window.COTIZADOR_API_URL.trim()
            ? window.COTIZADOR_API_URL.trim().replace(/\/$/, '')
            : 'https://erp.construidea.com:4202/api';

    if (
        typeof window !== 'undefined' &&
        window.location.protocol === 'https:' &&
        configured.startsWith('http://')
    ) {
        const upgraded = 'https://' + configured.slice('http://'.length);
        console.warn(
            '[Cotizador] API en HTTP con página HTTPS; se usa',
            upgraded,
            '(sube el JS con https:// o define window.COTIZADOR_API_URL).'
        );
        return upgraded;
    }

    return configured;
}

const API_URL = resolveApiUrl();
// Pruebas locales HTTP: window.COTIZADOR_API_URL = 'http://localhost:3001/api';

const PRESUPUESTO_MAIL_ENDPOINT = `${API_URL}/presupuesto-mail`;

if (typeof console !== 'undefined' && console.info) {
    console.info('[Cotizador]', COTIZADOR_SCRIPT_REVISION, '→', PRESUPUESTO_MAIL_ENDPOINT);
}

const appState = {
    currentStep: 0,
    totalSteps: 6,
    formData: {
        tieneProyecto: '',
        tipoProyecto: '',
        subtipoVivienda: '',
        subtipoAmpliacion: '',
        superficie: 100,
        plantas: 1,
        pais: '',
        tipoEnvolvente: '',
        nombre: '',
        email: '',
        telefono: ''
    },
    presupuesto: null
};

function nextStep() {
    if (!validateCurrentStep()) return;

    if (appState.currentStep === 0) {
        if (appState.formData.tieneProyecto === 'si') {
            alert(
                '¡Perfecto! Si ya tienes proyecto de arquitectura, envíanos tus datos y documentación a:\n\n  info@metalicsolutionssteelframing.com\n\nTe daremos un presupuesto personalizado.\n\nMientras tanto, puedes continuar con el formulario para enviar tu solicitud.'
            );
        }
        document.getElementById('step0').classList.remove('active');
        document.getElementById('step1').classList.add('active');
        appState.currentStep = 1;
        updateProgress();
        return;
    }

    if (appState.currentStep === 1) {
        const tipoProyecto = appState.formData.tipoProyecto;
        if (tipoProyecto === 'vivienda' || tipoProyecto === 'ampliacion') {
            document.getElementById('step1').classList.remove('active');
            document.getElementById('step1b').classList.add('active');
            if (tipoProyecto === 'vivienda') {
                document.querySelector('.subtipo-vivienda').style.display = 'block';
                document.querySelector('.subtipo-ampliacion').style.display = 'none';
            } else {
                document.querySelector('.subtipo-vivienda').style.display = 'none';
                document.querySelector('.subtipo-ampliacion').style.display = 'block';
            }
            appState.currentStep = '1b';
            updateProgress();
            return;
        }
    }

    if (appState.currentStep === '1b') {
        document.getElementById('step1b').classList.remove('active');
        document.getElementById('step2').classList.add('active');
        appState.currentStep = 2;
        updateProgress();
        return;
    }

    if (appState.currentStep < appState.totalSteps) {
        document.getElementById('step' + appState.currentStep).classList.remove('active');
        appState.currentStep++;
        document.getElementById('step' + appState.currentStep).classList.add('active');
        if (appState.currentStep === appState.totalSteps) {
            submitForm();
        }
        updateProgress();
    }
}

function prevStep() {
    if (appState.currentStep === 1) {
        document.getElementById('step1').classList.remove('active');
        document.getElementById('step0').classList.add('active');
        appState.currentStep = 0;
        updateProgress();
        return;
    }

    if (appState.currentStep === '1b') {
        document.getElementById('step1b').classList.remove('active');
        document.getElementById('step1').classList.add('active');
        appState.currentStep = 1;
        updateProgress();
        return;
    }

    if (appState.currentStep === 2) {
        const tipoProyecto = appState.formData.tipoProyecto;
        if (tipoProyecto === 'vivienda' || tipoProyecto === 'ampliacion') {
            document.getElementById('step2').classList.remove('active');
            document.getElementById('step1b').classList.add('active');
            appState.currentStep = '1b';
            if (tipoProyecto === 'vivienda') {
                document.querySelector('.subtipo-vivienda').style.display = 'block';
                document.querySelector('.subtipo-ampliacion').style.display = 'none';
            } else {
                document.querySelector('.subtipo-vivienda').style.display = 'none';
                document.querySelector('.subtipo-ampliacion').style.display = 'block';
            }
            updateProgress();
            return;
        }
    }

    if (appState.currentStep > 1) {
        document.getElementById('step' + appState.currentStep).classList.remove('active');
        appState.currentStep--;
        document.getElementById('step' + appState.currentStep).classList.add('active');
        updateProgress();
    }
}

function updateProgress() {
    let effectiveStep = appState.currentStep;
    if (appState.currentStep === '1b') {
        effectiveStep = 1;
    } else if (typeof appState.currentStep === 'number' && appState.currentStep > 1) {
        const tipoProyecto = appState.formData.tipoProyecto;
        if (tipoProyecto === 'vivienda' || tipoProyecto === 'ampliacion') {
            effectiveStep = appState.currentStep;
        }
    }

    for (let i = 0; i <= appState.totalSteps - 1; i++) {
        const circle = document.getElementById('progress' + i);
        if (circle) {
            circle.classList.remove('active', 'completed');
            if (i < effectiveStep) circle.classList.add('completed');
            else if (i === effectiveStep) circle.classList.add('active');
        }
    }

    const fill = document.getElementById('progressLineFill');
    if (fill) fill.style.width = (effectiveStep / (appState.totalSteps - 1)) * 100 + '%';

    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function validateCurrentStep() {
    let isValid = true;
    let errorMsg = '';

    switch (appState.currentStep) {
        case 0:
            if (!appState.formData.tieneProyecto) {
                errorMsg = 'Por favor selecciona una opción';
                isValid = false;
            }
            break;
        case 1:
            if (!appState.formData.tipoProyecto) {
                errorMsg = 'Por favor selecciona un tipo de proyecto';
                isValid = false;
            }
            break;
        case '1b': {
            const tipoProyecto = appState.formData.tipoProyecto;
            if (tipoProyecto === 'vivienda' && !appState.formData.subtipoVivienda) {
                errorMsg = 'Por favor selecciona el tipo de vivienda';
                isValid = false;
            } else if (tipoProyecto === 'ampliacion' && !appState.formData.subtipoAmpliacion) {
                errorMsg = 'Por favor selecciona el tipo de ampliación';
                isValid = false;
            }
            break;
        }
        case 2:
            break;
        case 3: {
            const pais = document.querySelector('select[name="pais"]').value;
            if (!pais) {
                errorMsg = 'Por favor selecciona un país';
                isValid = false;
            } else {
                appState.formData.pais = pais;
            }
            break;
        }
        case 4:
            if (!appState.formData.tipoEnvolvente) {
                errorMsg = 'Por favor selecciona el tipo de envolvente';
                isValid = false;
            }
            break;
        case 5: {
            const nombre = document.querySelector('input[name="nombre"]').value.trim();
            const email = document.querySelector('input[name="email"]').value.trim();
            const telefono = document.querySelector('input[name="telefono"]').value.trim();

            if (!nombre) {
                errorMsg = 'Por favor introduce tu nombre';
                isValid = false;
            } else if (!email) {
                errorMsg = 'Por favor introduce tu email';
                isValid = false;
            } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                errorMsg = 'Por favor introduce un email válido';
                isValid = false;
            } else if (!telefono) {
                errorMsg = 'Por favor introduce tu teléfono';
                isValid = false;
            } else {
                appState.formData.nombre = nombre || 'Cliente';
                appState.formData.email = email;
                appState.formData.telefono = telefono || 'No especificado';
            }
            break;
        }
    }

    if (!isValid) alert(errorMsg);
    return isValid;
}

function selectOption(element, value, field) {
    element.parentElement.querySelectorAll('.option-card').forEach((opt) => opt.classList.remove('selected'));
    element.classList.add('selected');
    appState.formData[field] = value;
}

function updateSlider(slider, elementId, suffix) {
    const value = parseInt(slider.value, 10);
    document.getElementById(elementId).textContent = value + suffix;
    if (elementId === 'surfaceValue') appState.formData.superficie = value;
    else if (elementId === 'floorsValue') appState.formData.plantas = value;
}

function updateFloorsSlider(slider) {
    const numPlantas = parseInt(slider.value, 10);
    const plural = numPlantas === 1 ? 'planta' : 'plantas';
    document.getElementById('floorsValue').textContent = numPlantas + ' ' + plural;
    appState.formData.plantas = numPlantas;
    generateFloorSliders(numPlantas);
}

function generateFloorSliders(numPlantas) {
    const container = document.getElementById('floorSlidersContainer');
    if (!container) return;
    container.innerHTML = '';

    if (!appState.formData.superficiePorPlanta) appState.formData.superficiePorPlanta = [];
    while (appState.formData.superficiePorPlanta.length < numPlantas) {
        appState.formData.superficiePorPlanta.push(100);
    }
    appState.formData.superficiePorPlanta = appState.formData.superficiePorPlanta.slice(0, numPlantas);

    for (let i = 0; i < numPlantas; i++) {
        container.innerHTML += `
            <div class="slider-container" style="margin-bottom: 20px;">
                <label class="slider-label">Planta ${i + 1} - Superficie</label>
                <div class="slider-value" id="floor${i}Value">${appState.formData.superficiePorPlanta[i]} m²</div>
                <input type="range" min="10" max="300" value="${appState.formData.superficiePorPlanta[i]}" step="10"
                       oninput="updateFloorSurface(${i}, this.value)">
            </div>
        `;
    }
    calculateTotalSurface();
}

function updateFloorSurface(plantaIndex, value) {
    const superficie = parseInt(value, 10);
    const el = document.getElementById(`floor${plantaIndex}Value`);
    if (el) el.textContent = superficie + ' m²';
    appState.formData.superficiePorPlanta[plantaIndex] = superficie;
    calculateTotalSurface();
}

function calculateTotalSurface() {
    if (!appState.formData.superficiePorPlanta || !appState.formData.superficiePorPlanta.length) return;
    const total = appState.formData.superficiePorPlanta.reduce((sum, m2) => sum + m2, 0);
    const disp = document.getElementById('totalSurfaceDisplay');
    if (disp) disp.textContent = total + ' m²';
    appState.formData.superficie = total;
}

function initializeFloorSliders() {
    generateFloorSliders(appState.formData.plantas || 1);
}


function isLikelyNetworkOrCorsError(err) {
    if (!err) return false;
    if (err instanceof TypeError) return true;
    const m = String(err.message || '');
    return /NetworkError|Failed to fetch|Load failed|network error/i.test(m);
}

function isMixedContentConfiguration() {
    return (
        typeof window !== 'undefined' &&
        window.location.protocol === 'https:' &&
        API_URL.startsWith('http://')
    );
}

function mixedContentUserMessage() {
    return (
        'El navegador bloqueó el envío (contenido mixto).\n\n' +
        'La página va por HTTPS pero la API sigue en HTTP (http://erp.construidea.com:4202).\n\n' +
        'Qué hacer:\n' +
        '• Sube a WordPress el script con https://erp.construidea.com:4202/api y vacía la caché.\n' +
        '• En F12 → Red, la petición debe salir a https://…, no a http://…\n' +
        '• En consola debe verse la revisión ' +
        COTIZADOR_SCRIPT_REVISION +
        ' y la URL https del endpoint.\n\n' +
        'Si el JS va pegado en la página del presupuesto, actualiza también ese bloque (no solo el .js del servidor).'
    );
}

function networkErrorUserMessage() {
    if (isMixedContentConfiguration()) {
        return mixedContentUserMessage();
    }
    return (
        'No se pudo conectar con el servidor del formulario.\n\n' +
        'Causas frecuentes:\n' +
        '• Contenido mixto: API en http:// con web en https:// (usa https:// en la API).\n' +
        '• CORS: el origen https://metalicsolutionssteelframing.com debe estar en CORS_ORIGINS del Node.\n' +
        '• Firewall o API caída: comprueba que el puerto 4202 responda por HTTPS.\n\n' +
        'Revisa la consola del navegador (F12 → Red) para ver el fallo exacto.'
    );
}

function buildPayload() {
    const data = { ...appState.formData };
    if (data.subtipoAmpliacion === '') data.subtipoAmpliacion = null;
    if (data.subtipoVivienda === '') data.subtipoVivienda = null;

    const n = Math.max(1, parseInt(data.plantas, 10) || 1);
    if (!Array.isArray(data.superficiePorPlanta) || data.superficiePorPlanta.length !== n) {
        const total = Math.max(10, parseInt(data.superficie, 10) || 100);
        const porPlanta = Math.max(10, Math.round(total / n));
        data.superficiePorPlanta = Array.from({ length: n }, () => porPlanta);
        data.superficie = porPlanta * n;
    }
    return data;
}

async function submitForm() {
    try {
        if (isMixedContentConfiguration()) {
            alert(mixedContentUserMessage());
            return;
        }

        showLoader();

        const body = buildPayload();
        console.log('Enviando a API:', PRESUPUESTO_MAIL_ENDPOINT, body);

        
        const response = await fetch(PRESUPUESTO_MAIL_ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'text/plain;charset=UTF-8' },
            body: JSON.stringify(body)
        });

        const text = await response.text();
        let result = {};
        try {
            result = text ? JSON.parse(text) : {};
        } catch {
            throw new Error(
                `Respuesta no válida (${response.status}). Comprueba CORS y que la API Node esté activa en ${API_URL}`
            );
        }

        hideLoader();

        if (!response.ok || !result.success) {
            throw new Error(result.message || `Error HTTP ${response.status}`);
        }

        fillSubmissionSummary();
        
    } catch (error) {
        hideLoader();
        console.error(error);
        let msg;
        if (isLikelyNetworkOrCorsError(error)) {
            msg = networkErrorUserMessage();
        } else if (error && error.message) {
            msg = error.message;
        } else {
            msg = 'No se pudo enviar la información. Inténtalo de nuevo más tarde.';
        }
        alert(msg);
        prevStep();
    }
}


function fillSubmissionSummary() {
    document.getElementById('summaryTipo').textContent = getTipoProyectoLabel();
    document.getElementById('summarySuperficie').textContent = `${appState.formData.superficie} m²`;
    document.getElementById('summaryPlantas').textContent =
        `${appState.formData.plantas} planta${appState.formData.plantas > 1 ? 's' : ''}`;
    document.getElementById('summaryEnvolvente').textContent = getTipoEnvolventeLabel(
        appState.formData.tipoEnvolvente
    );
    updateSummaryIcons();
}

function updateSummaryIcons() {
    const tipo = appState.formData.tipoProyecto;
    const subtipo = appState.formData.subtipoVivienda || appState.formData.subtipoAmpliacion;
    const envolvente = appState.formData.tipoEnvolvente;
    const base = 'https://metalicsolutionssteelframing.com/wp-content/uploads';

    const tipoIcon = document.getElementById('summaryTipoIcon');
    if (tipoIcon) {
        let imgSrc = `${base}/vivienda-aislada.png`;
        if (tipo === 'vivienda') {
            if (subtipo === 'aislada') imgSrc = `${base}/vivienda-aislada.png`;
            else if (subtipo === 'medianeras') imgSrc = `${base}/vivienda-medianeras.png`;
            tipoIcon.style.width = '110px';
            tipoIcon.style.height = '110px';
        } else if (tipo === 'ampliacion') {
            if (subtipo === 'planta_baja') {
                imgSrc = `${base}/ampliacion-horizontal.png`;
                tipoIcon.style.width = '130px';
                tipoIcon.style.height = '130px';
            } else if (subtipo === 'remonta') {
                imgSrc = `${base}/ampliacion-vertical.png`;
                tipoIcon.style.width = '110px';
                tipoIcon.style.height = '110px';
            }
        }
        tipoIcon.src = imgSrc;
    }

    const envolventeIcon = document.getElementById('summaryEnvolventeIcon');
    if (envolventeIcon) {
        let imgSrc = `${base}/panel-thermochip.png`;
        if (envolvente === 'thermochip') imgSrc = `${base}/panel-thermochip.png`;
        else if (envolvente === 'placa_cementicia') imgSrc = `${base}/placa-cementicia.png`;
        else if (envolvente === 'sin_envolvente') imgSrc = `${base}/solo-estructura.png`;
        envolventeIcon.src = imgSrc;
    }
}

function getTipoProyectoLabel() {
    const tipo = appState.formData.tipoProyecto;
    const subtipo = appState.formData.subtipoVivienda || appState.formData.subtipoAmpliacion;

    if (tipo === 'vivienda') {
        const subtipos = {
            aislada: 'Vivienda Aislada',
            medianeras: 'Vivienda Entre Medianeras',
            adosada: 'Vivienda Adosada'
        };
        return subtipos[subtipo] || 'Vivienda Nueva';
    }
    if (tipo === 'ampliacion') {
        const subtipos = {
            planta_baja: 'Ampliación Horizontal',
            remonta: 'Ampliación en Altura (Remonta)'
        };
        return subtipos[subtipo] || 'Ampliación';
    }
    return '';
}

function getTipoEnvolventeLabel(tipo) {
    const labels = {
        thermochip: 'Thermochip',
        placa_cementicia: 'Placa Cementicia',
        sin_envolvente: 'Sin Envolvente'
    };
    return labels[tipo] || tipo;
}

function showLoader() {
    const loader = document.getElementById('loader');
    if (loader) loader.style.display = 'flex';
}

function hideLoader() {
    const loader = document.getElementById('loader');
    if (loader) loader.style.display = 'none';
}

document.addEventListener('DOMContentLoaded', function () {
    console.log('Cotizador · envío solo por API Node:', PRESUPUESTO_MAIL_ENDPOINT);
    updateProgress();
    initializeFloorSliders();

    const paisSelect = document.querySelector('select[name="pais"]');
    if (paisSelect) {
        paisSelect.addEventListener('change', (e) => {
            appState.formData.pais = e.target.value;
        });
    }
});
</script>
<!-- end Simple Custom CSS and JS -->
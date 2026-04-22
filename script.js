const Scamera = {
    data: {},
    currentCountry: null,
    isScanning: false,
    isVideoPlaying: false,
    isAnimating: false,
    clock: null,
    scene: null,
    camera: null,
    renderer: null,
    mixer: null,
    model: null,
    animations: {},
    modelInitialized: false,
    triviaScore: 0,
    triviaAnswers: {},
    totalTrivia: 0,
    
    countryConfig: {
        'colombia': { 
            name: 'Colombia', 
            modelFile: 'tucanCol.glb', 
            animName: 'Take 01',
            indices: [0, 1, 2],
            modelIds: ['modelo-ar-colombia-0', 'modelo-ar-colombia-1', 'modelo-ar-colombia-2'],
            video: 'Colombia.mp4'
        },
        'japon': { 
            name: 'Japón', 
            modelFile: 'ramenJapn.glb', 
            animName: 'animation',
            indices: [3, 4, 5, 6],
            modelIds: ['modelo-ar-japon-0', 'modelo-ar-japon-1', 'modelo-ar-japon-2', 'modelo-ar-japon-3'],
            video: 'Japan.mp4'
        },
        'corea': { 
            name: 'Corea del Sur', 
            modelFile: 'casaKor.glb', 
            animName: 'Sketchfab_modelAction',
            indices: [7, 8],
            modelIds: ['modelo-ar-corea-0', 'modelo-ar-corea-1'],
            video: 'Korea.mp4'
        },
        'mexico': { 
            name: 'México', 
            modelFile: 'alebrijeMex.glb', 
            animName: 'cat_rig|cat_rig|Animation',
            indices: [9, 10, 11, 12, 13],
            modelIds: ['modelo-ar-mexico-0', 'modelo-ar-mexico-1', 'modelo-ar-mexico-2', 'modelo-ar-mexico-3', 'modelo-ar-mexico-4'],
            video: 'Mexico.mp4'
        },
        'sudafrica': { 
            name: 'Sudáfica', 
            modelFile: 'craneoSud.glb', 
            animName: 'Object_3Action',
            indices: [14, 15, 16, 17],
            modelIds: ['modelo-ar-sudafrica-0', 'modelo-ar-sudafrica-1', 'modelo-ar-sudafrica-2', 'modelo-ar-sudafrica-3'],
            video: 'SouthAfrica.mp4'
        },
        'espana': { 
            name: 'España', 
            modelFile: 'toro.glb', 
            animName: 'Bull_game_rig|Bull_game_rig|Bull_game_walk',
            indices: [18, 19, 20],
            modelIds: ['modelo-ar-espana-0', 'modelo-ar-espana-1', 'modelo-ar-espana-2'],
            video: 'Spain.mp4'
        },
        'tunez': { 
            name: 'Túnez', 
            modelFile: 'muebleTun.glb', 
            animName: 'Object_3Action.003',
            indices: [21, 22, 23],
            modelIds: ['modelo-ar-tunez-0', 'modelo-ar-tunez-1', 'modelo-ar-tunez-2'],
            video: 'Tunisia.mp4'
        },
        'uruguay': { 
            name: 'Uruguay', 
            modelFile: 'mateUru.glb', 
            animName: 'move.001',
            indices: [24, 25, 26],
            modelIds: ['modelo-ar-uruguay-0', 'modelo-ar-uruguay-1', 'modelo-ar-uruguay-2'],
            video: 'Uruguay.mp4'
        },
        'uzbekistan': { 
            name: 'Uzbekistán', 
            modelFile: 'tazaUz.glb', 
            animName: 'servir',
            indices: [27, 28, 29],
            modelIds: ['modelo-ar-uzbekistan-0', 'modelo-ar-uzbekistan-1', 'modelo-ar-uzbekistan-2'],
            video: 'Uzbekistan.mp4'
        }
    },

    async init() {
        console.log("🔄 Inicializando Scamera...");
        
        // Esperar a que A-Frame y MindAR estén listos
        const scene = document.querySelector('a-scene');
        if (!scene.hasLoaded) {
            await new Promise(resolve => scene.addEventListener('loaded', resolve));
        }
        
        // Esperar un poco más para que MindAR initialize
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        await this.loadData();
        this.setupAR();
        this.setupEventListeners();
        console.log("✅ Scamera inicializado");
    },

    async loadData() {
        try {
            const response = await fetch('./data.json');
            if (!response.ok) throw new Error('No se pudo cargar data.json');
            this.data = await response.json();
            console.log("✅ Datos cargados:", Object.keys(this.data));
        } catch (error) {
            console.error("❌ Error cargando datos:", error);
            this.data = {};
        }
    },

    setupAR() {
        const btnIniciar = document.getElementById('btn-iniciar');
        const btnDetener = document.getElementById('btn-detener');

        if (btnIniciar) {
            btnIniciar.addEventListener('click', () => this.startScanner());
        }

        if (btnDetener) {
            btnDetener.addEventListener('click', () => this.stopScanner());
        }

        this.setupTargetListeners();
    },

    setupTargetListeners() {
        console.log("🔧 Configurando listeners de targets...");
        
        const countryMap = {
            // Colombia (0, 1, 2)
            'target-colombia-0': 'colombia',
            'target-colombia-1': 'colombia',
            'target-colombia-2': 'colombia',
            // Japan (3, 4, 5, 6)
            'target-japon-0': 'japon',
            'target-japon-1': 'japon',
            'target-japon-2': 'japon',
            'target-japon-3': 'japon',
            // Korea (7, 8)
            'target-corea-0': 'corea',
            'target-corea-1': 'corea',
            // Mexico (9, 10, 11, 12, 13)
            'target-mexico-0': 'mexico',
            'target-mexico-1': 'mexico',
            'target-mexico-2': 'mexico',
            'target-mexico-3': 'mexico',
            'target-mexico-4': 'mexico',
            // South Africa (14, 15, 16, 17)
            'target-sudafrica-0': 'sudafrica',
            'target-sudafrica-1': 'sudafrica',
            'target-sudafrica-2': 'sudafrica',
            'target-sudafrica-3': 'sudafrica',
            // Spain (18, 19, 20)
            'target-espana-0': 'espana',
            'target-espana-1': 'espana',
            'target-espana-2': 'espana',
            // Tunisia (21, 22, 23)
            'target-tunez-0': 'tunez',
            'target-tunez-1': 'tunez',
            'target-tunez-2': 'tunez',
            // Uruguay (24, 25, 26)
            'target-uruguay-0': 'uruguay',
            'target-uruguay-1': 'uruguay',
            'target-uruguay-2': 'uruguay',
            // Uzbekistan (27, 28, 29)
            'target-uzbekistan-0': 'uzbekistan',
            'target-uzbekistan-1': 'uzbekistan',
            'target-uzbekistan-2': 'uzbekistan'
        };

        // Esperar a que MindAR esté listo
        const setupListeners = () => {
            Object.keys(countryMap).forEach(targetId => {
                const targetElement = document.getElementById(targetId);
                if (targetElement) {
                    const country = countryMap[targetId];
                    
                    targetElement.addEventListener('targetFound', () => {
                        console.log(`🎯 Target encontrado: ${targetId} -> ${country}`);
                        this.onTargetFound(country);
                    });

                    targetElement.addEventListener('targetLost', () => {
                        console.log(`❌ Target perdido: ${targetId} -> ${country}`);
                        if (this.currentCountry === country) {
                            this.onTargetLost(country);
                        }
                    });
                    
                    console.log(`✅ Listener configurado para: ${targetId}`);
                } else {
                    console.log(`⚠️ Target no encontrado: ${targetId}`);
                }
            });
        };

        // Verificar si la escena ya está cargada
        const scene = document.querySelector('a-scene');
        if (scene.hasLoaded) {
            setupListeners();
        } else {
            scene.addEventListener('loaded', setupListeners);
        }
    },

    onTargetFound(country) {
        if (this.currentCountry === country) return;
        
        // Ocultar modelos del país anterior
        if (this.currentCountry) {
            this.hideARModel(this.currentCountry);
        }
        
        this.currentCountry = country;
        const config = this.countryConfig[country];
        
        console.log(`🎯 Detectado: ${config.name} (país: ${country})`);
        this.showNotification(`🎯 ${config.name} detectado!`);
        this.updateStatus(`Escaneo activo - ${config.name} detectado`);
        
        this.showCountryInfo(country);
        this.showARModel(country);
    },

    onTargetLost(country) {
        // No ocultamos el popup cuando se pierde el target
        // Solo se ocultará cuando se cambie de país o se detenga el escáner
        console.log(`⚠️ Target perdido: ${country} - Popup mantiene visible`);
    },

    showARModel(country) {
        const config = this.countryConfig[country];
        if (!config) {
            console.error(`❌ No hay configuración para: ${country}`);
            return;
        }

        config.modelIds.forEach(modelId => {
            const modelElement = document.getElementById(modelId);
                if (modelElement) {
                    modelElement.setAttribute('visible', 'true');
                    console.log(`✅ Modelo ${modelId} mostrado para ${country}`);
                    // ✨ chispas mágicas
                    const sparkles = this.createMagicSparkles(modelElement);

                    sparkles.setAttribute("visible", true);

                    setTimeout(()=>{
                        sparkles.setAttribute("visible", false);
                    }, 1600);

                    const startAnimation = () => {
                    modelElement.removeAttribute('animation-mixer');

                        modelElement.setAttribute(
                            'animation-mixer',
                            `clip: ${config.animName}; loop: repeat`
                        );

                        console.log(`🎬 Animación ${config.animName} activada`);
                    };

                    // Si el modelo ya está cargado
                if (modelElement.getObject3D('mesh')) {
                    startAnimation();
                }// Si aún no ha cargado
                else {
                    modelElement.addEventListener('model-loaded', startAnimation, { once: true });
                }
            } else {
                console.error(`❌ No se encontró elemento: ${modelId}`);
            }
        });
    },

    hideARModel(country) {
        const config = this.countryConfig[country];
        if (!config) return;

        config.modelIds.forEach(modelId => {
            const modelElement = document.getElementById(modelId);
            if (modelElement) {
                modelElement.setAttribute('visible', 'false');
            }
        });
    },

       createMagicSparkles(modelElement){
            // eliminar partículas anteriores si existen
            const oldSparkles = modelElement.parentElement.querySelector(".sparkles-ar");

            if(oldSparkles){
                oldSparkles.remove();
            }

            const sparkleContainer = document.createElement("a-entity");
            sparkleContainer.classList.add("sparkles-ar");

            // posición desde donde nace la luz
            sparkleContainer.setAttribute("position", "0 -0.4 0");
            for(let i=0; i<18; i++){

                const sparkle = document.createElement("a-sphere");

                sparkle.setAttribute("radius","0.045");

                sparkle.setAttribute("color",
                    ["#fff7b0","#ffe066","#ffd700","#fff2a8","#ffffff"][Math.floor(Math.random()*5)]
                );

                sparkle.setAttribute(
                    "material",
                    "emissive:#ffd700; emissiveIntensity:2; transparent:true; opacity:0.95"
                );

                // posición inicial concentrada
                sparkle.setAttribute("position",
                    `${(Math.random()-0.5)*0.25} ${Math.random()*0.1} ${(Math.random()-0.5)*0.25}`
                );

                // movimiento hacia arriba tipo invocación
                sparkle.setAttribute("animation__float",`
                    property: position;
                    to: ${(Math.random()-0.5)*0.6} ${1.2 + Math.random()*0.3} ${(Math.random()-0.5)*0.6};
                    dur: ${1600 + Math.random()*900};
                    easing: easeOutCubic;
                `);

                sparkle.setAttribute("animation__fade",`
                    property: material.opacity;
                    from: 1;
                    to: 0;
                    dur: 1700;
                `);

                sparkle.setAttribute("animation__scale",`
                    property: scale;
                    from: 0.3 0.3 0.3;
                    to: 1.3 1.3 1.3;
                    dur: 1700;
                `);

                sparkleContainer.appendChild(sparkle);
            }


            // círculo de luz en el piso
            const glow = document.createElement("a-circle");
            glow.setAttribute("radius","0.6");
            glow.setAttribute("rotation","-90 0 0");
            glow.setAttribute("position","0 -0.3 0");
            glow.setAttribute("material",
            "color:#ffd700; opacity:0.35; transparent:true");

            glow.setAttribute("animation",`
            property: scale;
            from: 0.2 0.2 0.2;
            to: 1.6 1.6 1.6;
            dur: 1200;
            easing: easeOutQuad;
            `);

            sparkleContainer.appendChild(glow);


            modelElement.parentElement.appendChild(sparkleContainer);

            return sparkleContainer;
        },

        showCountryInfo(country) {
            const countryData = this.data[country];
            if (!countryData) return;

            const infoCard = document.getElementById('country-info');
            const nameEl = document.getElementById('country-name');
            const descEl = document.getElementById('country-description');

            if (infoCard && nameEl && descEl) {
                nameEl.textContent = countryData.titulo || this.countryConfig[country]?.name || country;
                descEl.textContent = countryData.descripcion || '';
                infoCard.classList.remove('hidden');
                infoCard.classList.add('visible');
            }
        },

        hideCountryInfo() {
            const infoCard = document.getElementById('country-info');
            if (infoCard) {
                infoCard.classList.add('hidden');
                infoCard.classList.remove('visible');
            }
        },

        startScanner() {
            const scene = document.querySelector('a-scene');
            if (!scene) {
                console.error("❌ No se encontró la escena A-Frame");
                return;
            }

            console.log("📷 Iniciando escáner...");
            
            // Obtener el sistema MindAR y arrancarlo
            const mindarSystem = scene.systems['mindar-image-system'];
            if (mindarSystem) {
                if (!mindarSystem.active) {
                    try {
                        mindarSystem.start();
                        this.isScanning = true;
                        this.updateStatus("Escaneando... Busca un escudo");
                        this.showNotification("📷 Cámara activada");
                        
                        document.getElementById('btn-iniciar').disabled = true;
                        document.getElementById('btn-detener').disabled = false;
                    } catch (error) {
                        console.error("❌ Error al iniciar MindAR:", error);
                        this.showNotification("❌ Error al iniciar la cámara");
                    }
                } else {
                    console.log("ℹ️ El escáner ya está activo");
                }
            } else {
                console.error("❌ Sistema MindAR no encontrado");
                this.showNotification("❌ Sistema AR no disponible");
            }
        },

    stopScanner() {
        const scene = document.querySelector('a-scene');
        if (!scene) return;

        const mindarSystem = scene.systems['mindar-image-system'];
        if (mindarSystem && mindarSystem.active) {
            mindarSystem.stop();
        }

        this.isScanning = false;
        this.currentCountry = null;
        this.hideCountryInfo();
        
        // Ocultar todos los modelos
        Object.keys(this.countryConfig).forEach(country => {
            this.hideARModel(country);
        });
        
        this.updateStatus("Presiona 'Iniciar Escáner' para comenzar");
        this.showNotification("⏹️ Escáner detenido");
        
        document.getElementById('btn-iniciar').disabled = false;
        document.getElementById('btn-detener').disabled = true;
    },

    updateStatus(message) {
        const statusEl = document.getElementById('status-text');
        if (statusEl) {
            statusEl.textContent = message;
        }
    },

    showNotification(message) {
        const toast = document.getElementById('toast-notification');
        if (!toast) return;
        
        toast.textContent = message;
        toast.classList.add('show');
        
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    },

    setupEventListeners() {
        const infoModal = document.getElementById('infoModal');
        if (infoModal) {
            infoModal.addEventListener('shown.bs.modal', () => this.init3DModel());
            infoModal.addEventListener('hidden.bs.modal', () => this.cleanup3DModel());
        }

        // Video modal
        const videoModal = document.getElementById('videoModal');
        if (videoModal) {
            videoModal.addEventListener('shown.bs.modal', () => this.playCurrentVideo());
            videoModal.addEventListener('hidden.bs.modal', () => this.stopCurrentVideo());
        }

        // Video controls
        const btnVideoToggle = document.getElementById('btn-video-toggle');
        if (btnVideoToggle) {
            btnVideoToggle.addEventListener('click', () => this.toggleVideo());
        }

        // Video filters
        document.querySelectorAll('.video-filter').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const filter = e.target.dataset.filter;
                this.applyVideoFilter(filter);
            });
        });

        const triviaModal = document.getElementById('triviaModal');
        if (triviaModal) {
            triviaModal.addEventListener('shown.bs.modal', () => this.loadTrivia());
        }

        const statsModal = document.getElementById('estadisticasModal');
        if (statsModal) {
            statsModal.addEventListener('shown.bs.modal', () => this.loadStatistics());
        }

        const activarAnimacion = document.getElementById('activarAnimacion');
        if (activarAnimacion) {
            activarAnimacion.addEventListener('click', () => this.playAnimation());
        }

        const detenerAnimacion = document.getElementById('detenerAnimacion');
        if (detenerAnimacion) {
            detenerAnimacion.addEventListener('click', () => this.stopAnimation());
        }

        const closeCountryInfo = document.getElementById('close-country-info');
        if (closeCountryInfo) {
            closeCountryInfo.addEventListener('click', () => this.hideCountryInfo());
        }

        const btnResultado = document.getElementById('btn-resultado');
        if (btnResultado) {
            btnResultado.addEventListener('click', () => this.showTriviaResult());
        }
    },

    playCurrentVideo() {
        const config = this.countryConfig[this.currentCountry];
        if (!config || !config.video) {
            document.getElementById('video-country-title').textContent = 'No hay video disponible para este país';
            return;
        }

        const videoEl = document.getElementById('modal-video-player');
        if (!videoEl) return;

        videoEl.src = `./videos/${config.video}`;
        videoEl.muted = true;
        videoEl.loop = true;
        
        const playPromise = videoEl.play();
        if (playPromise !== undefined) {
            playPromise.catch(error => {
                console.log('Video autoplay blocked:', error);
            }).then(() => {
                const btn = document.getElementById('btn-video-toggle');
                if (btn) {
                    btn.innerHTML = '<i class="fas fa-pause"></i>';
                }
            });
        }

        document.getElementById('video-country-title').textContent = `Reproduciendo: ${config.name}`;
    },

    pauseCurrentVideo() {
        const videoEl = document.getElementById('modal-video-player');
        if (videoEl) {
            videoEl.pause();
            const btn = document.getElementById('btn-video-toggle');
            if (btn) {
                btn.innerHTML = '<i class="fas fa-play"></i>';
            }
        }
    },

    stopCurrentVideo() {
        const videoEl = document.getElementById('modal-video-player');
        if (videoEl) {
            videoEl.pause();
            videoEl.currentTime = 0;
            videoEl.src = '';
        }
    },

    toggleVideo() {
        const videoEl = document.getElementById('modal-video-player');
        const btn = document.getElementById('btn-video-toggle');
        if (!videoEl || !btn) return;

        if (videoEl.paused) {
            videoEl.play();
            btn.innerHTML = '<i class="fas fa-pause"></i>';
        } else {
            videoEl.pause();
            btn.innerHTML = '<i class="fas fa-play"></i>';
        }
    },

    applyVideoFilter(filter) {
        const videoEl = document.getElementById('modal-video-player');
        if (!videoEl) return;

        videoEl.style.filter = 'none';
        
        switch(filter) {
            case 'blur':
                videoEl.style.filter = 'blur(2px)';
                break;
            case 'pixelate':
                videoEl.style.filter = 'blur(1px) contrast(150%)';
                break;
            case 'thermal':
                videoEl.style.filter = 'sepia(100%) saturate(300%) contrast(200%) hue-rotate(-30deg)';
                break;
            case 'color':
                videoEl.style.filter = 'saturate(180%) contrast(115%) brightness(105%)';
                break;
            default:
                videoEl.style.filter = 'none';
        }

        // Update button states
        document.querySelectorAll('.video-filter').forEach(btn => {
            btn.classList.remove('btn-green');
            btn.classList.add('btn-outline-dark');
            if (btn.dataset.filter === filter) {
                btn.classList.add('btn-green');
                btn.classList.remove('btn-outline-dark');
            }
        });
    },

    loadTrivia() {
        const container = document.getElementById('trivia-container');
        if (!container) return;

        if (!this.currentCountry) {
            container.innerHTML = '<p class="text-center">Escanea un escudo primero para jugar trivia</p>';
            return;
        }

        const dataCountry = this.currentCountry;
        
        let triviaData = this.data.trivia?.[dataCountry];
        if (!triviaData || triviaData.length === 0) {
            container.innerHTML = '<p class="text-center">No hay trivia disponible para este país</p>';
            return;
        }
        // RANDOMIZAR
        // 🧠 inicializar historial si no existe
if (!this.usedQuestions) {
    this.usedQuestions = {};
}

if (!this.usedQuestions[dataCountry]) {
    this.usedQuestions[dataCountry] = [];
}

// 🔹 agregar índice a preguntas
let preguntasConIndex = triviaData.map((q, i) => ({
    ...q,
    _index: i
}));

// 🔹 filtrar las que NO han salido antes
let disponibles = preguntasConIndex.filter(
    q => !this.usedQuestions[dataCountry].includes(q._index)
);

// 🔁 si ya no hay suficientes, reiniciar historial
if (disponibles.length < 5) {
    this.usedQuestions[dataCountry] = [];
    disponibles = preguntasConIndex;
}

// 🔀 mezclar
for (let i = disponibles.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [disponibles[i], disponibles[j]] = [disponibles[j], disponibles[i]];
}

// ✂️ tomar 5
let seleccionadas = disponibles.slice(0, 5);

// 🧠 guardar usadas
this.usedQuestions[dataCountry].push(
    ...seleccionadas.map(q => q._index)
);

// limpiar _index
triviaData = seleccionadas.map(({ _index, ...q }) => q);

        // RANDOM RESPUESTAS
        triviaData = triviaData.map(q => {
            const opciones = [...q.opciones];

            for (let i = opciones.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [opciones[i], opciones[j]] = [opciones[j], opciones[i]];
            }

            return { ...q, opciones };
        });

        if (!triviaData || triviaData.length === 0) {
            container.innerHTML = '<p class="text-center">No hay trivia disponible para este país</p>';
            return;
        }

        this.triviaScore = 0;
        this.triviaAnswers = {};
        this.totalTrivia = triviaData.length;

        container.innerHTML = triviaData.map((q, idx) => `
            <li class="d-flex align-items-stretch mb-3 rounded-3" style="background:#f9f9f4;">
                <div class="d-flex justify-content-center align-items-center flex-shrink-0 rounded-start"
                    style="background:#4a4a4a; color:white; width:60px; font-weight:700; font-size:1.5rem;">
                    ${idx + 1}
                </div>
                <div class="flex-grow-1 px-3 py-2">
                    <p class="mb-2 fw-bold">${q.pregunta}</p>
                    <div class="d-flex flex-wrap gap-2">
                        ${q.opciones.map((op, i) => `
                            <button class="btn btn-green opcion flex-grow-1 flex-sm-grow-0 mb-2"
                                style="min-width: 80px;" 
                                data-pregunta="${idx}" 
                                data-opcion="${i}"
                                data-correcta="${op.correcta}">
                                ${op.texto}
                            </button>
                        `).join('')}
                    </div>
                </div>
            </li>
        `).join('');

        container.querySelectorAll('.opcion').forEach(btn => {
            btn.addEventListener('click', (e) => this.handleTriviaAnswer(e));
        });
    },

    handleTriviaAnswer(event) {
        const btn = event.target;
        const pregunta = btn.dataset.pregunta;
        const correcta = btn.dataset.correcta === 'true';

        this.triviaAnswers[pregunta] = correcta;
        
        if (correcta) {
            this.triviaScore++;
        }

        const siblings = btn.parentElement.querySelectorAll('.opcion');
        siblings.forEach(sib => {
            sib.disabled = true;
            if (sib.dataset.correcta === 'true') {
                sib.classList.add('btn-success');
                sib.classList.remove('btn-green');
            } else if (sib === btn && !correcta) {
                sib.classList.add('btn-danger');
                sib.classList.remove('btn-green');
            }
        });
    },

    showTriviaResult() {
        document.getElementById('scoreText').textContent = `${this.triviaScore} / ${this.totalTrivia}`;
        
        const mensaje = document.getElementById('mensajeResultado');
        const percentage = (this.triviaScore / this.totalTrivia) * 100;
        
        if (percentage >= 80) {
            mensaje.textContent = "¡Excelente! 🎉";
        } else if (percentage >= 60) {
            mensaje.textContent = "¡Muy bien! 👍";
        } else {
            mensaje.textContent = "Sigue practicando 💪";
        }
    },

    loadStatistics() {
        if (!this.currentCountry) {
            this.updateStatsUI({});
            return;
        }

        const dataCountry = this.currentCountry;
        const stats = this.data.estadisticas?.[dataCountry];
        this.updateStatsUI(stats || {});
    },

    updateStatsUI(stats) {
        const container = document.querySelector('#estadisticasModal .container-fluid');
        if (!container) return;

        const defaultStats = {
            partidos: [{ equipoA: 'Equipo A', equipoB: 'Equipo B', golesA: 0, golesB: 0, tiempo: '90:00' }],
            tirosPuerta: { local: 0, rival: 0 },
            faltas: { local: 0, rival: 0 },
            tarjetas: { amarillas: { local: 0, rival: 0 }, rojas: { local: 0, rival: 0 } },
            saquesEsquina: { local: 0, rival: 0 },
            cambios: { local: '0/5', rival: '0/5' }
        };

        const s = stats.partidos ? stats : defaultStats;
        const countryName = this.currentCountry ? this.countryConfig[this.currentCountry]?.name || this.currentCountry : 'Equipo';

        container.innerHTML = `
            <div class="row g-4 justify-content-center">
                <p class="ps-3 mt-5 ms-5">Estadísticas del país seleccionado: <strong>${countryName}</strong></p>
                
                <div class="col-12 col-md-4 d-flex justify-content-center">
                    <div class="bg-green rounded-4 d-flex flex-column align-items-center mt-1" style="width:270px; height:230px;">
                        <p class="text-center mt-2 fw-bold fs-4">Máximo goleador</p>
                        ${s.partidos.slice(0, 1).map(p => `
                            <div class="fs-4 my-2 fw-bold" >${p.jugadorA}</div>
                            <div class="fs-4 my-2 fw-bold" >${p.golesA}</div>
                        `).join('')}
                    </div>
                </div>

                <div class="col-12 col-md-4 d-flex justify-content-center">
                    <div class="bg-light rounded-4 d-flex flex-column align-items-center mt-1" style="width:270px; height:200px;">
                        <p class="mt-2 green-font fs-4">2° Máximo goleador</p>
                        <p class="fs-4 fw-bold my-auto">${s.partidos[0]?.jugadorB || 0}</p>
                        <p class="fs-4 fw-bold my-auto">${s.partidos[0]?.golesB || 0}</p>
                        
                    </div>
                </div>

                <div class="col-12 col-md-4 d-flex justify-content-center">
                    <div class="bg-light rounded-4 d-flex flex-column align-items-center mt-1" style="width:270px; height:200px;">
                        <p class="mt-2 green-font fs-4">Más apariciones</p>
                        <p class="fs-4 fw-bold my-auto">${s.partidos[0]?.topAp}</p>
                    </div>
                </div>

                <div class="col-12 col-md-4 d-flex justify-content-center">
                    <div class="bg-light rounded-4 d-flex flex-column align-items-center" style="width:270px; height:280px;">
                        <p class="mt-2 green-font fs-4">Muchas apariciones</p>
                        <p class="fs-4 fw-bold my-4"> ${s.variasAp.apA}</p>
                        <p class="fs-4 fw-bold my-4"> ${s.variasAp.apB}</p>
                    </div>
                </div>

                <div class="col-12 col-md-4 d-flex justify-content-center">
                    <div class="bg-light rounded-4 d-flex flex-column align-items-center" style="width:270px; height:280px;">
                        <p class="mt-2 green-font fs-4">Títulos importantes</p>
                        <p class="fs-4 fw-bold my-4">${s.titulo.uno}</p>
                        <p class="fs-4 fw-bold my-4">${s.titulo.dos}</p>
                    </div>
                </div>

                <div class="col-12 col-md-4 d-flex justify-content-center">
                    <div class="bg-light rounded-4 d-flex flex-column align-items-center" style="width:260px; height:280px;">
                        <p class="mt-2 green-font fs-5">Rachas consecutivas</p>
                        <div class="bg-green rounded-5 px-3 py-1 mt-1 text-white">Victorias</div>
                        <p class="fs-4 fw-bold my-2">${s.racha.victorias.local}</p>
                        <div class="bg-green rounded-5 px-3 py-1 mt-1 text-white">Período</div>
                        <p class="fs-4 fw-bold my-2"> ${s.racha.year.local}</p>
                        
                    </div>
                </div>

                <div class="col-12 col-md-4 d-flex justify-content-center mb-4">
                    <div class="bg-light rounded-4 d-flex flex-column align-items-center" style="width:270px; height:200px;">
                        <p class="mt-2 green-font fs-4">Mayor victoria</p>
                        <p class="fs-4 fw-bold my-2">Marcador: ${s.victoria.marcador}</p>
                        <p class="fs-4 fw-bold my-2">Año: ${s.victoria.year}</p>
                    </div>
                </div>

                <div class="col-12 col-md-4 d-flex justify-content-center">
                    <div class="bg-light rounded-4 d-flex flex-column align-items-center mb-4" style="width:270px; height:200px;">
                        <p class="mt-2 green-font fs-5">Clasificación mundial</p>
                        <p class="fs-5 fw-bold my-2 text-center">${s.mundialData.data}</p>
                        <p class="fs-5 fw-bold my-2">Partidos: ${s.mundialData.partidos}</p>
                    </div>
                </div>
            </div>
        `;
    },

    updateInfoModal() {
        if (!this.currentCountry) return;

        const dataCountry = this.currentCountry;
        const countryData = this.data[dataCountry];
        const config = this.countryConfig[this.currentCountry];
        if (!countryData || !config) return;

        document.getElementById('modal-info-title').textContent = 'Conoce más';
        document.getElementById('modal-country-name').textContent = config.name.toUpperCase();
        document.getElementById('modal-tradicion').textContent = countryData.tradicion || 'Información cultural no disponible';
        document.getElementById('modal-futbol').textContent = countryData.futbol || 'Información de fútbol no disponible';
    },

    init3DModel() {
        this.updateInfoModal();
        
        if (!this.currentCountry) {
            console.log("ℹ️ No hay país seleccionado, cargando modelo de prueba (España)");
        }

        const container = document.getElementById('modelo3d');
        if (!container) return;

        if (this.modelInitialized) {
            console.log("ℹ️ Modelo ya inicializado");
            return;
        }

        // Usar THREE global de A-Frame
        this.clock = new THREE.Clock();
        
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x3a3a3a);

        this.camera = new THREE.PerspectiveCamera(45, 350 / 430, 0.1, 1000);
        this.camera.position.set(0, -0.5, 5);

        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(350, 430);
        container.appendChild(this.renderer.domElement);

        const light = new THREE.HemisphereLight(0xffffff, 0x444444, 1.5);
        this.scene.add(light);

        // Usar THREE.GLTFLoader de A-Frame
        const loader = new THREE.GLTFLoader();
        const countryKey = this.currentCountry;
        const modelFile = this.currentCountry 
            ? `./models/${this.countryConfig[this.currentCountry].modelFile}`
            : './models/toro.glb';

        loader.load(modelFile, (gltf) => {
            this.model = gltf.scene;
            this.model.scale.set(0.5, 0.5, 0.5);
            this.model.position.set(0, -0.5, 0);
            this.scene.add(this.model);

            this.mixer = new THREE.AnimationMixer(this.model);
            this.animations = {};

            gltf.animations.forEach((clip) => {
                this.animations[clip.name] = this.mixer.clipAction(clip);
            });

            const animName = this.currentCountry 
                ? this.countryConfig[this.currentCountry].animName 
                : 'Bull_game_walk';

            if (this.animations[animName]) {
                this.animations[animName].play();
                this.isAnimating = true;
            } else if (gltf.animations.length > 0) {
                this.mixer.clipAction(gltf.animations[0]).play();
                this.isAnimating = true;
            }

            console.log("Animaciones disponibles:", Object.keys(this.animations));

        }, undefined, (error) => {
            console.error("Error cargando modelo:", error);
        });

        // OrbitControls no está disponible en A-Frame sin aframe-extras
        // Usar controls simples
        let isDragging = false;
        let previousMousePosition = { x: 0, y: 0 };

        this.renderer.domElement.addEventListener('mousedown', (e) => {
            isDragging = true;
            previousMousePosition = { x: e.clientX, y: e.clientY };
        });

        this.renderer.domElement.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            
            const deltaX = e.clientX - previousMousePosition.x;
            const deltaY = e.clientY - previousMousePosition.y;
            
            if (this.model) {
                this.model.rotation.y += deltaX * 0.01;
            }
            
            previousMousePosition = { x: e.clientX, y: e.clientY };
        });

        this.renderer.domElement.addEventListener('mouseup', () => isDragging = false);
        this.renderer.domElement.addEventListener('mouseleave', () => isDragging = false);

        const animate = () => {
            requestAnimationFrame(animate);

            if (this.mixer) {
                this.mixer.update(this.clock.getDelta());
            }

            this.renderer.render(this.scene, this.camera);
        };

        animate();
        this.modelInitialized = true;
        console.log("✅ Modelo 3D inicializado");
    },

    cleanup3DModel() {
        if (this.renderer) {
            this.renderer.dispose();
            const container = document.getElementById('modelo3d');
            if (container && container.firstChild) {
                container.removeChild(container.firstChild);
            }
        }
        this.modelInitialized = false;
        this.mixer = null;
        this.model = null;
        this.animations = {};
    },

    playAnimation() {
        if (!this.mixer || !this.model) {
            console.log("ℹ️ Iniciando animación...");
            return;
        }

        const animName = this.currentCountry 
            ? this.countryConfig[this.currentCountry].animName 
            : 'Bull_game_walk';

        Object.values(this.animations).forEach(action => action.stop());

        if (this.animations[animName]) {
            this.animations[animName].reset();
            this.animations[animName].play();
            this.isAnimating = true;
            this.showNotification("▶ Animación iniciada");
        } else {
            console.log("Animación no encontrada:", animName);
        }
    },

    stopAnimation() {
        if (!this.mixer) return;

        Object.values(this.animations).forEach(action => action.stop());
        this.isAnimating = false;
        this.showNotification("⏹ Animación detenida");
    }
};


let isPaused = false;


document.querySelector('.country-info-buttons button').addEventListener('click', () => {

    // Obtener todos los modelos
    const modelos = document.querySelectorAll('.modelo-ar');

    modelos.forEach(modelo => {
        if (modelo.getAttribute('visible')) {

            const mixer = modelo.components['animation-mixer'];

            if (!mixer) return;

            if (isPaused) {
                // Reanudar
                mixer.play();
            } else {
                // Pausar
                mixer.pause();
            }
        }
    });

    isPaused = !isPaused;
});

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    console.log("📄 DOM cargado, iniciando Scamera...");
    Scamera.init();
});

window.Scamera = Scamera;

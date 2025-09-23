document.addEventListener('DOMContentLoaded', function() {
    // Funcionalidad para la sección de comandos
    initCommandsSection();
    
    // Funcionalidad para la sección de preguntas frecuentes
    initFAQSection();
    
    // Inicializar tooltips
    initTooltips();
    
    // Inicializar copiado de comandos
    initCommandCopy();
});

/**
 * Inicializa la funcionalidad de la sección de comandos
 */
function initCommandsSection() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const commandSearch = document.getElementById('commandSearch');
    const commandCategories = document.querySelectorAll('.command-category');
    const showMoreButtons = document.querySelectorAll('.btn-show-more');
    
    // Filtrar por categoría
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            const category = button.getAttribute('data-category');
            
            // Actualizar botones activos
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            // Mostrar/ocultar categorías según el filtro
            commandCategories.forEach(cat => {
                if (category === 'all' || cat.getAttribute('data-category') === category) {
                    cat.style.display = 'block';
                } else {
                    cat.style.display = 'none';
                }
            });
            
            // Actualizar contador de resultados
            updateCommandCount();
        });
    });
    
    // Buscar comandos
    if (commandSearch) {
        commandSearch.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            
            commandCategories.forEach(category => {
                const commands = category.querySelectorAll('.command-card');
                let visibleCount = 0;
                
                commands.forEach(cmd => {
                    const cmdName = cmd.querySelector('.command-name').textContent.toLowerCase();
                    const cmdDesc = cmd.querySelector('.command-description').textContent.toLowerCase();
                    
                    if (cmdName.includes(searchTerm) || cmdDesc.includes(searchTerm)) {
                        cmd.style.display = 'block';
                        visibleCount++;
                    } else {
                        cmd.style.display = 'none';
                    }
                });
                
                // Mostrar/ocultar categorías basadas en resultados
                const categoryHeader = category.querySelector('.category-header');
                const commandCount = category.querySelector('.command-count');
                
                if (visibleCount > 0) {
                    category.style.display = 'block';
                    commandCount.textContent = `${visibleCount} comando${visibleCount !== 1 ? 's' : ''}`;
                } else {
                    category.style.display = 'none';
                }
            });
            
            updateCommandCount();
        });
    }
    
    // Botones "Mostrar más"
    showMoreButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const category = e.target.closest('.command-category');
            const commands = category.querySelectorAll('.command-card');
            const isExpanded = category.classList.toggle('expanded');
            
            // Alternar visibilidad de comandos adicionales
            commands.forEach((cmd, index) => {
                if (index >= 3) {
                    cmd.style.display = isExpanded ? 'block' : 'none';
                }
            });
            
            // Actualizar texto del botón
            const icon = button.querySelector('i');
            button.innerHTML = isExpanded 
                ? 'Mostrar menos <i class="fas fa-chevron-up"></i>'
                : 'Ver más comandos <i class="fas fa-chevron-down"></i>';
                
            button.querySelector('i').className = isExpanded 
                ? 'fas fa-chevron-up' 
                : 'fas fa-chevron-down';
        });
    });
    
    // Inicializar contador de resultados
    updateCommandCount();
}

/**
 * Actualiza el contador de comandos encontrados
 */
function updateCommandCount() {
    const resultCount = document.getElementById('resultCount');
    if (!resultCount) return;
    
    const visibleCommands = document.querySelectorAll('.command-card:not([style*="display: none"])');
    resultCount.textContent = visibleCommands.length;
}

/**
 * Inicializa la funcionalidad de la sección de preguntas frecuentes
 */
function initFAQSection() {
    const faqItems = document.querySelectorAll('.faq-item');
    const categoryButtons = document.querySelectorAll('.category-btn');
    const faqSearch = document.getElementById('faqSearch');
    const suggestQuestionBtn = document.getElementById('suggestQuestion');
    
    // Alternar respuestas de las preguntas
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        
        question.addEventListener('click', () => {
            // Cerrar otros items abiertos en la misma categoría
            const parentCategory = item.closest('.faq-category');
            const activeItems = parentCategory.querySelectorAll('.faq-item.active');
            
            activeItems.forEach(activeItem => {
                if (activeItem !== item) {
                    activeItem.classList.remove('active');
                    const answer = activeItem.querySelector('.faq-answer');
                    answer.style.maxHeight = '0';
                    answer.style.padding = '0';
                }
            });
            
            // Alternar la pregunta actual
            item.classList.toggle('active');
            const answer = item.querySelector('.faq-answer');
            
            if (item.classList.contains('active')) {
                answer.style.maxHeight = answer.scrollHeight + 'px';
                answer.style.padding = '0 30px 25px';
            } else {
                answer.style.maxHeight = '0';
                answer.style.padding = '0 30px 0';
            }
        });
    });
    
    // Filtrar por categoría
    categoryButtons.forEach(button => {
        button.addEventListener('click', () => {
            const category = button.getAttribute('data-category');
            
            // Actualizar botones activos
            categoryButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            // Mostrar/ocultar categorías según el filtro
            document.querySelectorAll('.faq-category').forEach(cat => {
                if (category === 'all' || cat.getAttribute('data-category') === category) {
                    cat.style.display = 'block';
                } else {
                    cat.style.display = 'none';
                }
            });
        });
    });
    
    // Buscar en preguntas frecuentes
    if (faqSearch) {
        faqSearch.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            
            if (searchTerm.length < 2) {
                // Mostrar todas las preguntas si la búsqueda es muy corta
                document.querySelectorAll('.faq-item').forEach(item => {
                    item.style.display = 'block';
                });
                return;
            }
            
            let hasResults = false;
            
            // Buscar en preguntas y respuestas
            document.querySelectorAll('.faq-item').forEach(item => {
                const question = item.querySelector('.faq-question h4').textContent.toLowerCase();
                const answer = item.querySelector('.faq-answer').textContent.toLowerCase();
                
                if (question.includes(searchTerm) || answer.includes(searchTerm)) {
                    item.style.display = 'block';
                    hasResults = true;
                    
                    // Resaltar término de búsqueda
                    highlightText(item, searchTerm);
                } else {
                    item.style.display = 'none';
                }
            });
            
            // Mostrar mensaje si no hay resultados
            const noResults = document.getElementById('noResults');
            if (!noResults && !hasResults) {
                const noResultsEl = document.createElement('div');
                noResultsEl.id = 'noResults';
                noResultsEl.className = 'no-results';
                noResultsEl.innerHTML = `
                    <i class="fas fa-search"></i>
                    <h4>No se encontraron resultados</h4>
                    <p>Intenta con otros términos de búsqueda o <a href="#" id="contactSupport">contacta a soporte</a>.</p>
                `;
                
                const faqContainer = document.querySelector('.faq-accordion');
                faqContainer.appendChild(noResultsEl);
                
                // Agregar manejador de eventos para el enlace de contacto
                const contactLink = document.getElementById('contactSupport');
                if (contactLink) {
                    contactLink.addEventListener('click', (e) => {
                        e.preventDefault();
                        document.querySelector('.faq-support').scrollIntoView({ behavior: 'smooth' });
                    });
                }
            } else if (noResults && hasResults) {
                noResults.remove();
            }
        });
    }
    
    // Botón para sugerir preguntas
    if (suggestQuestionBtn) {
        suggestQuestionBtn.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Aquí podrías abrir un modal o redirigir a un formulario
            const question = prompt('¿Qué pregunta te gustaría que agreguemos a nuestras Preguntas Frecuentes?');
            
            if (question) {
                alert('¡Gracias por tu sugerencia! La revisaremos y la agregaremos si es necesario.');
                // Aquí podrías enviar la pregunta a tu backend
            }
        });
    }
    
    // Abrir la primera pregunta de cada categoría por defecto
    document.querySelectorAll('.faq-category').forEach(category => {
        const firstItem = category.querySelector('.faq-item');
        if (firstItem) {
            firstItem.classList.add('active');
            const answer = firstItem.querySelector('.faq-answer');
            answer.style.maxHeight = answer.scrollHeight + 'px';
            answer.style.padding = '0 30px 25px';
        }
    });
}

/**
 * Resalta el texto que coincide con el término de búsqueda
 */
function highlightText(element, searchTerm) {
    // Eliminar resaltados anteriores
    const highlights = element.querySelectorAll('.highlight');
    highlights.forEach(hl => {
        const parent = hl.parentNode;
        parent.replaceChild(document.createTextNode(hl.textContent), hl);
        parent.normalize(); // Combina nodos de texto adyacentes
    });
    
    // No resaltar si el término es muy corto
    if (searchTerm.length < 2) return;
    
    // Función recursiva para buscar y resaltar texto
    function highlightNode(node) {
        if (node.nodeType === 3) { // Nodo de texto
            const text = node.nodeValue;
            const searchRegex = new RegExp(`(${escapeRegExp(searchTerm)})`, 'gi');
            
            if (searchRegex.test(text)) {
                const fragment = document.createDocumentFragment();
                let lastIndex = 0;
                let match;
                
                while ((match = searchRegex.exec(text)) !== null) {
                    // Texto antes de la coincidencia
                    if (match.index > lastIndex) {
                        fragment.appendChild(document.createTextNode(text.substring(lastIndex, match.index)));
                    }
                    
                    // Texto resaltado
                    const highlight = document.createElement('span');
                    highlight.className = 'highlight';
                    highlight.textContent = match[0];
                    fragment.appendChild(highlight);
                    
                    lastIndex = match.index + match[0].length;
                }
                
                // Texto restante
                if (lastIndex < text.length) {
                    fragment.appendChild(document.createTextNode(text.substring(lastIndex)));
                }
                
                // Reemplazar el nodo de texto con el fragmento
                node.parentNode.replaceChild(fragment, node);
            }
        } else if (node.nodeType === 1 && node.childNodes && !/^(script|style|textarea)$/i.test(node.tagName)) {
            // Procesar nodos de elemento (excepto scripts, estilos y textareas)
            for (let i = 0; i < node.childNodes.length; i++) {
                highlightNode(node.childNodes[i]);
            }
        }
    }
    
    // Iniciar el resaltado
    highlightNode(element);
}

/**
 * Escapa caracteres especiales para usar en expresiones regulares
 */
function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Inicializa los tooltips
 */
function initTooltips() {
    // Inicializar tooltips usando Tippy.js o similar
    // Ejemplo con Tippy.js (asegúrate de incluir la biblioteca):
    // tippy('[data-tooltip]', {
    //     content: (reference) => reference.getAttribute('data-tooltip'),
    //     placement: 'top',
    //     animation: 'scale',
    //     theme: 'light',
    //     arrow: true
    // });
}

/**
 * Inicializa la funcionalidad de copiar comandos
 */
function initCommandCopy() {
    document.addEventListener('click', (e) => {
        const copyBtn = e.target.closest('.btn-copy');
        if (!copyBtn) return;
        
        const command = copyBtn.getAttribute('data-command');
        if (!command) return;
        
        // Copiar al portapapeles
        navigator.clipboard.writeText(command).then(() => {
            // Mostrar mensaje de confirmación
            showCopyFeedback(copyBtn, '¡Copiado!');
        }).catch(err => {
            console.error('Error al copiar el comando:', err);
            showCopyFeedback(copyBtn, 'Error al copiar');
        });
    });
    
    // Mostrar retroalimentación visual al copiar
    function showCopyFeedback(button, message) {
        const originalText = button.innerHTML;
        button.innerHTML = `<i class="fas fa-check"></i> ${message}`;
        button.style.backgroundColor = '#4CAF50';
        button.style.borderColor = '#4CAF50';
        
        // Restaurar después de 2 segundos
        setTimeout(() => {
            button.innerHTML = originalText;
            button.style.backgroundColor = '';
            button.style.borderColor = '';
        }, 2000);
    }
}

// Exportar funciones para uso global (si es necesario)
window.CommandsFAQ = {
    initCommandsSection,
    initFAQSection,
    initCommandCopy
};

document.addEventListener('DOMContentLoaded', () => {
    const openSidebarBtn = document.getElementById('open-sidebar-btn');
    const closeSidebarBtn = document.getElementById('close-sidebar-btn');
    const sidebar = document.getElementById('my-sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    const body = document.body;

    // Elementos focáveis dentro da sidebar para o "focus trap"
    const focusableElementsString = 'a[href], button:not([disabled]), textarea, input, select';
    let firstFocusableElement;
    let lastFocusableElement;

    function openSidebar() {
        body.classList.add('sidebar-is-open');
        openSidebarBtn.setAttribute('aria-expanded', 'true');
        sidebar.setAttribute('aria-hidden', 'false');

        // Gerenciamento de foco
        setFocusableElements();
        // Atraso pequeno para garantir que a sidebar esteja visível antes de focar
        setTimeout(() => {
            if (closeSidebarBtn) {
                 closeSidebarBtn.focus(); // Foca no botão de fechar
            } else if (firstFocusableElement) {
                firstFocusableElement.focus();
            }
        }, 100); // 100ms pode ser ajustado

        // Adiciona listeners para fechar
        addCloseListeners();
    }

    function closeSidebar() {
        body.classList.remove('sidebar-is-open');
        openSidebarBtn.setAttribute('aria-expanded', 'false');
        sidebar.setAttribute('aria-hidden', 'true');

        // Devolve o foco ao botão que abriu a sidebar
        openSidebarBtn.focus();

        // Remove listeners para fechar
        removeCloseListeners();
    }

    function setFocusableElements() {
        const focusableContent = sidebar.querySelectorAll(focusableElementsString);
        if (focusableContent.length > 0) {
            firstFocusableElement = focusableContent[0];
            lastFocusableElement = focusableContent[focusableContent.length - 1];
        } else {
            // Se não houver outros, o botão fechar é o único
            firstFocusableElement = closeSidebarBtn;
            lastFocusableElement = closeSidebarBtn;
        }
    }

    // Prende o foco dentro da sidebar (Focus Trap)
    function handleFocusTrap(e) {
        if (e.key !== 'Tab' || (!firstFocusableElement && !lastFocusableElement)) {
            return;
        }

        if (e.shiftKey) { // Shift + Tab
            if (document.activeElement === firstFocusableElement) {
                if (lastFocusableElement) lastFocusableElement.focus();
                e.preventDefault();
            }
        } else { // Tab
            if (document.activeElement === lastFocusableElement) {
                if (firstFocusableElement) firstFocusableElement.focus();
                e.preventDefault();
            }
        }
    }

    // Fecha com a tecla Escape
    function handleEscapeKey(e) {
        if (e.key === 'Escape' && body.classList.contains('sidebar-is-open')) {
            closeSidebar();
        }
    }

    function addCloseListeners() {
        overlay.addEventListener('click', closeSidebar);
        if(closeSidebarBtn) closeSidebarBtn.addEventListener('click', closeSidebar);
        document.addEventListener('keydown', handleEscapeKey);
        sidebar.addEventListener('keydown', handleFocusTrap); // Adiciona trap de foco
    }

    function removeCloseListeners() {
        overlay.removeEventListener('click', closeSidebar);
        if(closeSidebarBtn) closeSidebarBtn.removeEventListener('click', closeSidebar);
        document.removeEventListener('keydown', handleEscapeKey);
        sidebar.removeEventListener('keydown', handleFocusTrap); // Remove trap de foco
    }


    // Event Listeners principais
    if (openSidebarBtn) {
        openSidebarBtn.addEventListener('click', openSidebar);
    }

    // Opcional: Fechar sidebar ao clicar em um link dentro dela (se for navegação na mesma página)
    sidebar.querySelectorAll('a[href]').forEach(link => {
        link.addEventListener('click', (event) => {
            // Verifique se é um link para a mesma página (âncora)
            if (link.getAttribute('href').startsWith('#') || link.pathname === window.location.pathname) {
                 if (body.classList.contains('sidebar-is-open')) {
                    closeSidebar();
                }
            }
            // Se for um link para outra página, a sidebar fechará com o carregamento da nova página.
        });
    });
});

document.addEventListener('DOMContentLoaded', () => {
    const container = document.querySelector('#modelos .modelos-multi-carousel-container');
    const track = document.querySelector('#modelos .modelos-multi-carousel-track');
    const originalItems = Array.from(document.querySelectorAll('#modelos .modelo-item-original'));

    if (!container || !track || !originalItems.length) {
        console.warn('Elementos do carrossel de múltiplos itens não encontrados ou sem itens originais.');
        return;
    }

    const itemsVisible = 3;
    const itemsToScroll = 1; // Quantos itens rolam por vez (mudar para 3 se quiser que o bloco de 3 avance)
    const itemNominalWidth = 200; // Largura base do item (CSS .modelo-item-display width)
    const itemGap = 20;          // Espaçamento (CSS .modelo-item-display margin-right)
    const itemTotalWidth = itemNominalWidth + itemGap; // Largura de um item + seu gap à direita

    let currentIndex = 0;
    let autoPlayInterval;
    const AUTOPLAY_DELAY = 2000; // 4 segundos
    let displayItems = [];
    let totalClonedItems = 0; // Será o número total de itens no track (originais + clones)
    const clonesAtEachEnd = itemsVisible * 2; // Número de clones para adicionar em cada extremidade para o loop

    function setupCarousel() {
        track.innerHTML = '';
        displayItems = [];

        if (originalItems.length === 0) return;

        // Criar a lista de itens para o track, incluindo clones para o loop
        let trackItemNodes = [];

        // Adicionar clones do final dos originais no início do track
        for (let i = 0; i < clonesAtEachEnd; i++) {
            trackItemNodes.push(originalItems[(originalItems.length - clonesAtEachEnd + i) % originalItems.length].cloneNode(true));
        }

        // Adicionar os itens originais
        originalItems.forEach(item => trackItemNodes.push(item.cloneNode(true)));

        // Adicionar clones do início dos originais no final do track
        for (let i = 0; i < clonesAtEachEnd; i++) {
            trackItemNodes.push(originalItems[i % originalItems.length].cloneNode(true));
        }
        
        totalClonedItems = trackItemNodes.length;

        trackItemNodes.forEach(node => {
            node.classList.remove('modelo-item-original');
            node.classList.add('modelo-item-display');
            track.appendChild(node);
            displayItems.push(node); // Adiciona o elemento DOM real
        });
        
        // Ponto de partida: após os clones iniciais
        currentIndex = clonesAtEachEnd; 
        track.style.transition = 'none';
        track.style.transform = `translateX(-${currentIndex * itemTotalWidth}px)`;
        
        track.offsetHeight; // Força reflow
        track.style.transition = `transform 0.8s cubic-bezier(0.65, 0, 0.35, 1)`;
    }

    function moveToNext() {
        if (displayItems.length <= itemsVisible) return;

        currentIndex += itemsToScroll;
        track.style.transform = `translateX(-${currentIndex * itemTotalWidth}px)`;

        // Lógica para o loop infinito (teletransporte para frente)
        if (currentIndex >= (totalClonedItems - clonesAtEachEnd)) {
            track.addEventListener('transitionend', function resetLoop() {
                track.removeEventListener('transitionend', resetLoop);
                currentIndex = clonesAtEachEnd + ((currentIndex - clonesAtEachEnd) % originalItems.length);
                track.style.transition = 'none';
                track.style.transform = `translateX(-${currentIndex * itemTotalWidth}px)`;
                track.offsetHeight; // Força reflow
                track.style.transition = `transform 0.8s cubic-bezier(0.65, 0, 0.35, 1)`;
            }, { once: true });
        }
    }

    const startAutoPlay = () => {
        if (originalItems.length <= itemsVisible) return;
        stopAutoPlay();
        autoPlayInterval = setInterval(moveToNext, AUTOPLAY_DELAY);
    };

    const stopAutoPlay = () => {
        clearInterval(autoPlayInterval);
    };

    // Event Listeners para pausar no hover
    if (container && originalItems.length > itemsVisible) {
        container.addEventListener('mouseenter', stopAutoPlay);
        container.addEventListener('mouseleave', startAutoPlay);
    }
    
    // Inicialização
    setupCarousel();
    if (originalItems.length > itemsVisible) {
        startAutoPlay();
    }

    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            stopAutoPlay();
            setupCarousel();
            if (originalItems.length > itemsVisible) {
                startAutoPlay();
            }
        }, 300);
    });
});
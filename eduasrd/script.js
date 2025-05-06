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
class MacDesktop {
    constructor() {
        this.isDragging = false;
        this.dragElement = null;
        this.dragOffset = { x: 0, y: 0 };

        this.windowDragging = false;
        this.windowDragElement = null;
        this.windowDragOffset = { x: 0, y: 0 };
        this.zIndexCounter = 200;

        this.init();
    }

    init() {
        this.setupDesktopIcons();
        this.setupWindows();
        this.setupDockMagnification();
        this.updateTime();

        // Update time every second
        setInterval(() => this.updateTime(), 1000);
    }

    setupDesktopIcons() {
        const icons = document.querySelectorAll('.desktop-icon');

        icons.forEach(icon => {
            let iconDragStarted = false;
            let startX, startY;

            // Mouse down - start tracking
            icon.addEventListener('mousedown', (e) => {
                iconDragStarted = false;
                startX = e.clientX;
                startY = e.clientY;

                this.isDragging = true;
                this.dragElement = icon;
                this.dragElement.startX = startX;
                this.dragElement.startY = startY;
                const rect = icon.getBoundingClientRect();
                this.dragOffset.x = e.clientX - rect.left;
                this.dragOffset.y = e.clientY - rect.top;
                e.preventDefault();
            });

            // Store reference for cleanup
            icon.setDragStarted = (value) => { iconDragStarted = value; };

            icon.addEventListener('mouseup', () => {
                const clickedWithoutDrag = !iconDragStarted;

                this.isDragging = false;
                this.dragElement = null;
                icon.classList.remove('dragging');

                if (clickedWithoutDrag) {
                    this.openWindow(icon.dataset.window);
                }
            });
        });

        // Global mouse events for dragging icons
        document.addEventListener('mousemove', (e) => {
            if (this.isDragging && this.dragElement) {
                const deltaX = Math.abs(e.clientX - (this.dragElement.startX || 0));
                const deltaY = Math.abs(e.clientY - (this.dragElement.startY || 0));

                // If mouse moved more than 5px, consider it a drag
                if (deltaX > 5 || deltaY > 5) {
                    if (this.dragElement.setDragStarted) {
                        this.dragElement.setDragStarted(true);
                    }
                    this.dragElement.classList.add('dragging');

                    const x = e.clientX - this.dragOffset.x;
                    const y = e.clientY - this.dragOffset.y;

                    // Keep elements within viewport bounds
                    const maxX = window.innerWidth - this.dragElement.offsetWidth;
                    const maxY = window.innerHeight - this.dragElement.offsetHeight - 80;

                    const boundedX = Math.max(0, Math.min(x, maxX));
                    const boundedY = Math.max(0, Math.min(y, maxY));

                    this.dragElement.style.left = boundedX + 'px';
                    this.dragElement.style.top = boundedY + 'px';
                }
            }

            if (this.windowDragging && this.windowDragElement) {
                const x = e.clientX - this.windowDragOffset.x;
                const y = e.clientY - this.windowDragOffset.y;

                const maxX = window.innerWidth - this.windowDragElement.offsetWidth;
                const maxY = window.innerHeight - this.windowDragElement.offsetHeight - 40;

                const boundedX = Math.max(0, Math.min(x, maxX));
                const boundedY = Math.max(0, Math.min(y, maxY));

                this.windowDragElement.style.left = `${boundedX}px`;
                this.windowDragElement.style.top = `${boundedY}px`;
            }
        });

        document.addEventListener('mouseup', () => {
            if (this.isDragging && this.dragElement) {
                this.dragElement.classList.remove('dragging');
                this.isDragging = false;
                this.dragElement = null;
            }

            if (this.windowDragging && this.windowDragElement) {
                this.windowDragElement.classList.remove('dragging', 'dragging-start');
                this.windowDragging = false;
                this.windowDragElement = null;
            }
        });
    }

    setupWindows() {
        const windows = document.querySelectorAll('.window');

        windows.forEach(win => {
            const header = win.querySelector('.window-header');
            if (header) {
                header.addEventListener('mousedown', (e) => {
                    this.windowDragging = true;
                    this.windowDragElement = win;
                    const rect = win.getBoundingClientRect();
                    this.windowDragOffset.x = e.clientX - rect.left;
                    this.windowDragOffset.y = e.clientY - rect.top;
                    win.classList.add('dragging', 'dragging-start');
                    this.bringWindowToFront(win);
                    e.preventDefault();
                });
            }

            win.addEventListener('mousedown', () => this.bringWindowToFront(win));

            const closeBtn = win.querySelector('.window-btn.close');
            const minimizeBtn = win.querySelector('.window-btn.minimize');
            const maximizeBtn = win.querySelector('.window-btn.maximize');
            const controls = win.querySelector('.window-controls');

            if (closeBtn) {
                closeBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    win.classList.remove('active');
                });
            }

            if (minimizeBtn) {
                minimizeBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    win.classList.remove('active');
                });
            }

            if (maximizeBtn) {
                maximizeBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    win.classList.remove('active');
                });
            }

            // Allow near-miss clicks around the red/yellow buttons to close the window
            if (controls) {
                controls.addEventListener('click', (e) => {
                    const rect = controls.getBoundingClientRect();
                    const closeZoneWidth = rect.width + 8; // entire control cluster plus small padding
                    if (e.clientX <= rect.left + closeZoneWidth) {
                        e.stopPropagation();
                        win.classList.remove('active');
                    }
                });
            }
        });
    }

    bringWindowToFront(win) {
        this.zIndexCounter += 1;
        win.style.zIndex = this.zIndexCounter;
    }

    openWindow(windowId) {
        if (!windowId) return;

        const target = document.querySelector(`.window[data-window="${windowId}"]`);
        if (!target) return;

        target.classList.add('active', 'opening');
        this.bringWindowToFront(target);

        setTimeout(() => target.classList.remove('opening'), 250);
    }

    setupDockMagnification() {
        const dockContainer = document.querySelector('.dock-container');
        if (!dockContainer) return;

        const dockIcons = Array.from(dockContainer.querySelectorAll('.dock-icon'));
        const baseSize = 56;
        const maxScale = 1.8;
        const proximityRange = 120;

        let animationFrameId = null;

        dockContainer.addEventListener('mousemove', (e) => {
            if (animationFrameId) {
                return; // Skip if we're already processing
            }

            animationFrameId = requestAnimationFrame(() => {
                dockIcons.forEach((icon) => {
                    const rect = icon.getBoundingClientRect();
                    const iconCenterX = rect.left + rect.width / 2;
                    const iconCenterY = rect.top + rect.height / 2;

                    // Calculate distance from mouse to icon center
                    const distanceX = e.clientX - iconCenterX;
                    const distanceY = e.clientY - iconCenterY;
                    const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);

                    // Calculate scale based on distance (closer = larger)
                    let scale = 1;
                    let translateY = 0;

                    if (distance < proximityRange) {
                        const proximity = 1 - (distance / proximityRange);
                        scale = 1 + (proximity * (maxScale - 1));
                        translateY = -proximity * 20;
                    }

                    // Apply transform
                    icon.style.transform = `translateY(${translateY}px) scale(${scale})`;
                });

                animationFrameId = null;
            });
        });

        dockContainer.addEventListener('mouseleave', () => {
            if (animationFrameId) {
                cancelAnimationFrame(animationFrameId);
                animationFrameId = null;
            }

            dockIcons.forEach(icon => {
                icon.style.transform = 'translateY(0) scale(1)';
            });
        });
    }

    updateTime() {
        const timeElement = document.getElementById('current-time');
        if (!timeElement) return;

        const now = new Date();
        const timeString = now.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
        timeElement.textContent = timeString;
    }
}

// Initialize the desktop when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new MacDesktop();
});

// Prevent right-click context menu on desktop
document.addEventListener('contextmenu', (e) => {
    if (e.target.classList.contains('desktop') || e.target.classList.contains('desktop-icon')) {
        e.preventDefault();
    }
});

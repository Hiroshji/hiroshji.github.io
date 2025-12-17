## small update
forgot to add the icons/background lmfao

## Mac-Style Portfolio Website

Features
- Mac-style desktop with frosted (liquid glass) overlay
- Draggable desktop icons with labels beneath
- Centered Dock with magnification effect (hover to magnify)
- App icons use SVGs for them crisp visuals

Quick Notes
- Icons are draggable and positioned using inline `style` attributes in `index.html`.
- The Dock icons are located in `icons/` and displayed via `index.html` → `.dock`.
- Visuals and spacing are controlled in `styles.css`; interactive behavior is in `script.js`.

File Structure

```
coolass_website/
├── index.html    # Main HTML (desktop, icons, dock)
├── styles.css    # Visual styles and macOS-like effects
├── script.js     # Dragging, dock magnification, time
└── icons/        # SVG icon assets used by the Dock and Desktop
```

How to Edit
- To change an icon image: modify the SVG files in `icons/` or update the `.icon-image` CSS rules in `styles.css`.
- To reposition icons on the desktop: edit the `style="top: ...; left: ...;"` on each `.desktop-icon` in `index.html`.
- To adjust Dock behavior or animation timing: edit the transition/easing settings in `styles.css` and the `setupDockMagnification()` function in `script.js`.

Usage
- Drag icons to rearrange them on the desktop.
- Hover the Dock to magnify icons.
- Right-click on the desktop is disabled to keep the UI clean.

Browser Support
- Modern Chromium browsers, Firefox and Safari are supported. The project uses CSS backdrop-filter for the frosted glass effect, which requires a modern browser.

License
- This repository is for personal portfolio usage and experimentation.

Enjoy the Mac-like desktop — let me know if you want specific content added to this README.
Feel free to use this to with your portfolio but credit me.
.
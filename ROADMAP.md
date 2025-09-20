# Development Roadmap

## High Priority Features
- [x] ~~screen flashes each time i select a box (or any action)~~ **FIXED**: Optimized PIXI canvas lifecycle and React re-renders
- [x] ~~hover a box shows a Panel line background... hover a line with a box (not lines with no boxes) should do the same~~ **IMPLEMENTED**: Enhanced hover with professional styling
- [x] ~~Click box or line selects the box and line and shows a visual feedeback (box has wider border + line is darker). Clicking again unselects the box and line~~ **IMPLEMENTED**: Toggle selection with visual feedback
- [x] ~~I select a line/box. then i drag that selection. when I drop it will move that selection to a destination. I want to visualize that potential destination as a black line before i actually drop it by releasing the mouse button.~~ **IMPLEMENTED**: Drag destination preview with accurate positioning
- [x] ~~when i undo or redo, every box/line is unselected~~ **IMPLEMENTED**: Selection cleared on undo/redo operations
- [x] ~~when i undo or redo, every box/line is free of hover visual feedback~~ **IMPLEMENTED**: Hover states cleared on undo/redo operations
- [ ] Multi-select boxes/lines when Shift is pressed
- [ ] Drag-and-drop for multiple selected boxes/lines

## Medium Priority Features  
- [ ] Visual feedback improvements for selected boxes/lines
- [ ] Keyboard shortcuts for selection (Ctrl+A, Shift+click, etc.)
- [ ] Touch device support for mobile/tablet
- [ ] Undo/redo for selection operations

## Low Priority / Future Enhancements
- [ ] Box grouping and containers
- [ ] Advanced selection tools (lasso, rectangular selection)
- [ ] Zoom and pan functionality
- [ ] Export/import functionality
- [ ] Real-time collaboration features

## Technical Improvements
- [ ] Performance optimization for large numbers of boxes
- [ ] Accessibility improvements (ARIA labels, keyboard navigation)
- [ ] Unit and integration tests
- [ ] Better error handling and user feedback

## Known Issues
- None currently tracked

---
*Last updated: September 20, 2025*
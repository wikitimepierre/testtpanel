# Development Roadmap

## High Priority Features
- [x] ~~screen flashes each time i select a box (or any action)~~ **FIXED**: Optimized PIXI canvas lifecycle and React re-renders
- [x] ~~hover a box shows a Panel line background... hover a line with a box (not lines with no boxes) should do the same~~ **IMPLEMENTED**: Enhanced hover with professional styling
- [x] ~~Click box or line selects the box and line and shows a visual feedeback (box has wider border + line is darker). Clicking again unselects the box and line~~ **IMPLEMENTED**: Toggle selection with visual feedback
- [x] ~~I select a line/box. then i drag that selection. when I drop it will move that selection to a destination. I want to visualize that potential destination as a black line before i actually drop it by releasing the mouse button.~~ **IMPLEMENTED**: Drag destination preview with accurate positioning → **REMOVED**: Preview line functionality removed per user request
- [x] ~~when i undo or redo, every box/line is unselected~~ **IMPLEMENTED**: Selection cleared on undo/redo operations
- [x] ~~when i undo or redo, every box/line is free of hover visual feedback~~ **IMPLEMENTED**: Hover states cleared on undo/redo operations
- [x] ~~bug: if i select a box and then dragdrop it, it is unselected. it should be unselected ONLY if i click it not dragdrop it.~~ **FIXED**: Selection now persists after drag operations
- [x] ~~if i dragdrop a box, it becomes selected. if another box was selected. this selection is cancelled.~~ **IMPLEMENTED**: Dragged box becomes selected immediately when drag starts, cancelling previous selection
- [x] ~~when i dragdrop a box and, doing so, I hover a box, it shouldn't draw a hover box over that line/box~~ **FIXED**: Hover effects disabled during drag operations
- [x] ~~if i dragdrop a box and drop before its stackOrder changes, the box stays where I droped and it should come back at its initial place~~ **FIXED**: Box returns to original position when dropped without stack order change


- add a top margin of 25 px at the top
- 
- [ ] generate 15 boxes. that makes more boxes that can be displayed with the canvas height. display a vertical scrollbar so that you can see the unseen boxes.
- [ ] Multi-select boxes/lines when Shift is pressed
- [ ] Drag-and-drop for multiple selected boxes/lines

list of things to test:
during dragdrop, what is dragged is displayed UNDER all other boxes



make my mind clear about differences timeTracks, PanelLines, TimeObjects... then
rename variables so it's compatible with PanelLines, TimeObjects, ...

import types timeObjects, timeBox, wikidates, ...

how to prepare height of each line (topmargin line, timebox lines, start container lines, end container lines will be higher than others) ?


evaluate different control modes:
A) normal mode: drag drop background to pan vertically + scrollbar
B) edition mode (enter by long click on a line/box): drag drop line/box + pan with scrollbar only. Maybe there should be an edition mode where you dragdrop 

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